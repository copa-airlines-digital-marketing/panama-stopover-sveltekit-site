import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

class ScriptStub extends EventTarget {
	src = '';
	async = false;
	remove = vi.fn();
}

describe('Vamos preview loader', () => {
	let scripts: ScriptStub[];
	let registered: boolean;
	let register: () => void;
	let locationStub: { origin: string };

	beforeEach(() => {
		vi.resetModules();
		vi.useFakeTimers();
		scripts = [];
		registered = false;
		const definition = new Promise<void>((resolve) => {
			register = () => {
				registered = true;
				resolve();
			};
		});
		locationStub = { origin: 'https://dev.panama-stopover.com' };
		vi.stubGlobal('window', {
			location: locationStub,
			setTimeout,
			clearTimeout
		});
		vi.stubGlobal('customElements', {
			get: () => (registered ? class {} : undefined),
			whenDefined: () => definition
		});
		vi.stubGlobal('document', {
			createElement: () => new ScriptStub(),
			head: { append: (script: ScriptStub) => scripts.push(script) }
		});
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.unstubAllGlobals();
	});

	it.each([
		'http://dev.panama-stopover.com',
		'https://panama-stopover.com',
		'https://dev.panama-stopover.com.example.org',
		'http://localhost:1614',
		'null'
	])('does not request vendor code from %s', async (origin) => {
		locationStub.origin = origin;
		const { loadVamosComponent } = await import('./vamos-loader');
		await expect(loadVamosComponent()).rejects.toThrow('authorized development origin');
		expect(scripts).toHaveLength(0);
	});

	it('shares one request across mounts and waits for registration, not script load', async () => {
		const { loadVamosComponent, VAMOS_SCRIPT_URL } = await import('./vamos-loader');
		const first = loadVamosComponent();
		const second = loadVamosComponent();
		expect(first).toBe(second);
		expect(scripts).toHaveLength(1);
		expect(scripts[0].src).toBe(VAMOS_SCRIPT_URL);
		const settled = vi.fn();
		void first.then(settled);
		scripts[0].dispatchEvent(new Event('load'));
		await Promise.resolve();
		expect(settled).not.toHaveBeenCalled();
		register();
		await expect(first).resolves.toBeUndefined();
		expect(vi.getTimerCount()).toBe(0);
		await loadVamosComponent();
		expect(scripts).toHaveLength(1);
	});

	it('removes a failed script and permits a new request', async () => {
		const { loadVamosComponent } = await import('./vamos-loader');
		const first = loadVamosComponent();
		const rejection = expect(first).rejects.toThrow('could not be loaded');
		scripts[0].dispatchEvent(new Event('error'));
		await rejection;
		expect(scripts[0].remove).toHaveBeenCalledOnce();
		expect(vi.getTimerCount()).toBe(0);
		const retry = loadVamosComponent();
		expect(scripts).toHaveLength(2);
		register();
		await expect(retry).resolves.toBeUndefined();
	});

	it('times out if the script never registers and permits retry', async () => {
		const { loadVamosComponent, VAMOS_LOAD_TIMEOUT_MS } = await import('./vamos-loader');
		const first = loadVamosComponent();
		const rejection = expect(first).rejects.toThrow('timed out');
		await vi.advanceTimersByTimeAsync(VAMOS_LOAD_TIMEOUT_MS);
		await rejection;
		expect(scripts[0].remove).toHaveBeenCalledOnce();
		const retry = loadVamosComponent();
		expect(scripts).toHaveLength(2);
		register();
		await expect(retry).resolves.toBeUndefined();
		expect(vi.getTimerCount()).toBe(0);
	});
});
