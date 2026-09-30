export const VAMOS_SCRIPT_URL = 'https://www.vamoseventos.com/embed/vamos-copa-events.js';
export const VAMOS_ELEMENT = 'vamos-copa-events';
export const VAMOS_PREVIEW_ORIGIN = 'https://dev.panama-stopover.com';
export const VAMOS_LOAD_TIMEOUT_MS = 15_000;

let pending: Promise<void> | undefined;

export function isVamosPreviewOrigin(origin: string): boolean {
	return origin === VAMOS_PREVIEW_ORIGIN;
}

/** Registration only: the provider owns API loading, empty states and API errors. */
export function loadVamosComponent(): Promise<void> {
	if (!isVamosPreviewOrigin(window.location.origin)) {
		return Promise.reject(new Error('Vamos preview requires the authorized development origin.'));
	}
	if (customElements.get(VAMOS_ELEMENT)) return Promise.resolve();
	if (pending) return pending;

	const attempt = new Promise<void>((resolve, reject) => {
		const script = document.createElement('script');
		script.src = VAMOS_SCRIPT_URL;
		script.async = true;
		let settled = false;

		const finish = (error?: Error) => {
			if (settled) return;
			settled = true;
			window.clearTimeout(timeout);
			script.removeEventListener('error', onError);
			if (error) {
				script.remove();
				reject(error);
			} else {
				resolve();
			}
		};
		const onError = () => finish(new Error('Vamos script could not be loaded.'));
		const timeout = window.setTimeout(
			() => finish(new Error('Vamos component registration timed out.')),
			VAMOS_LOAD_TIMEOUT_MS
		);
		script.addEventListener('error', onError);
		void customElements.whenDefined(VAMOS_ELEMENT).then(() => finish());
		try {
			document.head.append(script);
		} catch {
			onError();
		}
	});

	pending = attempt;
	void attempt.catch(() => {
		if (pending === attempt) pending = undefined;
	});
	return attempt;
}
