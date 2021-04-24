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
// eslint-disable-next-line func-style
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

export default updateFavs;
