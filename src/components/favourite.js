import React, { Component } from 'react';
import PropTypes from 'prop-types';
import HeartOutlined from '@ant-design/icons/HeartOutlined';
import HeartFilled from '@ant-design/icons/HeartFilled';

class Favourite extends Component {
	constructor(props) {
		super(props);
		this.onToggle = this.onToggle.bind(this);
	}

	onToggle() {
		if (this.props.onClick) this.props.onClick();
	}

	render() {
		const Icon = this.props.selected ? HeartFilled : HeartOutlined;
		return (
			<span>
				<Icon style={{ paddingRight: '4px' }} onClick={this.onToggle} />
				{this.props.count}
			</span>
		);
	}
}

Favourite.propTypes = {
	id: PropTypes.number,
	selected: PropTypes.bool,
	count: PropTypes.number,
	onClick: PropTypes.func
};

export default Favourite;
