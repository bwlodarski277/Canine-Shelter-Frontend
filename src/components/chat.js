import React, { Component } from 'react';
import PropTypes from 'prop-types';
import UserContext from '../contexts/user';
import { error, json, status } from '../helpers/fetch';

export class Chat extends Component {
	componentDidMount() {
		const { user, jwt } = this.context;
		const locationId = parseInt(this.props.match.params.id);
		fetch(user.links.chats, { headers: { Authorization: 'Bearer ' + jwt } })
			.then(status)
			.then(json)
			.then(userChats => {
				const chat = userChats.find(chat => chat.locationId === locationId);
				const base = 'http://localhost:3000/api/v1/locations';
				if (chat)
					fetch(`${base}/${locationId}/chats/${chat.id}/messages`, {
						headers: { Authorization: 'Bearer ' + jwt }
					})
						.then(status)
						.then(json)
						.then(messages => {
							console.log('Chat exists', chat, messages);
							this.setState({ chat, messages });
						})
						.catch(error);
				else
					fetch(`${base}/${locationId}/chats`, {
						method: 'POST',
						headers: { Authorization: 'Bearer ' + jwt }
					})
						.then(status)
						.then(json)
						.then(({ link }) =>
							fetch(link, {
								headers: { Authorization: 'Bearer ' + jwt }
							})
								.then(status)
								.then(json)
								.then(chat => {
									fetch(chat.links.messages, {
										headers: { Authorization: 'Bearer ' + jwt }
									})
										.then(status)
										.then(json)
										.then(messages => {
											console.log('Chat created', chat);
											this.setState({ chat, messages });
										});
								})
								.catch(error)
						)
						.catch(error);
			})
			.catch(error);
	}

	render() {
		return <div></div>;
	}
}

Chat.contextType = UserContext;

Chat.propTypes = {
	match: PropTypes.object
};

export default Chat;
