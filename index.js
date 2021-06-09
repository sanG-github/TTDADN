const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");

const http = require("http");

const axios = require("axios");
const mqtt = require("mqtt");
const socket = require("socket.io");
const mysql = require("mysql");
const bcrypt = require("bcrypt");

const admin = require("firebase-admin");
const serviceAccount = require("./smarttomatofarm-firebase-adminsdk-j0civ-24e81aa790.json");
const registrationToken =
  "ceYpnIiuTSy3dR_dzjBQ1R:APA91bHS7ZELu_e8AxiVXAxCMrDsRibAztzb8_G9iT8zFbj-GKgNKbm4GeegSq4oFbIlRbVNL9Jm4FpDmQnnECh_HXBQLRkPp-lw8679elSgRL_pSHz8MpFsoejn9-zpy1ocPkHpsp9F";
const messageDeviceIot = require("./message-device-iot.json");
const alertEvents = require("events");
const alertEmitter = new alertEvents.EventEmitter();

const e = require("express");
const { stat } = require("fs");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

require("dotenv").config();

const PORT = 3001;
const app = express();
const saltRounds = 10;

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
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
  password: "victory",
  database: "company",
});

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

  constrain[values.type].upper_bound = values.upper_bound;
  constrain[values.type].lower_bound = values.lower_bound;
  console.log(constrain[values.type]);
});

// Socket setup
const server = http.createServer(app);
const io = socket(server);
var client, client2;

// MQTT
// Update Key
async function updateClient() {
  const options = {
    port: process.env.PORT,
    host: process.env.HOST,
    username: process.env.USERX_LDQ,
    password: process.env.KEY_LDQ,
  };
  client = mqtt.connect("mqtt://" + options.host, options);
  client.on("connect", function () {
    console.log("mqtt: server CSE_BBC connected!");
  });
  client2 = mqtt.connect("mqtt://" + options.host, options);
  client2.on("connect", function () {
    console.log("mqtt: server CSE_BBC connected!");
  });

  // await axios.get("http://dadn.esp32thanhdanh.link/").then((res) => {
  //   const options = {
  //     port: process.env.PORT,
  //     host: process.env.HOST,
  //     username: process.env.USERX,
  //     password: res.data.keyBBC,
  //   };

  //   const options2 = {
  //     port: process.env.PORT,
  //     host: process.env.HOST,
  //     username: process.env.USERX_02,
  //     password: res.data.keyBBC1,
  //   };

  //   client = mqtt.connect("mqtt://" + options.host, options);

  //   client2 = mqtt.connect("mqtt://" + options2.host, options2);

  //   client.on("connect", function () {
  //     console.log("mqtt: server CSE_BBC connected!");
  //   });

  //   client2.on("connect", function () {
  //     console.log("mqtt: server CSE_BBC1 connected!");
  //   });
  // });
}

updateClient();

axios.get(`https://io.adafruit.com/api/v2/quanledinh/feeds`).then((res) => {
  const feeds = res.data;
  console.log(`----------------------\nAll feeds from ${process.env.USERX}:`);
  feeds.map((feed) => {
    console.log("\t", feed.name);
    client.subscribe(process.env.USERX_LDQ + "/feeds/" + feed.name);
    client2.subscribe(process.env.USERX_LDQ + "/feeds/" + feed.name);
  });
  alertEmitter.emit("clientready");
});

// axios.get(`https://io.adafruit.com/api/v2/CSE_BBC1/feeds`).then((res) => {
//   const feeds = res.data;
//   console.log(
//     `----------------------\nAll feeds from ${process.env.USERX_02}:`
//   );
//   feeds.map((feed) => {
//     console.log("\t", feed.name);
//     client2.subscribe(process.env.USERX_02 + "/feeds/" + feed.name);
//   });
//   alertEmitter.emit("client2ready");
// });

