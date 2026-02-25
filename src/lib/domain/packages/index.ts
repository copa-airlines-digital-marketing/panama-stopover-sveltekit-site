/**
 * Packages Domain - Public Exports
 */

// Types
export type {
	PackageSchema,
	PackageTranslation,
	FileReference,
	ParentPage
} from './types';

// Validators
export {
	packageSchema,
	isPackageSchema,
	packageTranslationSchema,
	fileSchema,
	parentPageSchema
} from './types';

// Queries
export {
	packageQueryFields,
	buildPackageByPathQuery,
	buildPackageListQuery
} from './schemas';

// Mappers & View Models
export type {
	PackageCardViewModel,
	PackageDetailViewModel
} from './mappers';

export {
	mapDirectusPackageToViewModel,
	getPackageTranslation,
	getPackageName,
	mapPackageToCardViewModel,
	mapPackageToDetailViewModel
} from './mappers';

// Legacy export for backward compatibility
export type { StopoverPackageQuery } from '$lib/directus/package/types';
