import React, { useState, useEffect } from "react";
import axios from "axios";
import "antd/dist/antd.css";
import "./App.css";
import { io } from "socket.io-client";
require("dotenv").config();

const socket = io("http://localhost:3001", {
    transports: ["websocket"],
    extraHeaders: {
        "my-custom-header": "1234", // WARN: this will be ignored in a browser
    },
});

function App() {
    const [feeds, setFeeds] = useState([]);

    useEffect(() => {
        socket.on("feedFromServer", (data) => {
            try {
                const res = JSON.parse(data);
                console.log(typeof res, res);
                setFeeds(data)
                
            } catch (err) {
                console.log(typeof data, data);
            }
        });
    });

    const changeFeedData = () => {

        console.log("alo")
        socket.emit(
            "changeFeedData",
            `{
            "topic":"quan260402/feeds/bk-iot-light",
            "message":{
                "id":"13",
                "name":"LIGHT",
                "data":"X",
                "unit":""
            }
        }`
        );
    };

    return (
        <div className="App">
            <div className="wrapper">
                <ul>
                    {feeds &&
                        feeds.map((item) => (
                            <li>
                                <h3>{item.name}</h3>
                                <p>{item.last_value}</p>
                            </li>
                        ))}
                </ul>
                <button onClick={() => changeFeedData()}>
                    Test Change Data
                </button>
            </div>
        </div>
    );
}

export default App;
