import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Avatar, Menu } from 'antd';
import UserContext from '../contexts/user';
const { Item } = Menu;

/**
 * Navigation component.
 */
const Nav = () => {
	const context = useContext(UserContext);
	return (
		<>
			<h1 className="title">Canine Shelter</h1>
			<Menu theme="dark" mode="horizontal" defaultSelectedKeys={['1']}>
				<Item key="1">
					<Link to="/">Home</Link>
				</Item>
				<Item key="2">
					<Link to="/dogs">Dogs</Link>
				</Item>
				<Item key="3">
					<Link to="/breeds">Breeds</Link>
				</Item>
				<Item key="4">
					<Link to="/shelters">Shelters</Link>
				</Item>
				{context.loggedIn ? (
					<>
						<Item key="5" style={{ float: 'right' }}>
							<Link to="/account">
								<Avatar
									style={{ marginRight: '15px' }}
									src={context.user.imageUrl}
								/>
								Account
							</Link>
						</Item>
						<Item key="6">
							<Link to="/chats">Chats</Link>
						</Item>
					</>
				) : (
					<>
						<Item key="5" style={{ float: 'right' }}>
							<Link to="/login">Log In</Link>
						</Item>
						<Item key="6" style={{ float: 'right' }}>
							<Link to="/register">Register</Link>
						</Item>
					</>
				)}
				{context.user.role === 'staff' && (
					<Item key="7" style={{ float: 'right' }}>
						<Link to="/staffArea">Staff Area</Link>
					</Item>
				)}
			</Menu>
		</>
	);
};

export default Nav;
