import React from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';

const NavImage = props => {
	const history = useHistory();
	return <img alt={props.alt} src={props.src} onClick={() => history.push(props.to)} />;
};

NavImage.propTypes = {
	alt: PropTypes.string,
	src: PropTypes.string,
	to: PropTypes.string
};

export default NavImage;
