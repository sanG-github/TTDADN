const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const mqtt = require("mqtt");
const http = require("http");
const socket = require("socket.io");
const cors = require("cors");
require("dotenv").config();

const PORT = 3001;
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors({ origin: "http://localhost:3000" }));

// Socket setup
const server = http.createServer(app);
const io = socket(server);

// MQTT
const options = {
    port: process.env.PORT,
    host: process.env.HOST,
    username: process.env.USERX,
    password: process.env.KEY,
};

var client = mqtt.connect("mqtt://" + options.host, options);

client.on("connect", function () {
    console.log("mqtt: new client connected");
});

axios.get(`https://io.adafruit.com/api/v2/quan260402/feeds`).then((res) => {
    const feeds = res.data;
    console.log(`----------------------\nAll feeds:`);
    feeds.map((feed) => {
        console.log("\t", feed.name);
        client.subscribe(process.env.USERX + "/feeds/" + feed.name);
    });
});

io.on("connection", (socket) => {
    console.log("socketIO: new client connected ");

    // message when data changed from
    client.on("message", function (topic, message) {
        // in ra màn hình console 1 message ở định dạng string
        console.log(
            "----------------------\nTopic: ",
            topic,
            "\nMessage: ",
            message.toString()
        );

        socket.emit("feedFromServer", message.toString());
        // đóng kết nối của client
        // client.end();
    });
});

app.get("/getAllFeeds", (req, res) => {
    axios
        .get(`https://io.adafruit.com/api/v2/quan260402/feeds`)
        .then((res1) => res.send(res1.data))
        .catch((err) => console.log(err, "err"));
});

app.post("/changeFeed", (req, res) => {
    console.log(req);

    var data = {
        id: 1,
        name: "LED",
        data: "X",
        unit: "",
    };

    client.publish(
        `${options.username}/feeds/bk-iot-led`,
        JSON.stringify(data)
    );

    const reqq = req.body;
    console.log(reqq);

    // axios
    // 	.post(
    // 		`https://io.adafruit.com/api/v2/${process.env.USER}/feeds/${req.body.feedName}/data?X-AIO-Key=${process.env.KEY}`,
    // 		{
    // 			datum: {value: req.body.value},
    // 		}
    // 	)
    // 	.then((res1) => console.log(res1))
    // 	.catch((err) => console.log(err, 'err'));
});

app.get("/", (req, res) => {
    console.log("SERVER connected");
});

server.listen(PORT, () => console.log(`Listening on port ${PORT}`));

// ----------------------------------
