/** Construct in onMount. Each carousel owns its clock and starts paused. */
export function createHeroPlayback({
	advance,
	state,
	progress,
	interval = 6000
}: {
	advance: () => void;
	state: (playing: boolean) => void;
	progress: (fraction: number) => void;
	interval?: number;
}) {
	let playing = false,
		destroyed = false,
		reducedMotion = false,
		elapsed = 0;
	let started: number | null = null;
	let timeout: ReturnType<typeof setTimeout> | undefined;
	let frame: number | undefined;
	const holds = new Set<string>();
	const current = () => Math.min(interval, elapsed + (started === null ? 0 : Date.now() - started));
	function stopClock() {
		elapsed = current();
		started = null;
		clearTimeout(timeout);
		if (frame !== undefined) cancelAnimationFrame(frame);
		timeout = undefined;
		frame = undefined;
		if (!destroyed) progress(elapsed / interval);
	}
	function startClock() {
		if (destroyed || !playing || holds.size) return;
		started = Date.now();
		timeout = setTimeout(
			() => {
				stopClock();
				elapsed = 0;
				progress(0);
				advance();
				// Select may synchronously reset the clock during Embla's advance.
				stopClock();
				startClock();
			},
			Math.max(0, interval - elapsed)
		);
		if (!reducedMotion) {
			const draw = () => {
				progress(current() / interval);
				frame = requestAnimationFrame(draw);
			};
			frame = requestAnimationFrame(draw);
		}
	}
	return {
		play() {
			if (destroyed) return;
			stopClock();
			playing = true;
			state(true);
			startClock();
		},
		pause() {
			if (destroyed) return;
			stopClock();
			playing = false;
			state(false);
		},
		reset() {
			if (destroyed) return;
			stopClock();
			elapsed = 0;
			progress(0);
			startClock();
		},
		suspend(reason: string) {
			if (destroyed) return;
			stopClock();
			holds.add(reason);
		},
		resume(reason: string) {
			if (destroyed) return;
			stopClock();
			holds.delete(reason);
			startClock();
		},
		setReducedMotion(value: boolean) {
			if (destroyed) return;
			stopClock();
			reducedMotion = value;
			startClock();
		},
		destroy() {
			stopClock();
			destroyed = true;
			playing = false;
			holds.clear();
		}
	};
}
