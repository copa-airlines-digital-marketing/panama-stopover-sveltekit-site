import {
	DIRECTUS_REST_URL,
	DIRECTUS_TOKEN,
	PREVIEW_SECRET,
	DIRECTUS_PREVIEW_TOKEN
} from '$env/static/private';
import { readItem, readItems, type QueryItem } from '@directus/sdk';
import { getClient } from './client';
import type { Schema } from './schema';
import { replace } from 'ramda';

type DirectusRequestBody = Record<string, string | number | undefined | null>;

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null;

const getErrorMessage = (error: unknown) => {
	if (error instanceof Error) return error.message;
	if (typeof error === 'string') return error;
	return 'Unknown Directus error';
};

const getErrorDetails = (error: unknown) => {
	if (!isRecord(error)) return undefined;

	return {
		name: typeof error.name === 'string' ? error.name : undefined,
		message: getErrorMessage(error),
		errors: error.errors,
		response: error.response
	};
};

const logDirectusError = (
	operation: 'readItem' | 'readItems',
	context: Record<string, unknown>,
	error: unknown
) => {
	console.error(
		`[directus:${operation}] Request failed`,
		JSON.stringify(
			{
				...context,
				error: getErrorDetails(error) ?? getErrorMessage(error)
			},
			null,
			2
		)
	);
};

/**
 * Gets a single item from a Directus collection
 * @param collection - Collection name
 * @param id - Item ID
 * @param query - Query configuration
 * @param preview - Preview secret or null
 * @returns Item data or null if error
 */
const getItem = async <T>(
	collection: keyof Schema,
	id: string | number,
	query: QueryItem<Schema, T>,
	preview: string | number | null | undefined
) => {
	const token = preview === PREVIEW_SECRET ? DIRECTUS_PREVIEW_TOKEN : DIRECTUS_TOKEN;
	try {
		const client = getClient(DIRECTUS_REST_URL, token);
		const request = await client.request(readItem(collection, id, query));
		return request;
	} catch (error) {
		logDirectusError(
			'readItem',
			{
				collection,
				id,
				preview: preview === PREVIEW_SECRET,
				query
			},
			error
		);
		return null;
	}
};

/**
 * Gets multiple items from a Directus collection
 * @param collection - Collection name
 * @param query - Query configuration
 * @param preview - Preview secret or null
 * @returns Array of items or null if error
 */
const getItems = async <T>(
	collection: keyof Schema,
	query: QueryItem<Schema, T>,
	preview: string | number | null | undefined
) => {
	const token = preview === PREVIEW_SECRET ? DIRECTUS_PREVIEW_TOKEN : DIRECTUS_TOKEN;
	try {
		const client = getClient(DIRECTUS_REST_URL, token);
		const request = await client.request(readItems(collection, query));
		return request;
	} catch (error) {
		logDirectusError(
			'readItems',
			{
				collection,
				preview: preview === PREVIEW_SECRET,
				query
			},
			error
		);
		return null;
	}
};

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
