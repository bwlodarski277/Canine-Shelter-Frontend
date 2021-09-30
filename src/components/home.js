import { Card, Carousel, Divider } from 'antd';
import React, { Component } from 'react';
import Title from 'antd/lib/typography/Title';
import { json, status } from '../helpers/fetch';
import { baseUrl } from '../config';
import DogCard from './dogCard';
import { updateFavs } from '../helpers/updateFavs';

/**
 * Home component
 * Displays a welcome screen
 */
class Home extends Component {
	constructor(props) {
		super(props);
		this.props = props;
		this.state = {
			dogCards: []
		};
	}

	async componentDidMount() {
		const url = new URL(`${baseUrl}/dogs`);
		url.search = new URLSearchParams([
			['select', 'name'],
			['select', 'imageUrl'],
			['limit', 4],
			['order', 'id'],
			['direction', 'desc']
		]);
		const res = await fetch(url);
		const data = await status(res);
		const { dogs } = await json(data);
		const dogCards = dogs.map(dog => (
			<section
				key={dog.id}
				style={{
					background: '#364d79'
				}}
			>
				<DogCard dog={dog} disableFavs onClick={updateFavs} />
			</section>
		));
		this.setState({ dogCards });
	}

	render() {
		return (
			<section
				style={{
					maxWidth: '900px',
					margin: 'auto',
					marginTop: '1em'
				}}
			>
				<Title style={{ textAlign: 'center' }}>Welcome to the Canine Shelter</Title>
				<Divider />
				<Card
					title={
						<Title style={{ textAlign: 'center' }} level={2}>
							Latest dogs
						</Title>
					}
				>
					<Carousel autoplay dotPosition={'top'} style={{ padding: '1em' }}>
						{this.state.dogCards}
					</Carousel>
				</Card>
			</section>
		);
	}
}

export default Home;
