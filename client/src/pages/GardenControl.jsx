import React, { useState, useEffect } from "react";
import "../styles/GardenControl.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import lightImg from "../img/light.png";
import temperatureImg from "../img/temperature.png";
import moistureImg from "../img/moisture.png";
import humidityImg from "../img/humidity.png";
import { notification } from "antd";
import { Button } from "antd";
import { SmileOutlined } from "@ant-design/icons";
import "animate.css";
import ErrorPage from "./ErrorPage";
import { makeStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import Switch from "@material-ui/core/Switch";
import { CountdownCircleTimer } from "react-countdown-circle-timer";

const io = require("socket.io-client");

require("dotenv").config();
const socket = io("http://localhost:3001", {
    transports: ["websocket"],
    extraHeaders: {
        "my-custom-header": "1234", // WARN: this will be ignored in a browser
    },
});

function publishData(type, zoneId, value, deviceList) {
    let feedName = type === "water" ? "RELAY" : "DRV_PWM";
    console.log(type, zoneId);

    axios
        .get(`http://localhost:3001/device`)
        .then((response) => {
            response.data.forEach((device) => {
                if (device.zoneId === zoneId && device.feedName === feedName) {
                    deviceList.push(device);
                }
            });
        })
        .then(() => {
            console.log(deviceList);
            var server = "";

            if (type === "water") {
                server = "CSE_BBC1";
            } else {
                server = "CSE_BBC";
            }

            deviceList.forEach((datum) => {
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
            });
        });
}

function formatTime(timeString) {
    const time = timeString.split(":");
    return parseInt(time[0]) * 60 + parseInt(time[1]);
}

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
    const useStyles = makeStyles((theme) => ({
        container: {
            display: "flex",
            flexWrap: "wrap",
        },
        textField: {
            marginLeft: theme.spacing(1),
            marginRight: theme.spacing(1),
            width: 120,
        },
    }));

    const classes = useStyles();
    const [device, setDevice] = useState({})
    const [temp, setTemp] = useState(200);
    const [humidity, setHumidity] = useState(0);
    const [light, setLight] = useState({ data: 0 });
    const [moisture, setMoisture] = useState({ data: 0 });
    const [zone, setZone] = useState(0);
    const [statusCode, setStatusCode] = useState(200);

    // điều khiển rèm và hệ thống tưới
    const [openState, setOpenState] = useState(true);
    const [autoWatering, setAutoWatering] = useState(false);
    const [waterProcessing, setWaterProcessing] = useState(false);
    const [curtainProcessing, setCurtainProcessing] = useState(false);

    const [timeRange, setTimeRange] = useState("15:00");

    function handelClick(zoneId) {
        setZone(zoneId);
    }

    function handleCurtainLoading(message) {
        openNotification("Thông báo", message, true);
        publishData("curtain", zone, openState === true ? 255 : -255, device);

        setCurtainProcessing(true);
        setTimeout(() => {
            openNotification(
                "Thông báo",
                `Rèm đã được ${openState === true ? "đóng" : "mở"}`,
                true
            );
            publishData("curtain", zone, 0, device);
            setCurtainProcessing(false);
            setOpenState(!openState);
        }, 5000);
    }

    function handleSwitchChange(event) {
        setAutoWatering(!autoWatering);
    }

    function handleTimepickerChange(e) {
        setTimeRange(e.target.value);
    }

    function handleWaterLoading() {
        if (waterProcessing) {
            openNotification("Thông báo", `Đã tắt hệ thống tưới nước.`, true);
            publishData("water", zone, 0, device);
            setWaterProcessing(false);
        } else {
            publishData("water", zone, 1, device);
            setWaterProcessing(true);
            openNotification("Thông báo", `Đã bật hệ thống tưới nước.`, true);
        }
    }

    function handleCountdownCircle() {
        openNotification("Thông báo", `Đã tắt hệ thống tưới nước.`, true);
        publishData("water", zone, 0, device);
        setWaterProcessing(false);
        return [false, 0];
    }

    useEffect(() => {
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
                setStatusCode(0);
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

    useEffect(() => {
        axios.get(`http://localhost:3001/deviceWithZoneId/${zone}`)
            .then((res) => {
                const arr = res.data.filter((item) => item.feedName === 'RELAY')
                setDevice(res.data.filter((item) => item.feedName === 'RELAY'))
                setWaterProcessing(arr[0].last_values === "1" ? true : false)
            }).catch((err) => { console.log(err) })
    }, [zone])

    console.log('device', device)
    console.log('auto water', autoWatering)
    if (statusCode !== 200) {
        return <ErrorPage />;
    }

    function format(length) {
        const minutes = `0${Math.floor(length / 60).toString()}`.slice(-2);
        const seconds = `0${(length % 60).toString()}`.slice(-2);
        return `${minutes}:${seconds}`;
    }

    return (
        <div>
            <div className="title">Điều khiển vườn</div>

            <div className="Inner">
                <div className="Display">
                    <div className="Garden animate__animated animate__fadeInDown">
                        <button onClick={() => handelClick(1)}>
                            <div
                                className="Block Zone1 animate__animated animate__fadeInDown"
                                style={{ animationDelay: "1.2s" }}
                            >
                                <p className="Rotate">
                                    Zone 1{" "}
                                    <FontAwesomeIcon icon={faInfoCircle} />
                                </p>{" "}
                            </div>
                        </button>

                        <button onClick={() => handelClick(2)}>
                            <div
                                className="Block Zone2 animate__animated animate__fadeInDown"
                                style={{ animationDelay: "1.4s" }}
                            >
                                <p className="Rotate">
                                    Zone 2{" "}
                                    <FontAwesomeIcon icon={faInfoCircle} />
                                </p>{" "}
                            </div>
                        </button>
                        <button
                            onClick={() => handelClick(3)}
                            className="Block Zone3 animate__animated animate__fadeInDown"
                            style={{ animationDelay: "1.6s" }}
                        >
                            Zone 3 <FontAwesomeIcon icon={faInfoCircle} />
                        </button>
                        <button onClick={() => handelClick(4)}>
                            <div
                                className="Block Zone4 animate__animated animate__fadeInDown"
                                style={{ animationDelay: "1.8s" }}
                            >
                                <p className="Rotate">
                                    Zone 4{" "}
                                    <FontAwesomeIcon icon={faInfoCircle} />
                                </p>{" "}
                            </div>
                        </button>
                        <button onClick={() => handelClick(5)}>
                            <div
                                className="Block Zone5 animate__animated animate__fadeInDown"
                                style={{ animationDelay: "2s" }}
                            >
                                <p className="Rotate">
                                    Zone 5{" "}
                                    <FontAwesomeIcon icon={faInfoCircle} />
                                </p>{" "}
                            </div>
                        </button>
                    </div>
                </div>
                <div className="Control">
                    <div className="Module animate__animated animate__fadeIn">
                        <p>
                            <img
                                className="img"
                                style={{ width: "20px", margin: "0 10px" }}
                                src={lightImg}
                                alt=""
                            />
                            Cường độ ánh sáng : {light.data}
                        </p>
                    </div>
                    <div
                        className="Module animate__animated animate__fadeIn"
                        style={{ animationDelay: "0.2s" }}
                    >
                        <p>
                            <img
                                className="img"
                                style={{ width: "20px", margin: "0 10px" }}
                                src={temperatureImg}
                                alt=""
                            />
                            Nhiệt độ : {temp} độ C
                        </p>
                    </div>
                    <div
                        className="Module animate__animated animate__fadeIn"
                        style={{ animationDelay: "0.4s" }}
                    >
                        <p>
                            <img
                                className="img"
                                style={{ width: "20px", margin: "0 10px" }}
                                src={moistureImg}
                                alt=""
                            />
                            Độ ẩm đất: {moisture.data} %
                        </p>
                    </div>
                    <div
                        className="Module animate__animated animate__fadeIn"
                        style={{ animationDelay: "0.6s" }}
                    >
                        <p>
                            <img
                                className="img"
                                style={{ width: "20px", margin: "0 10px" }}
                                src={humidityImg}
                                alt=""
                            />
                            Độ ẩm không khí : {humidity} %
                        </p>
                    </div>

                    {zone === 0 ? (
                        ""
                    ) : (
                        <div>
                            <div className="title">Zone : {zone}</div>
                            <div className="Module">
                                <p>Hệ thống tưới</p>
                                <Switch
                                    checked={autoWatering}
                                    onChange={handleSwitchChange}
                                    color="primary"
                                    name="autoWatering"
                                    inputProps={{
                                        "aria-label": "primary checkbox",
                                    }}
                                />
                                <Button
                                    onClick={() =>
                                        handleWaterLoading(
                                            `Hệ thống tưới của zone ${zone} đang được`
                                        )
                                    }
                                >
                                    {waterProcessing === false ? "Mở" : "Tắt"}
                                </Button>
                            </div>

                            {autoWatering === true ? (
                                <div className="Module">
                                    <form
                                        className={classes.container}
                                        noValidate
                                    >
                                        <TextField
                                            id="time"
                                            label="Thời gian tưới"
                                            type="time"
                                            defaultValue="15:00"
                                            className={classes.textField}
                                            InputLabelProps={{
                                                shrink: true,
                                            }}
                                            inputProps={{
                                                step: 60, // 5 min
                                            }}
                                            onChange={handleTimepickerChange}
                                        />
                                    </form>
                                    {waterProcessing === true ? (
                                        <CountdownCircleTimer
                                            isPlaying={waterProcessing}
                                            duration={formatTime(timeRange)}
                                            colors={[
                                                ["#004777", 0.33],
                                                ["#F7B801", 0.33],
                                                ["#A30000", 0.33],
                                            ]}
                                            onComplete={handleCountdownCircle}
                                        >
                                            {({ remainingTime }) =>
                                                format(remainingTime)
                                            }
                                        </CountdownCircleTimer>
                                    ) : (
                                        ""
                                    )}
                                </div>
                            ) : (
                                ""
                            )}
                            <div className="Module">
                                <p>{openState === false ? "Mở" : "Đóng"} rèm</p>
                                <Button
                                    onClick={() =>
                                        handleCurtainLoading(
                                            `Rèm của zone ${zone} đang được ${openState === true
                                                ? "đóng"
                                                : "mở"
                                            }`
                                        )
                                    }
                                    disabled={
                                        curtainProcessing === false
                                            ? false
                                            : true
                                    }
                                >
                                    {openState === false ? "Mở" : "Đóng"}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default GardenControl;
