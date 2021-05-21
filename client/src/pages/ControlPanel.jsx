import React, { useState , useEffect} from 'react'
import 'antd/dist/antd.css';
import '../styles/ControlPanel.css'
import axios from 'axios'
import { Card } from 'antd';
import { Switch } from 'antd';
import { io } from "socket.io-client";
import { Select } from 'antd';
import { Slider } from 'antd';
const { Option } = Select;
require("dotenv").config();

const socket = io("http://localhost:3001", {
    transports: ["websocket"],
    extraHeaders: {
        "my-custom-header": "1234", // WARN: this will be ignored in a browser
    },
});

function onChange(feed,feedName,data) {

    socket.emit(
        "changeFeedData",
        `{
        "topic":"quan260402/feeds/${feed}",
        "message":{
            "id":"13",
            "name":"${feedName}",
            "data":"",
            "unit":""
        }
    }`
    );
}

function Led({datum}){

    return (
        <Card title={datum.name}  style={{ width: 300,margin: '10px 10px' }}>
            <p>ID thiết bị: {datum.id}</p>
            <p>{datum.status}</p>
            <span>Chọn :</span>
            <Select defaultValue="2" onChange="" style={{ width: 100, margin: '0 20px',}}>
                    <Option value="2">Xanh</Option>
                    <Option value="1">Đỏ</Option>
                    <Option value="0">Tắt</Option>
            </Select>
        </Card>
    )
}

function Speaker({datum}){

    console.log(datum)

    return (
        <Card title={datum.name} extra="" style={{ width: 300,margin: '10px 10px' }}>
            <p>ID thiết bị: {datum.id}</p>
            <p>{datum.status}</p>
            <p>Âm lượng</p>
            <Slider defaultValue={500} min={0} max={1023} />
        </Card>
    )
}

function LCD({datum}){

    console.log(datum)

    return (
        <Card title={datum.name} extra={<Switch defaultChecked onChange={
            (checked,event) => {
                onChange(checked,event,datum)
            }
        } />} style={{ width: 300,margin: '10px 10px' }}>
            <p>{datum.status}</p>
        </Card>
    )
}

function WaterPump({datum}){

    console.log(datum)

    return (
        <Card title={datum.name} extra={<Switch defaultChecked onChange={
            (checked) => {
                const feed = ""
                const feedName =""
                const data = checked ? 1 : 0;
                console.log(data);
                onChange(feed,feedName,data);
            }
        } />} style={{ width: 300,margin: '10px 10px' }}>
            <p>{datum.status}</p>
        </Card>
    )
}

function Engine({datum}){

    const [value, setValue] = useState(125)
    const [direction, setDirection] = useState(true)

    function handleChange(value){
        setValue(value)
    }

    function switchDirection(){
        setDirection(!direction)
    }

    console.log(datum)

    return (
        <Card title={datum.name} extra={<Switch defaultChecked onChange={
            (checked,event) => {
                onChange(checked,event,datum)
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
        </Card>
    )
}

function ControlPanel() {

    const [data,setData] = useState([]);

    useEffect(()=>{
        axios.get(`http://localhost:3001/device`).then(response => {
            console.log('alo')
            setData(response.data);
        })
    },[])

    // const changeFeedData = (checked) => {

    //     console.log("alo")
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
            <div className="title">Bảng điều khiển</div>
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
