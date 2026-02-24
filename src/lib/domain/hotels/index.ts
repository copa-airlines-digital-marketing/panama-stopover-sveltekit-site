/**
 * Hotels Domain - Public Exports
 * 
 * Barrel export for all hotel domain types, validators, and repository functions.
 */

// Types
export type {
	HotelSchema,
	HotelTranslation,
	Location,
	FileReference,
	ParentPage
} from './types';

// Validators
export {
	hotelSchema,
	isHotelSchema,
	locationSchema,
	hotelTranslationSchema,
	fileSchema,
	parentPageSchema
} from './types';

// Queries
export {
	hotelQueryFields,
	buildHotelQuery,
	buildHotelListQuery
} from './schemas';

// Mappers & View Models
export type {
	HotelCardViewModel,
	HotelDetailViewModel
} from './mappers';

export {
	mapDirectusHotelToViewModel,
	getHotelTranslation,
	getHotelName,
	mapHotelToCardViewModel,
	mapHotelToDetailViewModel
} from './mappers';

// Repository (data access) - commented out until needed
// export { getSections } from './repository';
