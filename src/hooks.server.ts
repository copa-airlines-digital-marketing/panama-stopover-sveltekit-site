import { includes, isNotNil, pipe, split } from 'ramda'
import { MAX_COOKIE_SERIALIZATION, SESSION_COOKIE_SERIALIZATION } from '$lib/cookies'
import { redirect, type RequestEvent } from '@sveltejs/kit'
import { base } from '$app/paths'
import { getPreferredLocale, isSupportedLocale } from '$lib/i18n'

const CLIENT_ID_KEY = 'client'
const SESSION_ID_KEY = 'session'

const unknownToString = ( value: unknown ) => {
  if ( typeof value === 'string' )
    return value

  return JSON.stringify(value)
}

const hashValue = async ( value: string ) => {
  const utf8 = new TextEncoder().encode(value)
  const hashBuffer = await crypto.subtle.digest('SHA-256', utf8)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map((bytes) => bytes.toString(16).padStart(2,'0')).join('')

  return hashHex
}

const setClientId = pipe(unknownToString, hashValue)

const getUserIdCookie = async ({cookies, getClientAddress}: RequestEvent) => {
  const userIdFromCookies = cookies.get(CLIENT_ID_KEY) 

  if(isNotNil(userIdFromCookies))
    return userIdFromCookies

  const newUserId = await setClientId(getClientAddress())

  return newUserId
}

const geSessionIdFromCookie = ({cookies}: RequestEvent, id: string) => {
  const sessionIdFromCookies = cookies.get(SESSION_ID_KEY) 

  if(isNotNil(sessionIdFromCookies))
    return sessionIdFromCookies

  return crypto.randomUUID() + '-' + (new Date()).getTime() + '-' + id
}

export async function handle({ event, resolve }) {
  console.log('+hooks.server.svelte')
  const { cookies, 
    route: { id: routeID }, 
    url: { pathname }
  } = event
  console.log(event.params, pathname)

  const userId =  await getUserIdCookie(event)

  cookies.set( CLIENT_ID_KEY, userId, MAX_COOKIE_SERIALIZATION)

  cookies.set( SESSION_ID_KEY, geSessionIdFromCookie(event, userId), SESSION_COOKIE_SERIALIZATION )

  if(isNotNil(routeID) && (includes('api', routeID ) || includes('assets', routeID)))
    return (await resolve(event))

  const [,langFromPath] = split('/', pathname)

  if(!langFromPath) {
    const locale = getPreferredLocale(event)
    console.log('redirecting to locale', locale)
    throw redirect(307, `${base}/${locale}`)
  }

  const pageLocale = isSupportedLocale(langFromPath) ? langFromPath : getPreferredLocale(event) 

  event.locals.locale = pageLocale

	return await resolve(event, { transformPageChunk: ({ html }) => html.replace('%lang%', pageLocale) });
}