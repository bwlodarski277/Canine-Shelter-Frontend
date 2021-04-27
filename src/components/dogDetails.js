import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
	Button,
	Card,
	Collapse,
	Divider,
	Empty,
	Form,
	Image,
	Input,
	InputNumber,
	message,
	PageHeader,
	Select,
	Tabs
} from 'antd';
import noImage from '../images/noImage.jpg';
import { error, json, status } from '../helpers/fetch';
import { withRouter } from 'react-router-dom';
import Title from 'antd/lib/typography/Title';
import Sider from 'antd/lib/layout/Sider';
import Layout, { Content } from 'antd/lib/layout/layout';
import Favourite from './favourite';
import { getUserFavs } from '../helpers/updateFavs';
import UserContext from '../contexts/user';
import ShelterListItem from './shelterListItem';
import BreedListItem from './breedListItem';
const { Item } = Form;
const { TabPane } = Tabs;

const nameRules = [{ min: 3, max: 32, message: 'Name must be betweeen or 3-32 characters' }];

export class DogDetails extends Component {
	constructor(props) {
		super(props);
		this.state = {
			id: props.id,
			dog: null,
			history: props.history,
			location: null,
			breed: null,
			breeds: [],
			form: React.createRef()
		};
		this.toggleFavourite = this.toggleFavourite.bind(this);
		this.goToShelter = this.goToShelter.bind(this);
		this.updateBreed = this.updateBreed.bind(this);
		this.refetchBreed = this.refetchBreed.bind(this);
		this.updateDog = this.updateDog.bind(this);
	}

	componentDidMount() {
		const { id } = this.props.match.params;
		const { user, jwt } = this.context;

		const url = 'http://localhost:3000/api/v1/dogs';

		// Getting the dog's info
		fetch(`${url}/${id}`, { cache: 'no-cache' })
			// Still caching but asking API if data has changed
			.then(status)
			.then(json)
			.then(dog => {
				// this.setState({ dog });

				// Getting favourite count for dog
				fetch(dog.links.favourites)
					.then(status)
					.then(json)
					.then(({ count }) => {
						// Checking if the user favourited the dog
						getUserFavs([dog], user, jwt)
							.then(([dog]) => {
								dog.favourites = count;
								console.log(dog);
								this.setState({ dog });
							})
							.catch(error);
					})
					.catch(error);
			})
			.catch(error);

		// Getting dog location
		fetch(`${url}/${id}/location`, { cache: 'no-cache' })
			.then(status)
			.then(json)
			.then(location =>
				fetch(location.links.location, { cache: 'no-cache' })
					.then(status)
					.then(json)
					.then(location => this.setState({ location }))
					.catch(() => console.log('Dog does not have location'))
			)
			.catch(error);

		// Getting breed
		this.getBreed(url, id);

		// Get a list of breeds
		fetch('http://localhost:3000/api/v1/breeds?select=name&limit=0')
			.then(status)
			.then(json)
			.then(data => this.setState({ breeds: data.breeds }))
			.catch(error);
	}

	getBreed(url, id) {
		fetch(`${url}/${id}/breed`, { cache: 'no-cache' })
			.then(status)
			.then(json)
			.then(breed =>
				fetch(breed.links.breed, { cache: 'no-cache' })
					.then(status)
					.then(json)
					.then(breed => this.setState({ breed }))
					.catch(() => console.log('Dog does not have breed'))
			)
			.catch(error);
	}

	refetchBreed(url) {
		fetch(url, { cache: 'no-cache' })
			.then(status)
			.then(json)
			.then(breed => this.setState({ breed }));
	}

	goToShelter(id) {
		const { history } = this.props;
		history.push(`/shelters/${id}`);
	}

	goToBreed(id) {
		const { history } = this.props;
		history.push(`/breeds/${id}`);
	}

	toggleFavourite() {
		const { user, jwt } = this.context;
		const { dog } = this.state;
		if (user.role === 'staff') {
			message.info('Staff may not favourite dogs.');
			return;
		}
		if (dog.favourited)
			// Get favourites
			fetch(user.links.favourites, {
				headers: { Authorization: 'Bearer ' + jwt },
				cache: 'no-cache' // Still caching but asking API if data has changed
			})
				.then(status)
				.then(json)
				// Find favourite with the same dog ID
				.then(favs => {
					const {
						links: { self }
					} = favs.find(fav => fav.dogId === dog.id);
					// Delete dog
					fetch(self, {
						method: 'DELETE',
						headers: { Authorization: 'Bearer ' + jwt }
					})
						// Decrement number
						.then(status)
						.then(() => {
							dog.favourites--;
							dog.favourited = !dog.favourited;
							this.setState({ dog });
							console.log('Favourite removed');
						})
						.catch(error);
				})
				.catch(error);
		// Add a new favourite
		else
			fetch(user.links.favourites, {
				method: 'POST',
				headers: { Authorization: 'Bearer ' + jwt, 'Content-Type': 'application/json' },
				body: JSON.stringify({ dogId: dog.id })
			})
				// Update number
				.then(status)
				.then(json)
				.then(() => {
					dog.favourites++;
					dog.favourited = !dog.favourited;
					this.setState({ dog });
					console.log('Favourite added');
				})
				.catch(error);
	}

