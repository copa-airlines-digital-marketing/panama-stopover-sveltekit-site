import { describe, expect, test } from 'vitest';
import { readFileSync } from 'node:fs';
import {
	flightSearchFormQueryFields,
	flightSearchFormSchema,
	isFlightSearchFormSchema
} from './flight-search-form';
import { contentGroupSchema } from './content-group';
import { sectionSchema } from './section';

const flightSearchFormSource = readFileSync(
	'src/lib/components/directus/general-components/flight-search-form/flight-search-form.svelte',
	'utf-8'
);

const flightSearchFormFixture = {
	id: 1,
	status: 'published',
	sort: 1,
	key: 'stopover-flight-search',
	name: 'Stopover flight search',
	layout_variant: 'default',
	theme: 'light',
	supported_trip_types: ['roundtrip', 'one_way', 'multicity'],
	default_trip_type: 'roundtrip',
	stopover_enabled: true,
	show_stopover_duration: true,
	show_passengers: true,
	show_promo_code: true,
	show_itinerary_summary: true,
	fallback_enabled: true,
	fallback_roundtrip_url: 'https://www.copaair.com/en-gs/',
	fallback_one_way_url: 'https://www.copaair.com/en-gs/',
	fallback_multicity_url: 'https://www.copaair.com/en-gs/',
	shopping_base_url: 'https://shopping.copaair.com',
	shopping_miles_url: 'https://shopping.copaair.com/miles',
	shopping_multicity_url: 'https://shopping.copaair.com/multicity',
	translations: [
		{
			languages_code: 'es-PA',
			eyebrow: 'Panama Stopover',
			title: 'Busca tu vuelo',
			subtitle: 'Agrega una parada en Panama.',
			roundtrip_label: 'Ida y vuelta',
			one_way_label: 'Solo ida',
			multicity_label: 'Multiciudad',
			stopover_toggle_label: 'Agregar Stopover',
			stopover_placement_label: 'Donde quieres hacer Stopover?',
			stopover_outbound_label: 'En la ida',
			stopover_return_label: 'En el regreso',
			stopover_segment_label: 'Segmento',
			origin_label: 'Origen',
			origin_placeholder: 'Ciudad, pais (IATA)',
			destination_label: 'Destino',
			destination_placeholder: 'Ciudad, pais (IATA)',
			departure_date_label: 'Fecha de salida',
			return_date_label: 'Fecha de regreso',
			stopover_duration_label: 'Noches en Panama',
			stopover_duration_placeholder: '1 a 15 noches',
			stopover_helper_text: 'Puedes quedarte hasta 15 noches.',
			passengers_label: 'Pasajeros',
			promo_code_label: 'Codigo promocional',
			promo_code_placeholder: 'Opcional',
			summary_title: 'Resumen de tu busqueda',
			summary_segment_label: 'Segmento',
			summary_stopover_label: 'Stopover',
			summary_continue_label: 'Continuar',
			summary_outbound_label: 'Ida',
			summary_return_label: 'Regreso',
			summary_date_label: 'Fecha',
			fallback_title: 'Continua en copa.com',
			fallback_helper_text: 'Tambien puedes buscar en el formulario oficial.',
			fallback_roundtrip_cta_label: 'Buscar ida y vuelta',
			fallback_one_way_cta_label: 'Buscar solo ida',
			fallback_multicity_cta_label: 'Buscar multiciudad',
			expanded_search_label: 'Busqueda ampliada',
			cta_label: 'Buscar vuelos',
			disclaimer: 'La disponibilidad final se confirma en shopping.',
			loading_message: 'Cargando rutas',
			invalid_route_message: 'Ruta no disponible',
			invalid_duration_message: 'Selecciona entre 1 y 15 noches',
			required_field_message: 'Este campo es requerido',
			max_passengers_message_template: 'Máximo {max} pasajeros.',
			infant_adult_message: 'Cada infante debe viajar con un adulto.',
			return_date_after_departure_message: 'La fecha de regreso debe ser posterior a la salida.',
			minimum_destination_night_message: 'Mantén al menos 1 noche en tu destino final.',
			routes_unavailable_message:
				'Las rutas no están disponibles. Intenta nuevamente en unos segundos.',
			no_routes_found_message: 'No se encontraron rutas',
			select_origin_label: 'Selecciona origen',
			select_destination_label: 'Selecciona destino',
			select_return_date_label: 'Selecciona regreso',
			complete_dates_label: 'Completa fechas para calcular',
			close_label: 'Cerrar',
			clear_selection_label: 'Limpiar selección',
			decrease_adults_label: 'Disminuir adultos',
			increase_adults_label: 'Aumentar adultos',
			decrease_children_label: 'Disminuir niños',
			increase_children_label: 'Aumentar niños',
			decrease_infants_label: 'Disminuir infantes',
			increase_infants_label: 'Aumentar infantes',
			summary_route_label: 'Ruta',
			summary_outbound_flight_label: 'Vuelo de salida',
			summary_return_flight_label: 'Vuelo de regreso',
			adult_singular_label: 'Adulto',
			child_singular_label: 'Niño',
			infant_singular_label: 'Infante',
			night_singular_label: 'noche',
			night_plural_label: 'noches'
		}
	]
};

