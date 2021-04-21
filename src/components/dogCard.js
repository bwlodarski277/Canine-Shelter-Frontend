import React from 'react';
import PropTypes from 'prop-types';
import { Card } from 'antd';
import noImage from '../images/noImage.jpg';
import NavImage from './navImage';

const { Meta } = Card;

const DogCard = props => {
	const image = props.image ? props.image : noImage;
	return (
		<div>
			<Card
				hoverable
				style={{ margin: '1em' }}
				cover={<NavImage alt={props.name} src={image} to={`/dogs/${props.id}`} />}
				actions={[]}
			>
				<Meta title={props.name} />
			</Card>
		</div>
	);
};

DogCard.propTypes = {
	id: PropTypes.number,
	name: PropTypes.string,
	image: PropTypes.string
};

export default DogCard;
