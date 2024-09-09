import { json } from "@sveltejs/kit"

export const load = ( args ) => {
  console.log( args )
  return json( {}, { status: 200 } )
}