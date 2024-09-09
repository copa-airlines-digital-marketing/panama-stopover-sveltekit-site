import type { Locale } from "../lib/i18n";

/** 
  * @param {string} param 
  * @return {param is Locale} 
  * @satisfies {import('@sveltejs/kit').ParamMatcher} 
*/

export function match(param): param is Locale {
  return /^[a-z]{2}$|^[a-z]{2}-[A-Z]{2}$/.test(param) 
}