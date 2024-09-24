import { isSupportedLocale, type Locale } from "../lib/i18n";

/** 
  * @param {string} param 
  * @return {param is Locale} 
  * @satisfies {import('@sveltejs/kit').ParamMatcher} 
*/

export function match(param): param is Locale {
  return isSupportedLocale(param)
}