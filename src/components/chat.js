import React, { Component } from 'react';
import PropTypes from 'prop-types';
import UserContext from '../contexts/user';
import { error, json, status } from '../helpers/fetch';
import { Button, Card, Empty, Form, Input, List } from 'antd';
import Title from 'antd/lib/typography/Title';
import { CloseCircleOutlined } from '@ant-design/icons';
const { Item } = Form;

const messageRules = [{ required: true, message: 'Please enter a message' }];

/**
 * Chat component
 * Used to allow users and locations to interact.
 */
export class Chat extends Component {
	constructor(props) {
		super(props);
		this.state = {
			chat: null,
			messages: [],
			form: React.createRef(),
			bottom: React.createRef(),
			input: React.createRef(),
			interval: null
		};
		this.sendMessage = this.sendMessage.bind(this);
		this.scrollToBottom = this.scrollToBottom.bind(this);
		this.getNewMessages = this.getNewMessages.bind(this);
	}

	componentDidMount() {
		const { user, jwt } = this.context;
		const locationId = parseInt(this.props.match.params.locationId);
		const chatId = parseInt(this.props.match.params.chatId);
		// If chatId is provided
		if (!isNaN(chatId)) {
			// Get the chat
			const url = `http://localhost:3000/api/v1/locations/${locationId}/chats/${chatId}`;
			fetch(url, { headers: { Authorization: 'Bearer ' + jwt } })
				.then(status)
				.then(json)
				.then(chat => {
					// Get messages
					console.debug('Chat exists:', chat, user);
					fetch(chat.links.messages, { headers: { Authorization: 'Bearer ' + jwt } })
						.then(status)
						.then(json)
						.then(messages => {
							// Get new messages every second and set state
							const interval = setInterval(this.getNewMessages, 1000);
							this.setState({ chat, messages, interval });
						})
						.catch(error);
				})
				.catch(error);
			// If chatId is not provided
		} else {
			// Get user's chats
			const url = user.links.chats;
			fetch(url, { headers: { Authorization: 'Bearer ' + jwt } })
				.then(status)
				.then(json)
				.then(chats => {
					// Find chat with the same locationId
					const chat = chats.find(chat => chat.locationId === locationId);
					if (chat) {
						// If found, get messages
						console.log('Found chat');
						console.log('Getting chat messages');
						fetch(chat.links.messages, {
							headers: { Authorization: 'Bearer ' + jwt }
						})
							.then(status)
							.then(json)
							.then(messages => {
								console.log('Fetched chat messages');
								const interval = setInterval(this.getNewMessages, 1000);
								this.setState({ chat, messages, interval });
							})
							.catch(error);
					} else {
						// If not found, create the chat
						console.log('Not found chat, creating');
						fetch(`http://localhost:3000/api/v1/locations/${locationId}/chats`, {
							method: 'POST',
							headers: {
								Authorization: 'Bearer ' + jwt,
								'Content-Type': 'application/json'
							}
						})
							.then(status)
							.then(json)
							.then(chat =>
								fetch(chat.link, { headers: { Authorization: 'Bearer ' + jwt } })
									.then(status)
									.then(json)
									.then(chat => {
										console.log('Created chat', chat);
										const interval = setInterval(this.getNewMessages, 1000);
										this.setState({ chat, messages: [], interval });
									})
									.catch(error)
							)
							.catch(error);
					}
				});
		}

		this.scrollToBottom();
	}

	componentWillUnmount() {
		// Making sure the setInterval above gets stopped
		clearInterval(this.state.interval);
	}

	/**
	 * Gets new messages for the current chat
	 */
	getNewMessages() {
		const { jwt } = this.context;
		const { chat } = this.state;
		fetch(chat.links.messages, {
			headers: { Authorization: 'Bearer ' + jwt },
			cache: 'no-cache'
		})
			.then(status)
			.then(json)
			.then(messages => {
				this.setState({ messages });
			})
			.catch(error);
	}

	/**
	 * Sends a new message to the chat.
	 * @param {object} data data (message) to send
	 * @param {object} form form that called this function
	 */
	sendMessage(data, form) {
		const { chat } = this.state;
		const { jwt } = this.context;
		fetch(chat.links.messages, {
			method: 'POST',
			headers: { Authorization: 'Bearer ' + jwt, 'Content-Type': 'application/json' },
			body: JSON.stringify(data)
		})
			.then(status)
			.then(json)
			.then(res => {
				fetch(res.link, { headers: { Authorization: 'Bearer ' + jwt } })
					.then(status)
					.then(json)
					.then(message => {
						const { messages } = this.state;
						messages.push(message);
						this.setState({ messages });
						form.current.resetFields();
						this.scrollToBottom();
					})
					.catch(error);
			})
			.catch(error);
	}

	/**
	 * Deletes a chat message.
	 * @param {number} id message ID
	 */
	deleteMessage(id) {
		console.log(id);
		const { messages } = this.state;
		const { jwt } = this.context;
		const idx = messages.findIndex(msg => msg.id === id);
		if (idx !== -1)
			fetch(messages[idx].links.self, {
				method: 'DELETE',
				headers: { Authorization: 'Bearer ' + jwt }
			})
				.then(status)
				.then(json)
				.then(() => {
					messages.splice(idx, 1);
					this.setState({ messages });
				})
				.catch(error);
	}

	/**
	 * Scrolls to the bottom of the chat message list.
	 */
	scrollToBottom() {
		const { input, bottom } = this.state;
		bottom.current.scrollIntoView();
		input.current.focus();
	}

	render() {
		const { messages } = this.state;
		const { user } = this.context;
		const chatMessages = messages.length ? (
			<List
				dataSource={messages}
				renderItem={message => (
					<List.Item>
						<List.Item.Meta
							title={message.sender ? 'User' : 'Shelter'}
							description={message.message}
						/>
						{user.role === 'staff' || message.sender ? (
							<CloseCircleOutlined onClick={() => this.deleteMessage(message.id)} />
						) : (
							<></>
						)}
					</List.Item>
				)}
			/>
		) : (
			// messages.map(message => <Text key={message.id}>{message.message}</Text>)
			<Empty description="No messages" />
		);

		return (
			<section style={{ maxWidth: '800px', margin: 'auto' }}>
				<Card>
					<Title level={3} style={{ textAlign: 'center' }}>
						Messages
					</Title>
					<Card style={{ maxHeight: '60vh', overflow: 'auto', marginBottom: '1em' }}>
						{chatMessages}
						{/* Element used to scroll down to bottom of chat */}
						<section ref={this.state.bottom} onLoad={this.scrollToBottom} />
					</Card>
					<Form
						ref={this.state.form}
						layout="inline"
						onFinish={data => this.sendMessage(data, this.state.form)}
					>
						<Item
							name="message"
							rules={messageRules}
							style={{ width: '85%', marginRight: 0 }}
						>
							<Input
								ref={this.state.input}
								placeholder="New message"
								autoComplete="off"
							/>
						</Item>
						<Item style={{ width: '15%', marginRight: 0 }}>
							<Button
								type="primary"
								htmlType="submit"
								style={{ width: '100%', marginRight: 0 }}
							>
								Send
							</Button>
						</Item>
					</Form>
				</Card>
			</section>
		);
	}
}

Chat.contextType = UserContext;

Chat.propTypes = {
	match: PropTypes.object
};

export default Chat;
