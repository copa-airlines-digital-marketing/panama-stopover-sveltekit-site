import type { QueryItem } from '@directus/sdk';
import type { Schema } from '$lib/infrastructure/directus/schema';

/**
 * Query field specifications for pages collection
 */

export const translatedPathField = { 
	translations: ['path', 'languages_code', 'title_tag'] 
} as const;

export const pagePathFields = [
	translatedPathField,
	{
		parent: [
			translatedPathField,
			{ parent: [translatedPathField, { parent: [translatedPathField] }] }
		]
	}
] as const;

export const pageQueryFields = [
	'id',
	'share_image',
	'index',
	'head_code',
	'start_of_body_code',
	'end_of_body_code',
	{ translations: ['languages_code', 'path', 'title_tag', 'meta_description'] },
	{ parent: pagePathFields }
] as const;

/**
 * Build a page query with locale filtering
 */
export function buildPageQuery(locale: string): QueryItem<Schema, 'pages'> {
	return {
		fields: pageQueryFields as any,
		filter: {
			translations: {
				languages_code: { _eq: locale }
			}
		} as any,
		deep: {
			translations: {
				_filter: {
					languages_code: { _eq: locale }
				}
			}
		}
	};
}

/**
 * Build a page query by path
 */
export function buildPageByPathQuery(
	locale: string,
	path: string
): QueryItem<Schema, 'pages'> {
	return {
		fields: pageQueryFields as any,
		filter: {
			_and: [
				{ translations: { languages_code: { _eq: locale } } } as any,
				{ translations: { path: { _eq: path } } } as any
			]
		},
		deep: {
			translations: {
				_filter: {
					languages_code: { _eq: locale }
				}
			}
		}
	};
}
