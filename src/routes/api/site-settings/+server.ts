import { getData } from "$lib/data/index.js"
import { json } from "@sveltejs/kit"

/** @type {import('./$types').PageServerLoad} */
export async function GET() {
  const data = getData('site-settings', 60*5)
  console.log( data )
  return json( {}, { status: 200 } )
}