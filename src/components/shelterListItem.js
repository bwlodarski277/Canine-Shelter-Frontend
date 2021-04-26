import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Divider, Space } from 'antd';
import Title from 'antd/lib/typography/Title';

class ShelterListItem extends Component {
	render() {
		const { shelter, onClick } = this.props;
		return (
			<section key={shelter.id} id={shelter.id}>
				<Title level={3}>{shelter.name}</Title>
				<p>{shelter.address}</p>
				<Space>
					<Button type="primary" onClick={onClick}>
						View dogs
					</Button>
					<Button>Contact shelter</Button>
				</Space>
				<Divider />
			</section>
		);
	}
}

ShelterListItem.propTypes = {
	shelter: PropTypes.object,
	onClick: PropTypes.func
};

export default ShelterListItem;
