import { getTours } from '$cms';
import { DIRECTUS_REST_URL, DIRECTUS_TOKEN } from '$env/static/private';
import { pagePathFields } from '../page';
import { type DirectusRequestBody } from '../utils';

const paramExistAndIsString = ([key, value]: [string, string | number | null | undefined]) => {
	if ((typeof value === 'string' || typeof value === 'number') && !!value) return true;

	console.error(`${key} is required to retrieve the tour, but recieved: ${value}`);

	return false;
};

const validateAllParameters = (params: Record<string, string | number | null | undefined>) =>
	Object.entries(params).every(paramExistAndIsString);

const getPublishedTours = async (filters: DirectusRequestBody) => {
	const { locale, category, subCategory, article } = filters;

	console.log('getting tour', article);

	if (!validateAllParameters({ locale, category, subCategory, article })) return null;

	const tours = await getTours(DIRECTUS_REST_URL, DIRECTUS_TOKEN, {
		fields: [
			'main_image',
			'duration',
			'start_time',
			'meeting_point',
			'end_point',
			'category',
			'supported_languages',
			'pilar',
			'promo_code',
			'promo_discount_amount',
			'promo_discount_percent',
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
		],
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
		}
	});

	const [tour] = tours;

	return tour;
};

export { getPublishedTours };
