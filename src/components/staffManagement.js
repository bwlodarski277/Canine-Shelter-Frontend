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

const shelterForm = React.createRef();
const dogForm = React.createRef();

const StaffManagement = props => {
	const { location } = props;
	const dogList = (
		<>
			<Title level={3}>Dogs list</Title>
			<ShelterDogs id={location.id} compact />
		</>
	);
	return (
		<>
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
					<Select>
						<Select.Option key="0" value={false}>
							Female
						</Select.Option>
						<Select.Option key="1" value={true}>
							Male
						</Select.Option>
					</Select>
				</Item>
				<Item name="age" label="Age">
					<InputNumber min={0} style={{ float: 'left' }} />
				</Item>

				<Item wrapperCol={{ offset: 4, span: 16 }}>
					<Button type="primary" htmlType="submit">
						Add dog
					</Button>
				</Item>
			</Form>

			<Collapse style={{ marginBottom: '1em' }}>
				<Collapse.Panel header="Need help with choosing the breed?">
					<BreedHelper />
				</Collapse.Panel>
			</Collapse>

			<Divider />
			{/* When dogs are being fetched, don't show this */}
			{location.id && dogList}
		</>
	);
};

StaffManagement.propTypes = {
	updateLocation: PropTypes.func,
	addDog: PropTypes.func,
	location: PropTypes.object
};

export default StaffManagement;
