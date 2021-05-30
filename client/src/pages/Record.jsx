import React, { useState , useEffect} from 'react'
import 'antd/dist/antd.css';
import '../styles/Record.css'
import axios from 'axios'
import { Table } from 'antd';
import { Select } from 'antd';
const { Option } = Select;
const { Column } = Table;

function Record() {

    const [data,setData] = useState([]);
    const [type,setType] = useState('device')

    function handleChange(value) {
        console.log(`selected ${value}`);
        setType(value)
      }
      
    useEffect(()=>{
        axios.get(`http://localhost:3001/${type}`).then(response => {
            console.log('alo')
            setData(response.data);
        })
    },[type])

    return (
        <div>
            <div className="title">Bảng dữ liệu thiết bị</div>

            <div className="selector">
                Chọn      
                <Select defaultValue="device" style={{ width: 120 }} onChange={handleChange} style={{ width: 200, margin: '0 20px',}}>
                    <Option value="device">Dữ liệu thiết bị</Option>
                    <Option value="temperature">Dữ liệu nhiệt độ</Option>
                    <Option value="moisture">Dữ liệu độ ẩm</Option>
                    <Option value="light">Dữ liệu cường độ ánh sáng</Option>
                
                </Select>
            </div>
            {type === 'device' ? 
            
            <Table dataSource={data} style={{}}>
                <Column title="ID" dataIndex="id" key="id" />
                <Column title="Tên thiết bị" dataIndex="name" key="name" />
                <Column title="Trạng thái" dataIndex="status" key="status" />
                <Column title="Thương hiệu" dataIndex="brand" key="brand" />
            </Table> :
            <Table dataSource={data} style={{}}>
                <Column title="ID thiết bị nhập" dataIndex="inputId" key="inputId" />
                <Column title="Số liệu" dataIndex="record" key="record" />
                <Column title="Thời gian" dataIndex="datetime" key="dateTime" />
            </Table>
            }
        </div>
    )
}

export default Record
