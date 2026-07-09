import {
	getItems,
	getTranslationFilter,
	type DirectusRequestBody
} from '../../infrastructure/directus/utils';
import { say } from '$lib/core/utils';
import { groupsSchema } from '../../directus/groups';
import { contentGroupQueryFields, contentGroupSchema } from '../../directus/content-group';
import { flightSearchFormQueryFields } from '../../directus/flight-search-form';
import {
	stopoverHotelModuleQueryFields,
	stopoverHotelModuleSchema
} from '../../directus/stopover_hotel_module';
import { formQueryFields, formSchema } from '../../directus/forms';
import { textContentQuery, textContentSchema } from '../../directus/text-content';
import { navigationQuery, navigationSchema } from '../../directus/navigation';
import { logoQuery, logosSchema } from '../../directus/logos';
import { headerQuery, headerSchema } from '../../directus/header';
import { stopoverMixedExperienceModuleQueryFields } from '../../directus/stopover_mixed_experience_module';
import { isSectionSchema, sectionSchema } from './types';

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null;

const sectionFilter = (storefront: string | number, page: string | number) => ({
	_and: [
		{ page_storefronts: { pages_storefronts_id: { storefronts_code: { _eq: storefront } } } },
		{ page_storefronts: { pages_storefronts_id: { pages_id: { _eq: page } } } }
	]
});

const removeNullSectionContentItems = (sections: unknown) => {
	if (!Array.isArray(sections)) return { sections, removedItems: [] };

	const removedItems: unknown[] = [];

	const sanitizedSections = sections.map((section, sectionIndex) => {
		if (!isRecord(section) || !Array.isArray(section.section_content)) return section;

		const sectionContent = section.section_content.filter((sectionContentItem, contentIndex) => {
			if (!isRecord(sectionContentItem) || sectionContentItem.item !== null) return true;

			removedItems.push({
				section_index: sectionIndex,
				section_id: section.id,
				section_content_index: contentIndex,
				section_content_id: sectionContentItem.id,
				collection: sectionContentItem.collection
			});
			return false;
		});

		return {
			...section,
			section_content: sectionContent
		};
	});

	return { sections: sanitizedSections, removedItems };
};

const rawSectionContentItemsQuery = (storefront: string, page: string) => ({
	fields: [
		'id',
		{
			section_content: ['id', 'collection', 'item']
		}
	],
	filter: sectionFilter(storefront, page),
	sort: ['page_storefronts.sort']
});

const getRawSectionContentItemsById = (sections: unknown) => {
	const items = new Map<string, unknown>();

	if (!Array.isArray(sections)) return items;

	sections.forEach((section) => {
		if (!isRecord(section) || !Array.isArray(section.section_content)) return;

		section.section_content.forEach((sectionContentItem) => {
			if (!isRecord(sectionContentItem)) return;

			const id = sectionContentItem.id;
			if (typeof id !== 'string' && typeof id !== 'number') return;

			items.set(String(id), sectionContentItem.item);
		});
	});

	return items;
};

const getStopoverHotelModulesByName = async (
	names: string[],
	preview: DirectusRequestBody['preview']
) => {
	if (names.length === 0) return new Map<string, unknown>();

	const modules = await getItems(
		'stopover_hotel_module',
		{
			fields: stopoverHotelModuleQueryFields,
			filter: {
				name: {
					_in: names
				}
			},
			limit: -1
		},
		preview
	);

	const modulesByName = new Map<string, unknown>();

	if (!Array.isArray(modules)) return modulesByName;

	modules.forEach((module) => {
		if (!isRecord(module) || typeof module.name !== 'string') return;
		modulesByName.set(module.name, module);
	});

	return modulesByName;
};

