import React from 'react';
import { json, status } from '../helpers/fetch';
import { Card } from 'antd';
import SearchList from './searchList';
import { withRouter } from 'react-router-dom';
import BreedListItem from './breedListItem';

/**
 * Function for fetching data in the search list.
 * @param {number} currentPage current page to use for pagination
 * @param {number} pageSize page size to use for pagination
 * @param {string} query query to search by
 * @returns {object} list of breeds in the page and total count
 */
const getBreeds = async (currentPage, pageSize, query, order, direction) => {
	const url = new URL('http://localhost:3000/api/v1/breeds');
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

/**
 * Maps the list of breeds to a set of React componenets.
 * @param {List<object>} breeds list of breed objects
 */
const mapBreeds = (breeds, { goToBreed }) => {
	const breedList = breeds.map(breed => (
		<BreedListItem key={breed.id} breed={breed} onClick={() => goToBreed(breed.id)} />
	));
	return (
		<section style={{ maxWidth: '900px', margin: 'auto', marginTop: '1em', minHeight: '70vh' }}>
			<Card style={{ marginBottom: '1em' }}>{breedList}</Card>
		</section>
	);
};

// Requires function keyword for `this`
// eslint-disable-next-line func-style
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
			extraFuncs={{ goToBreed }}
			{...props}
		/>
	);
};

export default withRouter(Breeds);
