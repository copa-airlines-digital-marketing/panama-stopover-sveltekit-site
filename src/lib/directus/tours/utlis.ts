import { isNumberArray } from "$lib/utils";

const isStopoverTourTranslations = <T>(value: T[] | null | undefined): value is T[] => {
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
