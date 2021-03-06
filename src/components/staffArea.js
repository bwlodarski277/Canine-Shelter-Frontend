import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import UserContext from '../contexts/user';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Card, message } from 'antd';
import Title from 'antd/lib/typography/Title';
import { error, json, status } from '../helpers/fetch';
import StaffManagement from './staffManagement';
import StaffAssign from './staffAssign';
import { baseUrl } from '../config';

/**
 * Staff area
 * Allows new staff to choose their location or create a new one.
 * Allows existing staff to modify their location, add dogs and view
 * the dogs at their location. Allows for breed creation.
 */
export class StaffArea extends Component {
	constructor(props) {
		super(props);
		this.state = {
			assigned: false,
			locations: []
		};
		this.setLocation = this.setLocation.bind(this);
		this.createLocation = this.createLocation.bind(this);
		this.updateLocation = this.updateLocation.bind(this);
		this.addDog = this.addDog.bind(this);
		this.addBreed = this.addBreed.bind(this);
		this.getBreeds = this.getBreeds.bind(this);
	}

	/**
	 * Sets the staff member's location using the dropdown.
	 * @param {object} data data passed from form
	 */
	setLocation(data) {
		const { jwt } = this.props.context;
		// Getting the current user's staff ID
		fetch(`${baseUrl}/staff`, {
			method: 'POST',
			headers: { Authorization: 'Bearer ' + jwt, 'Content-Type': 'application/json' },
			body: JSON.stringify(data)
		})
			.then(status)
			.then(json)
			// Getting their staff record to get their location
			.then(({ link }) => {
				fetch(link, { headers: { Authorization: 'Bearer ' + jwt } })
					.then(status)
					.then(json)
					.then(res => {
						this.setState({ staff: res, assigned: true });
						// Getting their location
						fetch(res.links.location)
							.then(status)
							.then(json)
							.then(location => this.setState({ location }))
							.catch(error);
						message.success('Successfully assigned to location');
					})
					.catch(error);
			})
			.catch(error);
	}

	/**
	 * Creates a new locatiom.
	 * @param {object} data data to register a new location
	 */
	createLocation(data) {
		const { jwt } = this.props.context;
		const fields = {};
		const { staffKey, ...newLoc } = data;
		Object.keys(newLoc).map(key => {
			// Filtering out fields that weren't set
			if (newLoc[key] !== undefined && newLoc[key] !== '') fields[key] = newLoc[key];
		});
		fetch(`${baseUrl}/locations`, {
			method: 'POST',
			headers: { Authorization: 'Bearer ' + jwt, 'Content-Type': 'application/json' },
			body: JSON.stringify(fields)
		})
			.then(status)
			.then(json)
			.then(({ id: locationId, link }) => {
				// Getting the new location
				fetch(link)
					.then(status)
					.then(json)
					.then(location => {
						// Setting the staff member associated with location
						fetch(`${baseUrl}/staff`, {
							method: 'POST',
							headers: {
								Authorization: 'Bearer ' + jwt,
								'Content-Type': 'application/json'
							},
							body: JSON.stringify({ locationId, staffKey })
						})
							.then(status)
							.then(json)
							.then(({ link }) => {
								// Getting staff record details
								fetch(link, { headers: { Authorization: 'Bearer ' + jwt } })
									.then(status)
									.then(json)
									.then(staff => {
										this.setState({ staff, assigned: true, location });
									})
									.catch(error);
							})
							.catch(error);
					});
			})
			.catch(error);
	}

	/**
	 * Updates the current location
	 * @param {object} data data to update the location
	 * @param {object} form form that called this function
	 */
	updateLocation(data, form) {
		const { jwt } = this.props.context;
		const { location } = this.state;
		const updateFields = {};
		Object.keys(data).map(key => {
			if (data[key] !== undefined && data[key] !== '') {
				location[key] = data[key]; // Update values in the location object
				updateFields[key] = data[key]; // Filtering out fields that weren't set
			}
		});
		if (!Object.keys(updateFields).length) {
			message.info('Please enter at least one field.');
			return;
		}
		fetch(this.state.staff.links.location, {
			method: 'PUT',
			headers: { Authorization: 'Bearer ' + jwt, 'Content-Type': 'application/json' },
			body: JSON.stringify(updateFields)
		})
			.then(status)
			.then(json)
			.then(() => {
				this.setState({ location });
				message.success('Location updated');
				form.current.resetFields();
			})
			.catch(error);
	}

