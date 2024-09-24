import { createDirectus, rest, staticToken, type DirectusClient, type RestClient, type StaticTokenClient } from "@directus/sdk";
import type { Schema } from "./schema";

type Client = DirectusClient<Schema> & StaticTokenClient<Schema> & RestClient<Schema>

const getClient = (host: string, token: string) => 
  createDirectus<Schema>(host).with(staticToken(token)).with(rest())

export {
  getClient
}

export type {
  Client
}