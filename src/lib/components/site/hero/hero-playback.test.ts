import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createHeroPlayback } from './hero-playback';

describe('hero playback', () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.stubGlobal('requestAnimationFrame', (callback: () => void) => setTimeout(callback, 16));
		vi.stubGlobal('cancelAnimationFrame', clearTimeout);
	});
	afterEach(() => {
		vi.clearAllTimers();
		vi.useRealTimers();
		vi.unstubAllGlobals();
	});
	function setup() {
		const advance = vi.fn(),
			state = vi.fn(),
			progress = vi.fn();
		return { advance, state, progress, clock: createHeroPlayback({ advance, state, progress }) };
	}
	it('starts paused and advances only after the full interval', () => {
		const { clock, advance } = setup();
		vi.advanceTimersByTime(12000);
		expect(advance).not.toHaveBeenCalled();
		clock.play();
		vi.advanceTimersByTime(5999);
		expect(advance).not.toHaveBeenCalled();
		vi.advanceTimersByTime(1);
		expect(advance).toHaveBeenCalledTimes(1);
		clock.destroy();
		expect(vi.getTimerCount()).toBe(0);
	});
	it('preserves elapsed time on pause and resumes the remaining interval', () => {
		const { clock, advance, progress } = setup();
		clock.play();
		vi.advanceTimersByTime(2400);
		clock.pause();
		expect(progress).toHaveBeenLastCalledWith(0.4);
		vi.advanceTimersByTime(20000);
		expect(advance).not.toHaveBeenCalled();
		clock.play();
		vi.advanceTimersByTime(3599);
		expect(advance).not.toHaveBeenCalled();
		vi.advanceTimersByTime(1);
		expect(advance).toHaveBeenCalledTimes(1);
	});
	it('waits for all holds and does not resume an explicitly paused carousel', () => {
		const { clock, advance } = setup();
		clock.play();
		vi.advanceTimersByTime(1000);
		clock.suspend('hover');
		clock.suspend('other');
		clock.resume('hover');
		vi.advanceTimersByTime(10000);
		expect(advance).not.toHaveBeenCalled();
		clock.resume('other');
		vi.advanceTimersByTime(5000);
		expect(advance).toHaveBeenCalledTimes(1);
		clock.suspend('hover');
		clock.pause();
		clock.resume('hover');
		vi.advanceTimersByTime(12000);
		expect(advance).toHaveBeenCalledTimes(1);
	});
	it('resets to a full interval when manually changing slides', () => {
		const { clock, advance, progress } = setup();
		clock.play();
		vi.advanceTimersByTime(4000);
		clock.pause();
		clock.reset();
		expect(progress).toHaveBeenLastCalledWith(0);
		clock.play();
		vi.advanceTimersByTime(5999);
		expect(advance).not.toHaveBeenCalled();
		vi.advanceTimersByTime(1);
		expect(advance).toHaveBeenCalledTimes(1);
	});
	it('does not duplicate clocks when selection resets during advance', () => {
		const advance = vi.fn(() => clock.reset());
		const clock = createHeroPlayback({ advance, state: vi.fn(), progress: vi.fn() });
		clock.play();
		vi.advanceTimersByTime(18000);
		expect(advance).toHaveBeenCalledTimes(3);
		expect(vi.getTimerCount()).toBe(2);
		clock.destroy();
		vi.advanceTimersByTime(12000);
		expect(advance).toHaveBeenCalledTimes(3);
	});
	it('does not animate progress with reduced motion', () => {
		const { clock, advance } = setup();
		clock.setReducedMotion(true);
		clock.play();
		expect(vi.getTimerCount()).toBe(1);
		vi.advanceTimersByTime(6000);
		expect(advance).toHaveBeenCalledTimes(1);
		clock.destroy();
		clock.play();
		expect(vi.getTimerCount()).toBe(0);
	});
	it('keeps each carousel independent', () => {
		const first = setup(),
			second = setup();
		first.clock.play();
		second.clock.play();
		first.clock.destroy();
		vi.advanceTimersByTime(6000);
		expect(first.advance).not.toHaveBeenCalled();
		expect(second.advance).toHaveBeenCalledTimes(1);
		second.clock.destroy();
		expect(vi.getTimerCount()).toBe(0);
	});
});