describe('block_flight_search_form schema contract', () => {
	test('accepts the agreed block model', () => {
		expect(isFlightSearchFormSchema(flightSearchFormFixture)).toBe(true);
		expect(flightSearchFormSchema.parse(flightSearchFormFixture).default_trip_type).toBe(
			'roundtrip'
		);
	});

	test('rejects unsupported trip types', () => {
		const invalid = {
			...flightSearchFormFixture,
			supported_trip_types: ['roundtrip', 'stopover']
		};

		expect(flightSearchFormSchema.safeParse(invalid).success).toBe(false);
	});

	test('queries every field needed by the runtime contract', () => {
		expect(flightSearchFormQueryFields).toContain('*');
		expect(flightSearchFormQueryFields).toContainEqual({ translations: ['*'] });
	});

	test('can live directly in section_content', () => {
		const section = {
			id: 1,
			component: null,
			landmark: 'section',
			section_id: 'booking',
			horizontal_behaviour: 'contained',
			content_spacing: 'normal',
			vertical_spacing: 'normal',
			section_content: [
				{
					id: 10,
					collection: 'block_flight_search_form',
					component_name: null,
					area: null,
					display: '100',
					theme: 'light',
					horizontal_alignment: 'center',
					vertical_alignment: 'top',
					item: flightSearchFormFixture
				}
			],
			page_storefronts: []
		};

		expect(sectionSchema.safeParse(section).success).toBe(true);
	});

	test('can live inside content_group', () => {
		const contentGroup = {
			translations: [{ languages_code: 'es-PA', title: 'Booking' }],
			content: [
				{
					collection: 'block_flight_search_form',
					component: null,
					item: flightSearchFormFixture
				}
			]
		};

		expect(contentGroupSchema.safeParse(contentGroup).success).toBe(true);
	});
});

