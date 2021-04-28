import React, { Component } from 'react';
import { error, json, status } from '../helpers/fetch';
import { Col, Row } from 'antd';
import PropTypes from 'prop-types';
import { updateFavs, getUserFavs, getDogFavs } from '../helpers/updateFavs';
import DogCard from './dogCard';
import UserContext from '../contexts/user';
import SearchList from './searchList';
import { baseUrl } from '../config';

/**
 * Dog grid component.
 */
class Dogs extends Component {
	constructor(props) {
		super(props);
		this.state = {
			context: this.props.context
		};
		this.fetchData = this.fetchData.bind(this);
		this.getDogs = this.getDogs.bind(this);
	}

	/**
	 * Fetches list of dogs and adds user's favourites to each dog
	 * @param {number} currentPage current page
	 * @param {number} pageSize number of dogs per page
	 * @param {string} query query to search for dogs
	 * @param {string} order item so order by
	 * @param {string} direction direction to sort in
	 * @returns {object} dogs list and total count
	 */
	async fetchData(currentPage, pageSize, query, order, direction) {
		try {
			let { dogs, count } = await this.getDogs(
				currentPage,
				pageSize,
				query,
				order,
				direction
			);
			dogs = await getDogFavs(dogs);
			if (this.state.context.loggedIn) {
				const { user, jwt } = this.props.context;
				dogs = await getUserFavs(dogs, user, jwt);
			}
			return { list: dogs, count };
		} catch (err) {
			error(err);
		}
	}

	/**
	 * Gets a list of dogs given a set of parameters.
	 * @param {number} currentPage current page
	 * @param {number} pageSize number of dogs per page
	 * @param {string} query query to search for dogs
	 * @param {string} order item so order by
	 * @param {string} direction direction to sort in
	 * @returns
	 */
	async getDogs(currentPage, pageSize, query, order, direction) {
		const url = new URL(`${baseUrl}/dogs`);
		const params = [
			['select', 'name'],
			['select', 'description'],
			['select', 'imageUrl'],
			['page', currentPage],
			['limit', pageSize],
			['query', query],
			['order', order],
			['direction', direction]
		];
		// Getting list of dogs
		url.search = new URLSearchParams(params);
		// Getting the dogs
		const res = await fetch(url, { cache: 'no-cache' });
		const data = await status(res);
		const { dogs, count } = await json(data);
		return { dogs, count };
	}

	/**
	 * Maps a list of dogs to a set of React components.
	 * @param {*} dogs list of dogs passed to this function
	 * @param {object} extraFuncs extra functions passed to component and bound to it
	 * @returns React components
	 */
	listMapping(dogs, { updateFavs }) {
		const list = dogs.map(dog => (
			<Col key={dog.id} span={6}>
				<DogCard dog={dog} onClick={updateFavs} />
			</Col>
		));
		return <Row style={{ minHeight: '70vh' }}>{list}</Row>;
	}

	render() {
		const columns = ['name', 'description', 'age', 'gender', 'dateCreated', 'dateModified'];
		return (
			<SearchList
				pageSizeOptions={[4, 8, 12]}
				defaultPageSize={4}
				columns={columns}
				fetchFunction={this.fetchData}
				listMapping={this.listMapping}
				extraFuncs={{ updateFavs }}
			/>
		);
		// return <p>Test</p>;
	}
}

Dogs.propTypes = {
	context: PropTypes.object
};

/**
 * Dogs component wrapper
 * Used to make sure the component gets up-to-date context
 */
const DogsWrapper = () => {
	return <UserContext.Consumer>{context => <Dogs context={context} />}</UserContext.Consumer>;
};

export default DogsWrapper;
