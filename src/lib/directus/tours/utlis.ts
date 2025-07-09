import type { StopoverTourTranslations } from "$cms/collections/stopover_tour_translations";
import type { StopoverTour } from "$cms/collections/stopover_tours/stopover_tours";
import { isNumberArray } from "$lib/utils";

const isStopoverTourTranslations = (value: StopoverTour['translations']): value is StopoverTourTranslations[] => {
  if(value == null) {
    console.warn(`value is null or undefined`);
    return false;
  }

  if(!Array.isArray(value)) {
    console.warn(`value is not an array: ${value}`);
    return false;
  }

  if(isNumberArray(value)) {
    console.warn(`value is a number array: ${value}`);
    return false;
  }

  return true
}

export {
  isStopoverTourTranslations
}