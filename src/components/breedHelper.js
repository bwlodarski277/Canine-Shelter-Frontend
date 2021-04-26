import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { error, json, status } from '../helpers/fetch';
import noImage from '../images/noImage.jpg';
import { Button, Divider, Form, Image, Select } from 'antd';

export class BreedHelper extends Component {
	constructor(props) {
		super(props);
		this.state = {
			breedList: [],
			imageUrl: noImage
		};
		this.updateImage = this.updateImage.bind(this);
		this.refreshImage = this.refreshImage.bind(this);
	}

	componentDidMount() {
		fetch('https://dog.ceo/api/breeds/list/all')
			.then(status)
			.then(json)
			.then(({ message: list }) => {
				const breedList = {};
				for (const [breed, subBreeds] of Object.entries(list))
					if (!subBreeds.length) breedList[breed] = breed;
					else subBreeds.forEach(sub => (breedList[`${breed}-${sub}`] = [breed, sub]));
				this.setState({ breedList });
				// console.log(breedList);
			})
			.catch(error);
	}

	/**
	 * Fetches a random image for a breed and updates the state.
	 * @param {string|Array<string, string>} breed breed to fetch image for
	 */
	updateImage(breed) {
		let res;
		if (breed instanceof Array)
			// If it has a sub-breed, get the sub-breed
			res = fetch(`https://dog.ceo/api/breed/${breed[0]}/${breed[1]}/images/random`);
		// If no sub-breed, get the breed
		else res = fetch(`https://dog.ceo/api/breed/${breed}/images/random`);
		res.then(status)
			.then(json)
			.then(({ message }) => this.setState({ imageUrl: message, currentBreed: breed }));
	}

	/**
	 * Refreshes the image by fetching a new random image.
	 */
	refreshImage() {
		if (this.state.currentBreed) this.updateImage(this.state.currentBreed);
	}

	render() {
		const { breedList } = this.state;
		const breedKeys = Object.keys(breedList);
		const items = breedKeys.map(key => (
			<Select.Option key={key} value={breedList[key]}>
				{key}
			</Select.Option>
		));
		return (
			<>
				<Form>
					<Form.Item name="breed">
						<Select
							placeholder="Pick a breed to view image"
							onChange={this.updateImage}
						>
							{items}
						</Select>
					</Form.Item>
				</Form>
				<Button type="primary" onClick={this.refreshImage}>
					Get another
				</Button>
				<Divider />
				<Image src={this.state.imageUrl} preview={false} />
			</>
		);
	}
}

BreedHelper.propTypes = { temp: PropTypes.object };

export default BreedHelper;
