import { dissoc, isNil, unwind } from "ramda"

function isPromiseFulfilled<T>(promise: PromiseSettledResult<T>): promise is PromiseFulfilledResult<T> {
  return promise.status === 'fulfilled'
}

function getValueOfFulfilledPromise<T>(promise: PromiseFulfilledResult<T>) {
  return promise.value
}

function unifyTranslations(translation: unknown){
  return {
    locale: translation.lang_code || translation.languages_code,
    path: translation.path
  }
}

function unifyPagesResponse(page: unknown){
  return {
    parent: page.parent || page.parent_page,
    translations: page.translations.map(unifyTranslations)
  }
}

function toIdObject(acc: object, page: object){
  return {[page.id]: dissoc('id', page), ...acc}
}

function unifyPages(page: unknown){
  return {
    parent: page.parent,
    ...page.translations
  }
}

function toFlattedTranslation(page:unknown[]){
  return page.map(unifyPagesResponse).flatMap(unwind('translations')).map(unifyPages)
}

function searchParent(pages: object){
  return function(page: object){
    if(isNil(pages[page.languages_code][page.parent]))
      return [page.path]
    
    return [...searchParent(pages)(pages[page.languages_code][page.parent]), page.path]
  }
}

export {
  isPromiseFulfilled,
  getValueOfFulfilledPromise,
  unifyPagesResponse,
  unifyPages,
  toIdObject,
  toFlattedTranslation,
  searchParent
}