import { getContext, setContext } from "svelte"
import { writable, type Writable } from "svelte/store"

type Cannonicals = Record<string, string>

const CANNONICAL_KEY = Symbol('cannonical')

const setPageCannonicals = (cannonicals: Cannonicals) => {
  const store = writable<Cannonicals>(cannonicals)
  setContext(CANNONICAL_KEY, store)
  return store
}

const getPageCannonicals = () => {
  return getContext<Writable<Cannonicals>>(CANNONICAL_KEY)
}

export {
  setPageCannonicals,
  getPageCannonicals
}