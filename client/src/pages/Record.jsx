import React, { useState , useEffect} from 'react'
import 'antd/dist/antd.css';
import '../styles/Record.css'
import axios from 'axios'
import { Table } from 'antd';
import { Select } from 'antd';
import { Calendar } from 'react-date-range';
import * as locales from 'react-date-range/dist/locale';
import ErrorPage from './ErrorPage';
import { addDays } from 'date-fns';

const { Option } = Select;
const { Column } = Table;


function Record() {

    const [statusCode, setStatusCode] = useState(200);

    const [data,setData] = useState([]);
    const [type,setType] = useState('device')
    const [date, setDate] = useState("");

    function handleDatepicker(item){
        setDate(item)
    }

    function handleChange(value) {
        setType(value)
      }
      
    useEffect(()=>{
        if(type === 'device' ){
            axios.get(`http://localhost:3001/device`).then(response => {
                setData(response.data);
                setStatusCode(200);
            })
            .catch((err) => {
                setStatusCode(0);
            })
        }
        else {
            var endDate = addDays(date, 1)
            axios.get(`http://localhost:3001/record/${type}?from=${date.toString()}&to=${endDate.toString()}`).then(response => {
                setData(response.data);
                setStatusCode(200);
            })
            .catch((err) => {
                setStatusCode(0);
            })
        }  
    },[type,date])

    if(statusCode !== 200){
        return <ErrorPage />
    }

    return (
        <div>
            <div className="title">Bảng dữ liệu thiết bị</div>
            
            <div className="Inner">
                <div className="Display">
                    <div className="selector">
                        Chọn      
                        <Select defaultValue="device" onChange={handleChange} style={{ width: 200, margin: '0 20px',}}>
                            <Option value="device">Dữ liệu thiết bị</Option>
                            <Option value="temperature">Dữ liệu nhiệt độ</Option>
                            <Option value="moisture">Dữ liệu độ ẩm</Option>
                            <Option value="light">Dữ liệu cường độ ánh sáng</Option>
                            <Option value="humidity">Dữ liệu độ ẩm không khí</Option>
                        
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
                        <Column title="Số liệu" dataIndex="record" key="record"/>
                        <Column title="Thời gian" dataIndex="datetime" key="dateTime" />
                    </Table>
                    }
                </div>
                <div className="">
                    <Calendar onChange={item => handleDatepicker(item)}
                    locale={locales.Vietnamese} date={date} />
                </div>
            </div>
            

            
            

            
        </div>
    )
}

export default Record
