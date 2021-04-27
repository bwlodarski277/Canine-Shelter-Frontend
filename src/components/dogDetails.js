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
	Tabs,
	Upload
} from 'antd';
import noImage from '../images/noImage.jpg';
import { error, json, status } from '../helpers/fetch';
// import { withRouter } from 'react-router-dom';
import Title from 'antd/lib/typography/Title';
import Sider from 'antd/lib/layout/Sider';
import Layout, { Content } from 'antd/lib/layout/layout';
import Favourite from './favourite';
import { getUserFavs } from '../helpers/updateFavs';
import UserContext from '../contexts/user';
import ShelterListItem from './shelterListItem';
import BreedListItem from './breedListItem';
import { withRouter } from 'react-router';
import { UploadOutlined } from '@ant-design/icons';
const { Item } = Form;
const { TabPane } = Tabs;

const nameRules = [{ min: 3, max: 32, message: 'Name must be betweeen or 3-32 characters' }];

/**
 * Dog details object
 * Allows for viewing details about a dog, it's location and breed.
 * Allows staff to modify details about the dog and breed.
 */
export class DogDetails extends Component {
	constructor(props) {
		super(props);
		const { jwt } = this.props.context;
		this.state = {
			id: props.id,
			dog: null,
			history: props.history,
			location: null,
			breed: null,
			breeds: [],
			form: React.createRef(),
			upload: {
				accept: 'image/jpeg, image/png',
				maxCount: 1,
				showUploadList: false,
				name: 'upload',
				action: 'http://localhost:3000/api/v1/uploads',
				headers: { Authorization: 'Bearer ' + jwt },
				onChange: this.onPictureChanged
			}
		};
		this.toggleFavourite = this.toggleFavourite.bind(this);
		this.goToShelter = this.goToShelter.bind(this);
		this.updateBreed = this.updateBreed.bind(this);
		this.refetchBreed = this.refetchBreed.bind(this);
		this.updateDog = this.updateDog.bind(this);
		this.onPictureChanged = this.onPictureChanged.bind(this);
	}