const hydrateNullStopoverHotelModules = async (sections: unknown, filters: DirectusRequestBody) => {
	if (!Array.isArray(sections)) return { sections, hydratedItems: [] };

	const { storefront, page } = filters;
	if (!storefront || !page) return { sections, hydratedItems: [] };

	const missingItems: Array<{
		sectionIndex: number;
		contentIndex: number;
		sectionId: unknown;
		sectionContentId: string;
	}> = [];

	sections.forEach((section, sectionIndex) => {
		if (!isRecord(section) || !Array.isArray(section.section_content)) return;

		section.section_content.forEach((sectionContentItem, contentIndex) => {
			if (
				!isRecord(sectionContentItem) ||
				sectionContentItem.collection !== 'stopover_hotel_module' ||
				sectionContentItem.item !== null ||
				(typeof sectionContentItem.id !== 'string' && typeof sectionContentItem.id !== 'number')
			) {
				return;
			}

			missingItems.push({
				sectionIndex,
				contentIndex,
				sectionId: section.id,
				sectionContentId: String(sectionContentItem.id)
			});
		});
	});

	if (missingItems.length === 0) return { sections, hydratedItems: [] };

	const rawSections = await getItems(
		'sections',
		rawSectionContentItemsQuery(String(storefront), String(page)),
		filters.preview
	);
	const rawItemsById = getRawSectionContentItemsById(rawSections);
	const moduleNames = Array.from(
		new Set(
			missingItems
				.map((item) => rawItemsById.get(item.sectionContentId))
				.filter((item): item is string => typeof item === 'string' && item.length > 0)
		)
	);
	const modulesByName = await getStopoverHotelModulesByName(moduleNames, filters.preview);
	const hydratedItems: unknown[] = [];

	const hydratedSections = sections.map((section, sectionIndex) => {
		if (!isRecord(section) || !Array.isArray(section.section_content)) return section;

		const sectionContent = section.section_content.map((sectionContentItem, contentIndex) => {
			if (!isRecord(sectionContentItem)) return sectionContentItem;

			const missingItem = missingItems.find(
				(item) => item.sectionIndex === sectionIndex && item.contentIndex === contentIndex
			);
			if (!missingItem) return sectionContentItem;

			const moduleName = rawItemsById.get(missingItem.sectionContentId);
			if (typeof moduleName !== 'string') return sectionContentItem;

			const module = modulesByName.get(moduleName);
			if (!module) return sectionContentItem;

			hydratedItems.push({
				section_index: sectionIndex,
				section_id: missingItem.sectionId,
				section_content_index: contentIndex,
				section_content_id: missingItem.sectionContentId,
				collection: sectionContentItem.collection,
				module_name: moduleName
			});

			return {
				...sectionContentItem,
				item: module
			};
		});

		return {
			...section,
			section_content: sectionContent
		};
	});

	return { sections: hydratedSections, hydratedItems };
};

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
						form: formQueryFields,
						stopover_hotel_module: stopoverHotelModuleQueryFields,
						stopover_mixed_experience_module: stopoverMixedExperienceModuleQueryFields,
						block_flight_search_form: flightSearchFormQueryFields
					}
				}
			]
		}
	],
	filter: sectionFilter(storefront, page),
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

	const { sections: hydratedSections, hydratedItems } = await hydrateNullStopoverHotelModules(
		sectionRequest,
		filters
	);

	if (hydratedItems.length > 0) {
		say('Recovered section content entries from raw Directus many-to-any references', {
			filters,
			hydratedItems: hydratedItems.slice(0, 10)
		});
	}

	const { sections, removedItems } = removeNullSectionContentItems(hydratedSections);

	if (removedItems.length > 0) {
		say('Ignoring section content entries without item', {
			filters,
			removedItems: removedItems.slice(0, 10)
		});
	}

	if (isSectionSchema(sections)) {
		return sections;
	}

	const errors = sectionSchema.array().safeParse(sections).error?.errors;

	say('Sections did not comply with the schema', errors?.slice(0, 5));
	return null;
};

export { getSections };
