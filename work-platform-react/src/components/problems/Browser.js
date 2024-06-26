import {Col, DatePicker, Form, Modal, Row, Table} from "antd";
import React, {useEffect, useState} from "react";
import Search from "antd/es/input/Search";
import {ProblemsApis} from "../../request/problemApi";

const columns = [
    {
        title: '名称',
        dataIndex: 'title',
    },
    {
        title: '周日期',
        dataIndex: 'weekDate',
    },
]

 const Browser  =  (props) => {
    const {onSelected, onCancel, onOk, visible, selectedKeys} = props;
    const [data, setData] = useState([]);
    let title;
    let year;
    let weekNumber;

    const getData = () => {
        const condition = {
            year,
            weekNumber,
            title,
            state: 0
        }
        ProblemsApis.list(condition).then(result => {
            const data = result;
            data.forEach(i => {
                i.key = i.id;
            });
            setData(data);
        })
    }
    useEffect(() => {
        getData();
    }, []);

    const onSearch = (value) => {
        title = value;
        getData();
    }

    const rowSelection = {
        selectedRowKeys: selectedKeys,
        onChange: onSelected,
    };

    const handleOk = () => {
        const selectedData = data.filter(i => selectedKeys.indexOf(i.id) !== -1);
        onOk(selectedData);
    }

    return (
        <Modal title="选择问题"
               onOk={handleOk}
               open={visible}
               onCancel={onCancel}
               width={600}>
            <Row>
                <Col span={12}>
                    <Form.Item
                        label="标题"
                        name="title"
                        labelAlign={'left'}
                    >
                        <Search
                            onSearch={onSearch}
                            style={{
                                width: 200,
                            }}
                            allowClear={true}
                        />
                    </Form.Item>

                </Col>
            </Row>
            <Table columns={columns}
                   dataSource={data}
                   pagination={{position: ['bottomRight']}}
                   rowSelection={rowSelection}
            />
        </Modal>
    )
}

export default Browser;