	componentDidMount() {
		const { id } = this.props.match.params;
		const { user, jwt, loggedIn } = this.props.context;

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
						if (loggedIn)
							getUserFavs([dog], user, jwt)
								.then(([dog]) => {
									dog.favourites = count;
									console.log(dog);
									this.setState({ dog });
								})
								.catch(error);
						else this.setState({ dog });
					})
					.catch(error);
			})
			.catch(error);

		// Getting dog location
		fetch(`${url}/${id}/location`, { cache: 'no-cache' })
			.then(status)
			.then(json)
			.then(location =>
				// Get location details
				fetch(location.links.location, { cache: 'no-cache' })
					.then(status)
					.then(json)
					.then(location => this.setState({ location }))
					.catch(() => console.log('Dog does not have location'))
			)
			.catch(error);

		// Getting breed
		this.getBreed(url, id);

		if (user.role === 'staff')
			// Get a list of breeds
			fetch('http://localhost:3000/api/v1/breeds?select=name&limit=0')
				.then(status)
				.then(json)
				.then(data => this.setState({ breeds: data.breeds }))
				.catch(error);
	}

	/**
	 * Gets a dog's breed
	 * @param {string} url URL to fetch
	 * @param {number|string} id dog ID
	 */
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

	/**
	 * Fetces a breed's information
	 * @param {string} url breed URL
	 */
	refetchBreed(url) {
		fetch(url, { cache: 'no-cache' })
			.then(status)
			.then(json)
			.then(breed => this.setState({ breed }));
	}

	/**
	 * Navigates to a shelter's dogs
	 * @param {number} id shelter ID
	 */
	goToShelter(id) {
		const { history } = this.props;
		history.push(`/shelters/${id}`);
	}

	/**
	 * Navigates to a breed's dogs
	 * @param {number} id breed ID
	 */
	goToBreed(id) {
		const { history } = this.props;
		history.push(`/breeds/${id}`);
	}

	/**
	 * Navigates to a chat
	 * @param {number} id location ID
	 */
	goToChat(id) {
		const { history } = this.props;
		history.push(`/chats/${id}`);
	}

	/**
	 * Toggles the user's favourite on a dog.
	 */
	toggleFavourite() {
		const { user, jwt } = this.props.context;
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

	/**
	 * Updates a breed's details
	 * @param {object} data data to use to update breed
	 * @param {string} url URL to fetch
	 * @param {*} _ unused
	 * @param {object} form form that called this function
	 */
	updateBreed(data, url, _, form) {
		const { jwt } = this.props.context;
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

	/**
	 * Updates the dog's details
	 * @param {object} data data to use to update dog
	 * @param {object} form form that called this function
	 */
	updateDog(data, form) {
		const { breedId, ...formData } = data;

		const { jwt } = this.props.context;
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
		// If Details other than breed are being updated
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
					if (form) form.current.resetFields();
				})
				.catch(error);
		// If breed of the dog is being updated
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
					if (form) form.current.resetFields();
				})
				.catch(error);
		else message.info('Please update at least one field');
	}

	/**
	 * Updates the dog's picture.
	 * @param {object} info info object passed by Antd
	 */
	onPictureChanged(info) {
		if (info.file.status === 'done') {
			const { jwt } = this.props.context;
			const { dog } = this.state;
			console.log(info);
			const res = info.file.response;
			fetch(dog.links.self, {
				method: 'PUT',
				headers: {
					Authorization: 'Bearer ' + jwt,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ imageUrl: res.link })
			})
				.then(status)
				.then(() => this.updateDog({ imageUrl: res.link }))
				.catch(error);
		} else if (info.file.status === 'error') {
			console.error(info);
			message.error(`${info.file.name} file upload failed.`);
		}
	}

	render() {
		if (!this.state.dog) return <Empty />;
		const { dog, location, breed, breeds, form } = this.state;
		const { user } = this.props.context;

		const image = dog.imageUrl ? dog.imageUrl : '';

		const actions =
			'favourited' in dog || 'favourites' in dog
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
									<Collapse.Panel
										header="Update dog"
										style={{ textAlign: 'center' }}
									>
										<Title level={3} style={{ textAlign: 'center' }}>
											Update details
										</Title>
										<Form
											ref={form}
											style={{ marginTop: '1em', textAlign: 'center' }}
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
											<Item name="breedId" label="Breed">
												<Select placeholder="Breed">{breedList}</Select>
											</Item>
											<Item name="age" label="Age">
												<InputNumber
													min={0}
													style={{ float: 'left' }}
													placeholder="Age"
												/>
											</Item>

											<Item wrapperCol={{ offset: 4, span: 16 }}>
												<Button type="primary" htmlType="submit">
													Update dog
												</Button>
											</Item>
										</Form>
										<Divider />
										<Title level={3} style={{ textAlign: 'center' }}>
											Update image
										</Title>
										<Upload
											{...this.state.upload}
											onChange={this.onPictureChanged}
										>
											<Button
												type="primary"
												icon={<UploadOutlined />}
												style={{ textAlign: 'center' }}
											>
												Upload image
											</Button>
										</Upload>
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
								context={this.props.context}
							/>
						</TabPane>
						<TabPane tab="Shelter" key="3">
							<ShelterListItem
								shelter={location}
								user={user}
								onClick={() => this.goToShelter(location.id)}
								goToChat={() => this.goToChat(location.id)}
								context={this.props.context}
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
	match: PropTypes.object,
	context: PropTypes.object
};

const DogDetailsWrapper = props => {
	return (
		<UserContext.Consumer>
			{context => <DogDetails {...props} context={context} />}
		</UserContext.Consumer>
	);
};

DogDetailsWrapper.propTypes = DogDetails.propTypes;

export default withRouter(DogDetailsWrapper);
