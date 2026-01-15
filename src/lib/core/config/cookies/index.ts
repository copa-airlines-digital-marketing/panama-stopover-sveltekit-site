const MAX_COOKIE_EXPIRATION_TIME = 60 * 60 * 24 * 30 * 24; //62208000

const SESSION_COOKIE_EXPIRATION_TIME = 60 * 60 * 7 + 60 * 55; //28500

const SESSION_COOKIE_SERIALIZATION = {
	path: '/',
	httpOnly: true,
	secure: true,
	sameSite: 'strict',
	maxAge: SESSION_COOKIE_EXPIRATION_TIME
} as const;

const MAX_COOKIE_SERIALIZATION = {
	...SESSION_COOKIE_SERIALIZATION,
	maxAge: MAX_COOKIE_EXPIRATION_TIME
} as const;

/**
 * Sets a cookie in the browser
 * @param name - Cookie name
 * @param value - Cookie value
 * @param days - Number of days until expiration
 */
function setCookie(name: string, value: string, days: number) {
	let expires = '';
	if (days) {
		const date = new Date();
		date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
		expires = '; expires=' + date.toUTCString();
	}
	document.cookie = name + '=' + (value || '') + expires + '; path=/';
}

/**
 * Gets a cookie value by name
 * @param name - Cookie name
 * @returns Cookie value or null if not found
 */
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

export { SESSION_COOKIE_SERIALIZATION, MAX_COOKIE_SERIALIZATION, setCookie, getCookie };
