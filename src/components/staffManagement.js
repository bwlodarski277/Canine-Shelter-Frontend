import PropTypes from 'prop-types';
import React from 'react';
import { Button, Collapse, Divider, Form, Input, InputNumber, Select } from 'antd';
import Title from 'antd/lib/typography/Title';
import ShelterDogs from './shelterDogs';
import BreedHelper from './breedHelper';
// import { json } from '../helpers/fetch';
// import { UploadOutlined } from '@ant-design/icons';
const { Item } = Form;

const nameUpdateRules = [{ max: 128, message: 'Name must not exceed 128 characters' }];

// const updateLocation = (data, props) => {
// 	props.updateLocation(data, shelterForm);
// };

const nameRules = [
	{ required: true, message: "Please enter the dog's name" },
	{ min: 3, max: 32, message: 'The name must be between or 3-32 characters' }
];

const breedRules = [{ required: true, message: 'Please select a breed' }];

const newBreedName = [
	{ required: true, message: "Please enter the breed's name" },
	{ max: 64, message: 'Breed name must not be longer than 64 characters' }
];

const shelterForm = React.createRef();
const dogForm = React.createRef();
const breedForm = React.createRef();

/**
 * Staff management component
 * Allows users to create dogs, update their location,
 * view a list of dogs at their location and create breeds.
 */
const StaffManagement = props => {
	const { location, breeds } = props;
	const breedList = breeds.map(breed => (
		<Select.Option key={breed.id} value={breed.id}>
			{breed.name}
		</Select.Option>
	));
	const dogList = (
		<>
			<Title level={3}>Dogs list</Title>
			<ShelterDogs id={location.id} compact />
		</>
	);
	return (
		<>
			{/* Location editor */}
			<Title level={3}>Manage location</Title>
			<Form
				ref={shelterForm}
				style={{ marginTop: '1em' }}
				labelCol={{ span: 8 }}
				wrapperCol={{ span: 16 }}
				onFinish={data => props.updateLocation(data, shelterForm)}
			>
				<Item name="name" label="Location name" rules={nameUpdateRules}>
					<Input placeholder={location.name} />
				</Item>
				<Item name="address" label="Location address">
					<Input.TextArea placeholder={location.address} rows={5} />
				</Item>
				<Item wrapperCol={{ offset: 4, span: 16 }}>
					<Button type="primary" htmlType="submit">
						Update location
					</Button>
				</Item>
			</Form>
			<Divider />

			{/* Form for adding new dogs to the DB */}
			<Title level={3}>Add dog</Title>
			<Form
				ref={dogForm}
				style={{ marginTop: '1em' }}
				labelCol={{ span: 8 }}
				wrapperCol={{ span: 16 }}
				onFinish={data => props.addDog(data, dogForm)}
			>
				<Item name="name" label="Name" rules={nameRules}>
					<Input placeholder="Name" />
				</Item>
				<Item name="description" label="Description">
					<Input.TextArea placeholder="Description" rows={5} />
				</Item>
				<Item name="gender" label="Gender">
					<Select placeholder="Gender">
						<Select.Option key="0" value={false}>
							Female
						</Select.Option>
						<Select.Option key="1" value={true}>
							Male
						</Select.Option>
					</Select>
				</Item>
				<Item
					name="breedId"
					label="Breed"
					rules={breedRules}
					extra="See breed picker below for help."
				>
					<Select placeholder="Breed">{breedList}</Select>
				</Item>
				<Item name="age" label="Age">
					<InputNumber min={0} style={{ float: 'left' }} placeholder="Age" />
				</Item>

				<Item wrapperCol={{ offset: 4, span: 16 }}>
					<Button type="primary" htmlType="submit">
						Add dog
					</Button>
				</Item>
			</Form>

			{/* Breed helper */}
			<Collapse style={{ marginBottom: '1em' }}>
				<Collapse.Panel header="Need help with choosing the breed?">
					<BreedHelper />
				</Collapse.Panel>
			</Collapse>
			<Divider />

			{/* Form for adding new breeds to the DB */}
			<Title level={3}>Add breed</Title>
			<Form
				ref={breedForm}
				style={{ marginTop: '1em' }}
				labelCol={{ span: 8 }}
				wrapperCol={{ span: 16 }}
				onFinish={data => props.addBreed(data, dogForm)}
			>
				<Item name="name" label="Name" rules={newBreedName}>
					<Input placeholder="Name" />
				</Item>
				<Item name="description" label="Description">
					<Input.TextArea placeholder="Description" rows={5} />
				</Item>
				<Item wrapperCol={{ offset: 4, span: 16 }}>
					<Button type="primary" htmlType="submit">
						Add breed
					</Button>
				</Item>
			</Form>
			<Divider />

			{/* Shelter dogs list */}
			{location.id && dogList}
		</>
	);
};

StaffManagement.propTypes = {
	updateLocation: PropTypes.func,
	addDog: PropTypes.func,
	addBreed: PropTypes.func,
	location: PropTypes.object,
	breeds: PropTypes.arrayOf(PropTypes.object)
};

export default StaffManagement;
