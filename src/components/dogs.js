import React, { Component } from 'react';
import { json, status } from '../helpers/fetch';
import { Col, Row } from 'antd';
import DogCard from './dogCard';
import UserContext from '../contexts/user';

/**
 * Dog grid component.
 */
class Dogs extends Component {
	constructor(props) {
		super(props);
		this.state = {
			dogs: []
		};
		this.updateFavs = this.updateFavs.bind(this);
		this.getDogFavs = this.getDogFavs.bind(this);
		this.getUserFavs = this.getUserFavs.bind(this);
	}

	async componentDidMount() {
		try {
			let dogs = await this.getDogs();
			dogs = await this.getDogFavs(dogs);
			if (this.context.loggedIn) dogs = await this.getUserFavs(dogs);
			this.setState({ dogs });
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
			['limit', '1']
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

	render() {
		if (!this.state.dogs.length) return <h2>Loading dogs...</h2>;
		const { dogs } = this.state;
		const list = dogs.map(dog => (
			<Col key={dog.id} span={6}>
				<DogCard dog={dog} onClick={this.updateFavs} />
			</Col>
		));
		return <Row>{list}</Row>;
	}
}

Dogs.contextType = UserContext;

export default Dogs;
