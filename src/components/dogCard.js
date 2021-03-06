import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Card, notification } from 'antd';

import noImage from '../images/noImage.jpg';
import NavImage from './navImage';
import UserContext from '../contexts/user';
// import { json, status } from '../helpers/fetch';
import Favourite from './favourite';
// import { json, status } from '../helpers/fetch';

const { Meta } = Card;

/**
 * DogCard
 * Component for displaying details about a dog.
 * Used in the Dogs list.
 */
class DogCard extends Component {
	constructor(props) {
		super(props);
		this.onClick = this.onClick.bind(this);
	}

	/**
	 * Calls the passed in onClick function
	 */
	onClick() {
		this.props.onClick(this.props.dog.id);
	}

	render() {
		const { dog, disableFavs } = this.props;
		const image = dog.imageUrl ? dog.imageUrl : noImage;
		const onClick = this.context.loggedIn
			? this.onClick
			: () =>
					notification.open({
						message: 'Log in',
						description: 'Please log in to perform this action.'
					});
		return (
			<>
				<Card
					hoverable
					style={{ margin: '1em' }}
					cover={<NavImage alt={dog.name} src={image} to={`/dogs/${dog.id}`} />}
					actions={
						!disableFavs && [
							<Favourite
								key={dog.id}
								id={dog.id}
								selected={dog.favourited}
								count={dog.favourites}
								onClick={onClick}
							/>
						]
					}
				>
					<Meta title={dog.name} />
				</Card>
			</>
		);
	}
}

DogCard.propTypes = {
	dog: PropTypes.object,
	onClick: PropTypes.func,
	disableFavs: PropTypes.bool
};

DogCard.contextType = UserContext;

export default DogCard;
