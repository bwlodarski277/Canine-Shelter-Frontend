const status = response => {
	const { status } = response;
	if (status >= 200 && status < 300) return response;
	return new Promise((resolve, reject) => {
		return reject(response);
	});
};

const json = response => response.json();

export { status, json };
