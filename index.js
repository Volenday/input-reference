import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Checkbox, Col, Form, Input, List, Row, Select, Skeleton, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { uniq } from 'lodash';

const browser = typeof window !== 'undefined' ? true : false;

if (browser) require('./styles.css');

const InputReference = ({
	allowClear = false,
	allowSearch = true,
	children,
	disabled = false,
	disabledItems = [],
	dynamicHeight = false,
	error = null,
	extra = null,
	options = [],
	id,
	inlineError = true,
	label = '',
	listComponentLimit = 'All',
	loading = false,
	multiple,
	onBlur,
	onChange,
	onClear,
	placeholder = '',
	required = false,
	showManageButton = false,
	toolTip = '',
	value = '',
	withLabel = false,
	relatedEntityModalClose,
	type = 'dropdown'
}) => {
	const originalOptions = listComponentLimit === 'All' ? options : options.slice(0, listComponentLimit);
	const [listOptions, setListOptions] = useState([]);
	const [isDrawerVisible, setIsDrawerVisible] = useState(false);
	let timeout = useRef(null);

	const handleSearch = useCallback(
		(val = '') => {
			if (timeout) clearTimeout(timeout);
			timeout = setTimeout(() => {
				if (!val)
					return setListOptions(
						listComponentLimit === 'All'
							? options
							: uniq([
									...(value ? options.filter(d => value.includes(d.value)) : []),
									...options.slice(0, listComponentLimit)
							  ])
					);

				const newOptions = options.filter(d => d.label.match(new RegExp(val, 'i')));
				setListOptions(newOptions);
			}, 500);
		},
		[JSON.stringify(options), JSON.stringify(listOptions)]
	);

	useEffect(() => {
		handleSearch();
	}, [JSON.stringify(options)]);

	const renderSelect = () => {
		return (
			<Select
				allowClear={allowClear}
				disabled={disabled}
				filterOption={(input, { props }) => props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
				loading={loading}
				mode={multiple ? 'multiple' : 'default'}
				onBlur={onBlur}
				onChange={e => onChange({ target: { name: id, value: e } }, id, e)}
				onClear={onClear}
				optionFilterProp="children"
				placeholder={placeholder || label || id}
				showSearch
				style={{ width: '100%' }}
				value={value ? value : []}>
				{options.map(e => (
					<Select.Option key={e.value} value={e.value}>
						{e.label}
					</Select.Option>
				))}
			</Select>
		);
	};

	const renderListComponent = () => {
		const height = dynamicHeight ? 'auto' : 234;

		return (
			<div className="listComponentWrapper">
				<Row gutter={4}>
					{allowSearch && (
						<Col span={24} style={{ paddingRight: '0px !important' }}>
							<Input.Search
								disabled={disabled}
								size="small"
								placeholder="Search.."
								onSearch={e => handleSearch(e)}
								onKeyUp={e => handleSearch(e.target.value)}
							/>
						</Col>
					)}
					<Col span={24} className="listWrapper" style={{ height }}>
						<List
							dataSource={listOptions}
							disabled={disabled}
							itemLayout="horizontal"
							loading={loading}
							renderItem={(d, index) => (
								<List.Item style={{ paddingTop: 3, paddingBottom: 3 }}>
									<Checkbox
										disabled={disabled}
										className="table-font-size"
										disabled={
											disabledItems ? (disabledItems.includes(d.value) ? true : false) : false
										}
										style={{ fontSize: '8pt' }}
										onChange={e => {
											const { checked, value: newValue } = e.target;

											const finalValue = checked
												? multiple
													? [...value, newValue]
													: newValue
												: multiple
												? value.filter(d => d !== newValue)
												: '';

											onChange({ target: { name: id, value: finalValue } }, id, finalValue);

											if (
												(!multiple && !checked && value) ||
												(multiple && !checked && value.length === 1)
											) {
												//temporary fix for delay form value
												setListOptions(originalOptions); //first 10 default options
											} else {
												if (!multiple) {
													[listOptions[0], listOptions[index]] = [
														listOptions[index],
														listOptions[0]
													];
												} else {
													if (checked) {
														const selectedItem = listOptions[index];
														listOptions.splice(index, 1);
														listOptions.splice(0, 0, selectedItem);
													}
												}
											}
										}}
										value={d.value}
										checked={value ? value.includes(d.value) : false}>
										{d.label}
									</Checkbox>
								</List.Item>
							)}
							rowKey={e => `${id}-${e.value}`}
							size="small"
						/>
					</Col>
				</Row>
			</div>
		);
	};

	const renderDrawer = () => {
		const { Drawer } = require('antd');

		return (
			<Drawer
				title="Manage"
				width={720}
				visible={isDrawerVisible}
				onClose={() => {
					setIsDrawerVisible(false);
					relatedEntityModalClose();
				}}>
				{children}
			</Drawer>
		);
	};

	let formItemCommonProps = {
		colon: false,
		label: withLabel ? (
			<>
				<div style={{ float: 'right' }}>{extra}</div>{' '}
				<div className="label">
					<span>
						{label}{' '}
						{toolTip && (
							<Tooltip title={toolTip}>
								{' '}
								<QuestionCircleOutlined />
							</Tooltip>
						)}
					</span>{' '}
					{showManageButton && (
						<a
							className="ant-btn ant-btn-link"
							onClick={e => {
								e.preventDefault();
								setIsDrawerVisible(true);
							}}
							type="link">
							(Manage)
						</a>
					)}
				</div>
			</>
		) : (
			false
		),
		required,
		validateStatus: error ? 'error' : 'success'
	};
	if (inlineError) formItemCommonProps = { ...formItemCommonProps, help: error ? error : '' };

	return (
		<Form.Item {...formItemCommonProps}>
			{browser ? (
				<>
					{type === 'dropdown' ? renderSelect() : renderListComponent()}
					{showManageButton && renderDrawer()}
				</>
			) : (
				<Skeleton active paragraph={{ rows: 1, width: '100%' }} title={false} />
			)}
		</Form.Item>
	);
};

export default InputReference;
