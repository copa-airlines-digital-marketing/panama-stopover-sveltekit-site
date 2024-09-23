import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { cubicOut } from "svelte/easing";
import type { TransitionConfig } from "svelte/transition";
import { extendTailwindMerge } from "tailwind-merge";
import { default as Preset } from 'cmds-tailwind-styles';
import { allPass, curry, has, isNotEmpty, isNotNil } from "ramda";
import { createTV } from "tailwind-variants";

function flatObject(entry: [string, string | object]) {
  const [key, value] = entry

  if(typeof value === 'string')
    return key === 'DEFAULT' ? null : key

  return Object.entries(value).flatMap(flatObject).map(v => key + ( v ? '-'+v : '') )
}

const colors = Object.entries(Preset.theme.extend.colors).flatMap(flatObject)

const cmTWMergeConfig = {
  extend: {
    theme: {
      colors: colors,
      spacing: Object.keys(Preset.theme.extend.spacing)
    },
    classGroups: {
      'font-family': [{font:Object.keys(Preset.theme.extend.fontFamily)}], //this is good,
      'font-size': [{text:Object.keys(Preset.theme.extend.fontSize)}],
    }
  }
} as const

const customTwMerge = extendTailwindMerge(cmTWMergeConfig)

const cmTailwindVariants = createTV({
  twMergeConfig: cmTWMergeConfig
})

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
	}, "");
}

function flyAndScale(
	node: Element,
	params: FlyAndScaleParams = { y: -8, x: 0, start: 0.95, duration: 150 }
): TransitionConfig {
	const style = getComputedStyle(node);
	const transform = style.transform === "none" ? "" : style.transform;

	const scaleConversion = (
		valueA: number,
		scaleA: [number, number],
		scaleB: [number, number]
	) => {
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
				opacity: t,
			});
		},
		easing: cubicOut,
	};
}

const isNotNilNorEmpty = allPass([isNotNil, isNotEmpty])

const say = curry((message: string, value: unknown) => {
  console.log(message, JSON.stringify(value, null, 2))
  return value
})

function isKeyOfObject<T>(key: string | number | symbol, obj: T): key is keyof T {
  return has(key, obj)
}

export {
  cn,
  flyAndScale,
  isKeyOfObject,
  isNotNilNorEmpty,
  say,
  styleToString,
  cmTailwindVariants,
  customTwMerge,
}