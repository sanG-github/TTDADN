const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const http = require("http");
const axios = require("axios");
const mqtt = require("mqtt");
const socket = require("socket.io");
const { getDate } = require("date-fns");
const mysql = require("mysql");
const bcrypt = require("bcrypt");

require("dotenv").config();

const PORT = 3001;
const app = express();
const saltRounds = 10;

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
// app.use(cors({ origin: "http://localhost:3000" }));
app.use(
    cors({
        origin: ["http://localhost:3000"],
        methods: ["GET", "POST"],
        credentials: true,
    })
);
app.use(
    session({
        key: "userId",
        secret: "subscribe",
        resave: false,
        saveUninitialized: false,
        cookie: {
            expires: 60 * 60 * 24 * 1000,
        },
    })
);

//Connect database
const database = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "quan0402",
    database: "DADN",
});

app.get("/statistic/temperature",(req,res)=>{
    var sqlSelect = ""
    console.log(req.query)
    if(req.query){

        var from = req.query.from.split(' ')
        var to = req.query.to.split(' ')
        var start = [from[1],from[2],from[3]].join(' ')
        var end = [to[1],to[2],to[3]].join(' ')

        sqlSelect = `SELECT AVG(record) as record,day(datetime) as date FROM DADN.temperature WHERE datetime >= str_to_date('${start}','%M %d %Y') AND datetime <= str_to_date('${end}','%M %d %Y') GROUP BY day(datetime) ORDER BY day(datetime) `;
    }
    else {
        sqlSelect = "SELECT AVG(record) as record,day(datetime) as date FROM DADN.temperature GROUP BY day(datetime) GROUP BY day(datetime) ORDER BY day(datetime)";
    }
    database.query(sqlSelect, (err, result) => {
      if (err) {
        console.log(err);
      }
      res.send(result);
    });
})

app.get("/statistic/moisture",(req,res)=>{
    var sqlSelect = ""
    console.log(req.query)
    if(req.query){

        var from = req.query.from.split(' ')
        var to = req.query.to.split(' ')
        var start = [from[1],from[2],from[3]].join(' ')
        var end = [to[1],to[2],to[3]].join(' ')

        sqlSelect = `SELECT AVG(record) as record,day(datetime) as date FROM DADN.moisture WHERE datetime >= str_to_date('${start}','%M %d %Y') AND datetime <= str_to_date('${end}','%M %d %Y') GROUP BY day(datetime) ORDER BY day(datetime)`;
    }
    else {
        sqlSelect = "SELECT AVG(record) as record,day(datetime) as date FROM DADN.moisture GROUP BY day(datetime) ORDER BY day(datetime)";
    }
   
    database.query(sqlSelect, (err, result) => {
      if (err) {
        console.log(err);
      }
      res.send(result);
    });
})

