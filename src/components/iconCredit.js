import TwitterOutlined from '@ant-design/icons/TwitterOutlined';
import React from 'react';

const twitter = 'https://twitter.com/CanineShelter';

/**
 * Displays an icon that takes users to the Twitter page.
 */
const IconCredit = () => {
	return (
		<>
			{/* <section style={{ float: 'left' }}>
				Icons made by{' '}
				<a href="https://www.freepik.com" title="Freepik" target="_blank" rel="noreferrer">
					Freepik
				</a>{' '}
				from{' '}
				<a
					href="https://www.flaticon.com/"
					title="Flaticon"
					target="_blank"
					rel="noreferrer"
				>
					www.flaticon.com
				</a>
			</section> */}
			<TwitterOutlined
				style={{ display: 'block', margin: 'auto' }}
				onClick={() => window.open(twitter, '_blank')}
			/>
		</>
	);
};

export default IconCredit;
