import {
	DIRECTUS_REST_URL,
	DIRECTUS_TOKEN,
	PREVIEW_SECRET,
	DIRECTUS_PREVIEW_TOKEN
} from '$env/static/private';
import { readItem, readItems } from '@directus/sdk';
import { getClient } from './client';
import type { Schema } from './schema';
import { replace } from 'ramda';

type DirectusRequestBody = Record<string, string | number | boolean | undefined | null> & {
	article?: string | number | null | undefined;
	category?: string | number | null | undefined;
	locale?: string | number | null | undefined;
	page?: string | number | null | undefined;
	preview?: string | number | null | undefined;
	storefront?: string | number | null | undefined;
	subCategory?: string | number | null | undefined;
};

/**
 * Gets a single item from a Directus collection
 * @param collection - Collection name
 * @param id - Item ID
 * @param query - Query configuration
 * @param preview - Preview secret or null
 * @returns Item data or null if error
 */
async function getItem<Collection extends keyof Schema>(
	collection: Collection,
	id: string | number,
	query: unknown,
	preview: string | number | null | undefined
): Promise<Schema[Collection] | null>;
async function getItem<T>(
	collection: keyof Schema,
	id: string | number,
	query: unknown,
	preview: string | number | null | undefined
): Promise<T | null>;
async function getItem(
	collection: keyof Schema,
	id: string | number,
	query: unknown,
	preview: string | number | null | undefined
) {
	const token = preview === PREVIEW_SECRET ? DIRECTUS_PREVIEW_TOKEN : DIRECTUS_TOKEN;
	try {
		const client = getClient(DIRECTUS_REST_URL, token);
		const request = await client.request(readItem(collection as never, id, query as never));
		return request;
	} catch (error) {
		console.log(`error while getting item: ${id} from collection: ${collection}`, error);
		return null;
	}
}

/**
 * Gets multiple items from a Directus collection
 * @param collection - Collection name
 * @param query - Query configuration
 * @param preview - Preview secret or null
 * @returns Array of items or null if error
 */
async function getItems<Collection extends keyof Schema>(
	collection: Collection,
	query: unknown,
	preview: string | number | null | undefined
): Promise<Schema[Collection][] | null>;
async function getItems<T>(
	collection: keyof Schema,
	query: unknown,
	preview: string | number | null | undefined
): Promise<T[] | null>;
async function getItems(
	collection: keyof Schema,
	query: unknown,
	preview: string | number | null | undefined
) {
	const token = preview === PREVIEW_SECRET ? DIRECTUS_PREVIEW_TOKEN : DIRECTUS_TOKEN;
	try {
		const client = getClient(DIRECTUS_REST_URL, token);
		const request = await client.request(readItems(collection as never, query as never));
		return request;
	} catch (error) {
		console.log(
			`error while getting items from collection: ${collection}`,
			JSON.stringify(error, null, 2)
		);
		return null;
	}
}

/**
 * Creates a translation filter for Directus queries
 * @param locale - Locale code
 * @returns Filter object for translations
 */
const getTranslationFilter = (locale: string | number) => ({
	translations: {
		_filter: {
			languages_code: {
				_eq: locale
			}
		}
	}
});

/**
 * Converts an article slug to a readable string
 * @param article - Article slug (e.g., "my-article")
 * @returns Article as words (e.g., "my article")
 */
const articleToWordString = (article: string) => replace(/-/g, ' ', article);

export { articleToWordString, getItem, getItems, getTranslationFilter };

export type { DirectusRequestBody };
