import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { json, status } from '../helpers/fetch';
import { Col, Row } from 'antd';
import DogCard from './dogCard';

class Dogs extends Component {
	constructor(props) {
		super(props);
		this.state = {
			dogs: []
		};
	}

	componentDidMount() {
		fetch('http://localhost:3000/api/v1/dogs?select=name&select=description&select=imageUrl')
			.then(status)
			.then(json)
			.then(data => {
				console.log(data);
				this.setState({ dogs: data });
			})
			.catch(err => console.log('Error fetching dog list', err.message));
	}

	render() {
		if (!this.state.dogs.length) return <h2>Loading dogs...</h2>;
		const { dogs } = this.state;
		const list = dogs.map(dog => (
			<Col key={dog.id} span={6}>
				<DogCard name={dog.name} image={dog.imageUrl} id={dog.id} />
			</Col>
		));
		return <Row>{list}</Row>;
	}
}

Dogs.propTypes = {
	num: PropTypes.number,
	page: PropTypes.number
};

export default Dogs;
