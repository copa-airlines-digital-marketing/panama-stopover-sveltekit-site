const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null;

/** Resolve only colors declared by the page's site; never accept arbitrary CSS. */
export function resolvePageAccent(accent: unknown, colors: unknown): string | undefined {
	if (!Array.isArray(colors)) return undefined;
	const palette = colors.filter(
		(entry): entry is { name: string; color: string } =>
			isRecord(entry) &&
			typeof entry.name === 'string' &&
			typeof entry.color === 'string' &&
			/^#(?:[a-f\d]{3}|[a-f\d]{6})$/i.test(entry.color)
	);
	return (
		palette.find((entry) => entry.name === accent)?.color ??
		palette.find((entry) => entry.name === 'primary')?.color
	);
}
