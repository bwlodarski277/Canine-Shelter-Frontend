import React, { Component } from 'react';
import PropTypes from 'prop-types';
import UserContext from '../contexts/user';
import { error, json, status } from '../helpers/fetch';
import { Button, Card, Divider, Empty } from 'antd';
import Title from 'antd/lib/typography/Title';
import { withRouter } from 'react-router-dom';

/**
 * Chats component
 * Gets a user's list of chats,
 * or a location's list of chats depending on state.
 */
export class Chats extends Component {
	constructor(props) {
		super(props);
		this.state = {
			chats: []
		};
	}

	/**
	 * Navigates to a chat.
	 * @param {object} chat chat to go to
	 */
	goToChat(chat) {
		const { history } = this.props;
		history.push(`/chats/${chat.locationId}/${chat.id}`);
	}

	componentDidMount() {
		const { user, jwt } = this.context;
		// If user is a standard user, get chats with location
		if (user.role === 'user')
			fetch(user.links.chats, {
				headers: { Authorization: 'Bearer ' + jwt }
			})
				.then(status)
				.then(json)
				.then(chats => {
					Promise.all(
						// Add location details to each chat
						chats.map(async chat => {
							const data = await fetch(chat.links.location, { cache: 'no-cache' });
							const res = await status(data);
							const location = await json(res);
							chat.location = location;
							return chat;
						})
					)
						.then(chats => this.setState({ chats }))
						.catch(error);
				})
				.catch(error);
		// If user is staff, get list of chats with users
		else if (user.role === 'staff')
			fetch('http://localhost:3000/api/v1/auth/staff', {
				headers: { Authorization: 'Bearer ' + jwt }
			})
				.then(status)
				.then(json)
				.then(staff => {
					fetch(`${staff.links.location}/chats`, {
						headers: { Authorization: 'Bearer ' + jwt }
					})
						.then(status)
						.then(json)
						.then(chats => {
							Promise.all(
								chats.map(async chat => {
									// Add user details to each chat
									const data = await fetch(chat.links.user, {
										cache: 'no-cache',
										headers: { Authorization: 'Bearer ' + jwt }
									});
									const res = await status(data);
									const user = await json(res);
									chat.user = user;
									return chat;
								})
							)
								.then(chats => this.setState({ chats }))
								.catch(error);
						})
						.catch(error);
				})
				.catch(error);
	}

	render() {
		const { chats } = this.state;
		const { user } = this.context;
		const chatList = chats.length ? (
			user.role === 'staff' ? (
				chats.map(chat => (
					<section key={chat.id}>
						<Title level={4}>{chat.user.username}</Title>
						<Button type="primary" onClick={() => this.goToChat(chat)}>
							Go to chat
						</Button>
						<Divider />
					</section>
				))
			) : (
				chats.map(chat => (
					<section key={chat.id}>
						<Title level={4}>{chat.location.name}</Title>
						<Button type="primary" onClick={() => this.goToChat(chat)}>
							Go to chat
						</Button>
						<Divider />
					</section>
				))
			)
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
	temp: PropTypes.object,
	history: PropTypes.object
};

Chats.contextType = UserContext;

export default withRouter(Chats);
