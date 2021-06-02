import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/CurrentFigure.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import tree from "../img/tomato-4.png";
import lightImg from "../img/light.png";
import temperatureImg from "../img/temperature.png";
import moistureImg from "../img/moisture.png";
import humidityImg from "../img/humidity.png";
const io = require("socket.io-client");
require("dotenv").config();

const socket = io("http://localhost:3001", {
    transports: ["websocket"],
    extraHeaders: {
        "my-custom-header": "1234", // WARN: this will be ignored in a browser
    },
});

function CurrentFigure() {
    const [temp, setTemp] = useState({});
    const [humidity, setHumidity] = useState(0);
    const [light, setLight] = useState({ data: 0 });
    const [moisture, setMoisture] = useState({ data: 0 });

    useEffect(() => {
        socket.on("feedFromServer2", (data) => {
            try {
                const res = JSON.parse(data.data);

                switch (res.name) {
                    case "TEMP-HUMID":
                        setTemp(JSON.parse(data.data).data.split("-")[0]);
                        setHumidity(JSON.parse(data.data).data.split("-")[1]);
                        break;
                    case "LIGHT":
                        setLight(JSON.parse(data.data));
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

        socket.on("feedFromServer", (data) => {
            try {
                const res = JSON.parse(data.data);

                switch (res.name) {
                    case "TEMP-HUMID":
                        setTemp(JSON.parse(data.data).data.split("-")[0]);
                        setHumidity(JSON.parse(data.data).data.split("-")[1]);
                        break;
                    case "LIGHT":
                        setLight(JSON.parse(data.data));
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
        <div className="Current-Figure">
            <div className="title">Thông số vườn cà chua hiện tại</div>
            <div className="Banner">
                <img className="img" src={tree} alt="" />
            </div>

            <div className="Figure-Block">
                <div className="Figure">
                    <img
                        className="img"
                        style={{ width: "30px", margin: "0 5px" }}
                        src={temperatureImg}
                        alt=""
                    />{" "}
                    Nhiệt độ :{" "}
                    <p
                        style={
                            temp >= 21 && temp <= 35
                                ? { color: "#08f25e" }
                                : { color: "#ff3333" }
                        }
                    >
                        {temp} độ C
                    </p>
                </div>
                <div className="Figure">
                    <img
                        className="img"
                        style={{ width: "30px", margin: "0 5px" }}
                        src={lightImg}
                        alt=""
                    />{" "}
                    Cường độ ánh sáng :{" "}
                    <p
                        style={
                            light.data >= 650 && light.data <= 850
                                ? { color: "#08f25e" }
                                : { color: "#ff3333" }
                        }
                    >
                        {light.data}
                    </p>{" "}
                </div>
                <div className="Figure">
                    <img
                        className="img"
                        style={{ width: "30px", margin: "0 5px" }}
                        src={moistureImg}
                        alt=""
                    />{" "}
                    Độ ẩm đất :{" "}
                    <p
                        style={
                            moisture.data >= 60 && moisture.data <= 70
                                ? { color: "#08f25e" }
                                : { color: "#ff3333" }
                        }
                    >
                        {moisture.data} {moisture.unit}
                    </p>
                </div>
                <div className="Figure">
                    <img
                        className="img"
                        style={{ width: "30px", margin: "0 5px" }}
                        src={humidityImg}
                        alt=""
                    />{" "}
                    Độ ẩm không khí :{" "}
                    <p
                        style={
                            humidity >= 50 && humidity <= 80
                                ? { color: "#08f25e" }
                                : { color: "#ff3333" }
                        }
                    >
                        {humidity} %
                    </p>
                </div>
            </div>
        </div>
    );
}

export default CurrentFigure;
