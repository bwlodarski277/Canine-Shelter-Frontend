import Title from 'antd/lib/typography/Title';
import React, { Component } from 'react';

/**
 * Home component
 * Displays a welcome screen
 */
class Home extends Component {
	constructor(props) {
		super(props);
	}

	render() {
		return <Title style={{ textAlign: 'center' }}>Welcome to the Canine Shelter</Title>;
	}
}

export default Home;
