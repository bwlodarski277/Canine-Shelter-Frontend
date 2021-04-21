import './App.css';
import Nav from './components/nav';

import React, { Component } from 'react';
import { Layout } from 'antd';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Home from './components/home';
import IconCredit from './components/iconCredit';
import Dogs from './components/dogs';
import DogDetails from './components/dogDetails';
const { Header, Content, Footer } = Layout;

class App extends Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	render() {
		return (
			<Layout className="layout">
				<Router>
					<Header>
						<Nav loggedIn={true} />
					</Header>
					<Content className="content">
						<Switch>
							<Route path="/dogs/:id" component={DogDetails} />
							<Route path="/dogs" component={Dogs} />
							<Route path="/beeds" />
							<Route path="/shelters" />
							<Route path="/" component={Home} />
						</Switch>
					</Content>
					<Footer>
						<IconCredit />
					</Footer>
				</Router>
			</Layout>
		);
	}
}

export default App;
