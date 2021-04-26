import React from 'react';
import PropTypes from 'prop-types';
import Title from 'antd/lib/typography/Title';
import { Button, Divider, Form, Input, Select } from 'antd';
const { Option } = Select;
const { Item } = Form;

const nameRules = [
	{ required: true, message: 'Please enter a location name' },
	{ max: 128, message: 'Name must not exceed 128 characters' }
];

const staffKeyRules = [
	{ required: true, message: 'Please enter the staff key' },
	{ len: 32, message: 'Staff key must be exactly 32 characters long' }
];

const locationRules = [{ required: true, message: 'Please select a location' }];

const StaffAssign = props => {
	return (
		<>
			<Title level={3}>Pick your location</Title>
			<Form
				style={{ marginTop: '1em' }}
				labelCol={{ span: 8 }}
				wrapperCol={{ span: 16 }}
				onFinish={props.setLocation}
			>
				<Item name="locationId" label="Location" rules={locationRules}>
					<Select placeholder="Select your location">
						{props.locations.map(loc => (
							<Option key={loc.id} value={loc.id}>
								{loc.name}
							</Option>
						))}
					</Select>
				</Item>
				<Item label="Staff key" name="staffKey" rules={staffKeyRules}>
					<Input placeholder="Staff key" />
				</Item>
				<Item wrapperCol={{ offset: 4, span: 16 }}>
					<Button type="primary" htmlType="submit">
						Assign location
					</Button>
				</Item>
			</Form>
			<Divider>OR</Divider>
			<Title level={3}>Create new location</Title>
			<Form
				style={{ marginTop: '1em' }}
				labelCol={{ span: 8 }}
				wrapperCol={{ span: 16 }}
				onFinish={props.createLocation}
			>
				<Item name="name" label="Location name" rules={nameRules}>
					<Input placeholder="Location name" />
				</Item>
				<Item name="address" label="Location address">
					<Input.TextArea placeholder="Location address" rows={5} />
				</Item>
				<Item wrapperCol={{ offset: 4, span: 16 }}>
					<Button type="primary" htmlType="submit">
						Assign location
					</Button>
				</Item>
			</Form>
		</>
	);
};

StaffAssign.propTypes = {
	locations: PropTypes.arrayOf(PropTypes.object),
	createLocation: PropTypes.func,
	setLocation: PropTypes.func
};

export default StaffAssign;
