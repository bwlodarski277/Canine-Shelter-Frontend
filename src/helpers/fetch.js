import { message } from 'antd';

const status = response => {
	const { status } = response;
	if (status >= 200 && status < 300) return response;
	return new Promise((resolve, reject) => {
		return reject(response);
	});
};

const json = response => response.json();

const error = error => {
	console.error(error);
	if (error.message) message.error(error.message);
	if (error.messages) message.error(error.messages[0]);
};

export { status, json, error };
