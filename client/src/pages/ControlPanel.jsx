import React, { useState , useEffect} from 'react'
import 'antd/dist/antd.css';
import '../styles/ControlPanel.css'
import axios from 'axios'
import { Card } from 'antd';
import { Switch } from 'antd';
import { io } from "socket.io-client";
import { Select } from 'antd';
import { Slider } from 'antd';
import { Input} from 'antd';
import { Button } from 'antd';
const { Option } = Select;
const { Search } = Input;
require("dotenv").config();

const socket = io("http://localhost:3001", {
    transports: ["websocket"],
    extraHeaders: {
        "my-custom-header": "1234", // WARN: this will be ignored in a browser
    },
});

function publishData(datum,value) {


    var server =''

    if(datum.feedName === 'RELAY'){
        server = 'CSE_BBC1';
    }
    else {
        server = 'CSE_BBC';
    }

    socket.emit(
        "changeFeedData",
        `{
        "topic":"${server}/feeds/${datum.feed}",
        "message":{
            "id":"${datum.id}",
            "name":"${datum.feedName}",
            "data":"${value}",
            "unit":"${datum.unit === undefined ? "" : datum.unit}"
        }
    }`
    );
    console.log("Success")
}




function Led({datum}){

    function onChange(value){
        //publish
        publishData(datum,value);
    }

    return (
        <Card title={datum.name}  style={{ width: 300,margin: '10px 10px' }}>
            <p>ID thiết bị: {datum.id}</p>
            <p>{datum.status}</p>
            <span>Chọn :</span>
            <Select defaultValue="2" onChange={(value => onChange(value))} style={{ width: 100, margin: '0 20px',}}>
                    <Option value="2">Xanh</Option>
                    <Option value="1">Đỏ</Option>
                    <Option value="0">Tắt</Option>
            </Select>
        </Card>
    )
}

function Speaker({datum}){

    const [value , setValue] = useState(0);

    function onClick(e){
        // publish
        publishData(datum,value)
    }
    function onChange(value){
        setValue(value)
    }

    return (
        <Card title={datum.name} extra="" style={{ width: 300,margin: '10px 10px' }}>
            <p>ID thiết bị: {datum.id}</p>
            <p>{datum.status}</p>
            <p>Âm lượng</p>
            <Slider defaultValue={500} min={0} max={1023} onChange={(value) => onChange(value)}/>
            <Button type="primary" onClick={(e) => onClick(e)}>Nhập</Button>
        </Card>
    )
}

function LCD({datum}){

    const [state, setState] = useState('')

    function onSearch (value) {
        if(value.length < 12){
            publishData(datum,value)
        }
    }

    function onChange(e){
        if (e.target.value.length >= 12){
            setState("Không vượt quá 12 ký tự")
        }
        else {
            setState("")
        }
    }

    return (
        <Card title={datum.name} extra={<Switch defaultChecked onChange={
            (checked,event) => {
                onChange(checked,event,datum)
            }
        } />} style={{ width: 300,margin: '10px 10px' }}>
            <p>ID thiết bị: {datum.id}</p>
            <p>{datum.status}</p>
            <Search
            placeholder="Nhập chuỗi kí tự"
            allowClear
            enterButton="Nhập"
            size="large"
            onSearch={(value)=>onSearch(value)}
            onChange={(e) => onChange(e)}
            />
            <p>{state}</p>
        </Card>
    )
}

function WaterPump({datum}){

    const [value , setValue] = useState(0);

    return (
        <Card title={datum.name} extra={<Switch defaultChecked onChange={
            (checked) => {
                const data = checked ? 1 : 0;
                setValue(data)
                publishData(datum,value)
            }
        } />} style={{ width: 300,margin: '10px 10px' }}>
            <p>ID thiết bị: {datum.id}</p>
            <p>{datum.status}</p>
            
        </Card>
    )
}

function Engine({datum}){

    const [value, setValue] = useState(125)
    const [direction, setDirection] = useState(true)

    function onClick(e){
        // publish
        publishData(datum,direction === true ? value : -value)
    }

    function handleChange(checked){
        setValue(checked)
    }

    function switchDirection(){
        setDirection(!direction)
    }

    

    return (
        <Card title={datum.name} extra={<Switch defaultChecked onChange={
            (checked) => {
                handleChange(checked)
            }
        } />} style={{ width: 300,margin: '10px 10px' }}>
            <p>ID thiết bị: {datum.id}</p>
            <p>{datum.status}</p>
            <p>Chiều quay : {direction === true ? "Thuận chiều kim đồng hồ" : "Ngược chiều kim đồng hồ"} </p>
            <p> Đổi chiều
            <span><Switch value={direction} style={{margin: '0 20px'}} onChange={switchDirection}
             />
            </span>
            </p>
            <p>Tốc độ quay</p>
            <Slider defaultValue={0} min={0} max={255} onChange={handleChange}/>
            <Button type="primary" onClick={(e) => onClick(e)}>Nhập</Button>
        </Card>
    )
}

function ControlPanel() {

    const [data,setData] = useState([]);

    useEffect(()=>{
        axios.get(`http://localhost:3001/device`).then(response => {
            setData(response.data);
        })
    },[])

    // const changeFeedData = (checked) => {

    //   
    //     socket.emit(
    //         "changeFeedData",
    //         `{
    //         "topic":"quan260402/feeds/bk-iot-light",
    //         "message":{
    //             "id":"13",
    //             "name":"LIGHT",
    //             "data":"X",
    //             "unit":""
    //         }
    //     }`
    //     );
    // };

    

    return (
        <div>
            <div className="title">Bảng điều khiển thiết bị</div>
            <div className="Device-block">
                {
                    data && data.filter((datum) => datum.type === 'output').map((datum) => {
                        switch(datum.feedName){
                            case 'LED' : return <Led datum={datum} />;break;
                            case 'LCD' : return <LCD datum={datum} />;break;
                            case 'RELAY' : return <WaterPump datum={datum} />;break;
                            case 'DRV_PWM' : return <Engine datum={datum} />;break;
                            case 'SPEAKER' : return <Speaker datum={datum} />;break;
                            default: break;
                        }
                    })
                }
            </div>
        </div>
    )
}

export default ControlPanel
