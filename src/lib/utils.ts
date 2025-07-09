import type { ClassValue } from 'clsx';
import { clsx } from 'clsx';
import { quintOut } from 'svelte/easing';
import type { TransitionConfig } from 'svelte/transition';
import { extendTailwindMerge } from 'tailwind-merge';
import { allPass, curry, has, isNotEmpty, isNotNil } from 'ramda';
import { createTV } from 'tailwind-variants';

const stopoverTWMergeConfig = {
	extend: {
		theme: {
			colors: [
				'primary',
				'primary-light',
				'primary-dark',
				'primary-ultradark',
				'primary-ultralight',
				'primary-faded',
				'secondary',
				'secondary-faded',
				'tertiary',
				'background-lightblue',
				'background-paper',
				'alternative-pardo',
				'alternative-gold',
				'alternative-darkorange',
				'alternative-lightorange',
				'alternative-perfermemberblue',
				'system-warning',
				'system-warning-faded',
				'system-error',
				'system-error-faded',
				'system-success',
				'system-success-faded',
				'grey-800',
				'grey-700',
				'grey-600',
				'grey-500',
				'grey-400',
				'grey-300',
				'grey-200',
				'grey-100',
				'grey-75',
				'grey-50',
				'common-black',
				'common-white',
				'status-member',
				'status-silver',
				'status-gold',
				'status-platinum',
				'status-presidential',
				'stopover-accent',
				'stopover-canal',
				'stopover-culture',
				'stopover-gastronomy',
				'stopover-nature'
			],
			spacing: ['gutter', 'minimal', 'tiny', 'petit', 'normal', 'roomy', 'spacious', 'big', 'huge'],
			font: ['Gilroy', "Suisse Int\'l", 'Jakarta'],
			text: ['d3', 'd2', 'd1', 'b', 'u4', 'u1', 'u2', 'u3', 'u4', 'u5', 'u6']
		}
	}
} as const;

const tm = extendTailwindMerge(stopoverTWMergeConfig);

const tv = createTV({
	twMergeConfig: stopoverTWMergeConfig
});

function cn(...inputs: ClassValue[]) {
	return tm(clsx(inputs));
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
	tv,
	tv as cmTailwindVariants,
	tm as customTwMerge,
	setCookie,
	getCookie,
	isNumberArray,
	isStringArray
};