	/**
	 * Registers a new dog in the current shelter.
	 * @param {object} data data to register a dog
	 * @param {object} form form that called this function
	 */
	addDog(data, form) {
		const { jwt } = this.props.context;
		const { breedId, ...formData } = data;
		fetch(`${baseUrl}/dogs`, {
			method: 'POST',
			headers: { Authorization: 'Bearer ' + jwt, 'Content-Type': 'application/json' },
			body: JSON.stringify(formData)
		})
			.then(status)
			.then(json)
			.then(res => {
				const { link } = res;
				const { location } = this.state;
				// Assigning location
				fetch(`${link}/location`, {
					method: 'POST',
					headers: { Authorization: 'Bearer ' + jwt, 'Content-Type': 'application/json' },
					body: JSON.stringify({ locationId: location.id })
				})
					.then(status)
					.then(json)
					.then(console.log)
					.catch(error);
				// Assigning breed
				fetch(`${link}/breed`, {
					method: 'POST',
					headers: { Authorization: 'Bearer ' + jwt, 'Content-Type': 'application/json' },
					body: JSON.stringify({ breedId })
				})
					.then(status)
					.then(json)
					.then(console.log)
					.catch(error);
				return res;
			})
			.then(res => {
				message.success('Dog added');
				form.current.resetFields();
				const { history } = this.props;
				history.push(`/dogs/${res.id}`);
			})
			.catch(error);
	}

	/**
	 * Registers a new breed.
	 * @param {object} data data to register a breed
	 * @param {object} form form that called this function
	 */
	addBreed(data, form) {
		const { jwt } = this.props.context;
		fetch(`${baseUrl}/breeds`, {
			method: 'POST',
			headers: { Authorization: 'Bearer ' + jwt, 'Content-Type': 'application/json' },
			body: JSON.stringify(data)
		})
			.then(status)
			.then(json)
			.then(() => {
				message.success('Breed added');
				this.getBreeds();
				form.current.resetFields();
			})
			.catch(error);
	}

	/**
	 * Gets a list of empty locations (no staff)
	 * @param {string} jwt JWT for auth
	 */
	getEmptyLocations(jwt) {
		fetch(`${baseUrl}/staff/unstaffed`, {
			headers: { Authorization: 'Bearer ' + jwt }
		})
			.then(status)
			.then(json)
			.then(res => {
				this.setState({ locations: res });
				console.log(res);
			})
			.catch(error);
	}

	componentDidMount() {
		const { jwt } = this.props.context;
		fetch(`${baseUrl}/auth/staff`, {
			headers: { Authorization: 'Bearer ' + jwt }
		})
			.then(status)
			.then(json)
			.then(res => {
				console.log(res);
				// If user is assigned to location, get location details
				if (res.staffId) {
					this.setState({ staff: res, assigned: true });
					fetch(res.links.location)
						.then(status)
						.then(json)
						.then(location => this.setState({ location }))
						.catch(error);
				} else this.getEmptyLocations(jwt);
			})
			.catch(error);
		this.getBreeds();
	}

	/**
	 * Gets a list of all breeds.
	 */
	getBreeds() {
		fetch(`${baseUrl}/breeds?select=name&limit=0`)
			.then(status)
			.then(json)
			.then(data => this.setState({ breeds: data.breeds }))
			.catch(error);
	}

	render() {
		const { user } = this.props.context;
		const { assigned, locations, breeds = [], location = {} } = this.state;
		if (user.role !== 'staff') return <Redirect to="/" />;

		const body = assigned ? (
			<StaffManagement
				updateLocation={this.updateLocation}
				addDog={this.addDog}
				addBreed={this.addBreed}
				location={location}
				breeds={breeds}
			/>
		) : (
			<StaffAssign
				createLocation={this.createLocation}
				locations={locations}
				setLocation={this.setLocation}
			/>
		);
		return (
			<section style={{ maxWidth: '700px', margin: 'auto' }}>
				<Card style={{ textAlign: 'center' }}>
					<Title name="login" style={{ textAlign: 'center' }}>
						Staff Area
					</Title>
					{body}
				</Card>
			</section>
		);
	}
}

StaffArea.propTypes = {
	context: PropTypes.object,
	history: PropTypes.object
};

const StaffAreaWrapper = props => {
	return (
		<UserContext.Consumer>
			{context => <StaffArea context={context} {...props} />}
		</UserContext.Consumer>
	);
};

export default withRouter(StaffAreaWrapper);
