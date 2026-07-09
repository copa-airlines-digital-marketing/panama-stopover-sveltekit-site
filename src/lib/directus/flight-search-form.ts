import { z } from 'zod';

const tripTypeSchema = z.union([
	z.literal('roundtrip'),
	z.literal('one_way'),
	z.literal('multicity')
]);

const layoutVariantSchema = z.union([
	z.literal('default'),
	z.literal('compact'),
	z.literal('hero')
]);

const themeSchema = z.union([z.literal('light'), z.literal('dark')]);

const flightSearchFormTranslationSchema = z.object({
	languages_code: z.string().nullable().optional(),
	eyebrow: z.string().nullable().optional(),
	title: z.string().nullable().optional(),
	subtitle: z.string().nullable().optional(),
	roundtrip_label: z.string().nullable().optional(),
	one_way_label: z.string().nullable().optional(),
	multicity_label: z.string().nullable().optional(),
	stopover_toggle_label: z.string().nullable().optional(),
	stopover_placement_label: z.string().nullable().optional(),
	stopover_outbound_label: z.string().nullable().optional(),
	stopover_return_label: z.string().nullable().optional(),
	stopover_segment_label: z.string().nullable().optional(),
	origin_label: z.string().nullable().optional(),
	origin_placeholder: z.string().nullable().optional(),
	destination_label: z.string().nullable().optional(),
	destination_placeholder: z.string().nullable().optional(),
	departure_date_label: z.string().nullable().optional(),
	return_date_label: z.string().nullable().optional(),
	stopover_duration_label: z.string().nullable().optional(),
	stopover_duration_placeholder: z.string().nullable().optional(),
	stopover_helper_text: z.string().nullable().optional(),
	stopover_duration_min_label: z.string().nullable().optional(),
	stopover_duration_max_label: z.string().nullable().optional(),
	itinerary_selector_label: z.string().nullable().optional(),
	passengers_label: z.string().nullable().optional(),
	adults_label: z.string().nullable().optional(),
	children_label: z.string().nullable().optional(),
	infants_label: z.string().nullable().optional(),
	passenger_helper_text: z.string().nullable().optional(),
	passenger_total_template: z.string().nullable().optional(),
	cabin_label: z.string().nullable().optional(),
	economy_label: z.string().nullable().optional(),
	business_label: z.string().nullable().optional(),
	promo_code_label: z.string().nullable().optional(),
	promo_code_placeholder: z.string().nullable().optional(),
	summary_title: z.string().nullable().optional(),
	summary_segment_label: z.string().nullable().optional(),
	summary_stopover_label: z.string().nullable().optional(),
	summary_continue_label: z.string().nullable().optional(),
	summary_outbound_label: z.string().nullable().optional(),
	summary_return_label: z.string().nullable().optional(),
	summary_date_label: z.string().nullable().optional(),
	summary_arrival_label: z.string().nullable().optional(),
	summary_return_starts_label: z.string().nullable().optional(),
	summary_select_date_label: z.string().nullable().optional(),
	summary_pending_dates_label: z.string().nullable().optional(),
	summary_destination_days_template: z.string().nullable().optional(),
	summary_arrive_after_stopover_label: z.string().nullable().optional(),
	external_new_tab_label: z.string().nullable().optional(),
	fallback_title: z.string().nullable().optional(),
	fallback_helper_text: z.string().nullable().optional(),
	fallback_roundtrip_cta_label: z.string().nullable().optional(),
	fallback_one_way_cta_label: z.string().nullable().optional(),
	fallback_multicity_cta_label: z.string().nullable().optional(),
	expanded_search_label: z.string().nullable().optional(),
	cta_label: z.string().nullable().optional(),
	disclaimer: z.string().nullable().optional(),
	loading_message: z.string().nullable().optional(),
	invalid_route_message: z.string().nullable().optional(),
	invalid_duration_message: z.string().nullable().optional(),
	required_field_message: z.string().nullable().optional(),
	max_passengers_message_template: z.string().nullable().optional(),
	infant_adult_message: z.string().nullable().optional(),
	return_date_after_departure_message: z.string().nullable().optional(),
	minimum_destination_night_message: z.string().nullable().optional(),
	routes_unavailable_message: z.string().nullable().optional(),
	no_routes_found_message: z.string().nullable().optional(),
	select_origin_label: z.string().nullable().optional(),
	select_destination_label: z.string().nullable().optional(),
	select_return_date_label: z.string().nullable().optional(),
	complete_dates_label: z.string().nullable().optional(),
	close_label: z.string().nullable().optional(),
	clear_selection_label: z.string().nullable().optional(),
	decrease_adults_label: z.string().nullable().optional(),
	increase_adults_label: z.string().nullable().optional(),
	decrease_children_label: z.string().nullable().optional(),
	increase_children_label: z.string().nullable().optional(),
	decrease_infants_label: z.string().nullable().optional(),
	increase_infants_label: z.string().nullable().optional(),
	summary_route_label: z.string().nullable().optional(),
	summary_outbound_flight_label: z.string().nullable().optional(),
	summary_return_flight_label: z.string().nullable().optional(),
	adult_singular_label: z.string().nullable().optional(),
	child_singular_label: z.string().nullable().optional(),
	infant_singular_label: z.string().nullable().optional(),
	night_singular_label: z.string().nullable().optional(),
	night_plural_label: z.string().nullable().optional()
});

const flightSearchFormSchema = z.object({
	id: z.union([z.string(), z.number()]).optional(),
	status: z.string().nullable().optional(),
	sort: z.number().nullable().optional(),
	key: z.string(),
	name: z.string().nullable().optional(),
	layout_variant: layoutVariantSchema.nullable().optional(),
	theme: themeSchema.nullable().optional(),
	supported_trip_types: tripTypeSchema.array(),
	default_trip_type: tripTypeSchema,
	stopover_enabled: z.boolean().nullable().optional(),
	show_stopover_duration: z.boolean().nullable().optional(),
	show_passengers: z.boolean().nullable().optional(),
	show_promo_code: z.boolean().nullable().optional(),
	show_itinerary_summary: z.boolean().nullable().optional(),
	fallback_enabled: z.boolean().nullable().optional(),
	fallback_roundtrip_url: z.string().url().nullable().optional(),
	fallback_one_way_url: z.string().url().nullable().optional(),
	fallback_multicity_url: z.string().url().nullable().optional(),
	shopping_base_url: z.string().url(),
	shopping_miles_url: z.string().url(),
	shopping_multicity_url: z.string().url(),
	translations: flightSearchFormTranslationSchema.array().nullable().optional()
});

const flightSearchFormQueryFields = ['*', { translations: ['*'] }];

type FlightSearchFormSchema = z.infer<typeof flightSearchFormSchema>;
type FlightSearchFormTranslationSchema = z.infer<typeof flightSearchFormTranslationSchema>;
type TripTypeSchema = z.infer<typeof tripTypeSchema>;

const isFlightSearchFormSchema = (value: unknown): value is FlightSearchFormSchema =>
	flightSearchFormSchema.safeParse(value).success;

export {
	flightSearchFormSchema,
	flightSearchFormTranslationSchema,
	flightSearchFormQueryFields,
	isFlightSearchFormSchema,
	tripTypeSchema
};

export type { FlightSearchFormSchema, FlightSearchFormTranslationSchema, TripTypeSchema };
