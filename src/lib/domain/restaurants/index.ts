/**
 * Restaurants Domain - Public Exports
 */

// Types
export type {
	RestaurantSchema,
	RestaurantTranslation,
	Location,
	FileReference,
	ParentPage
} from './types';

// Validators
export {
	restaurantSchema,
	isRestaurantSchema,
	locationSchema,
	restaurantTranslationSchema,
	fileSchema,
	parentPageSchema
} from './types';

// Queries
export {
	restaurantQueryFields,
	buildRestaurantQuery,
	buildRestaurantListQuery
} from './schemas';

// Mappers & View Models
export type {
	RestaurantCardViewModel,
	RestaurantDetailViewModel
} from './mappers';

export {
	mapDirectusRestaurantToViewModel,
	getRestaurantTranslation,
	getRestaurantName,
	mapRestaurantToCardViewModel,
	mapRestaurantToDetailViewModel
} from './mappers';
