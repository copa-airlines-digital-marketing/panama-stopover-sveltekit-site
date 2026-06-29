import { dissoc, isNil, unwind } from "ramda"

type PageTranslationLike = {
	lang_code?: string;
	languages_code?: string;
	path?: string;
};

type PageLike = {
	id?: string | number;
	languages_code?: string;
	parent?: string | number | null;
	parent_page?: string | number | null;
	path?: string;
	translations?: PageTranslationLike[];
};

type PagesByLocale = Record<string, Record<string, PageLike>>;

function isPromiseFulfilled<T>(promise: PromiseSettledResult<T>): promise is PromiseFulfilledResult<T> {
  return promise.status === 'fulfilled'
}

function getValueOfFulfilledPromise<T>(promise: PromiseFulfilledResult<T>) {
  return promise.value
}

function unifyTranslations(translation: PageTranslationLike){
  return {
    locale: translation.lang_code || translation.languages_code,
    path: translation.path
  }
}

function unifyPagesResponse(page: PageLike){
  return {
    parent: page.parent || page.parent_page,
    translations: (page.translations || []).map(unifyTranslations)
  }
}

function toIdObject(acc: Record<string, Omit<PageLike, 'id'>>, page: PageLike){
  return {[String(page.id || '')]: dissoc('id', page), ...acc}
}

function unifyPages(page: PageLike & { translations?: PageTranslationLike }){
  return {
    parent: page.parent,
    ...page.translations
  }
}

function toFlattedTranslation(page: PageLike[]){
  return page.map(unifyPagesResponse).flatMap(unwind('translations')).map((item) => unifyPages(item as unknown as PageLike & { translations?: PageTranslationLike }))
}

function searchParent(pages: PagesByLocale): (page: PageLike) => string[] {
  return function(page: PageLike){
    const locale = page.languages_code || '';
    const parent = String(page.parent || '');

    if(isNil(pages[locale]?.[parent]))
      return page.path ? [page.path] : []
    
    return [...searchParent(pages)(pages[locale][parent]), ...(page.path ? [page.path] : [])]
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

export type { PageLike, PagesByLocale }
