import { pagePathFields } from '../page';
import { getItems, type DirectusRequestBody } from '../../infrastructure/directus/utils';

const paramExistAndIsString = ([key, value]: [string, string | number | null | undefined]) => {
	if ((typeof value === 'string' || typeof value === 'number') && !!value) return true;

	console.error(`${key} is required to retrieve the tour, but recieved: ${value}`);

	return false;
};

const validateAllParameters = (params: Record<string, string | number | null | undefined>) =>
	Object.entries(params).every(paramExistAndIsString);

const getTourQuery = ({ locale, category, subCategory, article }: DirectusRequestBody) => ({
	fields: [
		'main_image',
		'duration',
		'start_time',
		'meeting_point',
		'end_point',
		'supported_languages',
		'pilar',
		'promo_code',
		'promo_discount_amount',
		'promo_discount_percent',
		{ experience_category: ['id', { translations: ['languages_code', 'label'] }] } as any,
		{ gallery: ['directus_files_id'] },
		{ operator: ['name', 'main_image', 'contact', 'network'] },
		{
			translations: [
				'languages_code',
				'path',
				'name',
				'description',
				'experience',
				'included',
				'not_included',
				'promo_name',
				'promo_description',
				'url'
			]
		},
		{ parent_page: pagePathFields }
	] as any,
	filter: {
		_and: [
			{ translations: { languages_code: { _eq: locale } } },
			{ translations: { path: { _eq: article } } },
			{ parent_page: { translations: { languages_code: { _eq: locale } } } },
			{ parent_page: { translations: { path: { _eq: subCategory } } } },
			{ parent_page: { parent: { translations: { languages_code: { _eq: locale } } } } },
			{ parent_page: { parent: { translations: { path: { _eq: category } } } } },
			{
				parent_page: { parent: { parent: { translations: { languages_code: { _eq: locale } } } } }
			},
			{ parent_page: { parent: { parent: { translations: { path: { _eq: locale } } } } } }
		]
	} as any,
	deep: {
		experience_category: {
			translations: { _filter: { languages_code: { _eq: locale } } }
		}
	} as any
} as const);

const getPublishedTours = async (filters: DirectusRequestBody) => {
	const { locale, category, subCategory, article } = filters;
	const params = { locale, category, subCategory, article };

	console.log('getting tour', article);

	if (!validateAllParameters(params)) return null;

	const tours = await getItems('stopover_tour', getTourQuery(params), filters.preview);

	if (!tours) return null;

	const [tour] = tours;

	return tour;
};

export { getPublishedTours };
