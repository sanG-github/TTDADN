import React, { useState, useEffect } from "react";
import '../styles/GardenControl.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faInfoCircle} from '@fortawesome/free-solid-svg-icons'
import axios from "axios";
import lightImg from "../img/light.png";
import temperatureImg from "../img/temperature.png";
import moistureImg from "../img/moisture.png";
import humidityImg from "../img/humidity.png";
import { notification } from "antd";
import { Button } from "antd";
// import { Progress } from 'antd';
import { SmileOutlined } from "@ant-design/icons";
import 'animate.css'
import ErrorPage from "./ErrorPage";


const io = require("socket.io-client");

require("dotenv").config();
const socket = io("http://localhost:3001", {
    transports: ["websocket"],
    extraHeaders: {
        "my-custom-header": "1234", // WARN: this will be ignored in a browser
    },
});


const openNotification = (message, description, isOk) => {
    let icon;
    if (!isOk)
        icon = <SmileOutlined rotate={180} style={{ color: "#eb2f96" }} />;
    else icon = <SmileOutlined style={{ color: "#108ee9" }} />;

    notification.open({
        message,
        description,
        icon,
    });
};

function GardenControl() {

    const [temp, setTemp] = useState(0);
    const [humidity, setHumidity] = useState(0);
    const [light, setLight] = useState({ data: 0 });
    const [moisture, setMoisture] = useState({ data: 0 });
    const [zone, setZone] = useState(0);

    const [statusCode, setStatusCode] = useState(0);

    function handelClick(zoneId){
        setZone(zoneId)
    }

    function handleLoading(message){
        openNotification(
            "Thông báo",
            message,
            true
        );
    }

    useEffect(() => {

        axios.get(`http://localhost:3001/`).then((response) => {
            setStatusCode(response.data.code);
        })

        axios.get("http://localhost:3001/currentFigure").then((res) => {
            setTemp(res.data.temp);
            setHumidity(res.data.humidity);
            setLight({ data: res.data.light });
            setMoisture({ data: res.data.moisture });
        });

        socket.on("feedFromServer2", (data) => {
            try {
                const res = JSON.parse(data.data);
                console.log("feedFromServer2", res);

                switch (res.name) {
                    case "LIGHT":
                        setLight(JSON.parse(data.data));
                        break;
                    default:
                        break;
                }
            } catch (err) {
                console.log(err);
            }
        });

        socket.on("feedFromServer", (data) => {
            try {
                const res = JSON.parse(data.data);
                console.log("feedFromServer", res);

                switch (res.name) {
                    case "TEMP-HUMID":
                        setTemp(JSON.parse(data.data).data.split("-")[0]);
                        setHumidity(JSON.parse(data.data).data.split("-")[1]);
                        break;
                    case "SOIL":
                        setMoisture(JSON.parse(data.data));
                        break;
                    default:
                        break;
                }
            } catch (err) {
                console.log(err);
            }
        });
    }, []);

    if(statusCode !== 200){
        return <ErrorPage />
    }

    return (
        <div>
            <div className="title">Điều khiển vườn</div>

            <div className="Inner">
                <div className="Display">
                    <div className="Garden animate__animated animate__fadeInDown" >
                        <button onClick={() => handelClick(1)}>
                            <div className="Block Zone1 animate__animated animate__fadeInDown" style={{animationDelay: "1.2s"}}><p className="Rotate">Zone 1 <FontAwesomeIcon icon={faInfoCircle}/></p> </div>
                        </button>
                        
                        <button onClick={() => handelClick(2)}><div className="Block Zone2 animate__animated animate__fadeInDown" style={{animationDelay: "1.4s"}}><p className="Rotate">Zone 2 <FontAwesomeIcon icon={faInfoCircle}/></p> </div></button>
                        <button onClick={() => handelClick(3)} className="Block Zone3 animate__animated animate__fadeInDown" style={{animationDelay: "1.6s"}}>Zone 3 <FontAwesomeIcon icon={faInfoCircle}/></button>
                        <button onClick={() => handelClick(4)}><div className="Block Zone4 animate__animated animate__fadeInDown" style={{animationDelay: "1.8s"}}><p className="Rotate">Zone 4 <FontAwesomeIcon icon={faInfoCircle}/></p> </div></button>
                        <button onClick={() => handelClick(5)}><div className="Block Zone5 animate__animated animate__fadeInDown" style={{animationDelay: "2s"}}><p className="Rotate">Zone 5 <FontAwesomeIcon icon={faInfoCircle}/></p> </div></button>
                    </div>
                </div>
                <div className="Control">
                    <div className="Module animate__animated animate__fadeIn" >
                        <p>
                            <img
                                className="img"
                                style={{ width: "20px" ,margin: "0 10px"}}
                                src={lightImg}
                                alt=""
                            />
                            Cường độ ánh sáng : {light.data}
                        </p>
                    </div>
                    <div className="Module animate__animated animate__fadeIn" style={{animationDelay: "0.2s"}}>
                        <p>
                            <img
                                className="img"
                                style={{ width: "20px" ,margin: "0 10px"}}
                                src={temperatureImg}
                                alt=""
                            />
                            Nhiệt độ : {temp} độ C
                        </p>
                    </div>
                    <div className="Module animate__animated animate__fadeIn" style={{animationDelay: "0.4s"}}>
                        <p>
                            <img
                                className="img"
                                style={{ width: "20px" ,margin: "0 10px"}}
                                src={moistureImg}
                                alt=""
                            />
                            Độ ẩm đất: {moisture.data} %
                        </p>
                    </div>
                    <div className="Module animate__animated animate__fadeIn" style={{animationDelay: "0.6s"}}>
                        <p>
                            <img
                                className="img"
                                style={{ width: "20px" ,margin: "0 10px"}}
                                src={humidityImg}
                                alt=""
                            />
                            Độ ẩm không khí : {humidity} %
                        </p>
                    </div>    

                    {
                        zone === 0 ? "" : (
                            <div>
                                <div className="title">Zone : {zone}</div>
                                <div className="Module">
                                    {zone}
                                </div>   
                                <div className="Module">
                                    <p>Hệ thống tưới</p>
                                    <Button onClick={()=>handleLoading(`Hệ thống tưới của zone ${zone} đang được mở`)}>Click</Button>
                                </div>   
                                <div className="Module">
                                    <p>Đóng rèm</p>
                                    <Button onClick={()=>handleLoading(`Rèm của zone ${zone} đang được đóng`)}>Click</Button>
                                </div>  
                            </div>
                        )
                    }
                       
                </div>
                
            </div>
            

        </div>
    )
}

export default GardenControl
