import './App.css';
import Nav from './components/nav';

import React, { Component } from 'react';
import { Layout } from 'antd';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Cookies from 'universal-cookie';

import Home from './components/home';
import IconCredit from './components/iconCredit';
import Dogs from './components/dogs';
import DogDetails from './components/dogDetails';
import UserContext from './contexts/user';
import Login from './components/login';
import { json, status } from './helpers/fetch';
import maxAge from './utilities/cookieAge';

const { Header, Content, Footer } = Layout;

/**
 * Root app component.
 */
class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
			user: {},
			loggedIn: false,
			cookies: new Cookies()
		};
		this.login = this.login.bind(this);
	}

	componentDidMount() {
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
		fetch('http://localhost:3000/api/v1/auth/jwt/refresh', {
			method: 'POST',
			body: JSON.stringify({ refresh }),
			headers: { 'Content-Type': 'application/json' }
		})
			.then(status)
			.then(json)
			.then(data => {
				const { access: jwt, refresh } = data;
				const { cookies } = this.state;
				cookies.set('jwt', jwt.token, { path: '/', maxAge: maxAge(jwt.exp) });
				cookies.set('refresh', refresh.token, { path: '/', maxAge: maxAge(refresh.exp) });
			})
			.catch(error => console.error(error));
	}

	/**
	 * Log into the website using JWT.
	 * @param {string} jwt JSON Web Token to use for logging in
	 */
	loginJwt(jwt) {
		fetch('http://localhost:3000/api/v1/auth/login', {
			headers: { Authorization: 'Bearer ' + jwt }
		})
			.then(status)
			.then(json)
			.then(user => {
				fetch(user.links.user, { headers: { Authorization: 'Bearer ' + jwt } })
					.then(status)
					.then(json)
					.then(userData => {
						this.setState({ user: userData, loggedIn: true });
						console.log(user);
					})
					.catch(error => console.error(error));
			})
			.catch(error => {
				console.error(error);
				this.setState({ error });
			});
	}

	/**
	 * Log in the user using basic authorization.
	 * @param {object} user user object returned from the DB
	 */
	login(user) {
		fetch('http://localhost:3000/api/v1/auth/jwt', {
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
			});
	}

	render() {
		const context = {
			user: this.state.user,
			jwt: this.state.cookies.get('jwt'),
			loggedIn: this.state.loggedIn,
			login: this.login
		};

		return (
			<UserContext.Provider value={context}>
				<Router>
					<Layout className="layout" style={{ minHeight: '100vh' }}>
						{/* Navbar */}
						<Header>
							<Nav />
						</Header>

						{/* Body of the website */}
						<Content className="content">
							<Switch>
								<Route path="/dogs/:id" component={DogDetails} />
								<Route path="/dogs" component={Dogs} />
								<Route path="/beeds" />
								<Route path="/shelters" />
								<Route path="/login" component={Login} />
								<Route path="/register" />
								<Route path="/account" />
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