describe('mini booking bar keyboard contract', () => {
	test('lets focus leave the booking bar at the custom tab-order boundaries', () => {
		expect(flightSearchFormSource).toContain('focusAdjacentToMiniBar');
		expect(flightSearchFormSource).toContain('nextIndex < 0 || nextIndex >= steps.length');
		expect(flightSearchFormSource).toContain("event.shiftKey ? 'previous' : 'next'");
	});

	test('marks the passenger dropdown trigger with an explicit focus outline', () => {
		expect(flightSearchFormSource).toContain('let miniPassengersFocused');
		expect(flightSearchFormSource).toContain('data-passenger-focus');
		expect(flightSearchFormSource).toContain('data-[passenger-focus=true]:outline-solid');
		expect(flightSearchFormSource).toContain('data-[passenger-focus=true]:outline-2');
		expect(flightSearchFormSource).toContain('data-[passenger-focus=true]:outline-primary-faded');
	});

	test('renders final summary details for the booking state', () => {
		expect(flightSearchFormSource).toContain(
			'const summaryDetails = $derived(getSummaryDetails())'
		);
		expect(flightSearchFormSource).toContain('data-flight-summary-detail');
		expect(flightSearchFormSource).toContain('getPassengerSummaryText');
		expect(flightSearchFormSource).toContain('getFlightPathSummary');
		expect(flightSearchFormSource).toContain('getStopoverDetailSummary');
	});

	test('localizes assistive labels for modal, autocomplete, and passenger counters', () => {
		expect(flightSearchFormSource).toContain('closeLabel={modalCloseLabel}');
		expect(flightSearchFormSource).toContain('{clearSelectionLabel}');
		expect(flightSearchFormSource).toContain('translation?.close_label');
		expect(flightSearchFormSource).toContain('translation?.clear_selection_label');
		expect(flightSearchFormSource).toContain('translation?.decrease_adults_label');
		expect(flightSearchFormSource).toContain('passengerCounterAriaLabels.decreaseAdults');
		expect(flightSearchFormSource).not.toContain('decrementAriaLabel="Decrease adults"');
		expect(flightSearchFormSource).not.toContain('incrementAriaLabel="Increase infants"');
	});

	test('reads booking form validation and summary copy from Directus before fallbacks', () => {
		expect(flightSearchFormSource).toContain('translation?.max_passengers_message_template');
		expect(flightSearchFormSource).toContain('translation?.infant_adult_message');
		expect(flightSearchFormSource).toContain('translation?.return_date_after_departure_message');
		expect(flightSearchFormSource).toContain('translation?.minimum_destination_night_message');
		expect(flightSearchFormSource).toContain('translation?.routes_unavailable_message');
		expect(flightSearchFormSource).toContain('translation?.no_routes_found_message');
		expect(flightSearchFormSource).toContain('translation?.select_origin_label');
		expect(flightSearchFormSource).toContain('translation?.select_destination_label');
		expect(flightSearchFormSource).toContain('translation?.select_return_date_label');
		expect(flightSearchFormSource).toContain('translation?.complete_dates_label');
		expect(flightSearchFormSource).toContain('translation?.summary_route_label');
		expect(flightSearchFormSource).toContain('translation?.summary_outbound_flight_label');
		expect(flightSearchFormSource).toContain('translation?.summary_return_flight_label');
		expect(flightSearchFormSource).toContain('translation?.adult_singular_label');
		expect(flightSearchFormSource).toContain('translation?.night_plural_label');
		expect(flightSearchFormSource).toContain('const datePlaceholderLabel');
		expect(flightSearchFormSource).toContain('const passengerLabel');
		expect(flightSearchFormSource).toContain('const stopoverDurationDisplayLabel');
		expect(flightSearchFormSource).toContain("const nightsPlaceholder = '__STOPOVER_NIGHTS__';");
		expect(flightSearchFormSource).toContain(".replaceAll('{nights}', nightsPlaceholder)");
		expect(flightSearchFormSource).toContain(".replaceAll(nightsPlaceholder, '{nights}')");
		expect(flightSearchFormSource).toContain('/\\bnights?\\b/gi');
		expect(flightSearchFormSource).toContain('/\\bnoches?\\b/gi');
		expect(flightSearchFormSource).toContain(
			'errors.destination = translation?.invalid_route_message || getLocalizedNoRoutesMessage();'
		);
		expect(flightSearchFormSource).toContain('formatStopoverNightTooltip(1)');
		expect(flightSearchFormSource).not.toContain("'Route not available'");
		expect(flightSearchFormSource).not.toContain("'Select dates'");
		expect(flightSearchFormSource).not.toContain("'Stopover nights'");
		expect(flightSearchFormSource).not.toContain("'Current total: {total}/{max}'");
	});

	test('cleans shopping booking-panel fallback URLs before opening multi-city', () => {
		expect(flightSearchFormSource).toContain('getCleanMulticityFallbackUrl');
		expect(flightSearchFormSource).toContain("url.pathname = '/booking-panel'");
		expect(flightSearchFormSource).toContain("params.append(`date${index}`, 'null')");
		expect(flightSearchFormSource).toContain("params.append(`area${index}`, '')");
		expect(flightSearchFormSource).toContain("params.append('stopover', 'false')");
		expect(flightSearchFormSource).toContain("params.append('stopoverNights', 'null')");
		expect(flightSearchFormSource).toContain("params.append('cabinType', 'Y')");
	});
});
