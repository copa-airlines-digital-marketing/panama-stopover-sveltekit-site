import { getContext, setContext } from "svelte"
import { writable, type Writable } from "svelte/store"

const LINK_BAR_CONTEXT_KEY = Symbol('LinkBar')

function setLinkBarContext(hasLabel: boolean) {
  const store = writable(hasLabel)
  setContext(LINK_BAR_CONTEXT_KEY, store)
  return store
}

function getLinkBarContext() {
  return getContext<Writable<boolean>>(LINK_BAR_CONTEXT_KEY)
}

export {
  getLinkBarContext,
  setLinkBarContext
}