import { getData } from '$lib/data/index.js';
import { articleToKeyMap, type KeyToTypeMap } from '$lib/directus/index.js';
import { isPageSettings } from '$lib/domain/pages';
import { isSectionSchema, sectionSchema, type SectionSchema } from '$lib/directus/section.js';
import { isEmpty, isNil } from 'ramda';

type RequestBody = {
	locale: string;
	home?: string;
	category?: string;
	subCategory?: string;
	article?: string;
	preview?: string | null | undefined;
};

type PageDataResult = Partial<KeyToTypeMap> & {
	sections?: SectionSchema[];
};

export async function getPageData(body: RequestBody): Promise<PageDataResult | null> {
	const { locale, subCategory, article, preview } = body;

	const storefront = 'gs';

	if (!locale) return null;

	const key = articleToKeyMap(subCategory || null, article || null);

	if (isNil(key)) return null;

	console.log('getting: ', key, body);

	const data = await getData(key, body);

	if (isNil(data) || isEmpty(data)) {
		return null;
	}

	let sections: SectionSchema[] | undefined = undefined;

	if (isPageSettings(data)) {
		const sectionsRequest = await getData('sections', {
			locale,
			storefront,
			page: data.id,
			preview
		});

		if (!isSectionSchema(sectionsRequest)) {
			return null;
		}

		sections = sectionsRequest;
	}

	return { [key]: data, sections } as PageDataResult;
}