alertEmitter.on("clientready", () => {
  client.on("message", function (topic, message) {
    const values = JSON.parse(message);
    let table = "";
    console.log(
      "----------------------\nTopic: ",
      topic,
      "\nMessage: ",
      message.toString()
    );
    switch (values.name) {
      case "SOIL":
        table = "moisture";
        break;
      case "TEMP-HUMID":
        table = "temperature";
        break;
      case "LIGHT":
        table = "light";
        break;
      default:
        break;
    }
    if (table != "") {
      console.log(
        "----------------------\nTopic: ",
        topic,
        "\nMessage: ",
        message.toString()
      );
      console.log("--------State");
      console.log(state);

      if (state.alertState == "empty") {
        checkConstrain(table, values.data);
      }
      if (state.alertState == "processing") {
        checkToCompleteTask(table, values.data);
      }
    }
  });
});

alertEmitter.on("client2ready", () => {
  client2.on("message", function (topic, message) {
    const values = JSON.parse(message);
    let table = "";
    switch (values.name) {
      case "LIGHT":
        table = "light";
        break;
      default:
        break;
    }
    if (table != "") {
      console.log(
        "----------------------\nTopic: ",
        topic,
        "\nMessage: ",
        message.toString()
      );
      console.log("--------State");
      console.log(state);
      if (state.active){
        if (state.alertState == "empty") {
          checkConstrain(table, values.data);
        }
        if (state.alertState == "processing") {
          checkToCompleteTask(table, values.data);
        }
      }
      
    }
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

    console.log(JSON.parse(message));
    const values = JSON.parse(message);
    let table = "";
    switch (values.name) {
      case "SOIL":
        table = "moisture";
        break;
      case "TEMP-HUMID":
        table = "temperature";
        break;
      default:
        break;
    }

    if (table != "") {
      const sqlSelect =
        "INSERT `" +
        table +
        "` (`inputId`,`record`) VALUES (" +
        parseInt(values.id) +
        "," +
        parseInt(values.data) +
        ")";
      database.query(sqlSelect, (err, result) => {
        if (err) {
          console.log(err);
        }
        console.log("Insert success");
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
    console.log(
      "----------------------\nTopic: ",
      topic,
      "\nMessage: ",
      message.toString()
    );

    console.log(JSON.parse(message));
    const values = JSON.parse(message);
    let table = "";
    switch (values.name) {
      case "LIGHT":
        table = "light";
        break;
      default:
        break;
    }

    const sqlSelect =
      "INSERT `" +
      table +
      "` (`inputId`,`record`) VALUES (" +
      parseInt(values.id) +
      "," +
      parseInt(values.data) +
      ")";
    database.query(sqlSelect, (err, result) => {
      if (err) {
        console.log(err);
      }
      console.log("Insert success");
    });

    socket.emit("feedFromServer2", {
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
        bcrypt.compare(password, result[0].password, (error, response) => {
          if (response) {
            req.session.token = "abc" + result[0].password;
            // console.log(req.session.token);
            res.send(result);
          } else {
            res.send({
              message: "Wrong username/password combination!",
            });
          }
        });
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

//------------

var constrain = {
  moisture: {
    upper_bound: 105,
    lower_bound: 95,
  },
  temperature: {
    upper_bound: 32,
    lower_bound: 28,
  },
  light: {
    upper_bound: 100,
    lower_bound: 100,
  },
  humid: {
    upper_bound: 55,
    lower_bound: 50,
  },
};

const mLowerBound = "lower_bound";
const mUpperBound = "upper_bound";

async function loadConstrain() {
  let sqlSelect = "SELECT * FROM `constrain` WHERE type = ";
  var re;
  database.query(sqlSelect, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      console.log(result);
      re = JSON.parse(result);
    }
  });

  // for (let index = 0; index < re.length; index++) {
  //   let cur = re[index];
  //   constrain[cur.type].upper_bound = cur['upper-bound'];
  //   constrain[cur.type].lower_bound = cur['lower-bound'];
  // }
  console.log(constrain);
}

//loadConstrain();

function checkToCompleteTask(type, data) {
  console.log("======= \n checkToCompleteTask");
  console.log("state[" + type + "]");
  if (type == "temperature") {
    let datath = data.split("-");
    let dtemperature = parseInt(datath[0]);
    let dhumid = parseInt(datath[1]);
    if (state.temperature != "") {
      if (
        dtemperature <= constrain.temperature.upper_bound &&
        dtemperature >= constrain.temperature.lower_bound
      )
      completetask();
      return;
    }
    if (state.humid != "") {
      if (
        dhumid <= constrain.humid.upper_bound &&
        dhumid >= constrain.humid.lower_bound
      ){
        completetask();
        console.log("check complete ok")
      }
      
      return;
    }
  }
  else{
    if (state[type] != "") {
      let dataint = parseInt(data);
      if (
        dataint <= constrain[type].upper_bound &&
        dataint >= constrain[type].lower_bound
      )
      completetask();
    }
  }
}

function checkConstrain(type, data) {
  console.log("---- checkconstrain");
  let flag = false;
  if (type == "temperature") {
    let datath = data.split("-");
    let dtemperature = parseInt(datath[0]);
    let dhumid = parseInt(datath[1]);

    if (constrain.temperature.lower_bound > dtemperature) {
      state.temperature = mLowerBound;
      flag = true;
    } else if (constrain.temperature.upper_bound < dtemperature) {
      state.temperature = mUpperBound;
      flag = true;
    }

    if (constrain.humid.lower_bound > dhumid) {
      state.humid = mLowerBound;
      flag = true;
    } else if (constrain.humid.upper_bound < dhumid) {
      state.humid = mUpperBound;
      flag = true;
    }
  } else {
    if (constrain[type].lower_bound > parseInt(data)) {
      state[type] = mLowerBound;
      flag = true;
    } else if (constrain[type].upper_bound < parseInt(data)) {
      state[type] = mUpperBound;
      flag = true;
    }
  }
  console.log(state);
  if (
    state.moisture == mUpperBound ||
    state.temperature != "" ||
    state.humid == mLowerBound
  ) {
    console.log("---\ncheck cannotHanlde");
    alertEmitter.emit("cannotHandle");
  } else if (flag) {
    console.log("---\ncheck handle");
    console.log(state);
    alertEmitter.emit("handle");
  }
}

//test sendmessage
app.get("/api/sendmessage", (req, res) => {
  state.isAlert = true;
  sendMessageAlert(messageAlert);
});

/////--------------------------

async function sendFCM(message) {
  admin
    .messaging()
    .send(message)
    .then((response) => {
      // Response is a message ID string.
      console.log("Successfully sent message:", response);
    })
    .catch((error) => {
      console.log("Error sending message:", error);
    });
  console.log("-----------\nsendfcm");
}

var state = {
  active: true,
  alertState: "empty",
  moisture: "",
  humid: "",
  temperature: "",
  light: "",
};

var alertTimeOut;

alertEmitter.on("cannotHandle", () => {
  console.log("-------cannotHandle");
  client.publish(
    messageDeviceIot.LoaBuzzer.feed,
    messageDeviceIot.LoaBuzzer.activate
  );
  state.alertState = "pending";
  let m = {
    data: {
      title: "Tình trạng khu vườn không tốt",
      body: "Hiện tại chúng tôi không thể cải thiện.",
      detail:
        "Hiện tại, chúng tôi không thể cải thiện tình trạng của khu vườn. Hãy kiểm tra khu vườn ngay.",
      alert: "cannotHandle",
      id: "dadn",
      moisture: state.moisture,
      temperature: state.temperature,
      light: state.light,
      humid: state.humid,
    },
    token: registrationToken,
  };
  sendFCM(m);
});
alertEmitter.on("handle", () => {
  console.log("handle");
  client.publish(
    messageDeviceIot.LoaBuzzer.feed,
    messageDeviceIot.LoaBuzzer.activate
  );
  state.alertState = "pending";
  let m = {
    data: {
      title: "Tình trạng khu vườn không tốt",
      body: "Hãy xác nhận công tác điều chỉnh.",
      detail:
        "Chúng tôi sẽ thực hiện công tác điều chỉnh nếu bạn không xác nhận trong 5 phút.",
      alert: "alert",
      id: "dadn",
      moisture: state.moisture,
      temperature: state.temperature,
      light: state.light,
      humid: state.humid,
    },
    token: registrationToken,
  };
  sendFCM(m);
  console.log(state);
  alertTimeOut = setTimeout(() => {
    if (state.alertState == "pending") {
      client.publish(
        messageDeviceIot.LoaBuzzer.feed,
        messageDeviceIot.LoaBuzzer.deactive
      );
      runTask();
    }
  }, 1000 * 10);
});
app.get("/api/activatealert", (req,res)=>{
  res.json({
    active: state.active
  })
})
app.post("/api/activatealert", (req, res)){
  if(req.body.activate == "true"){
    state.active = true
  }
  else{
    state.active = false
  }
  res.json(
    {
      active: state.active
    }
  )
}
app.post("/api/receiveresponefromapp", (req, res) => {
  client.publish(
    messageDeviceIot.LoaBuzzer.feed,
    messageDeviceIot.LoaBuzzer.deactive
  );
  console.log("-----receiveresponefromapp");
  console.log("body.action: " + req.body.action);
  if(state.alertState=="pending"){
    if (req.body.action == "acceptTask") {
      console.log("acceptTask");
      res.json({ id: req.body.id, status: "processing" });
      runTask();
      return;
    }
    if (req.body.action == "cancelTask") {
      res.json({ id: req.body.id, status: "rejected" });
      console.log("rejected");
      cancelTask();
      return;
    }
    if (req.body.action == "cannotHandle") {
      res.json({ id: req.body.id, status: "rejected" });
      cannotHandle();
      return;
    }
  }
  else{
    res.json({id: "", status: ""})
  }
  
});

function runTask() {
  state.alertState = "processing";
  clearTimeout(alertTimeOut);
  console.log("=======");
  console.log("runTask");
  console.log(state);
  console.log("=======");
  let m = {
    data: {
      alert: "processing",
      id: "dadn",
    },
    token: registrationToken,
  };
  sendFCM(m);
  if (state.moisture == mLowerBound) {
    client2.publish(
      messageDeviceIot.MayBomMini.feed,
      messageDeviceIot.MayBomMini.activate
    );
  }
  if (state.humid == mUpperBound) {
    client.publish(
      messageDeviceIot.CanhQuat.feed,
      messageDeviceIot.CanhQuat.activate
    );
  }
  if (state.light == mUpperBound) {
    client2.publish(
      messageDeviceIot.MaiChe.feed,
      messageDeviceIot.MaiChe.activate
    );
  }
  if (state.light == mLowerBound) {
    client2.publish(
      messageDeviceIot.MaiChe.feed,
      messageDeviceIot.MaiChe.deactive
    );
  }
}

function completetask() {
  let m = {
    data: {
      alert: "taskCompleted",
    },
    token: registrationToken,
  };
  sendFCM(m);
  if (state.moisture == mLowerBound) {
    client2.publish(
      messageDeviceIot.MayBomMini.feed,
      messageDeviceIot.MayBomMini.deactivate
    );
  }
  if (state.humid == mUpperBound) {
    client.publish(
      messageDeviceIot.CanhQuat.feed,
      messageDeviceIot.CanhQuat.deactive
    );
  }
  resetState();
}

async function resetState() {
  state.alertState = "empty";
  state.moisture = "";
  state.temperature = "";
  state.light = "";
  state.humid = "";
}

async function cancelTask() {
  let m = {
    data: {
      alert: "taskCanceled",
    },
    token: registrationToken,
  };
  //sendFCM(m);
  state.alertState = "cancel";
  setTimeout(() => {
    resetState();
  }, 1000 * 20);
}

async function cannotHandle() {
  let m = {
    data: {
      alert: "taskCanceled",
    },
    token: registrationToken,
  };
  //sendFCM(m);
  state.alertState = "cannotHandle";
  setTimeout(() => {
    resetState();
  }, 1000 * 10);
}

//alertEmitter.on("runTask", runTask);

server.listen(PORT, () => console.log(`Listening on port ${PORT}`));

// ----------------------------------
