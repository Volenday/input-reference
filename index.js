import React, { useCallback, useEffect, useState } from 'react';
import { Checkbox, Col, Form, Input, List, Row, Select, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { uniq } from 'lodash';

const browser = typeof window !== 'undefined' ? true : false;

if (browser) require('./styles.css');

export default ({
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
	placeholder = '',
	required = false,
	showManageButton = false,
	toolTip = '',
	value = '',
	withLabel = false,
	relatedEntityModalClose,
	type = 'dropdown'
}) => {
	const [listOptions, setListOptions] = useState([]);
	const [isDrawerVisible, setIsDrawerVisible] = useState(false);

	const handleSearch = useCallback(
		(val = '') => {
			if (!val)
				return setListOptions(
					listComponentLimit === 'All'
						? options
						: uniq([
								...options.slice(0, listComponentLimit),
								...(value ? options.filter(d => value.includes(d.value)) : [])
						  ])
				);
			const newOptions = options.filter(d => d.label.match(new RegExp(val, 'i')));
			setListOptions(newOptions);
		},
		[JSON.stringify(listOptions)]
	);

	useEffect(() => {
		handleSearch();
	}, []);

	const renderSelect = () => {
		return (
			<Select
				disabled={disabled}
				filterOption={(input, { props }) => props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
				loading={loading}
				mode={multiple ? 'multiple' : 'default'}
				onBlur={onBlur}
				onChange={e => onChange({ target: { name: id, value: e } }, id, e)}
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
								size="small"
								placeholder="Search.."
								onSearch={e => handleSearch(e)}
								onKeyUp={e => handleSearch(e.target.value)}
							/>
						</Col>
					)}
					<Col span={24} className="listWrapper" style={{ height }}>
						<List
							itemLayout="horizontal"
							dataSource={listOptions}
							renderItem={d => (
								<List.Item style={{ paddingTop: 3, paddingBottom: 3 }}>
									<Checkbox
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
