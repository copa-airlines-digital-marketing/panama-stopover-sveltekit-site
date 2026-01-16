/**
 * Transportation Domain - Public Exports
 */

// Types
export type {
	TransportationSchema,
	TransportationTranslation,
	FileReference,
	ParentPage
} from './types';

// Validators
export {
	transportationSchema,
	isTransportationSchema,
	transportationTranslationSchema,
	fileSchema,
	parentPageSchema
} from './types';

// Queries
export {
	transportationQueryFields,
	buildTransportationByPathQuery,
	buildTransportationListQuery
} from './schemas';

// Mappers & View Models
export type {
	TransportationCardViewModel,
	TransportationDetailViewModel
} from './mappers';

export {
	mapDirectusTransportationToViewModel,
	getTransportationTranslation,
	getTransportationName,
	mapTransportationToCardViewModel,
	mapTransportationToDetailViewModel
} from './mappers';

// Legacy export for backward compatibility
export type { TransportationQuery } from '$lib/directus/transportation/types';
