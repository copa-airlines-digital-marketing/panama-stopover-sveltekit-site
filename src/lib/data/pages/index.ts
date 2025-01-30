import { SITE_ID } from '$env/static/private';
import { getItems } from '$lib/directus/utils';
import { groupBy, map, path, prop, reduce, uniq, unwind } from 'ramda';
import { getValueOfFulfilledPromise, isPromiseFulfilled, toIdObject, unifyPagesResponse, unifyPages, toFlattedTranslation, searchParent } from './utils';

const pagesQuery = {
	fields: ['id', 'parent', { translations: ['languages_code', 'path'] }],
	filter: {
		_and: [
			{
				site: {
					_eq: SITE_ID
				}
			},
			{
				parent: {
					_nnull: true
				}
			}
		]
	}
};

const moduleQuery = {
	fields: ['id', 'parent_page', { translations: ['lang_code', 'path'] }]
};


function getAllPages(){
  return Promise.allSettled([
    getItems('pages', pagesQuery, null),
    getItems('stopover_hotels', moduleQuery, null),
    getItems('stopover_restaurants', moduleQuery, null),
    getItems('stopover_place_to_visit', moduleQuery, null)
  ]);
}


async function getAllPagesParams() {
  const pagesRequests = await getAllPages()
  
  if(!pagesRequests.every(isPromiseFulfilled))
    return[]

  const pageRequestValues = pagesRequests.map(getValueOfFulfilledPromise)

  const mainPages = map(map(unifyPages),map(reduce(toIdObject, {}),groupBy(path(['translations', 'languages_code']), pageRequestValues[0]?.flatMap(unwind('translations')))))

  const pagesPathFinder = map(map(searchParent(mainPages)),mainPages)

  const pages = toFlattedTranslation(pageRequestValues.flat()).filter(page => ['en', 'es', 'pt'].includes(page.locale)).map(page => ({path: [...(pagesPathFinder[page.locale][page.parent] || []),page.path].join('/')}))
  
  console.log(pages) 
  return []
}

export { getAllPagesParams };