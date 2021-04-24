import React, { Component } from 'react';
import { json, status } from '../helpers/fetch';
import { Col, Row } from 'antd';
import PropTypes from 'prop-types';
import updateFavs from '../helpers/updateFavs';
import DogCard from './dogCard';
import UserContext from '../contexts/user';
import SearchList from './searchList';

/**
 * Dog grid component.
 */
class Dogs extends Component {
	constructor(props) {
		super(props);
		this.state = {
			context: this.props.context
		};
		this.getDogs = this.getDogs.bind(this);
		this.fetchData = this.fetchData.bind(this);
		this.getDogFavs = this.getDogFavs.bind(this);
	}

	async fetchData(currentPage, pageSize, query, order, direction) {
		try {
			let { dogs, count } = await this.getDogs(
				currentPage,
				pageSize,
				query,
				order,
				direction
			);
			dogs = await this.getDogFavs(dogs);
			if (this.state.context.loggedIn) dogs = await this.getUserFavs(dogs);
			return { list: dogs, count };
		} catch (error) {
			console.error(error);
		}
	}

	async getDogs(currentPage, pageSize, query, order, direction) {
		const url = new URL('http://localhost:3000/api/v1/dogs');
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

	async getUserFavs(dogs) {
		const { user, jwt } = this.props.context;
		const res = await fetch(user.links.favourites, {
			headers: { Authorization: 'Bearer ' + jwt },
			cache: 'no-cache' // Still caching but asking API if data has changed
		});
		const data = await status(res);
		const favs = await json(data);

		const favIds = favs.map(fav => fav.dogId);

		const favouritedDogs = await Promise.all(
			dogs.map(async dog => {
				dog.favourited = favIds.includes(dog.id) ? true : false;
				return dog;
			})
		);
		return favouritedDogs;
	}

	/**
	 * Injects favourite counts into dogs list
	 * @returns {object} list of dogs with favourite data
	 */
	async getDogFavs(dogs) {
		// Mapping favourite counts to each dog
		const dogFavs = await Promise.all(
			dogs.map(async dog => {
				try {
					// Still caching but asking API if data has changed
					const res = await fetch(dog.links.favourites, { cache: 'no-cache' });
					const data = await status(res);
					const favs = await json(data);
					dog.favourites = favs.count;
					return dog;
				} catch (error) {
					console.log(error);
				}
			})
		);
		return dogFavs;
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
