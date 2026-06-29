<svelte:options runes={true} />

<script lang="ts">
	import { browser } from '$app/environment';
	import { base } from '$app/paths';
	import { getLocalTimeZone, today } from '@internationalized/date';
	import { Popover } from 'bits-ui';
	import { Autocomplete, type AutocompleteOption } from '$ui/components/autocomplete';
	import { ButtonGroup, type ButtonGroupOption } from '$ui/components/button-group';
	import { buttonVariants } from '$ui/components/button';
	import { Counter } from '$ui/components/counter';
	import {
		DatePicker,
		DateRangePicker,
		type DatePickerProps,
		type DateRangePickerProps
	} from '$ui/components/date-picker';
	import { Input } from '$ui/components/input';
	import { Modal } from '$ui/components/modal';
	import { NavTab, navTabVariants } from '$ui/components/nav-tab';
	import ExternalIcon from '$ui/components/icon/copa/external.svelte';
	import FlightArrivingIcon from '$ui/components/icon/copa/flight-arriving.svelte';
	import FlightDepartingIcon from '$ui/components/icon/copa/flight-departing.svelte';
	import SearchIcon from '$ui/components/icon/copa/search.svelte';
	import SearchModeMc from '$ui/components/icon/copa/search-mode-mc.svelte';
	import SearchModeOw from '$ui/components/icon/copa/search-mode-ow.svelte';
	import SearchModeRt from '$ui/components/icon/copa/search-mode-rt.svelte';
	import KeyboardArrow from '$ui/components/icon/regular/keyboard-arrow.svelte';
	import SeatIcon from '$ui/components/icon/copa/seat.svelte';
	import TravelersIcon from '$ui/components/icon/copa/travelers.svelte';
	import { AvionAterrizando, AvionDespegando, PanamaStopover } from '$ui/components/pictograms';
	import { Select, type SelectOption } from '$ui/components/select';
	import { Slider } from '$ui/components/slider';
	import type {
		FlightSearchFormSchema,
		FlightSearchFormTranslationSchema,
		TripTypeSchema
	} from '$lib/directus/flight-search-form';
	import {
		getAirportLabel,
		getDestinationOptions,
		getOriginOptions,
		isStopoverRouteIndex,
		isValidStopoverRoute,
		type StopoverRouteIndex
	} from '$lib/flight-search/stopover-routes';
	import { buildStopoverBookingUrl } from '$lib/flight-search/booking-url';

	type PickerDateValue = NonNullable<DatePickerProps['value']>;
	type PickerDateRange = NonNullable<DateRangePickerProps['value']>;
	type SummaryIcon = 'origin' | 'stopover' | 'destination';
	type SummaryStep = {
		icon: SummaryIcon;
		title: string;
		meta?: string;
		isPending?: boolean;
	};
	type SummaryDetail = {
		label: string;
		value: string;
		isPending?: boolean;
	};
	type Props = {
		item: FlightSearchFormSchema;
		component?: string | null;
	};
	type InternalTripType = Exclude<TripTypeSchema, 'multicity'>;
	type ValidationErrors = Partial<
		Record<'origin' | 'destination' | 'dates' | 'passengers' | 'stopoverNights' | 'routes', string>
	>;

	let { item, component = null }: Props = $props();

	const modalComponents = ['hero', 'hero-modal', 'modal'];
	const maxPassengers = 8;
	const hardMaxStopoverNights = 15;
	const bookingMinDate = today(getLocalTimeZone());
	const bookingMaxDate = bookingMinDate.add({ days: 330 });
	const miniTopSelectClass =
		'min-w-0 max-w-full py-0 [&>label]:sr-only [&>button]:!min-h-0 [&>button]:!min-w-0 [&>button]:!max-w-full [&>button]:!rounded-none [&>button]:!border-0 [&>button]:!bg-transparent [&>button]:!p-0 [&>button]:!font-normal [&>button]:!text-grey-600 [&>button]:!shadow-none [&>button]:hover:!border-transparent [&>button]:focus:!border-transparent [&_span]:!min-w-0 [&_span]:!text-grey-600';
	const miniLineFieldClass =
		'min-w-0 max-w-full py-0 [&>label]:sr-only [&>div]:!min-w-0 [&>div]:!max-w-full [&>div]:!rounded-none [&>div]:!border-0 [&>div]:!border-b [&>div]:!border-grey-200 [&>div]:!bg-transparent [&>div]:!px-0 [&>div]:!py-2 [&>div]:hover:!border-primary-light [&>div]:focus-within:!border-primary [&_input]:!min-w-0 [&_input]:!font-normal [&_input]:!text-grey-600 [&_input]:text-b [&_input]:placeholder:!text-grey-600';
	const miniDateFieldClass =
		'min-w-0 max-w-full py-0 md:col-span-2 min-[1180px]:col-span-1 [&>label]:sr-only [&>button]:!min-h-0 [&>button]:!min-w-0 [&>button]:!max-w-full [&>button]:!rounded-none [&>button]:!border-0 [&>button]:!border-b [&>button]:!border-grey-200 [&>button]:!bg-transparent [&>button]:!px-0 [&>button]:!py-2 [&>button]:!font-normal [&>button]:!text-grey-600 [&>button]:hover:!border-primary-light [&>button]:focus-visible:!border-primary [&_span[data-date-trigger-text=true]]:!min-w-0 [&_span[data-date-trigger-text=true]]:!truncate [&_span[data-date-trigger-text=true][data-has-value=true]]:!text-common-black';

	let modalOpen = $state(false);
	let selectedTripType = $state<TripTypeSchema>('roundtrip');
	let stopoverPlacementValue = $state<'outbound' | 'return'>('outbound');
	let cabinTypeValue = $state<'Y' | 'C'>('Y');
	let origin = $state('');
	let destination = $state('');
	let departureDateValue = $state<PickerDateValue | undefined>(undefined);
	let returnDateValue = $state<PickerDateValue | undefined>(undefined);
	let stopoverNightCount = $state(3);
	let miniPassengersOpen = $state(false);
	let miniPassengersFocused = $state(false);
	let adults = $state(1);
	let children = $state(0);
	let infants = $state(0);
	let promoCode = $state('');
	let isMiniCompactViewport = $state(false);
	let routeIndex = $state<StopoverRouteIndex | null>(null);
	let routeDataError = $state(false);
	let searchAttempted = $state(false);

	const translation = $derived<FlightSearchFormTranslationSchema | undefined>(
		item.translations?.[0] ?? undefined
	);
	const isHeroModal = $derived(
		modalComponents.includes(component ?? '') || item.layout_variant === 'hero'
	);
	const title = $derived(translation?.title || item.name || 'Book your Stopover');
	const subtitle = $derived(translation?.subtitle || getDefaultSubtitle());
	const modalActionLabel = $derived(translation?.cta_label || getDefaultSearchActionLabel());
	const expandedSearchLabel = $derived(getExpandedSearchLabel());
	const modalCloseLabel = $derived(getLocalizedControlLabel('close'));
	const clearSelectionLabel = $derived(getLocalizedControlLabel('clearSelection'));
	const passengerCounterAriaLabels = $derived(getPassengerCounterAriaLabels());
	const supportedTripTypes = $derived(
		item.supported_trip_types?.length ? item.supported_trip_types : [item.default_trip_type]
	);
	const defaultTripType = $derived(item.default_trip_type || supportedTripTypes[0]);
	const stopoverAvailable = $derived(item.stopover_enabled !== false);
	const pickerLocale = $derived(getPickerLocale(translation?.languages_code));
	const travelDateRange = $derived<PickerDateRange>({
		start: departureDateValue,
		end: returnDateValue
	});
	const departureDate = $derived(toIsoDate(departureDateValue));
	const returnDate = $derived(toIsoDate(returnDateValue));
	const stopoverPlacement = $derived<'outbound' | 'return'>(stopoverPlacementValue);
	const stopoverNightMax = $derived(hardMaxStopoverNights);
	const stopoverNights = $derived(String(stopoverNightCount));
	const stopoverCalendarRange = $derived(getStopoverCalendarRange());
	const cabinType = $derived<'Y' | 'C'>(cabinTypeValue);
	const adultCount = $derived(adults);
	const childCount = $derived(children);
	const infantCount = $derived(infants);
	const passengerTotal = $derived(adultCount + childCount + infantCount);
	const routeLanguage = $derived(getLanguageCode());
	const originOptions = $derived<AutocompleteOption[]>(
		getOriginOptions(routeIndex, routeLanguage, destination)
	);
	const destinationOptions = $derived<AutocompleteOption[]>(
		getDestinationOptions(routeIndex, origin, routeLanguage)
	);
	const routeDatasetMessage = $derived(getRouteDatasetMessage());
	const validationErrors = $derived<ValidationErrors>(searchAttempted ? getValidationErrors() : {});
	const adultMin = $derived(Math.max(1, infantCount));
	const adultMax = $derived(Math.max(adultMin, maxPassengers - childCount - infantCount));
	const childMax = $derived(Math.max(0, maxPassengers - adultCount - infantCount));
	const infantMax = $derived(
		Math.max(0, Math.min(adultCount, maxPassengers - adultCount - childCount))
	);
	const passengerLimitMessage = $derived(getMaxPassengersMessage());
	const passengerHelperText = $derived(
		translation?.passenger_helper_text || `${passengerLimitMessage} ${getInfantAdultMessage()}`
	);
	const passengerTotalText = $derived(
		translation?.passenger_total_template
			? formatTemplate(translation.passenger_total_template, {
					total: String(passengerTotal),
					max: String(maxPassengers)
				})
			: ''
	);
	const passengerSupportText = $derived(
		[passengerHelperText, passengerTotalText ? `${passengerTotalText}.` : '']
			.filter(Boolean)
			.join(' ')
	);
	const stopoverSummaryLabel = $derived(
		translation?.summary_stopover_label || getSummaryFieldLabel('stopover')
	);
	const outboundFlightLabel = $derived(getFlightSummaryLabel('outbound'));
	const returnFlightLabel = $derived(getFlightSummaryLabel('return'));
	const travelDatesLabel = $derived(
		translation?.summary_date_label ||
			[translation?.departure_date_label, translation?.return_date_label]
				.filter(Boolean)
				.join(' / ') ||
			getLocalizedLabel('selectDate')
	);
	const datePlaceholderLabel = $derived(getLocalizedLabel('selectDate'));
	const departureDateDisplayLabel = $derived(translation?.departure_date_label || travelDatesLabel);
	const travelDatesCalendarLabel = $derived(translation?.summary_date_label || travelDatesLabel);
	const passengerLabel = $derived(
		translation?.passengers_label || getSummaryFieldLabel('passengers')
	);
	const stopoverDurationDisplayLabel = $derived(
		translation?.stopover_duration_label || getSummaryFieldLabel('stopover')
	);
	const itinerarySelectorLabel = $derived(
		translation?.itinerary_selector_label || getSummaryFieldLabel('tripType')
	);
	const cabinLabel = $derived(translation?.cabin_label || getSummaryFieldLabel('cabin'));
	const originFieldLabel = $derived(translation?.origin_label || getLocalizedLabel('selectOrigin'));
	const destinationFieldLabel = $derived(
		translation?.destination_label || getLocalizedLabel('selectDestination')
	);
	const originPlaceholder = $derived(
		translation?.origin_placeholder || getLocalizedLabel('selectOrigin')
	);
	const destinationPlaceholder = $derived(
		translation?.destination_placeholder || getLocalizedLabel('selectDestination')
	);
	const stopoverPlacementOptions = $derived<ButtonGroupOption[]>([
		{
			value: 'outbound',
			label: translation?.stopover_outbound_label || 'Outbound'
		},
		{
			value: 'return',
			label: translation?.stopover_return_label || 'Return'
		}
	]);
	const cabinOptions = $derived<ButtonGroupOption[]>([
		{
			value: 'Y',
			label: translation?.economy_label || 'Economy'
		},
		{
			value: 'C',
			label: translation?.business_label || 'Business'
		}
	]);
	const miniTripTypeOptions = $derived<SelectOption[]>(
		supportedTripTypes
			.filter((tripType) => tripType !== 'multicity')
			.map((tripType) => ({
				value: tripType,
				label: getTripTypeLabel(tripType)
			}))
	);
	const miniCalendarMonthCount = $derived(isMiniCompactViewport ? 1 : 2);
	const miniDateDisplayValue = $derived(getMiniDateDisplayValue());
	const controlIdPrefix = $derived(getControlIdPrefix());
	const miniTabOrder = [
		'trip-type',
		'origin',
		'destination',
		'dates',
		'passengers',
		'cabin',
		'search',
		'multicity',
		'expanded-search'
	];
	const outboundSummarySteps = $derived(getOutboundSummarySteps());
	const returnSummarySteps = $derived(getReturnSummarySteps());
	const summaryDetails = $derived(getSummaryDetails());

	$effect(() => {
		if (!browser) return;

		let cancelled = false;
		routeDataError = false;

		fetch(`${base}/data/stopover-route-index.json`)
			.then((response) => {
				if (!response.ok) {
					throw new Error(`Route dataset failed with ${response.status}`);
				}
				return response.json();
			})
			.then((data: unknown) => {
				if (cancelled) return;
				if (!isStopoverRouteIndex(data)) {
					throw new Error('Route dataset has an invalid shape.');
				}
				routeIndex = data;
				routeDataError = false;
			})
			.catch(() => {
				if (cancelled) return;
				routeIndex = null;
				routeDataError = true;
			});

		return () => {
			cancelled = true;
		};
	});

	$effect(() => {
		const internalTripTypes = supportedTripTypes.filter(
			(tripType): tripType is InternalTripType => tripType !== 'multicity'
		);
		selectedTripType =
			defaultTripType !== 'multicity' && internalTripTypes.includes(defaultTripType)
				? defaultTripType
				: (internalTripTypes[0] ?? 'roundtrip');
	});

	$effect(() => {
		const normalized = normalizePassengerValues(adults, children, infants);
		if (adults !== normalized.adults) adults = normalized.adults;
		if (children !== normalized.children) children = normalized.children;
		if (infants !== normalized.infants) infants = normalized.infants;
	});

	$effect(() => {
		if (stopoverNightCount > stopoverNightMax) stopoverNightCount = stopoverNightMax;
		if (stopoverNightCount < 1) stopoverNightCount = 1;
	});

	$effect(() => {
		if (!browser) return;

		const mediaQuery = window.matchMedia('(max-width: 767px)');
		const updateCompactViewport = () => {
			isMiniCompactViewport = mediaQuery.matches;
		};

		updateCompactViewport();
		mediaQuery.addEventListener('change', updateCompactViewport);

		return () => {
			mediaQuery.removeEventListener('change', updateCompactViewport);
		};
	});

	$effect(() => {
		if (!routeIndex) return;

		if (origin && !routeIndex.origins.includes(origin)) {
			origin = '';
			return;
		}

		if (destination && !routeIndex.destinations.includes(destination)) {
			destination = '';
			return;
		}

		if (origin && destination && !isValidStopoverRoute(routeIndex, origin, destination)) {
			destination = '';
		}
	});

	$effect(() => {
		if (selectedTripType !== 'roundtrip' || !departureDateValue || !returnDateValue) return;

		const minimumDestinationNights = 1;
		const minimumReturnOffset =
			stopoverPlacement === 'outbound'
				? stopoverNightCount + minimumDestinationNights
				: minimumDestinationNights;
		const minimumReturnDate = departureDateValue.add({ days: minimumReturnOffset });

		if (returnDateValue.toString() < minimumReturnDate.toString()) {
			returnDateValue = minimumReturnDate;
		}
	});

	function openModal() {
		modalOpen = true;
	}

	function getTripTypeLabel(type: TripTypeSchema) {
		if (type === 'roundtrip') return translation?.roundtrip_label || 'Round trip';
		if (type === 'one_way') return translation?.one_way_label || 'One way';
		return translation?.multicity_label || 'Multi-city';
	}

	function getControlIdPrefix() {
		const rawValue = item.key || item.id || 'flight-search-form';
		const normalized = String(rawValue)
			.toLowerCase()
			.replace(/[^a-z0-9_-]+/g, '-')
			.replace(/^-+|-+$/g, '');

		return normalized || 'flight-search-form';
	}

	function getControlId(name: string) {
		return `${controlIdPrefix}-${name}`;
	}

	function getFallbackUrl(type: TripTypeSchema) {
		if (type === 'roundtrip') return item.fallback_roundtrip_url || item.shopping_base_url;
		if (type === 'one_way') return item.fallback_one_way_url || item.shopping_base_url;
		return getCleanMulticityFallbackUrl(item.fallback_multicity_url || item.shopping_multicity_url);
	}

	function getCleanMulticityFallbackUrl(rawUrl: string) {
		const url = new URL(rawUrl);
		const isShoppingUrl = url.hostname === 'shopping.copaair.com';
		if (!isShoppingUrl) return rawUrl;

		url.pathname = '/booking-panel';
		url.search = '';
		url.hash = '';

		const params = new URLSearchParams();
		params.append('roundtrip', 'false');
		params.append('seniors', '0');
		params.append('adults', '1');
		params.append('children', '0');
		params.append('infants', '0');
		for (let index = 1; index <= 5; index += 1) {
			params.append(`date${index}`, 'null');
		}
		params.append('promocode', '');
		for (let index = 1; index <= 10; index += 1) {
			params.append(`area${index}`, '');
		}
		params.append('advanced_air_search', 'true');
		params.append('flexible_dates_v2', 'false');
		params.append('stopoverNights', 'null');
		params.append('stopoverLegNumber', 'null');
		params.append('stopover', 'false');
		params.append('cabinType', 'Y');
		params.append('stopoverType', 'origin');

		url.search = params.toString();
		return url.toString();
	}

	function getPickerLocale(languageCode: string | null | undefined) {
		if (languageCode === 'pt') return 'pt-BR';
		if (languageCode === 'en') return 'en-US';
		return 'es-PA';
	}

	function getLanguageCode() {
		const languageCode = translation?.languages_code;
		if (languageCode === 'en' || languageCode === 'pt') return languageCode;
		return 'es';
	}

	function getDefaultSubtitle() {
		const languageCode = getLanguageCode();
		if (languageCode === 'en') {
			return 'Plan your flight search with a Panama Stopover before continuing to Copa Airlines.';
		}
		if (languageCode === 'pt') {
			return 'Planeje sua busca de voos com Stopover no Panamá antes de continuar para a Copa Airlines.';
		}
		return 'Planifica tu búsqueda de vuelos con Stopover en Panamá antes de continuar a Copa Airlines.';
	}

	function getDefaultSearchActionLabel() {
		const languageCode = getLanguageCode();
		if (languageCode === 'en') return 'Search flights';
		if (languageCode === 'pt') return 'Buscar voos';
		return 'Buscar vuelos';
	}

	function getExpandedSearchLabel() {
		if (translation?.expanded_search_label) return translation.expanded_search_label;

		const languageCode = getLanguageCode();
		if (languageCode === 'en') return 'Expanded search';
		if (languageCode === 'pt') return 'Busca expandida';
		return 'Búsqueda ampliada';
	}

	function getLocalizedControlLabel(
		key:
			| 'close'
			| 'clearSelection'
			| 'decreaseAdults'
			| 'increaseAdults'
			| 'decreaseChildren'
			| 'increaseChildren'
			| 'decreaseInfants'
			| 'increaseInfants'
	) {
		const directusLabels = {
			close: translation?.close_label,
			clearSelection: translation?.clear_selection_label,
			decreaseAdults: translation?.decrease_adults_label,
			increaseAdults: translation?.increase_adults_label,
			decreaseChildren: translation?.decrease_children_label,
			increaseChildren: translation?.increase_children_label,
			decreaseInfants: translation?.decrease_infants_label,
			increaseInfants: translation?.increase_infants_label
		};
		if (directusLabels[key]) return directusLabels[key];

		const languageCode = getLanguageCode();
		const labels = {
			en: {
				close: 'Close',
				clearSelection: 'Clear selection',
				decreaseAdults: 'Decrease adults',
				increaseAdults: 'Increase adults',
				decreaseChildren: 'Decrease children',
				increaseChildren: 'Increase children',
				decreaseInfants: 'Decrease infants',
				increaseInfants: 'Increase infants'
			},
			pt: {
				close: 'Fechar',
				clearSelection: 'Limpar seleção',
				decreaseAdults: 'Diminuir adultos',
				increaseAdults: 'Aumentar adultos',
				decreaseChildren: 'Diminuir crianças',
				increaseChildren: 'Aumentar crianças',
				decreaseInfants: 'Diminuir bebês',
				increaseInfants: 'Aumentar bebês'
			},
			es: {
				close: 'Cerrar',
				clearSelection: 'Limpiar selección',
				decreaseAdults: 'Disminuir adultos',
				increaseAdults: 'Aumentar adultos',
				decreaseChildren: 'Disminuir niños',
				increaseChildren: 'Aumentar niños',
				decreaseInfants: 'Disminuir infantes',
				increaseInfants: 'Aumentar infantes'
			}
		};

		return labels[languageCode][key];
	}

	function getPassengerCounterAriaLabels() {
		return {
			decreaseAdults: getLocalizedControlLabel('decreaseAdults'),
			increaseAdults: getLocalizedControlLabel('increaseAdults'),
			decreaseChildren: getLocalizedControlLabel('decreaseChildren'),
			increaseChildren: getLocalizedControlLabel('increaseChildren'),
			decreaseInfants: getLocalizedControlLabel('decreaseInfants'),
			increaseInfants: getLocalizedControlLabel('increaseInfants')
		};
	}

	function getLocalizedLabel(
		key:
			| 'selectOrigin'
			| 'selectDestination'
			| 'selectDate'
			| 'selectReturnDate'
			| 'completeDates'
			| 'required'
	) {
		const directusLabels = {
			selectOrigin: translation?.select_origin_label,
			selectDestination: translation?.select_destination_label,
			selectDate: translation?.summary_select_date_label,
			selectReturnDate: translation?.select_return_date_label,
			completeDates: translation?.complete_dates_label,
			required: translation?.required_field_message
		};
		if (directusLabels[key]) return directusLabels[key];

		const languageCode = getLanguageCode();
		const labels = {
			en: {
				selectOrigin: 'Select origin',
				selectDestination: 'Select destination',
				selectDate: 'Select date',
				selectReturnDate: 'Select return date',
				completeDates: 'Complete dates to calculate',
				required: 'Required'
			},
			pt: {
				selectOrigin: 'Selecione origem',
				selectDestination: 'Selecione destino',
				selectDate: 'Selecione a data',
				selectReturnDate: 'Selecione retorno',
				completeDates: 'Complete as datas para calcular',
				required: 'Obrigatório'
			},
			es: {
				selectOrigin: 'Selecciona origen',
				selectDestination: 'Selecciona destino',
				selectDate: 'Selecciona fecha',
				selectReturnDate: 'Selecciona regreso',
				completeDates: 'Completa fechas para calcular',
				required: 'Requerido'
			}
		};

		return labels[languageCode][key];
	}

	function getRouteDatasetMessage() {
		if (routeIndex) {
			return getLocalizedNoRoutesMessage();
		}

		if (!routeDataError) {
			return translation?.loading_message || getLocalizedLoadingRoutesMessage();
		}

		if (translation?.routes_unavailable_message) return translation.routes_unavailable_message;

		const languageCode = getLanguageCode();
		if (languageCode === 'en') return 'Routes are not available. Try again in a moment.';
		if (languageCode === 'pt')
			return 'As rotas não estão disponíveis. Tente novamente em instantes.';
		return 'Las rutas no están disponibles. Intenta nuevamente en unos segundos.';
	}

	function getLocalizedNoRoutesMessage() {
		if (translation?.no_routes_found_message) return translation.no_routes_found_message;
		if (translation?.invalid_route_message) return translation.invalid_route_message;

		const languageCode = getLanguageCode();
		if (languageCode === 'en') return 'No routes found';
		if (languageCode === 'pt') return 'Nenhuma rota encontrada';
		return 'No se encontraron rutas';
	}

	function getLocalizedLoadingRoutesMessage() {
		const languageCode = getLanguageCode();
		if (languageCode === 'en') return 'Loading routes';
		if (languageCode === 'pt') return 'Carregando rotas';
		return 'Cargando rutas';
	}

	function getRequiredFieldMessage() {
		return translation?.required_field_message || getLocalizedLabel('required');
	}

	function getMaxPassengersMessage() {
		const template = translation?.max_passengers_message_template;
		if (template) {
			return formatTemplate(template, { max: String(maxPassengers) });
		}

		const languageCode = getLanguageCode();
		if (languageCode === 'en') return `Maximum ${maxPassengers} passengers.`;
		if (languageCode === 'pt') return `Máximo de ${maxPassengers} passageiros.`;
		return `Máximo ${maxPassengers} pasajeros.`;
	}

	function getInfantAdultMessage() {
		if (translation?.infant_adult_message) return translation.infant_adult_message;

		const languageCode = getLanguageCode();
		if (languageCode === 'en') return 'Each infant must travel with one adult.';
		if (languageCode === 'pt') return 'Cada bebê deve viajar com um adulto.';
		return 'Cada infante debe viajar con un adulto.';
	}

	function getPassengerValidationMessage() {
		if (passengerTotal > maxPassengers) {
			return passengerLimitMessage;
		}

		if (infantCount > adultCount) {
			return getInfantAdultMessage();
		}

		return '';
	}

	function getDateValidationMessage() {
		const requiredMessage = getRequiredFieldMessage();

		if (!departureDate) return requiredMessage;
		if (selectedTripType === 'roundtrip' && !returnDate) return requiredMessage;

		if (selectedTripType === 'roundtrip' && returnDate < departureDate) {
			if (translation?.return_date_after_departure_message) {
				return translation.return_date_after_departure_message;
			}

			const languageCode = getLanguageCode();
			if (languageCode === 'en') return 'Return date must be after departure date.';
			if (languageCode === 'pt') return 'A data de volta deve ser posterior à ida.';
			return 'La fecha de regreso debe ser posterior a la salida.';
		}

		return getDestinationNightValidationMessage();
	}

	function getDestinationNightValidationMessage() {
		if (selectedTripType !== 'roundtrip' || !departureDate || !returnDate) return '';

		const minimumReturnOffset = stopoverPlacement === 'outbound' ? stopoverNightCount + 1 : 1;
		const minimumReturnDate = addDays(departureDate, minimumReturnOffset);
		if (!minimumReturnDate || returnDate >= minimumReturnDate) return '';

		if (translation?.minimum_destination_night_message) {
			return translation.minimum_destination_night_message;
		}

		const languageCode = getLanguageCode();
		if (languageCode === 'en') return 'Keep at least 1 night at your final destination.';
		if (languageCode === 'pt') return 'Mantenha pelo menos 1 noite no destino final.';
		return 'Mantén al menos 1 noche en tu destino final.';
	}

	function getValidationErrors(): ValidationErrors {
		const errors: ValidationErrors = {};
		const requiredMessage = getRequiredFieldMessage();
		const dateMessage = getDateValidationMessage();
		const passengerMessage = getPassengerValidationMessage();

		if (!routeIndex) errors.routes = routeDatasetMessage;
		if (!origin) errors.origin = requiredMessage;
		if (!destination) errors.destination = requiredMessage;
		if (dateMessage) errors.dates = dateMessage;
		if (passengerMessage) errors.passengers = passengerMessage;

		if (stopoverNightCount < 1 || stopoverNightCount > stopoverNightMax) {
			errors.stopoverNights = translation?.invalid_duration_message || `${1} - ${stopoverNightMax}`;
		}

		if (
			routeIndex &&
			origin &&
			destination &&
			!isValidStopoverRoute(routeIndex, origin, destination)
		) {
			errors.destination = translation?.invalid_route_message || getLocalizedNoRoutesMessage();
		}

		return errors;
	}

	function getFlightSummaryLabel(type: 'outbound' | 'return') {
		const directusLabel =
			type === 'outbound'
				? translation?.summary_outbound_flight_label
				: translation?.summary_return_flight_label;
		if (directusLabel) return directusLabel;

		const label =
			type === 'outbound' ? translation?.summary_outbound_label : translation?.summary_return_label;
		const normalizedLabel = label?.trim().toLowerCase();

		if (type === 'outbound') {
			if (
				normalizedLabel &&
				!['salida', 'ida', 'outbound', 'ida y vuelta'].includes(normalizedLabel)
			) {
				return label;
			}
			const languageCode = getLanguageCode();
			if (languageCode === 'en') return 'Outbound flight';
			if (languageCode === 'pt') return 'Voo de ida';
			return 'Vuelo de salida';
		}

		if (normalizedLabel && !['regreso', 'return', 'volta'].includes(normalizedLabel)) {
			return label;
		}
		const languageCode = getLanguageCode();
		if (languageCode === 'en') return 'Return flight';
		if (languageCode === 'pt') return 'Voo de volta';
		return 'Vuelo de regreso';
	}

	function getOriginSummaryTitle() {
		return origin
			? getAirportLabel(routeIndex, origin, routeLanguage)
			: getLocalizedLabel('selectOrigin');
	}

	function getDestinationSummaryTitle() {
		return destination
			? getAirportLabel(routeIndex, destination, routeLanguage)
			: getLocalizedLabel('selectDestination');
	}

	function getDateSummaryMeta(value: string, fallback = getLocalizedLabel('selectDate')) {
		return value ? formatDateLabel(value) : fallback;
	}

	function getMiniDateDisplayValue() {
		const dateParts =
			selectedTripType === 'roundtrip'
				? [departureDate, returnDate].filter(Boolean)
				: [departureDate].filter(Boolean);

		if (!dateParts.length) return '';

		const details = [formatStopoverNightTooltip(stopoverNightCount)];
		if (selectedTripType === 'roundtrip') {
			details.push(getStopoverPlacementLabel(stopoverPlacementValue));
		}

		return [
			dateParts.map((date) => formatMiniDateLabel(date)).join(' - '),
			details.join(' / ')
		].join(' | ');
	}

	function getSummaryDetails(): SummaryDetail[] {
		const details: SummaryDetail[] = [
			{
				label: itinerarySelectorLabel,
				value: getTripTypeLabel(selectedTripType)
			},
			{
				label: getSummaryFieldLabel('route'),
				value: getFlightPathSummary(),
				isPending: !origin || !destination
			},
			{
				label: travelDatesLabel,
				value: getTravelDateSummary(),
				isPending: !departureDate || (selectedTripType === 'roundtrip' && !returnDate)
			},
			{
				label: stopoverDurationDisplayLabel,
				value: getStopoverDetailSummary(),
				isPending: !departureDate
			},
			{
				label: cabinLabel,
				value: getCabinSummaryLabel()
			}
		];

		if (item.show_passengers !== false) {
			details.splice(4, 0, {
				label: passengerLabel,
				value: getPassengerSummaryText()
			});
		}

		if (item.show_promo_code !== false && promoCode.trim()) {
			details.push({
				label: translation?.promo_code_label || getSummaryFieldLabel('promoCode'),
				value: promoCode.trim()
			});
		}

		return details;
	}

	function getSummaryFieldLabel(
		key: 'tripType' | 'route' | 'stopover' | 'passengers' | 'cabin' | 'promoCode'
	) {
		if (key === 'route' && translation?.summary_route_label) return translation.summary_route_label;

		const languageCode = getLanguageCode();
		const labels = {
			en: {
				tripType: 'Trip type',
				route: 'Route',
				stopover: 'Stopover',
				passengers: 'Passengers',
				cabin: 'Cabin',
				promoCode: 'Promo code'
			},
			pt: {
				tripType: 'Tipo de viagem',
				route: 'Rota',
				stopover: 'Stopover',
				passengers: 'Passageiros',
				cabin: 'Cabine',
				promoCode: 'Código promocional'
			},
			es: {
				tripType: 'Tipo de viaje',
				route: 'Ruta',
				stopover: 'Stopover',
				passengers: 'Pasajeros',
				cabin: 'Cabina',
				promoCode: 'Código promocional'
			}
		};

		return labels[languageCode][key];
	}

	function getFlightPathSummary() {
		if (!origin || !destination) {
			return joinSummaryMeta([getOriginSummaryTitle(), getDestinationSummaryTitle()]);
		}

		const hub = routeIndex?.hubIata || 'PTY';
		const path =
			selectedTripType === 'one_way'
				? [origin, hub, destination]
				: stopoverPlacement === 'return'
					? [origin, destination, hub, origin]
					: [origin, hub, destination, origin];

		return path.join(' -> ');
	}

	function getTravelDateSummary() {
		if (!departureDate) return getLocalizedLabel('selectDate');

		if (selectedTripType === 'roundtrip') {
			return returnDate
				? `${formatDateLabel(departureDate)} - ${formatDateLabel(returnDate)}`
				: joinSummaryMeta([formatDateLabel(departureDate), getLocalizedLabel('selectReturnDate')]);
		}

		return formatDateLabel(departureDate);
	}

	function getStopoverDetailSummary() {
		const details = [formatStopoverNightTooltip(stopoverNightCount)];

		if (selectedTripType === 'roundtrip') {
			details.push(getStopoverPlacementLabel(stopoverPlacement));
		}

		if (!departureDate) {
			details.push(getLocalizedLabel('selectDate'));
			return joinSummaryMeta(details);
		}

		const stopoverStartDate =
			selectedTripType === 'roundtrip' && stopoverPlacement === 'return'
				? returnDate
				: departureDate;
		if (!stopoverStartDate) {
			details.push(getLocalizedLabel('selectReturnDate'));
			return joinSummaryMeta(details);
		}

		const stopoverEndDate = addDays(stopoverStartDate, stopoverNightCount);
		details.push(`${formatDateLabel(stopoverStartDate)} - ${formatDateLabel(stopoverEndDate)}`);

		return joinSummaryMeta(details);
	}

	function getCabinSummaryLabel() {
		return cabinOptions.find((option) => option.value === cabinTypeValue)?.label || cabinTypeValue;
	}

	function getPassengerSummaryText() {
		const parts = [
			getPassengerSummaryPart('adult', adultCount),
			getPassengerSummaryPart('child', childCount),
			getPassengerSummaryPart('infant', infantCount)
		].filter(Boolean);

		return parts.join(', ') || getPassengerPresetLabel(passengerTotal);
	}

	function getPassengerSummaryPart(type: 'adult' | 'child' | 'infant', count: number) {
		if (count <= 0) return '';
		return `${count} ${getPassengerSummaryLabel(type, count)}`;
	}

	function getPassengerSummaryLabel(type: 'adult' | 'child' | 'infant', count: number) {
		const languageCode = getLanguageCode();
		const labels = {
			en: {
				adult:
					count === 1
						? translation?.adult_singular_label || 'Adult'
						: translation?.adults_label || 'Adults',
				child:
					count === 1
						? translation?.child_singular_label || 'Child'
						: translation?.children_label || 'Children',
				infant:
					count === 1
						? translation?.infant_singular_label || 'Infant'
						: translation?.infants_label || 'Infants'
			},
			pt: {
				adult:
					count === 1
						? translation?.adult_singular_label || 'Adulto'
						: translation?.adults_label || 'Adultos',
				child:
					count === 1
						? translation?.child_singular_label || 'Criança'
						: translation?.children_label || 'Crianças',
				infant:
					count === 1
						? translation?.infant_singular_label || 'Bebê'
						: translation?.infants_label || 'Bebês'
			},
			es: {
				adult:
					count === 1
						? translation?.adult_singular_label || 'Adulto'
						: translation?.adults_label || 'Adultos',
				child:
					count === 1
						? translation?.child_singular_label || 'Niño'
						: translation?.children_label || 'Niños',
				infant:
					count === 1
						? translation?.infant_singular_label || 'Infante'
						: translation?.infants_label || 'Infantes'
			}
		};

		return labels[languageCode][type];
	}

	function getStopoverPlacementLabel(value: 'outbound' | 'return') {
		return stopoverPlacementOptions.find((option) => option.value === value)?.label || value;
	}

	function joinSummaryMeta(parts: string[]) {
		return parts.filter(Boolean).join(' / ');
	}

	function toIsoDate(value: PickerDateValue | undefined) {
		return value?.toString() ?? '';
	}

	function setTravelDateRange(value: PickerDateRange) {
		departureDateValue = value.start;
		returnDateValue = value.end;
	}

	function setMiniTripType(value: string) {
		if (value === 'multicity') {
			if (typeof window !== 'undefined') {
				window.open(getFallbackUrl('multicity'), '_blank', 'noreferrer');
			}
			return;
		}

		if (value === 'roundtrip' || value === 'one_way') {
			selectedTripType = value;
		}
	}

	function getFocusableElements(container: ParentNode) {
		const focusableSelector = [
			'a[href]',
			'button:not([disabled])',
			'input:not([disabled])',
			'select:not([disabled])',
			'textarea:not([disabled])',
			'[tabindex]:not([tabindex="-1"])'
		].join(',');

		const candidates =
			container instanceof HTMLElement && container.matches(focusableSelector)
				? [container, ...Array.from(container.querySelectorAll<HTMLElement>(focusableSelector))]
				: Array.from(container.querySelectorAll<HTMLElement>(focusableSelector));

		return candidates.filter((element) => {
			const rect = element.getBoundingClientRect();
			const styles = window.getComputedStyle(element);

			return (
				rect.width > 0 &&
				rect.height > 0 &&
				styles.display !== 'none' &&
				styles.visibility !== 'hidden' &&
				element.getAttribute('aria-hidden') !== 'true'
			);
		});
	}

	function getFocusableElement(container: Element | null) {
		if (!container) return null;
		return getFocusableElements(container)[0] ?? null;
	}

	function focusAdjacentToMiniBar(bar: HTMLElement, direction: 'previous' | 'next') {
		const allFocusableElements = getFocusableElements(document.body);
		const barIndexes = allFocusableElements
			.map((element, index) => (bar.contains(element) ? index : -1))
			.filter((index) => index >= 0);

		if (!barIndexes.length) return false;

		const boundaryIndex = direction === 'next' ? Math.max(...barIndexes) : Math.min(...barIndexes);
		const targetIndex = boundaryIndex + (direction === 'next' ? 1 : -1);
		const target = allFocusableElements[targetIndex];

		if (!target) return false;

		target.focus();
		return true;
	}

	function handleMiniTabOrder(event: KeyboardEvent) {
		if (event.key !== 'Tab' || event.altKey || event.ctrlKey || event.metaKey) return;

		const bar = event.currentTarget as HTMLElement;
		const activeElement = document.activeElement;
		const steps = miniTabOrder
			.map((step) => bar.querySelector<HTMLElement>(`[data-mini-tab-step="${step}"]`))
			.filter((step): step is HTMLElement => Boolean(step && getFocusableElement(step)));
		const currentIndex = steps.findIndex(
			(step) => activeElement instanceof Node && step.contains(activeElement)
		);

		if (currentIndex === -1) return;

		const nextIndex = event.shiftKey ? currentIndex - 1 : currentIndex + 1;
		if (nextIndex < 0 || nextIndex >= steps.length) {
			if (focusAdjacentToMiniBar(bar, event.shiftKey ? 'previous' : 'next')) {
				event.preventDefault();
			}
			return;
		}

		const nextElement = getFocusableElement(steps[nextIndex]);
		if (!nextElement) return;

		event.preventDefault();
		nextElement.focus();
	}

	function miniTabOrderAction(node: HTMLElement) {
		node.addEventListener('keydown', handleMiniTabOrder);

		return {
			destroy() {
				node.removeEventListener('keydown', handleMiniTabOrder);
			}
		};
	}

	function setStopoverPlacement(value: string) {
		if (value === 'outbound' || value === 'return') {
			stopoverPlacementValue = value;
		}
	}

	function setCabinType(value: string) {
		if (value === 'Y' || value === 'C') {
			cabinTypeValue = value;
		}
	}

	function toPassengerCount(value: number, fallback: number) {
		if (!Number.isFinite(value)) return fallback;
		return Math.max(0, Math.trunc(value));
	}

	function normalizePassengerValues(adultValue: number, childValue: number, infantValue: number) {
		const adultCount = Math.min(maxPassengers, Math.max(1, toPassengerCount(adultValue, 1)));
		const infantCount = Math.min(
			adultCount,
			maxPassengers - adultCount,
			toPassengerCount(infantValue, 0)
		);
		const childCount = Math.min(
			toPassengerCount(childValue, 0),
			Math.max(0, maxPassengers - adultCount - infantCount)
		);

		return {
			adults: adultCount,
			children: childCount,
			infants: infantCount
		};
	}

	function formatStopoverNightTooltip(value: number) {
		if (value === 1 && translation?.stopover_duration_min_label) {
			return translation.stopover_duration_min_label;
		}

		if (value === 15 && translation?.stopover_duration_max_label) {
			return translation.stopover_duration_max_label;
		}

		const unit = getNightUnit(value);

		return `${value} ${unit}`;
	}

	function formatTemplate(template: string, values: Record<string, string>) {
		return Object.entries(values).reduce(
			(result, [key, value]) => result.replaceAll(`{${key}}`, value),
			template
		);
	}

	function getPassengerPresetLabel(count: number) {
		const languageCode = getLanguageCode();
		if (count === 1) {
			if (translation?.adult_singular_label) return `1 ${translation.adult_singular_label}`;
			if (languageCode === 'en') return '1 Adult';
			return '1 Adulto';
		}

		if (translation?.passengers_label) return `${count} ${translation.passengers_label}`;
		if (languageCode === 'en') return `${count} Passengers`;
		if (languageCode === 'pt') return `${count} Passageiros`;
		return `${count} Pasajeros`;
	}

	function formatDateLabel(value: string, fallback = datePlaceholderLabel) {
		if (!value) return fallback;
		const [year, month, day] = value.split('-').map(Number);
		if (!year || !month || !day) return fallback;
		return new Intl.DateTimeFormat(pickerLocale, {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		}).format(new Date(year, month - 1, day));
	}

	function formatMiniDateLabel(value: string, fallback = datePlaceholderLabel) {
		if (!isMiniCompactViewport) return formatDateLabel(value, fallback);
		if (!value) return fallback;
		const [year, month, day] = value.split('-').map(Number);
		if (!year || !month || !day) return fallback;

		return new Intl.DateTimeFormat(pickerLocale, {
			month: 'short',
			day: 'numeric'
		}).format(new Date(year, month - 1, day));
	}

	function addDays(value: string, days: number) {
		if (!value) return '';
		const [year, month, day] = value.split('-').map(Number);
		if (!year || !month || !day) return '';
		const date = new Date(year, month - 1, day);
		date.setDate(date.getDate() + days);
		return toLocalIsoDate(date);
	}

	function toLocalIsoDate(date: Date) {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		return `${year}-${month}-${day}`;
	}

	function getStopoverCalendarRange(): PickerDateRange | undefined {
		if (selectedTripType !== 'roundtrip') return undefined;

		const start =
			stopoverPlacement === 'return' ? returnDateValue || departureDateValue : departureDateValue;
		if (!start) return undefined;

		return {
			start,
			end: start.add({ days: stopoverNightCount })
		};
	}

	function diffDays(start: string, end: string) {
		if (!start || !end) return null;
		const startDate = new Date(`${start}T00:00:00`);
		const endDate = new Date(`${end}T00:00:00`);
		const diff = Math.round((endDate.getTime() - startDate.getTime()) / 86_400_000);
		return diff >= 0 ? diff : null;
	}

	function getNightUnit(value: number) {
		const directusLabel =
			value === 1 ? translation?.night_singular_label : translation?.night_plural_label;
		if (directusLabel) return directusLabel;

		const languageCode = getLanguageCode();
		if (languageCode === 'es') return value === 1 ? 'noche' : 'noches';
		if (languageCode === 'pt') return value === 1 ? 'noite' : 'noites';
		return value === 1 ? 'night' : 'nights';
	}

	function getDestinationNightFallback(value: number) {
		const languageCode = getLanguageCode();
		if (languageCode === 'es') return `${value} ${getNightUnit(value)} en destino`;
		if (languageCode === 'pt') return `${value} ${getNightUnit(value)} no destino`;
		return `${value} ${getNightUnit(value)} at destination`;
	}

	function normalizeDestinationNightTemplate(template: string, value: number) {
		const nightsPlaceholder = '__STOPOVER_NIGHTS__';

		return template
			.replaceAll('{days}', nightsPlaceholder)
			.replaceAll('{nights}', nightsPlaceholder)
			.replace(/\bdays\b/gi, getNightUnit(value))
			.replace(/\bday\b/gi, getNightUnit(value))
			.replace(/\bnights?\b/gi, getNightUnit(value))
			.replace(/\bnoches?\b/gi, getNightUnit(value))
			.replace(/\bnoites?\b/gi, getNightUnit(value))
			.replace(/\bd[ií]as?\b/gi, getNightUnit(value))
			.replace(/\bdias?\b/gi, getNightUnit(value))
			.replaceAll(nightsPlaceholder, '{nights}');
	}

	function formatDestinationNightCount(nights: number | null) {
		if (nights === null) return getLocalizedLabel('completeDates');
		const template = translation?.summary_destination_days_template
			? normalizeDestinationNightTemplate(translation.summary_destination_days_template, nights)
			: getDestinationNightFallback(nights);

		return formatTemplate(template, { days: String(nights), nights: String(nights) });
	}

	function getOutboundSummarySteps(): SummaryStep[] {
		const stopoverEndDate = addDays(departureDate, stopoverNightCount);
		const destinationDays =
			selectedTripType === 'roundtrip'
				? diffDays(stopoverPlacement === 'outbound' ? stopoverEndDate : departureDate, returnDate)
				: null;

		if (selectedTripType === 'roundtrip' && stopoverPlacement === 'return') {
			return [
				{
					icon: 'origin',
					title: getOriginSummaryTitle(),
					meta: getDateSummaryMeta(departureDate),
					isPending: !origin || !departureDate
				},
				{
					icon: 'destination',
					title: getDestinationSummaryTitle(),
					meta: formatDestinationNightCount(destinationDays),
					isPending: !destination || destinationDays === null
				}
			];
		}

		return [
			{
				icon: 'origin',
				title: getOriginSummaryTitle(),
				meta: getDateSummaryMeta(departureDate),
				isPending: !origin || !departureDate
			},
			{
				icon: 'stopover',
				title: stopoverSummaryLabel,
				meta: departureDate
					? joinSummaryMeta([
							formatStopoverNightTooltip(stopoverNightCount),
							`${formatDateLabel(departureDate)} - ${formatDateLabel(stopoverEndDate)}`
						])
					: joinSummaryMeta([
							formatStopoverNightTooltip(stopoverNightCount),
							getLocalizedLabel('selectDate')
						]),
				isPending: !departureDate
			},
			{
				icon: 'destination',
				title: getDestinationSummaryTitle(),
				meta:
					selectedTripType === 'roundtrip'
						? formatDestinationNightCount(destinationDays)
						: stopoverEndDate
							? formatDateLabel(stopoverEndDate)
							: getLocalizedLabel('completeDates'),
				isPending: !destination || !stopoverEndDate
			}
		];
	}

	function getReturnSummarySteps(): SummaryStep[] {
		if (selectedTripType !== 'roundtrip') return [];

		const stopoverEndDate = addDays(returnDate, stopoverNightCount);

		if (stopoverPlacement === 'return') {
			return [
				{
					icon: 'origin',
					title: getDestinationSummaryTitle(),
					meta: getDateSummaryMeta(returnDate, getLocalizedLabel('selectReturnDate')),
					isPending: !destination || !returnDate
				},
				{
					icon: 'stopover',
					title: stopoverSummaryLabel,
					meta: returnDate
						? joinSummaryMeta([
								formatStopoverNightTooltip(stopoverNightCount),
								`${formatDateLabel(returnDate)} - ${formatDateLabel(stopoverEndDate)}`
							])
						: joinSummaryMeta([
								formatStopoverNightTooltip(stopoverNightCount),
								getLocalizedLabel('selectReturnDate')
							]),
					isPending: !returnDate
				},
				{
					icon: 'destination',
					title: getOriginSummaryTitle(),
					meta: stopoverEndDate
						? formatDateLabel(stopoverEndDate)
						: getLocalizedLabel('completeDates'),
					isPending: !origin || !stopoverEndDate
				}
			];
		}

		return [
			{
				icon: 'origin',
				title: getDestinationSummaryTitle(),
				meta: getDateSummaryMeta(returnDate, getLocalizedLabel('selectReturnDate')),
				isPending: !destination || !returnDate
			},
			{
				icon: 'destination',
				title: getOriginSummaryTitle(),
				meta: getDateSummaryMeta(returnDate, getLocalizedLabel('selectReturnDate')),
				isPending: !origin || !returnDate
			}
		];
	}

	function searchFlights() {
		searchAttempted = true;

		const errors = getValidationErrors();
		if (Object.keys(errors).length > 0) {
			return;
		}

		if (selectedTripType !== 'roundtrip' && selectedTripType !== 'one_way') {
			if (typeof window !== 'undefined') {
				window.open(getFallbackUrl('multicity'), '_blank', 'noreferrer');
			}
			return;
		}

		const bookingUrl = buildStopoverBookingUrl({
			shoppingBaseUrl: item.shopping_base_url,
			shoppingMulticityUrl: item.shopping_multicity_url,
			tripType: selectedTripType,
			origin,
			destination,
			departureDate,
			returnDate,
			stopoverNights: stopoverNightCount,
			stopoverPlacement,
			adults,
			children,
			infants,
			cabinType,
			promoCode,
			languageCode: getLanguageCode(),
			hubIata: routeIndex?.hubIata
		});

		if (typeof window !== 'undefined') {
			window.open(bookingUrl, '_blank', 'noreferrer');
		}
	}
