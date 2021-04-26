import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import UserContext from '../contexts/user';
import PropTypes from 'prop-types';
import { Card, message } from 'antd';
import Title from 'antd/lib/typography/Title';
import { error, json, status } from '../helpers/fetch';
import StaffManagement from './staffManagement';
import StaffAssign from './staffAssign';

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
	}

	/**
	 * Sets the staff member's location using the dropdown.
	 * @param {object} data data passed from form
	 */
	setLocation(data) {
		const { jwt } = this.props.context;
		fetch('http://localhost:3000/api/v1/staff', {
			method: 'POST',
			headers: { Authorization: 'Bearer ' + jwt, 'Content-Type': 'application/json' },
			body: JSON.stringify(data)
		})
			.then(status)
			.then(json)
			.then(({ link }) => {
				fetch(link, { headers: { Authorization: 'Bearer ' + jwt } })
					.then(status)
					.then(json)
					.then(res => {
						this.setState({ staff: res, assigned: true });
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

	createLocation(data) {
		return data;
	}

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

	addDog(data, form) {
		const { jwt } = this.props.context;
		fetch('http://localhost:3000/api/v1/dogs', {
			method: 'POST',
			headers: { Authorization: 'Bearer ' + jwt, 'Content-Type': 'application/json' },
			body: JSON.stringify(data)
		})
			.then(status)
			.then(json)
			.then(res => {
				const { link } = res;
				const { location } = this.state;
				fetch(`${link}/location`, {
					method: 'POST',
					headers: { Authorization: 'Bearer ' + jwt, 'Content-Type': 'application/json' },
					body: JSON.stringify({ locationId: location.id })
				})
					.then(status)
					.then(json)
					.then(() => {
						message.success('Dog added');
						form.current.resetFields();
					})
					.catch(error);
			})
			.catch(error);
	}

	getEmptyLocations(jwt) {
		fetch('http://localhost:3000/api/v1/staff/unstaffed', {
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
		fetch('http://localhost:3000/api/v1/auth/staff', {
			headers: { Authorization: 'Bearer ' + jwt }
		})
			.then(status)
			.then(json)
			.then(res => {
				console.log(res);
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
	}

	render() {
		const { user } = this.props.context;
		const { assigned, locations, location = {} } = this.state;
		if (user.role !== 'staff') return <Redirect to="/" />;

		const body = assigned ? (
			<StaffManagement
				updateLocation={this.updateLocation}
				addDog={this.addDog}
				location={location}
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
	context: PropTypes.object
};

const StaffAreaWrapper = () => {
	return (
		<UserContext.Consumer>{context => <StaffArea context={context} />}</UserContext.Consumer>
	);
};

export default StaffAreaWrapper;
