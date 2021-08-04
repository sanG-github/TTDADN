import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/CurrentFigure.css";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import tree from "../img/tomato-4.png";
import lightImg from "../img/light.png";
import temperatureImg from "../img/temperature.png";
import moistureImg from "../img/moisture.png";
import humidityImg from "../img/humidity.png";
import { SmileOutlined } from "@ant-design/icons";
import "animate.css";
import { notification } from "antd";
import ErrorPage from "./ErrorPage";

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

const io = require("socket.io-client");

require("dotenv").config();
const socket = io("http://localhost:3001", {
    transports: ["websocket"],
    extraHeaders: {
        "my-custom-header": "1234", // WARN: this will be ignored in a browser
    },
});

// const openNotification = (message, description, isOk) => {
//     let icon;
//     if (!isOk)
//         icon = <SmileOutlined rotate={180} style={{ color: "#eb2f96" }} />;
//     else icon = <SmileOutlined style={{ color: "#108ee9" }} />;

//     notification.open({
//         message,
//         description,
//         icon,
//     });
// };

// Mới nhất : Quân viết cho phần ràn buộc

function CurrentFigure() {
    const [constrains, setConstrains] = useState([]);
    const [temp, setTemp] = useState(0);
    const [humidity, setHumidity] = useState(0);
    const [light, setLight] = useState({ data: 0 });
    const [moisture, setMoisture] = useState({ data: 0 });

    const [statusCode, setStatusCode] = useState(200);

    useEffect(() => {
        axios
            .get(`http://localhost:3001/constrain`)
            .then((response) => {
                setConstrains(response.data);
                setStatusCode(200);
            })
            .catch((err) => {
                // openNotification("Something happened!","Lost connection to server.",false)
                setStatusCode(0);
            });

        axios
            .get("http://localhost:3001/currentFigure")
            .then((res) => {
                setTemp(res.data.temp);
                setHumidity(res.data.humidity);
                setLight({ data: res.data.light });
                setMoisture({ data: res.data.moisture });
                setStatusCode(200);
            })
            .catch((err) => {
                // openNotification("Something happened!","Lost connection to server.",false)
                setStatusCode(0);
            });

        socket.on("feedFromServer2", (data) => {
            try {
                const res = JSON.parse(data.data);
                console.log("feedFromServer2", res);

                switch (res.name) {
                    case "LIGHT":
                        openNotification(
                            "Thông báo",
                            `Cập nhật thành công`,
                            true
                        );
                        setLight(JSON.parse(data.data));
                        break;
                    default:
                        break;
                }
                setStatusCode(200);
            } catch (err) {
                // openNotification("Something happened!","Lost connection to server.",false)
                setStatusCode(0);
            }
        });

        socket.on("feedFromServer", (data) => {
            try {
                const res = JSON.parse(data.data);
                console.log("feedFromServer", res);

                switch (res.name) {
                    case "TEMP-HUMID":
                        openNotification(
                            "Thông báo",
                            `Cập nhật thành công`,
                            true
                        );
                        setTemp(JSON.parse(data.data).data.split("-")[0]);
                        setHumidity(JSON.parse(data.data).data.split("-")[1]);
                        break;
                    case "SOIL":
                        setMoisture(JSON.parse(data.data));
                        break;
                    default:
                        break;
                }
                setStatusCode(200);
            } catch (err) {
                setStatusCode(0);
                // openNotification("Something happened!","Lost connection to server.",false)
            }
        });
    }, []);

    if (statusCode !== 200) {
        return <ErrorPage />;
    }

    return (
        <div className="Current-Figure">
            <div className="title">Thông số vườn cà chua hiện tại</div>
            <div className="Banner">
                <img
                    className="img animate__animated animate__slow animate__shakeY animate__infinite"
                    src={tree}
                    alt=""
                />
            </div>

            {constrains.length !== 0 ? (
                <div className="Figure-Block animate__animated animate__fadeIn ">
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
                                temp >= constrains[1].lower_bound &&
                                temp <= constrains[1].upper_bound
                                    ? { color: "#08f25e" }
                                    : { color: "#ff3333" }
                            }
                        >
                            {temp} độ C
                        </p>
                    </div>
                    <div
                        className="Figure animate__animated animate__fadeIn"
                        style={{ animationDelay: "0.2s" }}
                    >
                        <img
                            className="img"
                            style={{ width: "30px", margin: "0 5px" }}
                            src={lightImg}
                            alt=""
                        />{" "}
                        Cường độ ánh sáng :{" "}
                        <p
                            style={
                                light.data >= constrains[0].lower_bound &&
                                light.data <= constrains[0].upper_bound
                                    ? { color: "#08f25e" }
                                    : { color: "#ff3333" }
                            }
                        >
                            {light.data}
                        </p>{" "}
                    </div>
                    <div
                        className="Figure animate__animated animate__fadeIn"
                        style={{ animationDelay: "0.4s" }}
                    >
                        <img
                            className="img"
                            style={{ width: "30px", margin: "0 5px" }}
                            src={moistureImg}
                            alt=""
                        />{" "}
                        Độ ẩm đất :{" "}
                        <p
                            style={
                                moisture.data >= constrains[2].lower_bound &&
                                moisture.data <= constrains[2].upper_bound
                                    ? { color: "#08f25e" }
                                    : { color: "#ff3333" }
                            }
                        >
                            {moisture.data}

                            {moisture.unit === "%" ? moisture.unit : "%"}
                        </p>
                    </div>
                    <div
                        className="Figure animate__animated animate__fadeIn"
                        style={{ animationDelay: "0.6s" }}
                    >
                        <img
                            className="img"
                            style={{ width: "30px", margin: "0 5px" }}
                            src={humidityImg}
                            alt=""
                        />{" "}
                        Độ ẩm không khí :{" "}
                        <p
                            style={
                                humidity >= constrains[3].lower_bound &&
                                humidity <= constrains[3].upper_bound
                                    ? { color: "#08f25e" }
                                    : { color: "#ff3333" }
                            }
                        >
                            {humidity} %
                        </p>
                    </div>
                </div>
            ) : (
                ""
            )}
        </div>
    );
}

export default CurrentFigure;
