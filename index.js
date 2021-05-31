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

app.get("/statistic/temperature",(req,res)=>{
    const sqlSelect = "SELECT AVG(record) as record,day(datetime) as date FROM DADN.temperature GROUP BY day(datetime)";
    database.query(sqlSelect, (err, result) => {
      if (err) {
        console.log(err);
      }
      res.send(result);
    });
})

app.get("/statistic/moisture",(req,res)=>{
    const sqlSelect = "SELECT AVG(record) as record,day(datetime) as date FROM DADN.moisture GROUP BY day(datetime)";
    database.query(sqlSelect, (err, result) => {
      if (err) {
        console.log(err);
      }
      res.send(result);
    });
})

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

app.get("/constrain", (req, res) => {
    let sqlSelect = "";
    if(!req.query.type){
       sqlSelect = "SELECT * FROM `constrain`";
    }
    else {
        sqlSelect = "SELECT * FROM `constrain` WHERE `type` = '"+req.query.type+"'";
        console.log(sqlSelect)
    }
    
    database.query(sqlSelect, (err, result) => {
      if (err) {
        console.log(err);
      }
      res.send(result);
    });
});

app.post("/setConstrain", (req, res) => {

    const values = {
        type : req.body.type,
        upper_bound : req.body.upper_bound,
        lower_bound : req.body.lower_bound,
    }

    const sqlUpdate =
    `UPDATE constrain SET lower-bound = ${values.lower_bound}, upper-bound  = ${values.upper_bound} WHERE type = '${values.type}'`;
    console.log(sqlUpdate)
    // database.query(
    //     sqlInsert,(err, result) => {
    //     if (err) console.log(err);
    //     else console.log("success");
    //     }
    // );
});


// Socket setup
const server = http.createServer(app);
const server2 = http.createServer(app);

const io = socket(server);
const io2 = socket(server2);

// MQTT


const options = {
    port: process.env.PORT,
    host: process.env.HOST,
    username: process.env.USERX,
    password: process.env.KEY,
};

const options2 = {
    port: process.env.PORT,
    host: process.env.HOST,
    username: process.env.USERX_02,
    password: process.env.KEY_02,
};

var client = mqtt.connect("mqtt://" + options.host, options);

var client2 = mqtt.connect("mqtt://" + options2.host, options2);

client.on("connect", function () {
    console.log("mqtt: server CSE_BBC connected!");
});

client2.on("connect", function () {
    console.log("mqtt: server CSE_BBC1 connected!");
});

axios.get(`https://io.adafruit.com/api/v2/CSE_BBC/feeds`).then((res) => {
    const feeds = res.data;
    console.log(`----------------------\nAll feeds:`);
    feeds.map((feed) => {
        console.log("\t", feed.name);
        client.subscribe(process.env.USERX + "/feeds/" + feed.name);
    });
});

axios.get(`https://io.adafruit.com/api/v2/CSE_BBC1/feeds`).then((res) => {
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
        console.log("Message from server CSE_BBC");

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
            case 'SOIL' : table = 'moisture';break;
            case 'TEMP-HUMID' : table = 'temperature';break;
            default : break;
        }
        
        if(table != ''){
            const sqlSelect = "INSERT `"+table+"` (`inputId`,`record`) VALUES ("+parseInt(values.id)+","+parseInt(values.data)+")";
            database.query(sqlSelect, (err, result) => {
                if (err) {
                    console.log(err);
                }
                console.log('Insert success')
            });
        }
        

        socket.emit("feedFromServer", {
            topic: topic,
            data: message.toString(),
        });

        // đóng kết nối của client
        // client.end();
    });

    client2.on("message", function (topic, message) {
        // in ra màn hình console 1 message ở định dạng string

        console.log("Message from server CSE_BBC1");
        
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
            case 'SOIL' : table = 'moisture';break;
            case 'TEMP-HUMID' : table = 'temperature';break;
            default : break;
        }
        
        if(table != ''){
            const sqlSelect = "INSERT `"+table+"` (`inputId`,`record`) VALUES ("+parseInt(values.id)+","+parseInt(values.data)+")";
            database.query(sqlSelect, (err, result) => {
                if (err) {
                    console.log(err);
                }
                console.log('Insert success')
            });
        }
        

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
            console.log(JSON.parse(patternData))
            if(data.message.name === 'RELAY'){
                client2.publish(data.topic, JSON.stringify(data.message));
            }
            else {
                client.publish(data.topic, JSON.stringify(data.message));
            }
            
        } catch (err) {
            console.log(err);
        }
    });
});



app.get("/getAllFeeds", (req, res) => {
    axios
        .get(`https://io.adafruit.com/api/v2/CSE_BBC/feeds`)
        .then((res1) => res.send(res1.data))
        .catch((err) => console.log(err, "err"));
});

app.get("/", (req, res) => {
    console.log("SERVER connected");
});

server.listen(PORT, () => console.log(`Listening on port ${PORT}`));

// ----------------------------------
