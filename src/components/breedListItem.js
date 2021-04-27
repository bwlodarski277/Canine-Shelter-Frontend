import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Collapse, Divider, Form, Input } from 'antd';
import Title from 'antd/lib/typography/Title';
const { Item } = Form;

const nameRules = [{ max: 64, message: 'Name must be less than or 64 characters.' }];

/**
 * Breed List Item component
 * Used in the breeds list. This is a single element in the list.
 */
class BreedListItem extends Component {
	render() {
		const form = React.createRef();
		const { breed, user, onClick, updateBreed, context } = this.props;
		return (
			<section key={breed.id} id={breed.id}>
				<Title level={3}>{breed.name}</Title>
				<p>{breed.description}</p>
				<Button type="primary" onClick={onClick}>
					View dogs
				</Button>
				{/* If the user is staff, let them update the breed */}
				{user.role === 'staff' && (
					<Collapse style={{ marginTop: '1em', marginBottom: '1em' }}>
						<Collapse.Panel header="Update breed">
							<Form
								ref={form}
								style={{ marginTop: '1em' }}
								labelCol={{ span: 8 }}
								wrapperCol={{ span: 16 }}
								onFinish={data =>
									updateBreed(data, breed.links.self, context, form)
								}
							>
								<Item name="name" label="Breed name" rules={nameRules}>
									<Input placeholder={breed.name} />
								</Item>
								<Item name="description" label="Breed description">
									<Input.TextArea placeholder={breed.description} rows={5} />
								</Item>
								<Item wrapperCol={{ offset: 8, span: 16 }}>
									<Button type="primary" htmlType="submit">
										Update breed
									</Button>
								</Item>
							</Form>
						</Collapse.Panel>
					</Collapse>
				)}
				<Divider />
			</section>
		);
	}
}

BreedListItem.propTypes = {
	breed: PropTypes.object,
	user: PropTypes.object,
	onClick: PropTypes.func,
	updateBreed: PropTypes.func,
	context: PropTypes.object
};

export default BreedListItem;
