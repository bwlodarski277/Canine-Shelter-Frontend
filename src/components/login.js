import GoogleOutlined from '@ant-design/icons/GoogleOutlined';
import { Button, Card, Divider, Form, Input, message } from 'antd';
import Title from 'antd/lib/typography/Title';
import React, { Component } from 'react';
import { GoogleLogin } from 'react-google-login';
import { Redirect } from 'react-router';
import UserContext from '../contexts/user';
import { json, status } from '../helpers/fetch';
import { googleOauth } from '../config';
import { baseUrl } from '../config';

const { Item } = Form;

const usernameRules = [{ required: true, message: 'Please enter your username' }];
const passwordRules = [{ required: true, message: 'Please enter your password' }];

/**
 * Login component
 * Handles logging users in.
 */
class Login extends Component {
	constructor(props) {
		super(props);
		this.state = {};
		this.login = this.login.bind(this);
	}

	/**
	 * Handles login
	 * @param {object} values username and password
	 */
	login(values) {
		const { username, password } = values;
		fetch(`${baseUrl}/auth/login`, {
			headers: { Authorization: 'Basic ' + btoa(`${username}:${password}`) }
		})
			.then(status)
			.then(json)
			.then(user => {
				fetch(user.links.user, {
					headers: { Authorization: 'Basic ' + btoa(`${username}:${password}`) },
					cache: 'no-cache' // Still caching but asking API if data has changed
				})
					.then(status)
					.then(json)
					.then(userData => {
						userData.password = password;
						this.context.login(userData);
					});
			})
			.catch(() => message.error('Invalid username or password.'));
	}

	/**
	 * Handles Google login (not finished)
	 * @param {object} data login data
	 */
	handleLogin(data) {
		console.log(data);
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
						{/* <Divider /> */}
						<Item wrapperCol={{ offset: 4, span: 16 }}>
							<Button type="primary" htmlType="submit">
								Log in
							</Button>
						</Item>
					</Form>
					<Divider>OR</Divider>
					<GoogleLogin
						clientId={googleOauth.clientID}
						onSuccess={this.handleLogin}
						onFailure={this.handleLogin}
						render={renderProps => (
							<Button icon={<GoogleOutlined />} onClick={renderProps.onClick}>
								Log in with Google
							</Button>
						)}
					/>
				</Card>
			</section>
		);
	}
}

Login.contextType = UserContext;

export default Login;
