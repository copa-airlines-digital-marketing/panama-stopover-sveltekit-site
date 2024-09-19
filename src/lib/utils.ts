import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { cubicOut } from "svelte/easing";
import type { TransitionConfig } from "svelte/transition";
import { extendTailwindMerge } from "tailwind-merge";
import { default as Preset } from 'cmds-tailwind-styles';
import { all, allPass, curry, isNotEmpty, isNotNil, keys, values } from "ramda";
import { createTV } from "tailwind-variants";

/* function flatObject(item: object) {

  const objectValues = values(item)

  console.log(typeof objectValues[0])

  if(typeof objectValues[0] === 'string') 
    return keys(item)

  return [...flatObject(objectValues)]
} */

const cmTailwindVariants = createTV({
  twMergeConfig: {
    extend: {
      classGroups: {
        'font-size': [...Object.keys(Preset.theme.extend.fontSize).map(v => 'text-'+v)],
        'font-family': [...Object.keys(Preset.theme.extend.fontFamily).map(v => 'font-'+v)],
        'text-color': [...Object.keys(Preset.theme.extend.colors).map(v => 'text-'+v)],
        'border-color': [...Object.keys(Preset.theme.extend.colors)]
      }
    }
  }
})

//console.log(flatObject(Preset.theme.extend.colors))

const customTwMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [...Object.keys(Preset.theme.extend.fontSize).map(v => 'text-'+v)],
      'font-family': [...Object.keys(Preset.theme.extend.fontFamily).map(v => 'font-'+v)],
      'text-color': [...Object.keys(Preset.theme.extend.colors).map(v => 'text-'+v)],
      'border-color': [...Object.keys(Preset.theme.extend.colors)]
    }
  }
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
})

export {
  cn,
  flyAndScale,
  isNotNilNorEmpty,
  say,
  styleToString,
  cmTailwindVariants,
}