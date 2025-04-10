import type { ClassValue } from 'clsx';
import { clsx } from 'clsx';
import { quintOut } from 'svelte/easing';
import type { TransitionConfig } from 'svelte/transition';
import { extendTailwindMerge } from 'tailwind-merge';
import { default as Preset } from 'cmds-tailwind-styles';
import { allPass, curry, has, isNotEmpty, isNotNil } from 'ramda';
import { createTV } from 'tailwind-variants';

function flatObject(entry: [string, string | object]) {
	const [key, value] = entry;

	if (typeof value === 'string') return key === 'DEFAULT' ? null : key;

	return Object.entries(value)
		.flatMap(flatObject)
		.map((v) => key + (v ? '-' + v : ''));
}

const colors = Object.entries(Preset.theme.extend.colors)
	.flatMap(flatObject)
	.concat([
		'stopover-gastronomy',
		'stopover-canal',
		'stopover-nature',
		'stopover-accent',
		'stopover-culture'
	]);

const cmTWMergeConfig = {
	extend: {
		theme: {
			colors: colors,
			spacing: Object.keys(Preset.theme.extend.spacing)
		},
		classGroups: {
			'font-family': [{ font: [...Object.keys(Preset.theme.extend.fontFamily), 'jakarta'] }], //this is good,
			'font-size': [{ text: Object.keys(Preset.theme.extend.fontSize) }]
		}
	}
} as const;

const customTwMerge = extendTailwindMerge(cmTWMergeConfig);

const cmTailwindVariants = createTV({
	twMergeConfig: cmTWMergeConfig
});

function cn(...inputs: ClassValue[]) {
	return customTwMerge(clsx(inputs));
}

type FlyAndScaleParams = {
	y?: number;
	x?: number;
	start?: number;
	duration?: number;
};

function styleToString(style: Record<string, number | string | undefined>): string {
	return Object.keys(style).reduce((str, key) => {
		if (style[key] === undefined) return str;
		return `${str}${key}:${style[key]};`;
	}, '');
}

function flyAndScale(
	node: Element,
	params: FlyAndScaleParams = { y: -8, x: 0, start: 0.95, duration: 150 }
): TransitionConfig {
	const style = getComputedStyle(node);
	const transform = style.transform === 'none' ? '' : style.transform;

	const scaleConversion = (valueA: number, scaleA: [number, number], scaleB: [number, number]) => {
		const [minA, maxA] = scaleA;
		const [minB, maxB] = scaleB;

		const percentage = (valueA - minA) / (maxA - minA);
		const valueB = percentage * (maxB - minB) + minB;

		return valueB;
	};

	return {
		duration: params.duration ?? 200,
		delay: 0,
		css: (t) => {
			const y = scaleConversion(t, [0, 1], [params.y ?? 5, 0]);
			const x = scaleConversion(t, [0, 1], [params.x ?? 0, 0]);
			const scale = scaleConversion(t, [0, 1], [params.start ?? 0.95, 1]);

			return styleToString({
				transform: `${transform} translate3d(${x}px, ${y}px, 0) scale(${scale})`,
				opacity: t
			});
		},
		easing: quintOut
	};
}

const isNotNilNorEmpty = allPass([isNotNil, isNotEmpty]);

const say = curry((message: string, value: unknown) => {
	console.log(message, JSON.stringify(value, null, 2));
	return value;
});

function isKeyOfObject<T>(key: string | number | symbol, obj: T): key is keyof T {
	return has(key, obj);
}

function setCookie(name: string, value: string, days: number) {
	let expires = '';
	if (days) {
		const date = new Date();
		date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
		expires = '; expires=' + date.toUTCString();
	}
	document.cookie = name + '=' + (value || '') + expires + '; path=/';
}

function getCookie(name: string) {
	const nameEQ = name + '=';
	const ca = document.cookie.split(';');
	for (let i = 0; i < ca.length; i++) {
		let c = ca[i];
		while (c.charAt(0) === ' ') c = c.substring(1, c.length);
		if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
	}
	return null;
}

const isNumberArray = (value: unknown): value is Array<number> => {
	if (Array.isArray(value)) return value.every((item) => typeof item === 'number');

	return false;
};

const isStringArray = (value: unknown): value is Array<string> => {
	if (Array.isArray(value)) return value.every((item) => typeof item === 'string');

	return false;
};

export {
	cn,
	flyAndScale,
	isKeyOfObject,
	isNotNilNorEmpty,
	say,
	styleToString,
	cmTailwindVariants,
	customTwMerge,
	setCookie,
	getCookie,
	isNumberArray,
	isStringArray
};
