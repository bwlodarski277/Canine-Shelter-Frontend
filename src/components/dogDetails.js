import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Card, Divider, Empty, Image, PageHeader } from 'antd';
import noImage from '../images/noImage.jpg';
import { json, status } from '../helpers/fetch';
import { withRouter } from 'react-router-dom';
import Title from 'antd/lib/typography/Title';
import Sider from 'antd/lib/layout/Sider';
import Layout, { Content } from 'antd/lib/layout/layout';

export class DogDetails extends Component {
	constructor(props) {
		super(props);
		this.state = {
			id: props.id,
			dog: null,
			history: props.history
		};
	}

	componentDidMount() {
		const { id } = this.props.match.params;
		fetch(`http://localhost:3000/api/v1/dogs/${id}`)
			.then(status)
			.then(json)
			.then(data => this.setState({ dog: data }))
			.catch(err => console.error(err));
	}

	render() {
		if (!this.state.dog) return <Empty />;
		const dog = this.state.dog;
		return (
			<section style={{ maxWidth: '900px', margin: 'auto' }}>
				<PageHeader title="Dog" onBack={() => this.props.history.goBack()} />
				<Card>
					<Layout>
						<Content style={{ textAlign: 'center', backgroundColor: 'white' }}>
							<Title>{dog.name}</Title>
							<Image src={dog.imageUrl} fallback={noImage} width={400} />
						</Content>
						<Sider theme="light">
							<Title level={3}>About the dog</Title>
							<Divider />
							{dog.description && (
								<>
									<Title level={4}>Description</Title>
									<p>{dog.description}</p>
								</>
							)}
							{dog.age && (
								<>
									<Title level={4}>Age</Title>
									<p>{dog.age}</p>
								</>
							)}
							{dog.gender !== null && (
								<>
									<Title level={4}>Gender</Title>
									<p>{dog.gender === 0 ? 'Female' : 'Male'}</p>
								</>
							)}
						</Sider>
					</Layout>
				</Card>
				{/* TODO: Add the favourite button here */}
			</section>
		);
	}
}

DogDetails.propTypes = {
	id: PropTypes.number,
	history: PropTypes.object,
	match: PropTypes.object
};

export default withRouter(DogDetails);
