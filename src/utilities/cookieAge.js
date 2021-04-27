/**
 * Calculates in how many seconds a cookie will expire.
 * @param {string} exp expiry timestamp
 * @returns {number} seconds until the cookie expires
 */
const maxAge = exp => {
	const expDate = new Date(Date.parse(exp)).getTime() / 1000;
	const nowDate = new Date().getTime() / 1000;
	return expDate - nowDate;
};

export default maxAge;