</script>

{#snippet tripTypeIcon(type: TripTypeSchema)}
	{#if type === 'roundtrip'}
		<SearchModeRt class="size-4 shrink-0 sm:size-5" aria-hidden="true" />
	{:else if type === 'one_way'}
		<SearchModeOw class="size-4 shrink-0 sm:size-5" aria-hidden="true" />
	{:else}
		<SearchModeMc class="size-4 shrink-0 sm:size-5" aria-hidden="true" />
	{/if}
{/snippet}

{#snippet externalLinkIcon()}
	<ExternalIcon class="size-3 shrink-0 text-current sm:size-4" aria-hidden="true" />
{/snippet}

{#snippet miniTripTypeIcon()}
	<span class="text-primary">{@render tripTypeIcon(selectedTripType)}</span>
{/snippet}

{#snippet miniPassengerIcon()}
	<TravelersIcon class="size-5 shrink-0 text-primary" aria-hidden="true" />
{/snippet}

{#snippet miniPassengerDropdown()}
	<Popover.Root bind:open={miniPassengersOpen}>
		<Popover.Trigger
			type="button"
			aria-label={passengerLabel}
			data-passenger-focus={miniPassengersFocused || miniPassengersOpen ? 'true' : undefined}
			class="flex w-full min-w-0 items-center gap-2 rounded-md bg-transparent p-0 font-body text-b font-normal text-grey-600 transition-colors outline-none hover:text-primary data-[passenger-focus=true]:text-primary data-[passenger-focus=true]:outline-2 data-[passenger-focus=true]:outline-offset-4 data-[passenger-focus=true]:outline-primary-faded data-[passenger-focus=true]:outline-solid"
			onfocus={() => (miniPassengersFocused = true)}
			onblur={() => (miniPassengersFocused = false)}
		>
			{@render miniPassengerIcon()}
			<span class="min-w-0 flex-1 truncate text-left">
				{getPassengerPresetLabel(passengerTotal)}
			</span>
			<span
				class="shrink-0 transition-transform duration-200"
				class:rotate-180={miniPassengersOpen}
			>
				<KeyboardArrow direction="down" class="size-6 text-grey-400" />
			</span>
		</Popover.Trigger>

		<Popover.Portal>
			<Popover.Content
				side="bottom"
				sideOffset={12}
				avoidCollisions={true}
				style="min-width: var(--bits-floating-anchor-width); z-index: 60;"
				class="w-[min(21rem,calc(100vw-2rem))] rounded border border-grey-300 bg-common-white p-3 shadow-[0px_3px_5px_rgba(0,0,0,0.17)]"
			>
				<div class="flex min-w-0 flex-col gap-3">
					<div
						class="flex min-w-0 items-center justify-between gap-3 rounded-lg border border-grey-200 bg-common-white p-3"
					>
						<span class="min-w-0 truncate font-body text-d1 text-grey-700">
							{getPassengerSummaryLabel('adult', 2)}
						</span>
						<Counter
							bind:value={adults}
							min={adultMin}
							max={adultMax}
							ariaLabel={getPassengerSummaryLabel('adult', 2)}
							decrementAriaLabel={passengerCounterAriaLabels.decreaseAdults}
							incrementAriaLabel={passengerCounterAriaLabels.increaseAdults}
						/>
					</div>

					<div
						class="flex min-w-0 items-center justify-between gap-3 rounded-lg border border-grey-200 bg-common-white p-3"
					>
						<span class="min-w-0 truncate font-body text-d1 text-grey-700">
							{getPassengerSummaryLabel('child', 2)}
						</span>
						<Counter
							bind:value={children}
							min={0}
							max={childMax}
							ariaLabel={getPassengerSummaryLabel('child', 2)}
							decrementAriaLabel={passengerCounterAriaLabels.decreaseChildren}
							incrementAriaLabel={passengerCounterAriaLabels.increaseChildren}
						/>
					</div>

					<div
						class="flex min-w-0 items-center justify-between gap-3 rounded-lg border border-grey-200 bg-common-white p-3"
					>
						<span class="min-w-0 truncate font-body text-d1 text-grey-700">
							{getPassengerSummaryLabel('infant', 2)}
						</span>
						<Counter
							bind:value={infants}
							min={0}
							max={infantMax}
							ariaLabel={getPassengerSummaryLabel('infant', 2)}
							decrementAriaLabel={passengerCounterAriaLabels.decreaseInfants}
							incrementAriaLabel={passengerCounterAriaLabels.increaseInfants}
						/>
					</div>

					<p class="font-body text-d2 text-grey-600">
						{passengerSupportText}
					</p>
					{#if validationErrors.passengers}
						<p class="font-body text-d2 text-system-error">
							{validationErrors.passengers}
						</p>
					{/if}
				</div>
			</Popover.Content>
		</Popover.Portal>
	</Popover.Root>
{/snippet}

{#snippet miniCabinIcon()}
	<SeatIcon class="size-5 shrink-0 text-primary" aria-hidden="true" />
{/snippet}

{#snippet miniOriginIcon()}
	<FlightDepartingIcon class="size-6 shrink-0 text-primary-light" aria-hidden="true" />
{/snippet}

{#snippet miniDestinationIcon()}
	<FlightArrivingIcon class="size-6 shrink-0 text-primary-light" aria-hidden="true" />
{/snippet}

{#snippet summaryIcon(type: SummaryIcon)}
	<span class="flex size-10 shrink-0 items-center justify-center" aria-hidden="true">
		{#if type === 'origin'}
			<AvionDespegando style="background" class="size-10" />
		{:else if type === 'stopover'}
			<PanamaStopover style="background" class="size-10" />
		{:else if type === 'destination'}
			<AvionAterrizando style="background" class="size-10" />
		{/if}
	</span>
{/snippet}

{#snippet miniStopoverPopoverFooter()}
	{#if stopoverAvailable}
		<div class="mt-5 border-t border-grey-200 pt-4">
			<div class="grid min-w-0 gap-4 md:grid-cols-[minmax(0,14rem)_minmax(0,1fr)]">
				{#if selectedTripType === 'roundtrip'}
					<ButtonGroup
						value={stopoverPlacementValue}
						options={stopoverPlacementOptions}
						label={translation?.stopover_placement_label || stopoverSummaryLabel}
						onValueChange={setStopoverPlacement}
						size="small"
						class="max-w-none"
						labelClass="text-d3"
						frameClass="bg-common-white"
					/>
				{:else}
					<div
						class="flex min-w-0 flex-col justify-center gap-1 rounded-lg bg-background-lightblue px-3 py-2"
					>
						<span class="font-body text-d3 font-medium text-primary">
							{translation?.stopover_placement_label || stopoverSummaryLabel}
						</span>
						<span class="truncate font-body text-d2 text-grey-700">
							{stopoverSummaryLabel}
						</span>
					</div>
				{/if}

				<div class="flex min-w-0 flex-col justify-center gap-2">
					<div class="flex items-center justify-between gap-2 font-body text-d3 text-grey-600">
						<span class="truncate">
							{stopoverDurationDisplayLabel}
						</span>
						<span class="shrink-0 font-medium text-primary">
							{formatStopoverNightTooltip(stopoverNightCount)}
						</span>
					</div>
					<Slider
						bind:value={stopoverNightCount}
						min={1}
						max={stopoverNightMax}
						step={1}
						ariaLabel={stopoverDurationDisplayLabel}
						showTooltip={false}
						formatTooltip={formatStopoverNightTooltip}
					/>
				</div>
			</div>
		</div>
	{/if}
{/snippet}

{#snippet miniBookingBar()}
	<div
		class="my-6 w-full overflow-visible rounded-xl border border-grey-100 bg-common-white shadow-[0_10px_24px_rgba(0,0,0,0.16)] md:w-[calc(100vw-9rem)] md:max-w-[1224px]"
		data-flight-search-bar
		data-component={component}
		role="group"
		aria-label={title}
		use:miniTabOrderAction
	>
		<div class="border-b border-grey-200 px-4 py-4 min-[1180px]:px-8">
			<div
				class="grid min-w-0 items-center gap-4 min-[1180px]:grid-cols-[minmax(0,33rem)_max-content] min-[1180px]:justify-between"
			>
				<div
					class="grid min-w-0 items-center justify-start gap-4 md:inline-grid md:grid-cols-[11rem_11rem_11rem]"
				>
					<div class="min-w-0" data-mini-tab-step="trip-type">
						<Select
							id={getControlId('mini-trip-type')}
							value={selectedTripType}
							options={miniTripTypeOptions}
							label={itinerarySelectorLabel}
							leftIcon={miniTripTypeIcon}
							class={miniTopSelectClass}
							onValueChange={setMiniTripType}
						/>
					</div>

					<div class="min-w-0" data-mini-tab-step="passengers">
						{@render miniPassengerDropdown()}
					</div>

					<div class="min-w-0" data-mini-tab-step="cabin">
						<Select
							id={getControlId('mini-cabin')}
							value={cabinTypeValue}
							options={cabinOptions}
							label={cabinLabel}
							leftIcon={miniCabinIcon}
							class={miniTopSelectClass}
							onValueChange={setCabinType}
						/>
					</div>
				</div>

				<div
					class="flex min-w-0 flex-wrap items-center justify-start gap-4 min-[1180px]:justify-end"
				>
					{#if supportedTripTypes.includes('multicity')}
						<a
							data-mini-tab-step="multicity"
							href={getFallbackUrl('multicity')}
							target="_blank"
							rel="noreferrer"
							class={buttonVariants({ variant: 'transparent-primary-main', size: 'default' }) +
								' min-h-0 gap-2 px-0 py-0 font-medium whitespace-nowrap'}
						>
							<SearchModeMc class="size-5 shrink-0" aria-hidden="true" />
							<span>{getTripTypeLabel('multicity')}</span>
							{@render externalLinkIcon()}
						</a>
					{/if}

					<button
						data-mini-tab-step="expanded-search"
						type="button"
						aria-haspopup="dialog"
						aria-expanded={modalOpen}
						class={buttonVariants({ variant: 'transparent-primary-main', size: 'default' }) +
							' min-h-0 gap-2 px-0 py-0 font-medium whitespace-nowrap'}
						onclick={openModal}
					>
						<SearchIcon class="size-5 shrink-0" aria-hidden="true" />
						<span>{expandedSearchLabel}</span>
					</button>
				</div>
			</div>
		</div>

		<div
			class="grid w-full min-w-0 gap-4 px-4 py-5 min-[1180px]:grid-cols-[minmax(0,1fr)_max-content] min-[1180px]:items-end min-[1180px]:px-8"
		>
			<div
				class="grid min-w-0 items-end gap-4 md:grid-cols-2 min-[1180px]:grid-cols-[minmax(0,14rem)_minmax(0,14rem)_minmax(20rem,28rem)] min-[1180px]:justify-start"
			>
				<div class="min-w-0" data-mini-tab-step="origin">
					<Autocomplete
						id={getControlId('mini-origin')}
						bind:value={origin}
						label={originFieldLabel}
						placeholder={originPlaceholder}
						options={originOptions}
						emptyMessage={routeDatasetMessage}
						{clearSelectionLabel}
						helperText={validationErrors.origin}
						error={Boolean(validationErrors.origin)}
						leftIcon={miniOriginIcon}
						class={miniLineFieldClass}
					/>
				</div>

				<div class="min-w-0" data-mini-tab-step="destination">
					<Autocomplete
						id={getControlId('mini-destination')}
						bind:value={destination}
						label={destinationFieldLabel}
						placeholder={destinationPlaceholder}
						options={destinationOptions}
						emptyMessage={routeDatasetMessage}
						{clearSelectionLabel}
						helperText={validationErrors.destination || validationErrors.routes}
						error={Boolean(validationErrors.destination || validationErrors.routes)}
						leftIcon={miniDestinationIcon}
						class={miniLineFieldClass}
					/>
				</div>

				<div class="min-w-0" data-mini-tab-step="dates">
					{#if selectedTripType === 'roundtrip'}
						<DateRangePicker
							id={getControlId('mini-travel-dates')}
							value={travelDateRange}
							onValueChange={setTravelDateRange}
							startName="mini_departure_date"
							endName="mini_return_date"
							label={travelDatesLabel}
							placeholder={datePlaceholderLabel}
							displayValue={miniDateDisplayValue}
							calendarLabel={travelDatesCalendarLabel}
							locale={pickerLocale}
							minValue={bookingMinDate}
							maxValue={bookingMaxDate}
							numberOfMonths={miniCalendarMonthCount}
							highlightedRange={stopoverCalendarRange}
							popoverFooter={miniStopoverPopoverFooter}
							closeOnRangeSelect={false}
							helperText={validationErrors.dates}
							error={Boolean(validationErrors.dates)}
							class={miniDateFieldClass}
							mandatory
							required
						/>
					{:else}
						<DatePicker
							id={getControlId('mini-departure-date')}
							bind:value={departureDateValue}
							name="mini_departure_date"
							label={departureDateDisplayLabel}
							placeholder={datePlaceholderLabel}
							displayValue={miniDateDisplayValue}
							calendarLabel={departureDateDisplayLabel}
							locale={pickerLocale}
							minValue={bookingMinDate}
							maxValue={bookingMaxDate}
							popoverFooter={miniStopoverPopoverFooter}
							closeOnDateSelect={false}
							helperText={validationErrors.dates}
							error={Boolean(validationErrors.dates)}
							class={miniDateFieldClass}
							mandatory
							required
						/>
					{/if}
				</div>
			</div>

			<div class="flex min-w-0 self-end min-[1180px]:justify-end">
				<button
					data-mini-tab-step="search"
					type="button"
					class={buttonVariants({ variant: 'solid-primary-main', size: 'default' }) +
						' w-full gap-2 whitespace-nowrap min-[1180px]:w-auto'}
					onclick={searchFlights}
				>
					<SearchIcon class="size-5 shrink-0" aria-hidden="true" />
					<span>{modalActionLabel}</span>
				</button>
			</div>
		</div>
	</div>
{/snippet}

{#if isHeroModal}
	{@render miniBookingBar()}
{:else}
	{@render miniBookingBar()}
{/if}

<Modal
	bind:open={modalOpen}
	{title}
	titleSize="32px"
	size="wide"
	closeLabel={modalCloseLabel}
	class="max-h-[88dvh] !max-w-[1200px] overflow-hidden [&>div:nth-child(2)]:px-4 [&>div:nth-child(2)]:pb-24 sm:[&>div:nth-child(2)]:px-6 min-[1180px]:[&>div:nth-child(2)]:px-8 min-[1366px]:[&>div:nth-child(2)]:px-14 min-[1366px]:[&>div:nth-child(2)]:pb-28"
	mainActionLabel={modalActionLabel}
	onMainAction={searchFlights}
>
	<div class="flex min-h-0 min-w-0 flex-col gap-5">
		{#if subtitle}
			<p class="font-body text-b text-grey-700">{subtitle}</p>
		{/if}

		<div
			class="grid min-h-0 min-w-0 gap-5 min-[1366px]:!grid-cols-[minmax(0,1fr)_22rem] min-[1366px]:gap-6"
		>
			<form class="flex min-h-0 min-w-0 flex-col gap-5">
				<fieldset class="flex min-w-0 flex-col gap-3">
					<legend class="font-body text-d1 font-medium text-grey-700">
						{itinerarySelectorLabel}
						<span class="text-system-error">*</span>
					</legend>
					<div
						class="grid max-w-full min-w-0 grid-cols-3 items-stretch gap-2"
						role="tablist"
						aria-label={itinerarySelectorLabel}
					>
						{#each supportedTripTypes as tripType}
							{#if tripType === 'multicity'}
								<a
									class={navTabVariants({ type: 'primary', active: false }) +
										' w-full min-w-0 justify-center px-1 text-center whitespace-normal sm:px-2'}
									href={getFallbackUrl(tripType)}
									target="_blank"
									rel="noreferrer"
									role="tab"
									aria-selected="false"
									aria-label={`${getTripTypeLabel(tripType)} ${translation?.external_new_tab_label || 'opens in a new tab'}`}
								>
									<span
										class="inline-flex max-w-full min-w-0 flex-wrap items-center justify-center gap-x-1 gap-y-0.5 text-[11px] leading-tight sm:flex-nowrap sm:text-d1"
									>
										{@render tripTypeIcon(tripType)}
										<span class="min-w-0 text-center">{getTripTypeLabel(tripType)}</span>
										{@render externalLinkIcon()}
									</span>
								</a>
							{:else}
								<NavTab
									type="primary"
									active={selectedTripType === tripType}
									class="w-full min-w-0 justify-center px-1 text-center whitespace-normal sm:px-2"
									onclick={(event) => {
										event.preventDefault();
										selectedTripType = tripType;
									}}
								>
									<span
										class="inline-flex max-w-full min-w-0 flex-wrap items-center justify-center gap-x-1 gap-y-0.5 text-[11px] leading-tight sm:flex-nowrap sm:text-d1"
									>
										{@render tripTypeIcon(tripType)}
										<span class="min-w-0 text-center">{getTripTypeLabel(tripType)}</span>
									</span>
								</NavTab>
							{/if}
						{/each}
					</div>
				</fieldset>

				<div class="grid min-w-0 gap-4 md:grid-cols-2">
					<Autocomplete
						id={getControlId('modal-origin')}
						bind:value={origin}
						label={originFieldLabel}
						placeholder={originPlaceholder}
						options={originOptions}
						emptyMessage={routeDatasetMessage}
						{clearSelectionLabel}
						helperText={validationErrors.origin}
						error={Boolean(validationErrors.origin)}
						mandatory
					/>
					<Autocomplete
						id={getControlId('modal-destination')}
						bind:value={destination}
						label={destinationFieldLabel}
						placeholder={destinationPlaceholder}
						options={destinationOptions}
						emptyMessage={routeDatasetMessage}
						{clearSelectionLabel}
						helperText={validationErrors.destination || validationErrors.routes}
						error={Boolean(validationErrors.destination || validationErrors.routes)}
						mandatory
					/>
				</div>

				<div>
					{#if selectedTripType === 'roundtrip'}
						<DateRangePicker
							id={getControlId('modal-travel-dates')}
							value={travelDateRange}
							onValueChange={setTravelDateRange}
							startName="departure_date"
							endName="return_date"
							label={travelDatesLabel}
							placeholder={datePlaceholderLabel}
							calendarLabel={travelDatesCalendarLabel}
							locale={pickerLocale}
							minValue={bookingMinDate}
							maxValue={bookingMaxDate}
							highlightedRange={stopoverCalendarRange}
							helperText={validationErrors.dates}
							error={Boolean(validationErrors.dates)}
							mandatory
							required
						/>
					{:else}
						<DatePicker
							id={getControlId('modal-departure-date')}
							bind:value={departureDateValue}
							name="departure_date"
							label={departureDateDisplayLabel}
							placeholder={datePlaceholderLabel}
							calendarLabel={departureDateDisplayLabel}
							locale={pickerLocale}
							minValue={bookingMinDate}
							maxValue={bookingMaxDate}
							helperText={validationErrors.dates}
							error={Boolean(validationErrors.dates)}
							mandatory
							required
						/>
					{/if}
				</div>

				{#if stopoverAvailable}
					<div class="flex flex-col gap-4">
						<input type="hidden" name="stopover" value="true" />

						<div
							class={selectedTripType === 'roundtrip'
								? 'grid min-w-0 gap-4 md:grid-cols-2'
								: 'grid min-w-0 gap-4'}
						>
							{#if selectedTripType === 'roundtrip'}
								<div class="flex flex-col gap-2">
									<span class="font-body text-d1 font-medium text-grey-700">
										{translation?.stopover_placement_label || stopoverSummaryLabel}
										<span class="text-system-error">*</span>
									</span>
									<ButtonGroup
										value={stopoverPlacementValue}
										options={stopoverPlacementOptions}
										onValueChange={setStopoverPlacement}
										size="large"
										class="max-w-none"
									/>
									<input type="hidden" name="stopover_placement" value={stopoverPlacement} />
								</div>
							{/if}

							<div class="flex flex-col gap-2">
								<span class="font-body text-d1 font-medium text-grey-700">
									{stopoverDurationDisplayLabel}
									<span class="text-system-error">*</span>
								</span>
								<div class="flex items-center justify-between font-body text-d3 text-grey-600">
									<span>{formatStopoverNightTooltip(1)}</span>
									<span>{formatStopoverNightTooltip(stopoverNightMax)}</span>
								</div>
								<Slider
									bind:value={stopoverNightCount}
									min={1}
									max={stopoverNightMax}
									step={1}
									ariaLabel={stopoverDurationDisplayLabel}
									class="pb-5"
									formatTooltip={formatStopoverNightTooltip}
								/>
								{#if validationErrors.stopoverNights}
									<p class="font-body text-d2 text-system-error">
										{validationErrors.stopoverNights}
									</p>
								{/if}
								<input type="hidden" name="stopoverNights" value={stopoverNights} />
							</div>
						</div>
					</div>
				{/if}

				{#if item.show_passengers !== false}
					<fieldset class="flex flex-col gap-2">
						<legend class="font-body text-d1 font-medium text-grey-700">
							{passengerLabel}
							<span class="text-system-error">*</span>
						</legend>
						<div class="mt-2 grid min-w-0 gap-3 md:grid-cols-3">
							<div
								class="flex min-w-0 items-center justify-between gap-3 rounded-lg border border-grey-200 bg-common-white p-3"
							>
								<span class="min-w-0 truncate font-body text-d1 text-grey-700">
									{getPassengerSummaryLabel('adult', 2)}
								</span>
								<Counter
									bind:value={adults}
									min={adultMin}
									max={adultMax}
									ariaLabel={getPassengerSummaryLabel('adult', 2)}
									decrementAriaLabel={passengerCounterAriaLabels.decreaseAdults}
									incrementAriaLabel={passengerCounterAriaLabels.increaseAdults}
								/>
								<input type="hidden" name="adults" value={adults} />
							</div>

							<div
								class="flex min-w-0 items-center justify-between gap-3 rounded-lg border border-grey-200 bg-common-white p-3"
							>
								<span class="min-w-0 truncate font-body text-d1 text-grey-700">
									{getPassengerSummaryLabel('child', 2)}
								</span>
								<Counter
									bind:value={children}
									min={0}
									max={childMax}
									ariaLabel={getPassengerSummaryLabel('child', 2)}
									decrementAriaLabel={passengerCounterAriaLabels.decreaseChildren}
									incrementAriaLabel={passengerCounterAriaLabels.increaseChildren}
								/>
								<input type="hidden" name="children" value={children} />
							</div>

							<div
								class="flex min-w-0 items-center justify-between gap-3 rounded-lg border border-grey-200 bg-common-white p-3"
							>
								<span class="min-w-0 truncate font-body text-d1 text-grey-700">
									{getPassengerSummaryLabel('infant', 2)}
								</span>
								<Counter
									bind:value={infants}
									min={0}
									max={infantMax}
									ariaLabel={getPassengerSummaryLabel('infant', 2)}
									decrementAriaLabel={passengerCounterAriaLabels.decreaseInfants}
									incrementAriaLabel={passengerCounterAriaLabels.increaseInfants}
								/>
								<input type="hidden" name="infants" value={infants} />
							</div>
						</div>
						<p class="font-body text-d1 text-grey-600">
							{passengerSupportText}
						</p>
						{#if validationErrors.passengers}
							<p class="font-body text-d2 text-system-error">
								{validationErrors.passengers}
							</p>
						{/if}
					</fieldset>
				{/if}

				<div class="grid min-w-0 gap-4 md:grid-cols-2">
					<div class="flex min-w-0 flex-col gap-2 py-2">
						<span class="font-body text-d1 font-medium text-grey-700">
							{cabinLabel}
						</span>
						<ButtonGroup
							value={cabinTypeValue}
							options={cabinOptions}
							onValueChange={setCabinType}
							size="large"
							class="max-w-none"
						/>
						<input type="hidden" name="cabinType" value={cabinType} />
					</div>
					{#if item.show_promo_code !== false}
						<Input
							id={getControlId('modal-promo-code')}
							bind:value={promoCode}
							label={translation?.promo_code_label || 'Promo code'}
							placeholder={translation?.promo_code_placeholder || ''}
						/>
					{/if}
				</div>
			</form>

			<aside
				class="max-w-full self-start rounded-lg border border-primary-faded/40 bg-background-lightblue/50 p-4"
			>
				<h3 class="font-heading text-b font-bold text-primary">
					{translation?.summary_title || 'Search summary'}
				</h3>

				<div class="mt-4 flex flex-col gap-4 font-body text-d1 text-grey-700">
					<div>
						<p class="font-body text-d3 font-semibold text-primary uppercase">
							{outboundFlightLabel}
						</p>
						<div
							class="relative mt-2 grid min-w-0 gap-2 before:absolute before:top-10 before:bottom-10 before:left-5 before:w-px before:bg-primary-faded/40 before:content-[''] md:grid-cols-3 md:before:hidden min-[1366px]:!grid-cols-1 min-[1366px]:before:block"
						>
							{#each outboundSummarySteps as step}
								<div
									class={step.isPending
										? 'relative z-10 min-w-0 rounded-lg border border-primary-faded/50 bg-common-white/75 p-2.5'
										: 'relative z-10 min-w-0 rounded-lg border border-grey-100 bg-common-white/95 p-2.5 shadow-sm'}
								>
									<div class="flex items-start gap-2.5">
										{@render summaryIcon(step.icon)}
										<div class="min-w-0">
											<p class="font-body text-d2 font-medium text-primary">
												{step.title}
											</p>
											{#if step.meta}
												<p class="font-body text-d3 text-grey-600">{step.meta}</p>
											{/if}
										</div>
									</div>
								</div>
							{/each}
						</div>
					</div>

					{#if returnSummarySteps.length}
						<div>
							<p class="font-body text-d3 font-semibold text-primary uppercase">
								{returnFlightLabel}
							</p>
							<div
								class="relative mt-2 grid min-w-0 gap-2 before:absolute before:top-10 before:bottom-10 before:left-5 before:w-px before:bg-primary-faded/40 before:content-[''] md:grid-cols-2 md:before:hidden min-[1366px]:!grid-cols-1 min-[1366px]:before:block"
							>
								{#each returnSummarySteps as step}
									<div
										class={step.isPending
											? 'relative z-10 min-w-0 rounded-lg border border-primary-faded/50 bg-common-white/75 p-2.5'
											: 'relative z-10 min-w-0 rounded-lg border border-grey-100 bg-common-white/95 p-2.5 shadow-sm'}
									>
										<div class="flex items-start gap-2.5">
											{@render summaryIcon(step.icon)}
											<div class="min-w-0">
												<p class="font-body text-d2 font-medium text-primary">
													{step.title}
												</p>
												{#if step.meta}
													<p class="font-body text-d3 text-grey-600">{step.meta}</p>
												{/if}
											</div>
										</div>
									</div>
								{/each}
							</div>
						</div>
					{/if}

					<dl
						class="grid min-w-0 gap-x-4 gap-y-2 border-t border-primary-faded/50 pt-4 md:grid-cols-2 min-[1366px]:!grid-cols-1"
						aria-label={translation?.summary_title || 'Search summary'}
					>
						{#each summaryDetails as detail}
							<div
								class="grid min-w-0 grid-cols-[minmax(0,7rem)_minmax(0,1fr)] items-baseline gap-2 min-[1366px]:grid-cols-[minmax(0,6.5rem)_minmax(0,1fr)]"
								data-flight-summary-detail={detail.label}
							>
								<dt class="min-w-0 font-body text-d3 font-medium text-grey-600">
									{detail.label}
								</dt>
								<dd
									class={detail.isPending
										? 'min-w-0 font-body text-d2 break-words text-grey-600'
										: 'min-w-0 font-body text-d2 font-medium break-words text-primary'}
								>
									{detail.value}
								</dd>
							</div>
						{/each}
					</dl>
				</div>
			</aside>
		</div>
	</div>
</Modal>
