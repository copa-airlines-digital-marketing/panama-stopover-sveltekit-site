import { getItems, getTranslationFilter, type DirectusRequestBody } from '../../infrastructure/directus/utils';
import { say } from '$lib/core/utils';
import { groupsSchema } from '../../directus/groups';
import { contentGroupQueryFields, contentGroupSchema } from '../../directus/content-group';
import { flightSearchFormQueryFields } from '../../directus/flight-search-form';
import { stopoverHotelModuleQueryFields, stopoverHotelModuleSchema } from '../../directus/stopover_hotel_module';
import { formSchema } from '../../directus/forms';
import { textContentQuery, textContentSchema } from '../../directus/text-content';
import { navigationQuery, navigationSchema } from '../../directus/navigation';
import { logoQuery, logosSchema } from '../../directus/logos';
import { headerQuery, headerSchema } from '../../directus/header';
import { isSectionSchema, sectionSchema } from './types';

/**
 * Builds a Directus query for fetching sections
 * @param storefront - Storefront code
 * @param page - Page ID
 * @param locale - Locale code
 * @returns Query configuration for Directus
 */
const sectionQuery = (storefront: string | number, page: string | number, locale: string | number) => ({
	fields: [
		'id',
		'landmark',
		'section_id',
		'horizontal_behaviour',
		'component',
		'content_spacing',
		'vertical_spacing',
		'content_horizontal_alignment',
		'content_horizontal_distribution',
		'content_vertical_alignment',
		'content_vertical_distribution',
		'background_color',
		{
			section_content: [
				'id',
				'collection',
				'component_name',
				'area',
				'display',
				'theme',
				'horizontal_alignment',
				'vertical_alignment',
				{
					item: {
						navigation: navigationQuery,
						Text_Content: textContentQuery,
						logos: logoQuery,
						icons: logoQuery,
						header: headerQuery,
						content_group: contentGroupQueryFields,
						stopover_hotel_module: stopoverHotelModuleQueryFields,
						block_flight_search_form: flightSearchFormQueryFields
					}
				}
			]
		}
	],
	filter: {
		_and: [
			{ page_storefronts: { pages_storefronts_id: { storefronts_code: { _eq: storefront } } } },
			{ page_storefronts: { pages_storefronts_id: { pages_id: { _eq: page } } } }
		]
	},
	deep: {
		section_content: {
			'item:Text_Content': getTranslationFilter(locale),
			'item:navigation': getTranslationFilter(locale),
			'item:form': getTranslationFilter(locale),
			'item:block_flight_search_form': getTranslationFilter(locale),
			'item:stopover_hotel_module': {
				filters: getTranslationFilter(locale)
			},
			'item:header': {
				navigations: {
					navigation_id: getTranslationFilter(locale)
				}
			},
			'item:content_group': {
				...getTranslationFilter(locale),
				content: {
					'item:navigation': getTranslationFilter(locale),
					'item:Text_Content': getTranslationFilter(locale),
					'item:form': getTranslationFilter(locale),
					'item:block_flight_search_form': getTranslationFilter(locale),
					'item:stopover_hotel_module': {
						filters: getTranslationFilter(locale)
					},
					_sort: ['order']
				}
			}
		}
	},
	sort: ['page_storefronts.sort']
});

/**
 * Fetches sections data from Directus
 * @param filters - Request filters including locale, storefront, page, preview
 * @returns Sections array or null if not found/invalid
 */
const getSections = async (filters: DirectusRequestBody) => {
	const { locale, storefront, page } = filters;

	if (!locale || !storefront || !page) {
		say('Locale, storefront, and page are required to get the sections', filters);
		return null;
	}

	const sectionRequest = await getItems(
		'sections',
		sectionQuery(storefront, page, locale),
		filters.preview
	);

	if (sectionRequest instanceof Response) {
		const responseText = await sectionRequest
			.clone()
			.text()
			.catch(() => null);

		say('Sections request returned a raw Response', {
			status: sectionRequest.status,
			statusText: sectionRequest.statusText,
			body: responseText?.slice(0, 1200)
		});

		return null;
	}

	if (isSectionSchema(sectionRequest)) {
		return sectionRequest;
	}

	const errors = sectionSchema.array().safeParse(sectionRequest).error?.errors;

	say('Sections did not comply with the schema', errors);
	return null;
};

export { getSections };
