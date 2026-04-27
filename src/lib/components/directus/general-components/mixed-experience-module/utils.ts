import type { PathSchema } from '$lib/domain/pages';

// Reference point for the distance filter: "Iglesia del Carmen, Vía España" (Panama City).
export const IGLESIA_DEL_CARMEN: GeoPoint = { lat: 8.9936, lng: -79.5197 };

export type GeoPoint = { lat: number; lng: number };

export type RawCategoryTranslation = {
	languages_code?: string | null;
	label?: string | null;
};

export type RawCategory = {
	id?: number | null;
	translations?: RawCategoryTranslation[] | null;
};

export type RawMixedItem = {
	id?: number | string | null;
	_collection?: string | null;
	priority?: number | null;
	date_created?: string | null;
	main_image?: string | null;
	promo_discount_percent?: number | null;
	promo_discount_amount?: number | null;
	duration?: number | string | null;
	experience_category?: number | RawCategory | null;
	supported_languages?: unknown;
	meeting_point?: unknown;
	location?: unknown;
	parent_page?: PathSchema | null;
	translations?: Array<{
		name?: string | null;
		path?: string | null;
		promo_name?: string | null;
	}>;
};

export type NormalizedMixedItem = {
	stableKey: string;
	collection: string;
	id: number | string | null;
	name: string;
	priority: number;
	dateCreated: string | null;
	recency: number;
	promoDiscountPercent: number | null;
	promoDiscountAmount: number | null;
	duration: number | null;
	experienceCategory: number | null;
	categoryLabel: string | null;
	supportedLanguages: string[];
	geoPoint: GeoPoint | null;
	distanceFromCenterKm: number | null;
	raw: RawMixedItem;
};

export type TranslationLike = { languages_code?: string | null };

/**
 * Picks the translation row matching `lang`, falling back to `fallback`
 * and finally the first available row.
 */
export function pickTranslation<T extends TranslationLike>(
	translations: T[] | null | undefined,
	lang: string | null | undefined,
	fallback = 'en'
): T | undefined {
	if (!translations || translations.length === 0) return undefined;
	return (
		(lang ? translations.find((t) => t.languages_code === lang) : undefined) ??
		translations.find((t) => t.languages_code === fallback) ??
		translations[0]
	);
}

/**
 * Parses a Directus GeoJSON point into `{ lat, lng }`.
 * Accepts the shape `{ type: 'Point', coordinates: [lng, lat] }` (GeoJSON canonical)
 * as well as already-parsed `{ lat, lng }` objects and JSON-string-encoded forms.
 */
export function parseGeoPoint(value: unknown): GeoPoint | null {
	if (value == null) return null;

	if (typeof value === 'string') {
		try {
			return parseGeoPoint(JSON.parse(value));
		} catch {
			return null;
		}
	}

	if (typeof value !== 'object') return null;

	const record = value as Record<string, unknown>;

	if (typeof record.lat === 'number' && typeof record.lng === 'number') {
		return { lat: record.lat, lng: record.lng };
	}

	const coords = record.coordinates;
	if (Array.isArray(coords) && coords.length >= 2) {
		const lng = Number(coords[0]);
		const lat = Number(coords[1]);
		if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
	}

	return null;
}

/**
 * Normalizes `duration` to a number. `stopover_tour.duration` is stored as a number,
 * `stopover_place_to_visit.duration` as a string (sometimes with units). Returns `null`
 * if the value cannot be parsed to a finite number.
 */
export function parseDuration(value: unknown): number | null {
	if (value == null) return null;
	if (typeof value === 'number') return Number.isFinite(value) ? value : null;
	if (typeof value === 'string') {
		const trimmed = value.trim();
		if (!trimmed) return null;
		const match = trimmed.match(/-?\d+(\.\d+)?/);
		if (!match) return null;
		const parsed = Number(match[0]);
		return Number.isFinite(parsed) ? parsed : null;
	}
	return null;
}

/**
 * `supported_languages` is stored as jsonb, typically as `Record<string, boolean>`
 * (truthy keys are enabled languages) or as an array of language codes.
 * Returns the enabled language codes as lowercase strings.
 */
