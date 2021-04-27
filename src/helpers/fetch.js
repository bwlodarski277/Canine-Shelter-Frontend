import { message } from 'antd';

const status = response => {
	const { status } = response;
	if (status >= 200 && status < 300) return response;
	return new Promise((resolve, reject) => {
		return reject(response);
	});
};

const json = response => response.json();

const _error = err => {
	console.error(err);
	if (err.message) message.error(err.message);
	if (err.errors) message.error(`${err.errors[0].item} ${err.errors[0].message}`);
};

const error = err => {
	// If error has no JSON function try to just send the message
	// If that fails as well, console log the error
	try {
		json(err).then(_error);
	} catch (_) {
		_error(err);
	}
	// .catch(() => {
	// 	try {
	// 		_error(err);
	// 	} catch (err) {
	// 		console.error(err);
	// 	}
	// })
	// .catch(console.error);
};

export { status, json, error };
