import {
	createDirectus,
	rest,
	staticToken,
	type DirectusClient,
	type RestClient,
	type StaticTokenClient
} from '@directus/sdk';
import type { Schema } from './schema';

type Client = DirectusClient<Schema> & StaticTokenClient<Schema> & RestClient<Schema>;

/**
 * Creates a Directus client with static token authentication
 * @param host - Directus server URL
 * @param token - Authentication token
 * @returns Configured Directus client
 */
const getClient = (host: string, token: string) =>
	createDirectus<Schema>(host).with(staticToken(token)).with(rest());

export { getClient };

export type { Client };
