import { includes, isNotNil, map, pipe, prop } from 'ramda'
import { MAX_COOKIE_SERIALIZATION, SESSION_COOKIE_SERIALIZATION } from '$lib/cookies'
import { isSiteSettings } from '$lib/directus/site-settings'

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

export async function handle({ event, resolve }) {
  const { cookies, 
    getClientAddress, 
    route: { id: routeID }, 
    params: { locale }, 
  } = event

  let userIdFromCookies = cookies.get( CLIENT_ID_KEY )

  if ( !userIdFromCookies ) {
    userIdFromCookies = await setClientId(getClientAddress())
    cookies.set( CLIENT_ID_KEY, userIdFromCookies, MAX_COOKIE_SERIALIZATION)
  }

  let sessionIdFromCookies = cookies.get( SESSION_ID_KEY )

  if ( !sessionIdFromCookies ) {
    sessionIdFromCookies = crypto.randomUUID() + '-' + (new Date()).getTime() + '-' + userIdFromCookies
  }

  cookies.set( SESSION_ID_KEY, sessionIdFromCookies, SESSION_COOKIE_SERIALIZATION )

  if(isNotNil(routeID) && (includes('api', routeID ) || includes('assets', routeID)))
    return (await resolve(event))

  console.log(event)

  if(!locale && routeID === '/')
    console.log('locale')
    
	const response = await resolve(event);

	return response;
}