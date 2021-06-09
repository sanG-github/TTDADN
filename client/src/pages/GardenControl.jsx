import React, { useState, useEffect } from "react";
import '../styles/GardenControl.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faInfoCircle} from '@fortawesome/free-solid-svg-icons'
import axios from "axios";
import lightImg from "../img/light.png";
import temperatureImg from "../img/temperature.png";
import moistureImg from "../img/moisture.png";
import humidityImg from "../img/humidity.png";
import { Button } from "antd";
import { Progress } from 'antd';

const io = require("socket.io-client");

require("dotenv").config();
const socket = io("http://localhost:3001", {
    transports: ["websocket"],
    extraHeaders: {
        "my-custom-header": "1234", // WARN: this will be ignored in a browser
    },
});

function GardenControl() {

    const [temp, setTemp] = useState(0);
    const [humidity, setHumidity] = useState(0);
    const [light, setLight] = useState({ data: 0 });
    const [moisture, setMoisture] = useState({ data: 0 });
    const [zone, setZone] = useState(0);
    const [progress, setProgress] = useState(false);
    const [percent, setPercent] = useState(0);

    function handelClick(zoneId){
        setZone(zoneId)
    }

    function handleLoading(){
        setProgress(true);
        console.log(progress)

    }

    useEffect(() => {
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

    return (
        <div>
            <div className="title">Điều khiển vườn</div>

            <div className="Inner">
                <div className="Display">
                    <div className="Garden">
                        <button onClick={() => handelClick(1)}>
                            <div className="Block Zone1"><p className="Rotate">Zone 1 <FontAwesomeIcon icon={faInfoCircle}/></p> </div>
                        </button>
                        
                        <button onClick={() => handelClick(2)}><div className="Block Zone2"><p className="Rotate">Zone 2 <FontAwesomeIcon icon={faInfoCircle}/></p> </div></button>
                        <button onClick={() => handelClick(3)} className="Block Zone3">Zone 3 <FontAwesomeIcon icon={faInfoCircle}/></button>
                        <button onClick={() => handelClick(4)}><div className="Block Zone4"><p className="Rotate">Zone 4 <FontAwesomeIcon icon={faInfoCircle}/></p> </div></button>
                        <button onClick={() => handelClick(5)}><div className="Block Zone5"><p className="Rotate">Zone 5 <FontAwesomeIcon icon={faInfoCircle}/></p> </div></button>
                    </div>
                </div>
                <div className="Control">
                    <div className="Module">
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
                    <div className="Module">
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
                    <div className="Module">
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
                    <div className="Module">
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
                    <div className="title">Zone : {zone}</div>
                    <div className="Module">
                         {zone}
                    </div>   
                    <div className="Module">
                        <p>Mở mấy bơm</p>
                        <Button onClick={()=>handleLoading()}>Click</Button>
                    </div>   
                    <div className="Module">
                        <p>Đóng rèm</p>
                        <Button onClick={()=>handleLoading()}>Click</Button>
                    </div>     
                </div>
                
            </div>
            

        </div>
    )
}

export default GardenControl