app.get("/statistic/humidity",(req,res)=>{
    var sqlSelect = ""
    console.log(req.query)
    if(req.query){

        var from = req.query.from.split(' ')
        var to = req.query.to.split(' ')
        var start = [from[1],from[2],from[3]].join(' ')
        var end = [to[1],to[2],to[3]].join(' ')

        sqlSelect = `SELECT AVG(record) as record,day(datetime) as date FROM DADN.humidity WHERE datetime >= str_to_date('${start}','%M %d %Y') AND datetime <= str_to_date('${end}','%M %d %Y') GROUP BY day(datetime) ORDER BY day(datetime)`;
    }
    else {
        sqlSelect = "SELECT AVG(record) as record,day(datetime) as date FROM DADN.humidity GROUP BY day(datetime) ORDER BY day(datetime)";
    }
   
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

app.get("/humidity", (req, res) => {
    const sqlSelect = "SELECT * FROM `humidity`";
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
    if (!req.query.type) {
        sqlSelect = "SELECT * FROM `constrain`";
    } else {
        sqlSelect =
            "SELECT * FROM `constrain` WHERE `type` = '" + req.query.type + "'";
        console.log(sqlSelect);
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
        type: req.body.type,
        upper_bound: req.body.upper_bound,
        lower_bound: req.body.lower_bound,
    };

    const sqlUpdate = `UPDATE constrain SET lower-bound = ${values.lower_bound}, upper-bound  = ${values.upper_bound} WHERE type = '${values.type}'`;
    console.log(sqlUpdate);
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
var client, client2;
// MQTT
// Update Key
async function updateClient() {
    await axios.get("http://dadn.esp32thanhdanh.link/").then((res) => {
        const options = {
            port: process.env.PORT,
            host: process.env.HOST,
            username: process.env.USERX,
            password: res.data.keyBBC,
        };

        const options2 = {
            port: process.env.PORT,
            host: process.env.HOST,
            username: process.env.USERX_02,
            password: res.data.keyBBC1,
        };

        console.log(options)
        console.log(options2)


        client = mqtt.connect("mqtt://" + options.host, options);

        client2 = mqtt.connect("mqtt://" + options2.host, options2);

        client.on("connect", function () {
            console.log("mqtt: server CSE_BBC connected!");
        });

        client2.on("connect", function () {
            console.log("mqtt: server CSE_BBC1 connected!");
        });
    });
}

updateClient();

axios.get(`https://io.adafruit.com/api/v2/CSE_BBC/feeds`).then((res) => {
    const feeds = res.data;
    console.log(`----------------------\nAll feeds from ${process.env.USERX}:`);
    feeds.map((feed) => {
        console.log("\t", feed.name);
        client.subscribe(process.env.USERX + "/feeds/" + feed.name);
    });
});

axios.get(`https://io.adafruit.com/api/v2/CSE_BBC1/feeds`).then((res) => {
    const feeds = res.data;
    console.log(
        `----------------------\nAll feeds from ${process.env.USERX_02}:`
    );
    feeds.map((feed) => {
        console.log("\t", feed.name);
        client2.subscribe(process.env.USERX_02 + "/feeds/" + feed.name);
    });
});

io.on("connection", (socket) => {
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
            case 'LIGHT' : table = 'light';break;
            default : break;
        } 
        
        if(table != ''){
            if(table == 'temperature'){
                var records = values.data.split('-');
                const sqlSelect1 = "INSERT `"+table+"` (`inputId`,`record`) VALUES ("+parseInt(values.id)+","+parseInt(records[0])+")";
                const sqlSelect2 = "INSERT `humidity` (`inputId`,`record`) VALUES ("+parseInt(values.id)+","+parseInt(records[1])+")";
                database.query(sqlSelect1, (err, result) => {
                    if (err) {
                        console.log(err);
                    }
                    console.log('Insert success')
                });
                database.query(sqlSelect2, (err, result) => {
                    if (err) {
                        console.log(err);
                    }
                    console.log('Insert success')
                });
            }
            else {
                const sqlSelect = "INSERT `"+table+"` (`inputId`,`record`) VALUES ("+parseInt(values.id)+","+parseInt(values.data)+")";
                database.query(sqlSelect, (err, result) => {
                    if (err) {
                        console.log(err);
                    }
                    console.log('Insert success')
                });
            } 
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
            console.log(JSON.parse(patternData));
            if (data.message.name === "RELAY") {
                client2.publish(data.topic, JSON.stringify(data.message));
            } else {
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

app.post("/api/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const password2 = req.body.password2;

    if (password === password2)
        database.query(
            "SELECT * FROM users WHERE username = ?;",
            username,
            (err, result) => {
                if (err) {
                    res.send({ message: err });
                }

                if (result.length > 0) {
                    res.send({ message: "Username existed!" });
                } else {
                    bcrypt.hash(password, saltRounds, (err, hash) => {
                        if (err) {
                            console.log(err);
                        }

                        database.query(
                            "INSERT INTO users (username, password) VALUES (?,?)",
                            [username, hash],
                            (err, result) => {
                                if (err) console.log(err);
                                else res.send(result);
                            }
                        );
                    });
                }
            }
        );
    else res.send({ message: "Password confirm doesnt match!" });
});

app.get("/api/login", (req, res) => {
    if (req.session.token) {
        res.send({ loggedIn: true, user: req.session.token });
    } else {
        res.send({ loggedIn: false });
    }
});

app.post("/api/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    database.query(
        "SELECT * FROM users WHERE username = ?;",
        username,
        (err, result) => {
            if (err) {
                res.send({ err: err });
            }

            if (result.length > 0) {
                bcrypt.compare(
                    password,
                    result[0].password,
                    (error, response) => {
                        if (response) {
                            req.session.token = "abc" + result[0].password;
                            // console.log(req.session.token);
                            res.send(result);
                        } else {
                            res.send({
                                message: "Wrong username/password combination!",
                            });
                        }
                    }
                );
            } else {
                res.send({ message: "User doesn't exist" });
            }
        }
    );
});

app.get("/api/logout", (req, res) => {
    req.session.destroy(null);
    res.clearCookie("userId");
    res.send({ message: "logout" });
});

server.listen(PORT, () => console.log(`Listening on port ${PORT}`));

// ----------------------------------
