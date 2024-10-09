import { getContext, setContext } from "svelte";
import { writable, type Writable } from "svelte/store";

const TAB_CONTEXT_ID = Symbol('tabs')

function setTabContext() {
  const store = writable<string[]>([])
  setContext(TAB_CONTEXT_ID, store)
  return store
}

function getTabContext() {
  return getContext<Writable<string[]>>(TAB_CONTEXT_ID)
}

export {
  setTabContext,
  getTabContext
}