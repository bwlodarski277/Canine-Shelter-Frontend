import { Button, Card, Divider, Form, Input } from 'antd';
import Title from 'antd/lib/typography/Title';
import React, { Component } from 'react';

import { Redirect } from 'react-router';
import UserContext from '../contexts/user';
import { json, status } from '../helpers/fetch';

const { Item } = Form;

const usernameRules = [{ required: true, message: 'Please enter your username' }];
const passwordRules = [{ required: true, message: 'Please enter your password' }];

/**
 * Login component
 */
class Login extends Component {
	constructor(props) {
		super(props);
		this.state = {};
		this.login = this.login.bind(this);
	}

	login(values) {
		const { username, password } = values;
		fetch('http://localhost:3000/api/v1/auth/login', {
			headers: { Authorization: 'Basic ' + btoa(`${username}:${password}`) }
		})
			.then(status)
			.then(json)
			.then(user => {
				fetch(user.links.user, {
					headers: { Authorization: 'Basic ' + btoa(`${username}:${password}`) }
				})
					.then(status)
					.then(json)
					.then(userData => {
						userData.password = password;
						this.context.login(userData);
						console.log(user);
					})
					.catch(error => console.error(error));
			})
			.catch(error => {
				console.error(error);
				this.setState({ error });
			});
	}

	render() {
		if (this.context.loggedIn) return <Redirect exact to="/" />;
		return (
			<section style={{ maxWidth: '600px', margin: 'auto' }}>
				<Card style={{ textAlign: 'center' }}>
					<Title name="login" style={{ textAlign: 'center' }}>
						Log In
					</Title>
					<Form labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} onFinish={this.login}>
						<Item label="Username" name="username" rules={usernameRules}>
							<Input placeholder="Username" />
						</Item>
						<Item label="Password" name="password" rules={passwordRules}>
							<Input.Password placeholder="Password" />
						</Item>
						<Divider />
						<Item wrapperCol={{ offset: 4, span: 16 }}>
							<Button type="primary" htmlType="submit">
								Log In
							</Button>
						</Item>
					</Form>
				</Card>
			</section>
		);
	}
}

Login.contextType = UserContext;

export default Login;
