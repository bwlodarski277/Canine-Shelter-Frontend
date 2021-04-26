import React, { Component } from 'react';
import { Pagination, Input, Empty, Row, Select } from 'antd';
const { Option } = Select;
import PropTypes from 'prop-types';
import UserContext from '../contexts/user';
// import { error, json } from '../helpers/fetch';
const { Search } = Input;

/**
 * Search List component.
 * Used for displaying a list of data on the page.
 */
class SearchList extends Component {
	constructor(props) {
		super(props);
		const { extraFuncs = {} } = this.props;
		this.state = {
			list: [],
			count: 0,
			currentPage: 1,
			pageSize: this.props.defaultPageSize,
			query: '',
			direction: 'desc',
			order: 'id',
			extraFuncs
		};
		this.changePageSize = this.changePageSize.bind(this);
		this.getData = this.getData.bind(this);
		this.updateSearch = this.updateSearch.bind(this);
		this.updateOrder = this.updateOrder.bind(this);
		this.updateDirection = this.updateDirection.bind(this);
	}

	async componentDidMount() {
		// Initial data fetch
		const { extraFuncs } = this.state;
		for (const func in extraFuncs) extraFuncs[func] = extraFuncs[func].bind(this);
		this.setState({ extraFuncs });
		await this.getData();
	}

	async componentDidUpdate(prevProps, prevState) {
		const { pageSize, currentPage, query, order, direction } = prevState;
		const { state } = this;
		if (
			pageSize !== state.pageSize ||
			currentPage !== state.currentPage ||
			query !== state.query ||
			order !== state.order ||
			direction !== state.direction
		)
			// Calling the provided fetch function to get updated data
			await this.getData();
	}

	/**
	 * Calls the provided fetch function to get data based on query and pagination.
	 */
	async getData() {
		const { currentPage, pageSize, query, order, direction } = this.state;
		const { list, count } = await this.props.fetchFunction(
			currentPage,
			pageSize,
			query,
			order,
			direction
		);
		this.setState({ list, count });
	}

	/**
	 * Updates the page number and page size.
	 * @param {number} page page number
	 * @param {number} pageSize number of items on the page
	 */
	changePageSize(page, pageSize) {
		this.setState({ currentPage: page, pageSize });
	}

	/**
	 * Updates the search query.
	 * @param {string} value new query value
	 */
	updateSearch(value) {
		this.setState({ query: value });
	}

	updateDirection(value) {
		this.setState({ direction: value });
	}

	updateOrder(value) {
		this.setState({ order: value });
	}

	render() {
		const { list, count, currentPage } = this.state;
		const { pageSizeOptions, defaultPageSize, columns } = this.props;
		const dataList = list.length ? (
			this.props.listMapping(list, this.state.extraFuncs, this.props.extraVars)
		) : (
			<Row style={{ minHeight: '70vh' }}>
				<Empty style={{ margin: 'auto' }} />
			</Row>
		);
		const orders = columns.map(column => (
			<Option key={column} value={column}>
				{column}
			</Option>
		));
		return (
			<>
				<section style={{ maxWidth: '700px', margin: 'auto' }}>
					<Input.Group compact>
						<Select
							style={{ width: '20%' }}
							defaultValue={columns[0]}
							onChange={this.updateOrder}
						>
							{orders}
						</Select>
						<Select
							style={{ width: '20%' }}
							defaultValue={'desc'}
							onChange={this.updateDirection}
						>
							<Option value="asc">ascending</Option>
							<Option value="desc">descending</Option>
						</Select>
						<Search
							style={{ width: '60%' }}
							allowClear
							placeholder="Search"
							onSearch={this.updateSearch}
						/>
					</Input.Group>
				</section>
				<section>{dataList}</section>
				<span style={{ textAlign: 'center' }}>
					<Pagination
						current={currentPage}
						// defaultCurrent={currentPage}
						total={count}
						showSizeChanger
						onChange={this.changePageSize}
						pageSizeOptions={pageSizeOptions}
						defaultPageSize={defaultPageSize}
					/>
				</span>
			</>
		);
	}
}

SearchList.contextType = UserContext;

SearchList.propTypes = {
	/**
	 * List numbers to use as the page size options.
	 */
	pageSizeOptions: PropTypes.arrayOf(PropTypes.number).isRequired,
	/**
	 * Default number of items per page.
	 */
	defaultPageSize: PropTypes.number.isRequired,
	/**
	 * Columns to allow sorting by.
	 */
	columns: PropTypes.arrayOf(PropTypes.string),
	/**
	 * Function used to fetch the data for this component.
	 */
	fetchFunction: PropTypes.func.isRequired,
	/**
	 * List mapping function used to map data fetched to React components.
	 */
	listMapping: PropTypes.func.isRequired,
	/**
	 * List of extra functions to be used in
	 */
	extraFuncs: PropTypes.objectOf(PropTypes.func),
	/**
	 * List of extra variables to be passed to the mapping function
	 */
	extraVars: PropTypes.objectOf(PropTypes.any)
};

const SearchListWrapper = props => {
	return (
		<UserContext.Consumer>
			{context => <SearchList {...props} context={context} />}
		</UserContext.Consumer>
	);
};

SearchListWrapper.propTypes = SearchList.propTypes;

export default SearchListWrapper;
