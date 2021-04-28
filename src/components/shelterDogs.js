import React, { Component } from 'react';
import { error, json, status } from '../helpers/fetch';
import { Col, Row } from 'antd';
import PropTypes from 'prop-types';
import { updateFavs, getDogFavs, getUserFavs } from '../helpers/updateFavs';
import DogCard from './dogCard';
import UserContext from '../contexts/user';
import SearchList from './searchList';
import { baseUrl } from '../config';

/**
 * Shelter dogs component
 * Gets a list of the current shelter's dogs.
 */
class ShelterDogs extends Component {
	constructor(props) {
		super(props);
		this.state = {
			context: this.props.context,
			id: this.props.id ? this.props.id : this.props.match.params.id
		};
		this.getDogs = this.getDogs.bind(this);
		this.fetchData = this.fetchData.bind(this);
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
			// Insert favs
			dogs = await getDogFavs(dogs);
			// If logged in
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
		const { id } = this.state;
		const url = new URL(`${baseUrl}/locations/${id}/dogs`);
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
	 * @param {list<object>} dogs list of dogs passed to this function
	 * @param {object} extraFuncs extra functions passed to component and bound to it
	 * @returns React components
	 */
	listMapping(dogs, { updateFavs }, { compact }) {
		// const  = extraFuncs;
		// const  = extraVars;
		const list = dogs.map(dog => (
			<Col key={dog.id} span={6}>
				<DogCard dog={dog} onClick={updateFavs} />
			</Col>
		));
		const minHeight = compact ? '0vh' : '70vh';
		return <Row style={{ minHeight }}>{list}</Row>;
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
				extraVars={{ compact: this.props.compact }}
			/>
		);
		// return <p>Test</p>;
	}
}

ShelterDogs.propTypes = {
	context: PropTypes.object,
	match: PropTypes.object,
	id: PropTypes.number,
	compact: PropTypes.bool
};

/**
 * Dogs component wrapper
 * Used to make sure the component gets up-to-date context
 */
const ShelterDogsWrapper = props => {
	return (
		<UserContext.Consumer>
			{context => <ShelterDogs context={context} {...props} />}
		</UserContext.Consumer>
	);
};

export default ShelterDogsWrapper;
