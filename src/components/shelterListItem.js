import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Divider, Space } from 'antd';
import Title from 'antd/lib/typography/Title';
import UserContext from '../contexts/user';

/**
 * Shelter list item
 * A single list element in a list of shelters.
 */
class ShelterListItemInner extends Component {
	render() {
		const {
			shelter,
			onClick,
			goToChat,
			context: { user }
		} = this.props;
		return (
			<section key={shelter.id} id={shelter.id}>
				<Title level={3}>{shelter.name}</Title>
				<p>{shelter.address}</p>
				<Space>
					<Button type="primary" onClick={onClick}>
						View dogs
					</Button>
					{user.role === 'user' && <Button onClick={goToChat}>Contact shelter</Button>}
				</Space>
				<Divider />
			</section>
		);
	}
}

ShelterListItemInner.propTypes = {
	shelter: PropTypes.object,
	onClick: PropTypes.func,
	goToChat: PropTypes.func,
	user: PropTypes.object
};

const ShelterListItem = props => {
	return (
		<UserContext.Consumer>
			{context => <ShelterListItemInner context={context} {...props} />}
		</UserContext.Consumer>
	);
};

ShelterListItem.propTypes = ShelterListItemInner.propTypes;

export default ShelterListItem;
