import React, { Component } from 'react';
import { json, status } from '../helpers/fetch';
import { Col, Row, Pagination, Input, Empty } from 'antd';
const { Search } = Input;
import DogCard from './dogCard';
import UserContext from '../contexts/user';

/**
 * Dog grid component.
 */
class Dogs extends Component {
	constructor(props) {
		super(props);
		this.state = {
			dogs: [],
			count: 0,
			currentPage: 1,
			pageSize: 4,
			query: ''
		};
		this.updateFavs = this.updateFavs.bind(this);
		this.getDogFavs = this.getDogFavs.bind(this);
		this.getUserFavs = this.getUserFavs.bind(this);
		this.changePageSize = this.changePageSize.bind(this);
		this.fetchData = this.fetchData.bind(this);
		this.updateSearch = this.updateSearch.bind(this);
	}

	async componentDidMount() {
		await this.fetchData();
	}

	async fetchData() {
		try {
			let { dogs, count } = await this.getDogs();
			dogs = await this.getDogFavs(dogs);
			if (this.context.loggedIn) dogs = await this.getUserFavs(dogs);
			this.setState({ dogs, count });
		} catch (error) {
			console.error(error);
		}
	}

	async getDogs() {
		const url = new URL('http://localhost:3000/api/v1/dogs');
		const params = [
			['select', 'name'],
			['select', 'description'],
			['select', 'imageUrl'],
			['page', this.state.currentPage],
			['limit', this.state.pageSize],
			['query', this.state.query]
		];
		// Getting list of dogs
		url.search = new URLSearchParams(params);
		// Getting the dogs
		const res = await fetch(url);
		const data = await status(res);
		const dogs = await json(data);
		return dogs;
	}

	async getUserFavs(dogs) {
		const { user, jwt } = this.context;
		const res = await fetch(user.links.favourites, {
			headers: { Authorization: 'Bearer ' + jwt }
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
					const res = await fetch(dog.links.favourites);
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

	updateFavs(id) {
		const { user, jwt } = this.context;
		const idx = this.state.dogs.findIndex(dog => dog.id === id);
		if (idx !== -1) {
			const { dogs } = this.state;
			// if favourited, find favourite ID and delete.
			if (dogs[idx].favourited)
				// Get favourites
				fetch(user.links.favourites, {
					headers: { Authorization: 'Bearer ' + jwt }
				})
					.then(status)
					.then(json)
					// Find favourite with the same dog ID
					.then(favs => {
						const {
							links: { self }
						} = favs.find(fav => fav.dogId === id);
						// Delete dog
						fetch(self, {
							method: 'DELETE',
							headers: { Authorization: 'Bearer ' + jwt }
						})
							// Decrement number
							.then(status)
							.then(() => {
								dogs[idx].favourites--;
								dogs[idx].favourited = !dogs[idx].favourited;
								this.setState({ dogs });
								console.log('Favourite removed');
							})
							.catch(error => console.error(error));
					})
					.catch(error => console.error(error));
			// Add a new favourite
			else
				fetch(user.links.favourites, {
					method: 'POST',
					headers: { Authorization: 'Bearer ' + jwt, 'Content-Type': 'application/json' },
					body: JSON.stringify({ dogId: id })
				})
					// Update number
					.then(status)
					.then(() => {
						dogs[idx].favourites++;
						dogs[idx].favourited = !dogs[idx].favourited;
						this.setState({ dogs });
						console.log('Favourite added');
					})
					.catch(error => console.error(error));
		}
	}

	async componentDidUpdate(prevProps, prevState) {
		const { pageSize, currentPage, query } = prevState;
		const { state } = this;
		if (
			pageSize !== state.pageSize ||
			currentPage !== state.currentPage ||
			query !== state.query
		)
			await this.fetchData();
	}

	changePageSize(page, pageSize) {
		this.setState({ currentPage: page, pageSize });
	}

	updateSearch(value) {
		this.setState({ query: value });
	}

	render() {
		const { dogs, count, currentPage } = this.state;
		let list = dogs.map(dog => (
			<Col key={dog.id} span={6}>
				<DogCard dog={dog} onClick={this.updateFavs} />
			</Col>
		));
		if (!list.length) list = <Empty style={{ margin: 'auto' }} />;
		return (
			<>
				<section style={{ maxWidth: '600px', margin: 'auto' }}>
					<Search allowClear placeholder="Search" onSearch={this.updateSearch} />
				</section>
				<Row style={{ minHeight: '70vh' }}>{list}</Row>
				<span style={{ textAlign: 'center' }}>
					<Pagination
						defaultCurrent={currentPage}
						total={count}
						showSizeChanger
						onChange={this.changePageSize}
						pageSizeOptions={[4, 8, 16]}
						defaultPageSize={4}
					/>
				</span>
			</>
		);
	}
}

Dogs.contextType = UserContext;

export default Dogs;
