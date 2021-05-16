const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
var cors = require("cors");
var mqtt = require("mqtt");
require("dotenv").config();

const app = express();
const port = 3001;
const options = {
    port: process.env.PORT,
    host: process.env.HOST,
    username: process.env.USER,
    password: process.env.KEY,
};

var client = mqtt.connect("mqtt://" + process.env.HOST, options);

client.on("connect", function () {
    console.log("Client connected");
    // client subcribe topic
    client.subscribe(`sanghuynh20000/feeds/led`, console.log);
    // client.publish(`sanghuynh20000/feeds/led`, 'off');
});

client.on("message", function (topic, message) {
    // in ra màn hình console 1 message ở định dạng string
    console.log(message.toString());
    // đóng kết nối của client
    client.end();
});

app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));

app.get("/getAllFeeds", (req, res) => {
    axios
        .get(
            `https://io.adafruit.com/api/v2/sanghuynh20000/feeds?X-AIO-Key=${process.env.KEY}`
        )
        .then((res1) => res.status(200).send(res1.data))
        .catch((err) => console.log(err, "err"));
});

app.post("/changeFeed", (req, res) => {
    // client.publish(
    //     `${process.env.USER}/feeds/${req.body.feedName}`,
    //     req.body.value
    // );

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

app.listen(port, () => {
    console.log(`App listening at PORT:`, port);
});
