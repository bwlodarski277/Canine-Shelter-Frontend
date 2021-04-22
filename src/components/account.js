import { Avatar, Button, Card, Divider, Form, Input, message, Upload } from 'antd';
import Title from 'antd/lib/typography/Title';
import React, { Component } from 'react';
import { UploadOutlined } from '@ant-design/icons';
import UserContext from '../contexts/user';
import { status } from '../helpers/fetch';
const { Item } = Form;

const usernameRules = [
	{
		min: 4,
		max: 32,
		message: 'Username must be between or 4-32 characters'
	}
];

const emailRules = [
	{
		type: 'email',
		message: 'Please enter a valid email'
	}
];

const firstRules = [
	{
		max: 32,
		message: 'First name must be a maximum of 32 characters'
	}
];

const lastRules = [
	{
		max: 32,
		message: 'Last name must be a maximum of 32 characters'
	}
];

const passwordRules = [
	{
		min: 8,
		max: 32,
		message: 'Password must be between or 8-72 characters.'
	}
];

const confirmRules = [
	({ getFieldValue }) => ({
		validator(rule, value) {
			const password = getFieldValue('password');
			if (password !== undefined && password !== value)
				return Promise.reject('Passwords do not match');

			return Promise.resolve();
		}
	})
];

export class Account extends Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	componentDidMount() {
		const { user, jwt } = this.context;
		this.setState({
			user,
			jwt,
			upload: {
				accept: 'image/jpeg, image/png',
				maxCount: 1,
				showUploadList: false,
				name: 'upload',
				action: 'http://localhost:3000/api/v1/uploads',
				headers: { Authorization: 'Bearer ' + jwt },
				onChange: this.onPictureChanged
			}
		});
	}

	onPictureChanged(info) {
		if (info.file.status === 'done') {
			const { user, jwt } = this.state;
			console.log(info);
			const res = info.file.response;
			fetch(user.links.self, {
				method: 'PUT',
				headers: {
					Authorization: 'Bearer ' + jwt,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ imageUrl: res.link })
			})
				.then(status)
				.then(() => this.context.setUser({ imageUrl: res.link }))
				.catch(error => {
					message.error(`${info.file.name} file upload failed.`);
					console.error(error);
				});
		} else if (info.file.status === 'error') {
			console.error(info);
			message.error(`${info.file.name} file upload failed.`);
		}
	}

	onInfoChanged(data) {
		this.context.setUser(data);
	}

	render() {
		const { user } = this.context;
		return (
			<section style={{ maxWidth: '700px', margin: 'auto' }}>
				{this.context.loggedIn && (
					<Card style={{ textAlign: 'center' }}>
						<Title>Your Account</Title>
						<Avatar size={128} src={user.imageUrl} />
						<Divider />
						<Upload {...this.state.upload} onChange={this.onPictureChanged.bind(this)}>
							<Title level={3}>Avatar</Title>
							<Button icon={<UploadOutlined />}>Upload avatar</Button>
						</Upload>
						<Divider />
						<Title level={3}>Update Profile</Title>
						<Form
							labelCol={{ span: 8 }}
							wrapperCol={{ span: 16 }}
							onFinish={this.onInfoChanged.bind(this)}
						>
							<Item label="Username" name="username" rules={usernameRules}>
								<Input placeholder={user.username} />
							</Item>
							<Item label="Email" name="email" rules={emailRules}>
								<Input placeholder={user.email} />
							</Item>
							<Item label="First name" name="firstName" rules={firstRules}>
								<Input placeholder={user.firstName} />
							</Item>
							<Item label="Last name" name="lastName" rules={lastRules}>
								<Input placeholder={user.lastName} />
							</Item>
							<Item label="Password" name="password" rules={passwordRules}>
								<Input.Password placeholder="Password" />
							</Item>
							<Item label="Confirm" name="confirm" rules={confirmRules}>
								<Input.Password placeholder="Confirm password" />
							</Item>
							<Item wrapperCol={{ offset: 4, span: 16 }}>
								<Button type="primary" htmlType="submit">
									Update profile
								</Button>
							</Item>
						</Form>
						<Divider />
						<Button onClick={this.context.logout}>Log out</Button>
					</Card>
				)}
			</section>
		);
	}
}

Account.contextType = UserContext;

export default Account;