	updateBreed(data, url, _, form) {
		const { jwt } = this.context;
		const { breed } = this.state;
		if (data.name || data.description)
			fetch(url, {
				method: 'PUT',
				headers: {
					Authorization: 'Bearer ' + jwt,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(data)
			})
				.then(status)
				.then(json)
				.then(() => {
					message.success('Breed updated');
					form.current.resetFields();
					this.refetchBreed(breed.links.self);
				})
				.catch(console.error);
		else message.info('Please enter at least one field to update.');
	}

	updateDog(data, form) {
		const { breedId, ...formData } = data;

		const { jwt } = this.context;
		const { dog } = this.state;
		const updateFields = {};
		Object.keys(formData).map(key => {
			if (formData[key] !== undefined && formData[key] !== '') {
				// Updating dog object
				dog[key] = formData[key];
				// Filtering out fields that weren't set
				updateFields[key] = formData[key];
			}
		});
		if (Object.keys(updateFields).length)
			fetch(dog.links.self, {
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
					message.success('Dog updated');
					this.setState({ dog });
					form.current.resetFields();
				})
				.catch(error);
		else if (breedId)
			fetch(dog.links.breed, {
				method: 'PUT',
				headers: {
					Authorization: 'Bearer ' + jwt,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ breedId })
			})
				.then(status)
				.then(json)
				.then(() => {
					message.success('Dog updated');
					this.setState({ dog });
					form.current.resetFields();
				})
				.catch(error);
		else message.info('Please update at least one field');
	}

	render() {
		if (!this.state.dog) return <Empty />;
		const { dog, location, breed, breeds, form } = this.state;
		const { user } = this.context;

		const image = dog.image ? image : '';

		const actions =
			'favourited' in dog
				? [
						<Favourite
							key={dog.id}
							id={dog.id}
							selected={dog.favourited}
							count={dog.favourites}
							onClick={this.toggleFavourite}
						/>
						// eslint-disable-next-line no-mixed-spaces-and-tabs
				  ]
				: [];

		const dogInfo = (
			<Card actions={actions}>
				<Layout>
					<Content style={{ textAlign: 'center', backgroundColor: 'white' }}>
						<Title>{dog.name}</Title>
						<Image src={image} fallback={noImage} width={400} />
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
		);

		const breedList = breeds.map(breed => (
			<Select.Option key={breed.id} value={breed.id}>
				{breed.name}
			</Select.Option>
		));

		// const breedInfo = 'Test';

		return (
			<section style={{ maxWidth: '900px', margin: 'auto' }}>
				<PageHeader title="Dog" onBack={() => this.props.history.goBack()} />
				<Card>
					<Tabs defaultActiveKey="1">
						<TabPane tab="Dog" key="1">
							{dogInfo}
							{user.role === 'staff' && (
								<Collapse style={{ marginTop: '1em', marginBottom: '1em' }}>
									<Collapse.Panel header="Update dog">
										<Form
											ref={form}
											style={{ marginTop: '1em' }}
											labelCol={{ span: 8 }}
											wrapperCol={{ span: 16 }}
											onFinish={data => this.updateDog(data, form)}
										>
											<Item name="name" label="Name" rules={nameRules}>
												<Input placeholder={dog.name} />
											</Item>
											<Item name="description" label="Description">
												<Input.TextArea
													placeholder={dog.description}
													rows={5}
												/>
											</Item>
											<Item name="gender" label="Gender">
												<Select placeholder="Gender">
													<Select.Option key="g0" value={false}>
														Female
													</Select.Option>
													<Select.Option key="g1" value={true}>
														Male
													</Select.Option>
												</Select>
											</Item>
											<Item
												name="breedId"
												label="Breed"
												extra="See breed picker below for help."
											>
												<Select placeholder="Breed">{breedList}</Select>
											</Item>
											<Item name="age" label="Age">
												<InputNumber
													min={0}
													style={{ float: 'left' }}
													placeholder="Age"
												/>
											</Item>

											<Item wrapperCol={{ offset: 8, span: 16 }}>
												<Button type="primary" htmlType="submit">
													Add dog
												</Button>
											</Item>
										</Form>
									</Collapse.Panel>
								</Collapse>
							)}
						</TabPane>
						<TabPane tab="Breed" key="2">
							{/* <BreedListItem breed={breed} onClick={() => this.goToBreed(breed.id)} /> */}
							<BreedListItem
								breed={breed}
								user={user}
								onClick={() => this.goToBreed(breed.id)}
								updateBreed={this.updateBreed}
								context={this.context}
							/>
						</TabPane>
						<TabPane tab="Shelter" key="3">
							<ShelterListItem
								shelter={location}
								user={user}
								onClick={() => this.goToShelter(location.id)}
								context={this.context}
							/>
						</TabPane>
					</Tabs>
				</Card>
			</section>
		);
	}
}

DogDetails.contextType = UserContext;

DogDetails.propTypes = {
	id: PropTypes.number,
	history: PropTypes.object,
	match: PropTypes.object
};

export default withRouter(DogDetails);
