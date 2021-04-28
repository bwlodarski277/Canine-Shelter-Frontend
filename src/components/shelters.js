import React from 'react';
import { json, status } from '../helpers/fetch';
import { Card } from 'antd';
import SearchList from './searchList';
import { withRouter } from 'react-router-dom';
import ShelterListItem from './shelterListItem';
import { baseUrl } from '../config';

/**
 * Function for fetching data in the search list.
 * @param {number} currentPage current page to use for pagination
 * @param {number} pageSize page size to use for pagination
 * @param {string} query query to search by
 * @returns {object} list of breeds in the page and total count
 */
const getShelters = async (currentPage, pageSize, query, order, direction) => {
	const url = new URL(`${baseUrl}/locations`);
	const params = [
		['select', 'name'],
		['select', 'address'],
		['page', currentPage],
		['limit', pageSize],
		['query', query],
		['order', order],
		['direction', direction]
	];
	url.search = new URLSearchParams(params);
	const res = await fetch(url, { cache: 'no-cache' });
	const check = await status(res);
	const { locations, count } = await json(check);
	return { list: locations, count };
};

/**
 * Maps the list of breeds to a set of React componenets.
 * @param {List<object>} shelters list of breed objects
 */
const mapShelters = (shelters, { goToShelter, goToChat }) => {
	const shelterList = shelters.map(shelter => (
		<ShelterListItem
			key={shelter.id}
			shelter={shelter}
			goToChat={() => goToChat(shelter.id)}
			onClick={() => goToShelter(shelter.id)}
		/>
	));
	return (
		<section style={{ maxWidth: '900px', margin: 'auto', marginTop: '1em', minHeight: '70vh' }}>
			<Card style={{ marginBottom: '1em' }}>{shelterList}</Card>
		</section>
	);
};

// Requires function keyword for `this`
// eslint-disable-next-line func-style
function goToShelter(id) {
	const { history } = this.props;
	history.push(`/shelters/${id}`);
}

// eslint-disable-next-line func-style
function goToChat(id) {
	const { history } = this.props;
	history.push(`/chats/${id}`);
}

/**
 * Breeds list component
 * Used for displaying a list of breeds on the breeds page
 */
const Shelters = props => {
	return (
		<SearchList
			pageSizeOptions={[4, 6, 8]}
			defaultPageSize={4}
			columns={['name', 'address']}
			fetchFunction={getShelters}
			listMapping={mapShelters}
			extraFuncs={{ goToShelter, goToChat }}
			{...props}
		/>
	);
};

export default withRouter(Shelters);
