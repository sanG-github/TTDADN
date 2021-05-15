import React, { useState } from "react";
import axios from "axios";
import "./App.css";
require("dotenv").config();

function App() {
    const [feeds, setFeeds] = useState([]);
    const onGetAllFeeds = () => {
        axios
            .get("http://localhost:3001/getAllFeeds")
            .then((res) => {
                setFeeds(res.data);
                console.log(res.data)
            })
            .catch((err) => console.log(err));

        
    };

    const onChangeFeed = (type, feedName, value, innerText) => {
        
        console.log(type, feedName, value, innerText);
        var nextValue;
        if (type === "toggle") nextValue = innerText;
        else {
            if (innerText === "+") nextValue = parseInt(value) + 1;
            else nextValue = parseInt(value) - 1;
        }

        console.log(feedName, nextValue);

        axios
            .post("http://localhost:3001/changeFeed", {
                data: { feedName: feedName, value: nextValue },
            })
            .then((res) => console.log(res.data))
            .catch((err) => console.log(err));
    };

    return (
        <div className="App">
            <div className="wrapper">
                <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => onGetAllFeeds()}
                >
                    GET FEEDS
                </button>
                <ul className="list-group">
                    {feeds &&
                        feeds.map((feed, key) => (
                            <li key={key}>
                                <h2>{feed.key}</h2>
                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={(e) =>
                                        onChangeFeed(
                                            feed.last_value === "ON" ||
                                                feed.last_value === "OFF"
                                                ? "toggle"
                                                : "num",
                                            feed.key,
                                            feed.last_value,
                                            e.target.innerText
                                        )
                                    }
                                >
                                    {feed.last_value === "ON" ||
                                    feed.last_value === "OFF"
                                        ? "OFF"
                                        : "-"}
                                </button>
                                <h2>{feed.last_value}</h2>
                                <button
                                    type="button"
                                    className="btn btn-success"
                                    onClick={(e) =>
                                        onChangeFeed(
                                            feed.last_value === "ON" ||
                                                feed.last_value === "OFF"
                                                ? "toggle"
                                                : "num",
                                            feed.key,
                                            feed.last_value,
                                            e.target.innerText
                                        )
                                    }
                                >
                                    {feed.last_value === "ON" ||
                                    feed.last_value === "OFF"
                                        ? "ON"
                                        : "+"}
                                </button>
                            </li>
                        ))}
                </ul>
            </div>
        </div>
    );
}

export default App;