export function parseSupportedLanguages(value: unknown): string[] {
	if (value == null) return [];
	if (Array.isArray(value)) {
		return value.filter((v): v is string => typeof v === 'string').map((v) => v.toLowerCase());
	}
	if (typeof value === 'object') {
		return Object.entries(value as Record<string, unknown>)
			.filter(([, v]) => Boolean(v))
			.map(([k]) => k.toLowerCase());
	}
	if (typeof value === 'string') {
		try {
			return parseSupportedLanguages(JSON.parse(value));
		} catch {
			return value
				.split(/[,;\s]+/)
				.map((v) => v.trim().toLowerCase())
				.filter(Boolean);
		}
	}
	return [];
}

export function stableKey(collection: string | null | undefined, id: number | string | null | undefined): string {
	return `${collection ?? 'unknown'}:${id ?? ''}`;
}

const toTimestamp = (value: string | null | undefined): number => {
	if (!value) return 0;
	const parsed = Date.parse(value);
	return Number.isNaN(parsed) ? 0 : parsed;
};

/**
 * Great-circle distance in kilometers between two points using the haversine formula.
 */
export function haversineKm(a: GeoPoint, b: GeoPoint): number {
	const R = 6371;
	const dLat = ((b.lat - a.lat) * Math.PI) / 180;
	const dLng = ((b.lng - a.lng) * Math.PI) / 180;
	const sinLat = Math.sin(dLat / 2);
	const sinLng = Math.sin(dLng / 2);
	const x =
		sinLat * sinLat +
		Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * sinLng * sinLng;
	return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

/**
 * Extracts the category id and localized label from `raw.experience_category`.
 * When the server has deep-fetched the relation it comes as an object with
 * `id` + `translations` (already filtered by locale server-side). When only
 * the FK was selected, it comes as a plain number.
 */
function extractCategory(raw: unknown): { id: number | null; label: string | null } {
	if (raw == null) return { id: null, label: null };
	if (typeof raw === 'number') return { id: raw, label: null };
	if (typeof raw === 'object') {
		const record = raw as RawCategory;
		const id = typeof record.id === 'number' ? record.id : null;
		const translations = Array.isArray(record.translations) ? record.translations : [];
		const label = translations[0]?.label ?? null;
		return { id, label };
	}
	return { id: null, label: null };
}

export function normalizeMixedItem(raw: RawMixedItem): NormalizedMixedItem {
	const collection = raw._collection ?? 'unknown';
	const geoSource = collection === 'stopover_tour' ? raw.meeting_point : raw.location;
	const geoPoint = parseGeoPoint(geoSource);
	const { id: experienceCategory, label: categoryLabel } = extractCategory(raw.experience_category);

	return {
		stableKey: stableKey(collection, raw.id ?? null),
		collection,
		id: (raw.id as number | string | null | undefined) ?? null,
		name: raw.translations?.[0]?.name ?? '',
		priority: raw.priority ?? 0,
		dateCreated: raw.date_created ?? null,
		recency: toTimestamp(raw.date_created),
		promoDiscountPercent: raw.promo_discount_percent ?? null,
		promoDiscountAmount: raw.promo_discount_amount ?? null,
		duration: parseDuration(raw.duration),
		experienceCategory,
		categoryLabel,
		supportedLanguages: parseSupportedLanguages(raw.supported_languages),
		geoPoint,
		distanceFromCenterKm: geoPoint ? haversineKm(IGLESIA_DEL_CARMEN, geoPoint) : null,
		raw
	};
}

/**
 * Returns a locale-aware language display name for a 2-letter code (e.g. `en` →
 * `English` when `locale=en`, `Inglés` when `locale=es`). Falls back to the
 * uppercased code when `Intl.DisplayNames` is unavailable or the code cannot be
 * resolved.
 */
export function getLanguageDisplayName(code: string, locale: string | null | undefined): string {
	const normalized = code.trim().toLowerCase();
	if (!normalized) return '';
	try {
		if (typeof Intl !== 'undefined' && typeof Intl.DisplayNames === 'function') {
			const display = new Intl.DisplayNames([locale || 'en'], { type: 'language' });
			const resolved = display.of(normalized);
			if (resolved && resolved.toLowerCase() !== normalized) return resolved;
		}
	} catch {
		// ignore - fall through to the uppercase fallback
	}
	return normalized.toUpperCase();
}

// -----------------------------------------------------------------------------
// Filters
// -----------------------------------------------------------------------------

export type MixedFilterState = {
	languages: string[]; // OR — empty array means "no filter"
	categories: number[]; // OR — empty array means "no filter"
	discountMin: number | null; // minimum discount percent; null = no filter
	durationMin: number | null;
	durationMax: number | null;
	distanceMaxKm: number | null;
};

export const emptyFilterState = (): MixedFilterState => ({
	languages: [],
	categories: [],
	discountMin: null,
	durationMin: null,
	durationMax: null,
	distanceMaxKm: null
});

export function applyFilters(
	items: NormalizedMixedItem[],
	filters: MixedFilterState
): NormalizedMixedItem[] {
	return items.filter((item) => {
		if (filters.languages.length > 0) {
			if (!filters.languages.some((lang) => item.supportedLanguages.includes(lang))) return false;
		}
		if (filters.categories.length > 0) {
			if (item.experienceCategory == null || !filters.categories.includes(item.experienceCategory))
				return false;
		}
		if (filters.discountMin != null) {
			if (item.promoDiscountPercent == null || item.promoDiscountPercent < filters.discountMin)
				return false;
		}
		if (filters.durationMin != null) {
			if (item.duration == null || item.duration < filters.durationMin) return false;
		}
		if (filters.durationMax != null) {
			if (item.duration == null || item.duration > filters.durationMax) return false;
		}
		if (filters.distanceMaxKm != null) {
			if (item.distanceFromCenterKm == null || item.distanceFromCenterKm > filters.distanceMaxKm)
				return false;
		}
		return true;
	});
}

// -----------------------------------------------------------------------------
// Sorting
// -----------------------------------------------------------------------------

export type SortOption = 'relevance' | 'discount_percent' | 'distance_from_center' | 'duration' | 'name';
export type SortDir = 'asc' | 'desc';

export function sortItems(
	items: NormalizedMixedItem[],
	sort: SortOption,
	dir: SortDir
): NormalizedMixedItem[] {
	const d = dir === 'asc' ? 1 : -1;
	const copy = [...items];

	switch (sort) {
		case 'relevance':
			return copy.sort((a, b) => {
				if (b.priority !== a.priority) return b.priority - a.priority;
				const ap = a.promoDiscountPercent ?? -1;
				const bp = b.promoDiscountPercent ?? -1;
				if (bp !== ap) return bp - ap;
				if (b.recency !== a.recency) return b.recency - a.recency;
				return a.stableKey.localeCompare(b.stableKey);
			});

		case 'discount_percent':
			return copy.sort((a, b) => {
				const aVal = a.promoDiscountPercent ?? (dir === 'asc' ? Infinity : -Infinity);
				const bVal = b.promoDiscountPercent ?? (dir === 'asc' ? Infinity : -Infinity);
				if (aVal !== bVal) return d * (bVal - aVal);
				return a.stableKey.localeCompare(b.stableKey);
			});

		case 'distance_from_center':
			return copy.sort((a, b) => {
				const aVal = a.distanceFromCenterKm ?? Infinity;
				const bVal = b.distanceFromCenterKm ?? Infinity;
				if (aVal !== bVal) return d * (aVal - bVal);
				return a.stableKey.localeCompare(b.stableKey);
			});

		case 'duration':
			return copy.sort((a, b) => {
				const aVal = a.duration ?? (dir === 'asc' ? Infinity : -Infinity);
				const bVal = b.duration ?? (dir === 'asc' ? Infinity : -Infinity);
				if (aVal !== bVal) return d * (aVal - bVal);
				return a.stableKey.localeCompare(b.stableKey);
			});

		case 'name':
			return copy.sort((a, b) => {
				const cmp = a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
				if (cmp !== 0) return d * cmp;
				return a.stableKey.localeCompare(b.stableKey);
			});
	}
}

// -----------------------------------------------------------------------------
// max_items caps — source first, then global
// -----------------------------------------------------------------------------

/**
 * Applies `source.max_items` caps per collection. Items without a matching cap
 * (or with a cap of `-1` / `null`) are passed through unchanged.
 * Must be applied AFTER sorting so the highest-ranked items per source survive.
 */
export function applySourceCaps<T extends { collection: string }>(
	items: T[],
	caps: Record<string, number | null | undefined>
): T[] {
	const counts: Record<string, number> = {};
	const out: T[] = [];

	for (const item of items) {
		const cap = caps[item.collection];
		if (cap == null || cap < 0) {
			out.push(item);
			continue;
		}
		const c = counts[item.collection] ?? 0;
		if (c < cap) {
			out.push(item);
			counts[item.collection] = c + 1;
		}
	}

	return out;
}
