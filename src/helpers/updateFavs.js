/* eslint-disable func-style */
import { error, json, status } from './fetch';

/**
 * Updates the favourite of a user when the user clicks a heart.
 * This function is passed down to the SearchList component, where
 * its `this` is bound to that of the SearchList component.
 * This function (along with any other extra functions) is then
 * passed to the ListMapping function that is also passed to the
 * SearchList component.
 * @param {number} id ID of dog to toggle favourite for
 */
function updateFavs(id) {
	const { user, jwt } = this.props.context;
	const idx = this.state.list.findIndex(dog => dog.id === id);
	if (idx !== -1) {
		const { list } = this.state;
		// if favourited, find favourite ID and delete.
		if (list[idx].favourited)
			// Get favourites
			fetch(user.links.favourites, {
				headers: { Authorization: 'Bearer ' + jwt },
				cache: 'no-cache' // Still caching but asking API if data has changed
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
							list[idx].favourites--;
							list[idx].favourited = !list[idx].favourited;
							this.setState({ list });
							console.log('Favourite removed');
						})
						.catch(error);
				})
				.catch(error);
		// Add a new favourite
		else
			fetch(user.links.favourites, {
				method: 'POST',
				headers: { Authorization: 'Bearer ' + jwt, 'Content-Type': 'application/json' },
				body: JSON.stringify({ dogId: id })
			})
				// Update number
				.then(status)
				.then(json)
				.then(() => {
					list[idx].favourites++;
					list[idx].favourited = !list[idx].favourited;
					this.setState({ list });
					console.log('Favourite added');
				})
				.catch(error);
	}
}

/**
 * Inserts the current user's favourites and inserts whether the dog is a fav or not.
 * @param {object} dogs dogs list to iterate
 * @param {object} user user object
 * @param {string} jwt user's JWT key
 * @returns {Promise<Array<object>>} list of updated dogs
 */
async function getUserFavs(dogs, user, jwt) {
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
 * @param {object} dogs dogs list to iterate
 * @returns {object} list of dogs with favourite data
 */
async function getDogFavs(dogs) {
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
			} catch (err) {
				error(err);
			}
		})
	);
	return dogFavs;
}

export { updateFavs, getDogFavs, getUserFavs };
