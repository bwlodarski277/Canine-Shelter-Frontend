import React, { Component } from 'react';
import PropTypes from 'prop-types';
import UserContext from '../contexts/user';
import { error, json, status } from '../helpers/fetch';
import { Card, Empty } from 'antd';
import Title from 'antd/lib/typography/Title';

export class Chats extends Component {
	constructor(props) {
		super(props);
		this.state = {
			chats: []
		};
	}

	componentDidMount() {
		const { user, jwt } = this.context;
		fetch(user.links.chats, {
			headers: { Authorization: 'Bearer ' + jwt }
		})
			.then(status)
			.then(json)
			// TODO: I added HATEOAS links to the user chats route.
			// Be sure to iterate over each chat and display info in a list.
			.then(chats => this.setState({ chats }))
			.catch(error);
	}

	render() {
		const { chats } = this.state;
		const chatList = chats.length ? (
			chats.map(chat => (
				<>
					<Title level={4}>{chat.locationId}</Title>
				</>
			))
		) : (
			<Empty />
		);
		return (
			<section style={{ maxWidth: '700px', margin: 'auto' }}>
				<Card>{chatList}</Card>
			</section>
		);
	}
}

Chats.propTypes = {
	temp: PropTypes.object
};

Chats.contextType = UserContext;

export default Chats;
