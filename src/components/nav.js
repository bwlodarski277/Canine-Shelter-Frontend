import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Menu } from 'antd';

const Nav = props => {
	const { loggedIn } = props;
	const userText = loggedIn ? 'Account' : 'Log In';
	return (
		<>
			<h1 className="title">Canine Shelter</h1>
			<Menu theme="dark" mode="horizontal" defaultSelectedKeys={['1']}>
				<Menu.Item key="1">
					<Link to="/">Home</Link>
				</Menu.Item>
				<Menu.Item key="2">
					<Link to="/dogs">Dogs</Link>
				</Menu.Item>
				<Menu.Item key="3">
					<Link to="/breeds">Breeds</Link>
				</Menu.Item>
				<Menu.Item key="4">
					<Link to="/shelters">Shelters</Link>
				</Menu.Item>
				<Menu.Item key="5" style={{ float: 'right' }}>
					{userText}
				</Menu.Item>
			</Menu>
		</>
	);
};

Nav.propTypes = {
	loggedIn: PropTypes.bool
};

export default Nav;
