/* eslint-disable func-style */
import React from 'react';
import { error, json, status } from '../helpers/fetch';
import { Card, message } from 'antd';
import SearchList from './searchList';
import { withRouter } from 'react-router-dom';
import BreedListItem from './breedListItem';
import { baseUrl } from '../config';

/**
 * Function for fetching data in the search list.
 * @param {number} currentPage current page to use for pagination
 * @param {number} pageSize page size to use for pagination
 * @param {string} query query to search by
 * @returns {object} list of breeds in the page and total count
 */
const getBreeds = async (currentPage, pageSize, query, order, direction) => {
	const url = new URL(`${baseUrl}/breeds`);
	const params = [
		['select', 'name'],
		['select', 'description'],
		['page', currentPage],
		['limit', pageSize],
		['query', query],
		['order', order],
		['direction', direction]
	];
	url.search = new URLSearchParams(params);
	const res = await fetch(url, { cache: 'no-cache' });
	const check = await status(res);
	const { breeds, count } = await json(check);
	return { list: breeds, count };
};

// Requires function keyword for `this`
// eslint-disable-next-line func-style
/**
 *
 * @param {object} data data to use to update breed
 * @param {string} breedUrl URL to the breed resource
 * @param {object} context user context for authentication
 * @param {object} form form that called this function
 */
function updateBreed(data, breedUrl, context, form) {
	if (data.name || data.description)
		fetch(breedUrl, {
			method: 'PUT',
			headers: { Authorization: 'Bearer ' + context.jwt, 'Content-Type': 'application/json' },
			body: JSON.stringify(data)
		})
			.then(status)
			.then(json)
			.then(() => {
				message.success('Breed updated');
				form.current.resetFields();
				this.getData();
			})
			.catch(error);
	else message.info('Please enter at least one field to update.');
}

/**
 * Maps the list of breeds to a set of React componenets.
 * @param {List<object>} breeds list of breed objects
 */
const mapBreeds = (breeds, { goToBreed, updateBreed }, _, context) => {
	const { user = {} } = context;
	const breedList = breeds.map(breed => {
		return (
			<BreedListItem
				key={breed.id}
				breed={breed}
				user={user}
				onClick={() => goToBreed(breed.id)}
				updateBreed={updateBreed}
				context={context}
			/>
		);
	});
	return (
		<section style={{ maxWidth: '900px', margin: 'auto', marginTop: '1em', minHeight: '70vh' }}>
			<Card style={{ marginBottom: '1em' }}>{breedList}</Card>
		</section>
	);
};

// Requires function keyword for `this`
// eslint-disable-next-line func-style
/**
 * Goes to the breed dog list.
 * @param {number} id breed ID
 */
function goToBreed(id) {
	const { history } = this.props;
	history.push(`/breeds/${id}`);
}

/**
 * Breeds list component
 * Used for displaying a list of breeds on the breeds page
 */
const Breeds = props => {
	const columns = ['name', 'description'];
	return (
		<SearchList
			pageSizeOptions={[4, 6, 8]}
			defaultPageSize={4}
			columns={columns}
			fetchFunction={getBreeds}
			listMapping={mapBreeds}
			extraFuncs={{ goToBreed, updateBreed }}
			{...props}
		/>
	);
};

export default withRouter(Breeds);
