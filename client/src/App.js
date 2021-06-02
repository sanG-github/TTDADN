import React, { useState, useEffect } from "react";
// import axios from "axios";
import { Route, Router, Switch } from "react-router-dom";
import { io } from "socket.io-client";
import SiderDemo from "./Layout";
import Account from "./pages/Account";
import "antd/dist/antd.css";
import "./App.css";
require("dotenv").config();

const socket = io("http://localhost:3001", {
    transports: ["websocket"],
    extraHeaders: {
        "my-custom-header": "1234", // WARN: this will be ignored in a browser
    },
});

function App() {
    return (
        <Router>
            <Switch>
                <Route path="/app" component={ProtectedLayout} />
                <Route path="/" component={PublicLayout} />
            </Switch>
        </Router>
    );
}

const ProtectedLayout = (props) => (
    <Switch>
        <Route exact path="/app/dashboard" component={SiderDemo} />
    </Switch>
);

const PublicLayout = (props) => <Route exact path="/" component={Account} />;

export default App;
