import { getItems } from '$lib/directus/utils.js'
import { error, json } from '@sveltejs/kit'
import { buildQuery } from './utils.js'

export async function GET({ url : { searchParams } }) {
    const locale = searchParams.get('locale')

    if (!locale)
        return error(400, { message: 'bad request' })

    const preview = searchParams.get('preview')
    const maxItems = parseInt(searchParams.get('max-items') || '-1')
    const highlights = JSON.parse(searchParams.get('highlights')?.toLocaleLowerCase() || 'false' )
    const sorts = searchParams.getAll('sort')

    const hotels = await getItems( 'stopover_hotels', buildQuery(maxItems, highlights, sorts, locale ),  preview )

    if (!hotels)
        return error(404, { message: 'not found'})

    return json(hotels)
}