import { Avatar, Button, Card, Divider, Form, Input, message, Modal, Space, Upload } from 'antd';
import Title from 'antd/lib/typography/Title';
import React, { Component } from 'react';
import { ExclamationCircleFilled, UploadOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';
import UserContext from '../contexts/user';
import { status } from '../helpers/fetch';
const { Item } = Form;
const { confirm } = Modal;

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
		const { jwt } = this.props.context;
		this.state = {
			popupVisible: false,
			form: React.createRef(),
			upload: {
				accept: 'image/jpeg, image/png',
				maxCount: 1,
				showUploadList: false,
				name: 'upload',
				action: 'http://localhost:3000/api/v1/uploads',
				headers: { Authorization: 'Bearer ' + jwt },
				onChange: this.onPictureChanged
			}
		};
		this.confirmDelete = this.confirmDelete.bind(this);
		this.onPictureChanged = this.onPictureChanged.bind(this);
		this.onPictureRemoved = this.onPictureRemoved.bind(this);
		this.onInfoChanged = this.onInfoChanged.bind(this);
	}

	onPictureRemoved() {
		const { setUser } = this.props.context;
		setUser({ imageUrl: null });
	}

	onPictureChanged(info) {
		if (info.file.status === 'done') {
			const { user, jwt, setUser } = this.props.context;
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
				.then(() => setUser({ imageUrl: res.link }))
				.catch(error => {
					message.error(`${info.file.name} file upload failed.`);
					console.error(error);
				});
		} else if (info.file.status === 'error') {
			console.error(info);
			message.error(`${info.file.name} file upload failed.`);
		}
	}

	/**
	 * Calls the user update function in the root component
	 * @param {object} data values passed by the form that called this
	 */
	onInfoChanged(data) {
		const { form } = this.state;
		this.props.context.setUser(data, form);
	}

	/**
	 * Spawns a confirmation dialog when user wants to delete account
	 */
	confirmDelete() {
		const { user, jwt, logout } = this.props.context;
		confirm({
			title: 'Are you sure?',
			icon: <ExclamationCircleFilled />,
			content: 'This will delete your account forever!',
			okType: 'danger',
			okText: 'Yes',
			cancelText: 'No',
			onOk() {
				fetch(user.links.self, {
					method: 'DELETE',
					headers: { Authorization: 'Bearer ' + jwt }
				})
					.then(status)
					.then(() => logout(true)) // Indicating account is deleted
					.catch(error => {
						console.error(error);
						message.error('Could not delete account');
					});
			}
		});
	}

	render() {
		const { user, loggedIn } = this.props.context;
		if (!loggedIn) return <Title style={{ textAlign: 'center' }}>Loading...</Title>;
		return (
			<section style={{ maxWidth: '700px', margin: 'auto' }}>
				<Card style={{ textAlign: 'center' }}>
					<Title>Your Account</Title>
					<Avatar size={128} src={user.imageUrl} />
					<Divider />
					<Title level={3}>Avatar</Title>
					<Space>
						<Upload {...this.state.upload} onChange={this.onPictureChanged}>
							<Button type="primary" icon={<UploadOutlined />}>
								Upload avatar
							</Button>
						</Upload>
						<Button type="text" onClick={this.onPictureRemoved}>
							Delete avatar
						</Button>
					</Space>
					<Divider />
					<Title level={3}>Update Profile</Title>
					<Form
						ref={this.state.form}
						labelCol={{ span: 8 }}
						wrapperCol={{ span: 16 }}
						onFinish={this.onInfoChanged}
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
					<Space>
						<Button onClick={this.props.context.logout}>Log out</Button>
						<Button danger onClick={this.confirmDelete}>
							Delete account
						</Button>
					</Space>
				</Card>
			</section>
		);
	}
}

Account.propTypes = {
	context: PropTypes.object
};

Account.contextType = UserContext;

/**
 * Wrapper for the Account element, passes context to the item.
 */
const AccountWrapper = () => {
	return <UserContext.Consumer>{context => <Account context={context} />}</UserContext.Consumer>;
};

export default AccountWrapper;
