import './App.css';
import Nav from './components/nav';

import React, { Component } from 'react';
import { Layout, message } from 'antd';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import Cookies from 'universal-cookie';

import { error, json, status } from './helpers/fetch';
import Home from './components/home';
import IconCredit from './components/iconCredit';
import Dogs from './components/dogs';
import UserContext from './contexts/user';
import Login from './components/login';
import maxAge from './utilities/cookieAge';
import Register from './components/register';
import Account from './components/account';
import Breeds from './components/breeds';
import BreedDogs from './components/breedDogs';
import DogDetails from './components/dogDetails';
import Shelters from './components/shelters';
import ShelterDogs from './components/shelterDogs';
import StaffArea from './components/staffArea';
import Chats from './components/chats';
import Chat from './components/chat';
import { baseUrl } from './config';

const { Header, Content, Footer } = Layout;

/**
 * Root app component.
 */
class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
			redirect: false,
			user: {},
			loggedIn: false,
			cookies: new Cookies()
		};
		this.login = this.login.bind(this);
		this.logout = this.logout.bind(this);
		this.setUser = this.setUser.bind(this);
	}

	componentDidMount() {
		// Getting JWT from cookies
		const { cookies } = this.state;
		const jwt = cookies.get('jwt');
		const refresh = cookies.get('refresh');
		if (jwt) this.loginJwt(jwt);
		else if (refresh) this.refreshJwt(refresh);
	}

	/**
	 * Refreshes the JWT once it expires.
	 * @param {string} refresh JWT refresh token
	 */
	refreshJwt(refresh) {
		fetch(`${baseUrl}/auth/jwt/refresh`, {
			method: 'POST',
			body: JSON.stringify({ refresh }),
			headers: { 'Content-Type': 'application/json' }
		})
			.then(status)
			.then(json)
			.then(data => {
				const { access: jwt, refresh } = data;
				const { cookies } = this.state;
				cookies.set('jwt', jwt.token, { path: '/', maxAge: maxAge(jwt.exp), secure: true });
				cookies.set('refresh', refresh.token, {
					path: '/',
					maxAge: maxAge(refresh.exp),
					secure: true
				});
				this.loginJwt(jwt.token);
			})
			.catch(error);
	}

	/**
	 * Log into the website using JWT.
	 * @param {string} jwt JSON Web Token to use for logging in
	 */
	loginJwt(jwt) {
		fetch(`${baseUrl}/auth/login`, {
			headers: { Authorization: 'Bearer ' + jwt }
		})
			.then(status)
			.then(json)
			.then(user => {
				fetch(user.links.user, {
					headers: { Authorization: 'Bearer ' + jwt }
				})
					.then(status)
					.then(json)
					.then(userData => {
						this.setState({ user: userData, loggedIn: true });
						console.log(user);
					})
					.catch(error);
			})
			.catch(error);
	}

	/**
	 * Log in the user using basic authorization, and store JWT.
	 * @param {object} user user object returned from the DB
	 */
	login(user) {
		fetch(`${baseUrl}/auth/jwt`, {
			headers: { Authorization: 'Basic ' + btoa(`${user.username}:${user.password}`) }
		})
			.then(status)
			.then(json)
			.then(data => {
				const jwt = data.access;
				const refresh = data.refresh;
				const { cookies } = this.state;
				cookies.set('jwt', jwt.token, { path: '/', maxAge: maxAge(jwt.exp) });
				cookies.set('refresh', refresh.token, { path: '/', maxAge: maxAge(refresh.exp) });
				this.setState({ user, loggedIn: true });
				message.success('Logged in');
			})
			.catch(error);
	}

	/**
	 * Logs the user out and creates a message.
	 * @param {boolean} [deleted] indicator for if account deleted message should be shown
	 */
	logout(deleted = false) {
		const { cookies } = this.state;
		cookies.remove('jwt');
		cookies.remove('refresh');
		this.setState({ user: {}, loggedIn: false, redirect: true });
		if (deleted) message.success('Account deleted');
		else message.success('Logged out');
	}

	/**
	 * Updates the user's record and updates the data stored
	 * @param {object} data data to update in the user record
	 * @param {object} [form] form reference, for clearning the form that called this
	 */
	setUser(data, form) {
		const { confirm, ...formData } = data;
		const jwt = this.state.cookies.get('jwt');
		const { user } = this.state;
		const updateFields = {};
		Object.keys(formData).map(key => {
			if (data[key] !== undefined && data[key] !== '') {
				user[key] = formData[key]; // Update values in the user object
				updateFields[key] = formData[key]; // Filtering out fields that weren't set
			}
		});
		if (!Object.keys(updateFields).length) {
			message.info('Please enter at least one field.');
			return;
		}
		// Post new data
		fetch(user.links.self, {
			method: 'PUT',
			headers: {
				Authorization: 'Bearer ' + jwt,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(updateFields)
		})
			.then(status)
			.then(json)
			.then(() => {
				// Update user state
				this.setState({ user });
				message.success('Profile updated successfully');
				if (form) form.current.resetFields();
			})
			.catch(error);
	}

	render() {
		// Setting context
		const context = {
			user: this.state.user,
			setUser: this.setUser,
			jwt: this.state.cookies.get('jwt'),
			loggedIn: this.state.loggedIn,
			login: this.login,
			logout: this.logout
		};

		const { redirect } = this.state;
		if (this.state.redirect) this.setState({ redirect: false });

		return (
			<UserContext.Provider value={context}>
				<Router>
					{redirect && <Redirect to="/" />}
					<Layout className="layout" style={{ minHeight: '100vh' }}>
						{/* Navbar */}
						<Header>
							<Nav />
						</Header>

						{/* Body of the website */}
						<Content className="content">
							<Switch>
								<Route path="/breeds/:id" component={BreedDogs} />
								<Route path="/breeds" component={Breeds} />
								<Route path="/dogs/:id" component={DogDetails} />
								<Route path="/dogs" component={Dogs} />
								<Route path="/shelters/:id" component={ShelterDogs} />
								<Route path="/shelters" component={Shelters} />
								<Route path="/chats/:locationId/:chatId" component={Chat} />
								<Route path="/chats/:locationId" component={Chat} />
								<Route path="/chats" component={Chats} />
								<Route path="/login" component={Login} />
								<Route path="/register" component={Register} />
								<Route path="/account" component={Account} />
								<Route path="/staffArea" component={StaffArea} />
								<Route path="/" exact={true} component={Home} />
							</Switch>
						</Content>

						{/* Footer */}
						<Footer>
							<IconCredit />
						</Footer>
					</Layout>
				</Router>
			</UserContext.Provider>
		);
	}
}

export default App;
