import { Button, Card, Divider, Form, Input } from 'antd';
import Title from 'antd/lib/typography/Title';
import React, { Component } from 'react';

import { Redirect } from 'react-router';
import UserContext from '../contexts/user';
import { error, json, status } from '../helpers/fetch';

const { Item } = Form;

const usernameRules = [
	{ required: true, message: 'Please enter a username' },
	{
		min: 4,
		max: 32,
		message: 'Username must be between or 4-32 characters'
	}
];

const emailRules = [
	{ required: true, message: 'Please enter an email' },
	{
		type: 'email',
		message: 'Please enter a valid email'
	}
];

const firstRules = [
	{ required: true, message: 'Please enter your first name' },
	{
		max: 32,
		message: 'First name must be a maximum of 32 characters'
	}
];

const lastRules = [
	{ required: true, message: 'Please enter your last name' },
	{
		max: 32,
		message: 'Last name must be a maximum of 32 characters'
	}
];

const passwordRules = [
	{ required: true, message: 'Please enter a password' },
	{
		min: 8,
		max: 32,
		message: 'Password must be between or 8-72 characters.'
	}
];

const staffKeyRules = [{ len: 32, message: 'Staff key must be exactly 32 characters long.' }];

const confirmRules = [
	{ required: true, message: 'Please confirm your password' },
	({ getFieldValue }) => ({
		validator(rule, value) {
			const password = getFieldValue('password');
			if (password !== undefined && password !== value)
				return Promise.reject('Passwords do not match');

			return Promise.resolve();
		}
	})
];

/**
 * Registration component
 */
class Register extends Component {
	constructor(props) {
		super(props);
		this.state = {};
		this.register = this.register.bind(this);
	}

	register(values) {
		const { confirm, ...registerData } = values;
		const { username, password } = registerData;
		fetch('http://localhost:3000/api/v1/users', {
			headers: { 'Content-Type': 'application/json' },
			method: 'POST',
			body: JSON.stringify(registerData)
		})
			.then(status)
			.then(json)
			.then(user => {
				fetch(user.link, {
					headers: { Authorization: 'Basic ' + btoa(`${username}:${password}`) }
				})
					.then(status)
					.then(json)
					.then(userData => {
						userData.password = password;
						this.context.login(userData);
						console.log(user);
					})
					.catch(error);
			})
			.catch(error);
	}

	render() {
		if (this.context.loggedIn) return <Redirect exact to="/" />;
		return (
			<section style={{ maxWidth: '600px', margin: 'auto' }}>
				<Card style={{ textAlign: 'center' }}>
					<Title name="register" style={{ textAlign: 'center' }}>
						Register
					</Title>
					<Form
						ref={this.state.form}
						labelCol={{ span: 8 }}
						wrapperCol={{ span: 16 }}
						onFinish={this.register}
					>
						<Item label="Username" name="username" rules={usernameRules}>
							<Input placeholder="Username" />
						</Item>
						<Item label="Email" name="email" rules={emailRules}>
							<Input placeholder="Email" />
						</Item>
						<Item label="First name" name="firstName" rules={firstRules}>
							<Input placeholder="First name" />
						</Item>
						<Item label="Last name" name="lastName" rules={lastRules}>
							<Input placeholder="Last name" />
						</Item>
						<Item label="Password" name="password" rules={passwordRules}>
							<Input.Password placeholder="Password" />
						</Item>
						<Item label="Confirm" name="confirm" rules={confirmRules}>
							<Input.Password placeholder="Confirm password" />
						</Item>
						<Divider />
						<Item
							label="Staff key"
							name="staffKey"
							rules={staffKeyRules}
							tooltip="Key for staff to use when signing up."
						>
							<Input placeholder="Staff key" />
						</Item>
						<Divider />
						<Item wrapperCol={{ offset: 4, span: 16 }}>
							<Button type="primary" htmlType="submit">
								Register
							</Button>
						</Item>
					</Form>
				</Card>
			</section>
		);
	}
}

Register.contextType = UserContext;

export default Register;
