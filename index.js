const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const mqtt = require("mqtt");
const http = require("http");
const socket = require("socket.io");
const cors = require("cors");
const mysql = require('mysql');
require("dotenv").config();

const PORT = 3001;
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors({ origin: "http://localhost:3000" }));

//Connect database
const database = mysql.createPool(
    {
        host: "localhost",
        user: "root",
        password: "quan0402",
        database: "DADN",
    }
)

app.get("/device", (req, res) => {
    const sqlSelect = "SELECT * FROM `device`";
    database.query(sqlSelect, (err, result) => {
      if (err) {
        console.log(err);
      }
      res.send(result);
    });
});

app.get("/temperature", (req, res) => {
    const sqlSelect = "SELECT * FROM `temperature`";
    database.query(sqlSelect, (err, result) => {
      if (err) {
        console.log(err);
      }
      res.send(result);
    });
});

app.get("/moisture", (req, res) => {
    const sqlSelect = "SELECT * FROM `moisture`";
    database.query(sqlSelect, (err, result) => {
      if (err) {
        console.log(err);
      }
      res.send(result);
    });
});

app.get("/light", (req, res) => {
    const sqlSelect = "SELECT * FROM `light`";
    database.query(sqlSelect, (err, result) => {
      if (err) {
        console.log(err);
      }
      res.send(result);
    });
});


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
    console.log("mqtt: new client connected!");
});

axios.get(`https://io.adafruit.com/api/v2/quan260402/feeds`).then((res) => {
    const feeds = res.data;
    console.log(`----------------------\nAll feeds:`);
    feeds.map((feed) => {
        console.log("\t", feed.name);
        client.subscribe(process.env.USERX + "/feeds/" + feed.name);
    });
});

io.on("connection",  (socket) => {
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
        
        console.log(JSON.parse(message));
        const values = JSON.parse(message);
        let table = ''
        switch(values.name){
            case 'LIGHT' : table = 'light';break;
            case 'SOIL' : table = 'moisture';break;
            case 'TEMP-HUMID' : table = 'temperature';break;
            default : break;
        }
        
        const sqlSelect = "INSERT `"+table+"` (`inputId`,`record`) VALUES ("+parseInt(values.id)+","+parseInt(values.data)+")";
        database.query(sqlSelect, (err, result) => {
            if (err) {
                console.log(err);
            }
            console.log('Insert success')
        });

        socket.emit("feedFromServer", {
            topic: topic,
            data: message.toString(),
        });

        // đóng kết nối của client
        // client.end();
    });

    socket.on("changeFeedData", (patternData) => {
        /* data has this format */
        // const patternData = `{
        //     "topic":"quan260402/feeds/bk-iot-led",
        //     "message":{
        //         "id":1,
        //         "name":"LED",
        //         "data":911,
        //         "unit":""
        //     }
        // }`;

        try {
            const data = JSON.parse(patternData);
            client.publish(data.topic, JSON.stringify(data.message));
        } catch (err) {
            console.log(err);
        }
    });
});

app.get("/getAllFeeds", (req, res) => {
    axios
        .get(`https://io.adafruit.com/api/v2/quan260402/feeds`)
        .then((res1) => res.send(res1.data))
        .catch((err) => console.log(err, "err"));
});

app.get("/", (req, res) => {
    console.log("SERVER connected");
});

server.listen(PORT, () => console.log(`Listening on port ${PORT}`));

// ----------------------------------
