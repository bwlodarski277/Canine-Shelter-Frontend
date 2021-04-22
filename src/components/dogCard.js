import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Card } from 'antd';

import noImage from '../images/noImage.jpg';
import NavImage from './navImage';
import UserContext from '../contexts/user';
// import { json, status } from '../helpers/fetch';
import Favourite from './favourite';
// import { json, status } from '../helpers/fetch';

const { Meta } = Card;

/**
 * Component for displaying details about a dog.
 * @param {object} props props passed from dogs list
 * @returns
 */
class DogCard extends Component {
	constructor(props) {
		super(props);
		this.onClick = this.onClick.bind(this);
	}

	onClick() {
		this.props.onClick(this.props.dog.id);
	}

	render() {
		const { dog } = this.props;
		const image = dog.imageUrl ? dog.imageUrl : noImage;
		const onClick = this.context.loggedIn ? this.onClick : null;
		return (
			<>
				<Card
					hoverable
					style={{ margin: '1em' }}
					cover={<NavImage alt={dog.name} src={image} to={`/dogs/${dog.id}`} />}
					actions={[
						<Favourite
							key={dog.id}
							id={dog.id}
							selected={dog.favourited}
							count={dog.favourites}
							onClick={onClick}
						/>
					]}
				>
					<Meta title={dog.name} />
				</Card>
			</>
		);
	}
}

DogCard.propTypes = {
	dog: PropTypes.object,
	onClick: PropTypes.func
};

DogCard.contextType = UserContext;

export default DogCard;
