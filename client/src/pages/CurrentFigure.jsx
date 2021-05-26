import React, { useState, useEffect } from "react";
import axios from "axios";
import '../styles/CurrentFigure.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import tree from '../img/tomato-4.png'
import { faThermometerThreeQuarters, faSun,faWater} from '@fortawesome/free-solid-svg-icons'
const io = require("socket.io-client")

require("dotenv").config();
const socket = io("http://localhost:3001", {
    transports: ["websocket"],
    extraHeaders: {
        "my-custom-header": "1234", // WARN: this will be ignored in a browser
    },
});

function CurrentFigure() {
 
    const [temp , setTemp] = useState(0);
    const [humidity , setHumidity] = useState(0);
    const [light,setLight] = useState({});
    const [moisture,setMoisture] = useState({});

    useEffect(() => {
        axios.get('https://io.adafruit.com/api/v2/CSE_BBC1/feeds/bk-iot-light').then((response) => {
            console.log(response.data.last_value);
            setLight(JSON.parse(response.data.last_value))
        })
    },[]);

    useEffect(() => {
        axios.get('https://io.adafruit.com/api/v2/CSE_BBC/feeds/bk-iot-soil').then((response) => {
            console.log(response.data.last_value);
            setMoisture(JSON.parse(response.data.last_value))
        })
    },[]);

    useEffect(() => {
        axios.get('https://io.adafruit.com/api/v2/CSE_BBC/feeds/bk-iot-temp-humid').then((response) => {
            console.log(response.data.last_value);

            var values = JSON.parse(response.data.last_value);
            setTemp(values.data.split('-')[0]); 
            setHumidity(values.data.split('-')[1]); 
        })
    },[]);

    useEffect(() => {
        socket.on("feedFromServer", (data) => {
            try {
                
                const res = JSON.parse(data.data)
                console.log(res)
                switch(res.name){
                    case 'TEMP-HUMID' :
                                        setTemp(JSON.parse(data.data).data.split('-')[0]); 
                                        setHumidity(JSON.parse(data.data).data.split('-')[1]); 
                                        break;
                    case 'LIGHT' : setLight(JSON.parse(data.data)); break;
                    case 'DRV_PWM' : setMoisture(JSON.parse(data.data)); break;
                    default : break;
                }
            } catch (err) {
                console.log(typeof data, data);
                console.log(err)
            }
        });
    });

    return (
        <div className="Current-Figure">
            <div>Thông số vườn cà chua hiện tại</div>
            <div className="Banner">
                <img className="img" src={tree} alt="" />
            </div>

            <div className="Figure-Block">
                <div className="Figure" style={ (temp >= 21 && temp <= 35 )? {color:'#08f25e'} : {color:'#ff3333'}} ><FontAwesomeIcon icon={faThermometerThreeQuarters} />  Nhiệt độ : {temp} độ C</div>
                <div className="Figure" style={ (light.data >= 650 && light.data <= 850 )? {color:'#08f25e'} : {color:'#ff3333'}} ><FontAwesomeIcon icon={faSun} />  Độ sáng : {light.data} </div>
                <div className="Figure" style={ (moisture.data >= 717 && moisture.data <= 818 )? {color:'#08f25e'} : {color:'#ff3333'}} ><FontAwesomeIcon icon={faWater} />  Độ ẩm đất : {moisture.data} {moisture.unit}</div>
                <div className="Figure" style={ (humidity >= 717 && moisture.data <= 818 )? {color:'#08f25e'} : {color:'#ff3333'}} ><FontAwesomeIcon icon={faWater} />  Độ ẩm không khí : {humidity} %</div>
            </div>
        </div>
    )
}

export default CurrentFigure
