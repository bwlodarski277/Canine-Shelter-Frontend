import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Divider } from 'antd';
import Title from 'antd/lib/typography/Title';

class BreedListItem extends Component {
	render() {
		const { breed, onClick } = this.props;
		return (
			<section key={breed.id} id={breed.id}>
				<Title level={3}>{breed.name}</Title>
				<p>{breed.description}</p>
				<Button type="primary" onClick={onClick}>
					View dogs
				</Button>
				<Divider />
			</section>
		);
	}
}

BreedListItem.propTypes = {
	breed: PropTypes.object,
	onClick: PropTypes.func
};

export default BreedListItem;
