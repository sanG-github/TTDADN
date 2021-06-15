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
const { response } = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");

require("dotenv").config();

const PORT = 3001;
const app = express();
const saltRounds = 10;

//Swagger
const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: "Library API",
      version: "1.0.0",
    },
  },
  apis: ["index.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Using middleware
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
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

app.get("/statistic/:type", (req, res) => {
  const type = req.params.type;
  var sqlSelect = "";
  if (req.query) {
    var from = req.query.from.split(" ");
    var to = req.query.to.split(" ");
    var start = [from[1], from[2], from[3]].join(" ");
    var end = [to[1], to[2], to[3]].join(" ");

    sqlSelect = `SELECT AVG(record) as record,day(datetime) as date FROM DADN.${type} WHERE datetime >= str_to_date('${start}','%M %d %Y') AND datetime <= str_to_date('${end}','%M %d %Y') GROUP BY day(datetime) ORDER BY day(datetime) `;
  } else {
    sqlSelect = `SELECT AVG(record) as record,day(datetime) as date FROM DADN.${type} GROUP BY day(datetime) GROUP BY day(datetime) ORDER BY day(datetime)`;
  }
  database.query(sqlSelect, (err, result) => {
    if (err) {
      console.log(err);
    }
    res.send(result);
  });
});

/**
 * @swagger
 * /device:
 *  get:
 *      description: GET all devices
 *      responses:
 *          200:
 *              description: Success
 */

app.get("/device", (req, res) => {
  const sqlSelect = "SELECT * FROM `device`";
  database.query(sqlSelect, (err, result) => {
    if (err) {
      console.log(err);
    }
    res.send(result);
  });
});

/**
 * @swagger
 * /record/{type} :
 *  get:
 *      description: GET all [TYPE] records from database.
 *      parameters:
 *      - name: type
 *        in : path
 *        description: light | temperature | moisture | humidity
 *        type: String
 *      responses:
 *          200:
 *              description: Success
 */

app.get("/record/:type", (req, res) => {
  const type = req.params.type;
  const sqlSelect = `SELECT * FROM DADN.${type}`;
  database.query(sqlSelect, (err, result) => {
    if (err) {
      console.log(err);
    }
    res.send(result);
  });
});

/**
 * @swagger
 * /constrain/{type}:
 *  get:
 *      description: GET all [TYPE] records.
 *      parameters:
 *      - name: type
 *        in : path
 *        description: light | temperature | moisture | humidity
 *        type: String
 *      responses:
 *          200:
 *              description: Success
 */

app.get("/constrain/:type", (req, res) => {
  let sqlSelect =
    "SELECT * FROM `constrain` WHERE `type` = '" + req.params.type + "'";
  database.query(sqlSelect, (err, result) => {
    if (err) {
      console.log(err);
    }
    res.send(result);
  });
});

/**
 * @swagger
 * /constrain:
 *  get:
 *      description: GET all constrains
 *      responses:
 *          200:
 *              description: Success
 */

app.get("/constrain", (req, res) => {
  let sqlSelect = "SELECT * FROM `constrain`";
  database.query(sqlSelect, (err, result) => {
    if (err) {
      console.log(err);
    }
    res.send(result);
  });
});

/**
 * @swagger
 * /setConstrain:
 *  post:
 *      description: POST new constrain to update.
 *      parameters:
 *      - name: item
 *        in: body
 *        required: true
 *        schema:
 *           type: object
 *           properties:
 *               id:
 *                   type: integer
 *               type:
 *                   type: string
 *               upper_bound:
 *                   type: integer
 *               lower_bound:
 *                   type: integer
 *           example:
 *                id: 0
 *                type: light
 *                upper_bound: 850
 *                lower_bound: 650
 *      responses:
 *          200:
 *              description: Success
 */

app.post("/setConstrain", (req, res) => {
  console.log();
  const values = {
    type: req.body.type,
    upper_bound: parseInt(req.body.upper_bound),
    lower_bound: parseInt(req.body.lower_bound),
  };
  const sqlUpdate = `UPDATE DADN.constrain SET lower_bound = ${values.lower_bound}, upper_bound  = ${values.upper_bound} WHERE type = '${values.type}'`;
  console.log(sqlUpdate);
  database.query(sqlUpdate, (err, result) => {
    if (err) console.log(err);
    else {
      console.log("success");
      res.sendStatus(200);
    }
  });
  loadConstrain();
});

/**
 * @swagger
 * /currentFigure:
 *  get:
 *      description: GET last value of all type's record.
 *      responses:
 *          200:
 *              description: Success
 */

app.get("/currentFigure", async (req, res) => {
  let light, moisture, temp, humidity;

  await axios
    .all([
      axios.get("https://io.adafruit.com/api/v2/CSE_BBC1/feeds/bk-iot-light"),
      axios.get("https://io.adafruit.com/api/v2/CSE_BBC/feeds/bk-iot-soil"),
      axios.get(
        "https://io.adafruit.com/api/v2/CSE_BBC/feeds/bk-iot-temp-humid"
      ),
    ])
    .then(
      axios.spread((lightRes, moistureRes, temp_humRes) => {
        // do something with three responses
        var values = JSON.parse(temp_humRes.data.last_value);
        light = JSON.parse(lightRes.data.last_value).data;
        moisture = JSON.parse(moistureRes.data.last_value).data;
        temp = values.data.split("-")[0];
        humidity = values.data.split("-")[1];
      })
    );

  res.send({ light, moisture, temp, humidity });
});

// Socket setup
const server = http.createServer(app);
const io = socket(server);
// MQTT
// Update Key
var client, client2;

async function updateClient() {
  await axios.get("http://dadn.esp32thanhdanh.link/").then((res) => {
    const options = {
      port: process.env.PORT,
      host: process.env.HOST,
      username: process.env.USERX,
      password: "aio_YWqQ75LLnzE66cGrbMWNhCka1Xhb",
    };

    const options2 = {
      port: process.env.PORT,
      host: process.env.HOST,
      username: process.env.USERX_02,
      password: "aio_byWm36bA6XUDSqPfCfVboXjt3Uf1",
    };

    // console.log(options);
    // console.log(options2);

    client = mqtt.connect("mqtt://" + options.host, options);

    client2 = mqtt.connect("mqtt://" + options2.host, options2);

    client.on("connect", function () {
      console.log("mqtt: server CSE_BBC connected!");
    });

    client2.on("connect", function () {
      console.log("mqtt: server CSE_BBC1 connected!");
    });
  });

  // axios.get(`https://io.adafruit.com/api/v2/CSE_BBC/feeds`).then((res) => {
  //     const feeds = res.data;
  //     console.log(
  //         `----------------------\nAll feeds from ${process.env.USERX}:`
  //     );
  //     feeds.map((feed) => {
  //         console.log("\t", feed.name);
  //         client.subscribe(process.env.USERX + "/feeds/" + feed.name);
  //     });
  //    alertEmitter.emit("clientready");
  // });

  // axios.get(`https://io.adafruit.com/api/v2/CSE_BBC1/feeds`).then((res) => {
  //     const feeds = res.data;
  //     console.log(
  //         `----------------------\nAll feeds from ${process.env.USERX_02}:`
  //     );
  //     feeds.map((feed) => {
  //         console.log("\t", feed.name);
  //         client2.subscribe(process.env.USERX_02 + "/feeds/" + feed.name);
  //     });
  //     alertEmitter.emit("client2ready");  
  // });

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
      if (table == "temperature") {
        var records = values.data.split("-");
        const sqlSelect1 =
          "INSERT `" +
          table +
          "` (`inputId`,`record`) VALUES (" +
          parseInt(values.id) +
          "," +
          parseInt(records[0]) +
          ")";
        const sqlSelect2 =
          "INSERT `humidity` (`inputId`,`record`) VALUES (" +
          parseInt(values.id) +
          "," +
          parseInt(records[1]) +
          ")";
        database.query(sqlSelect1, (err, result) => {
          if (err) {
            console.log(err);
          }
          console.log("Insert success");
        });
        database.query(sqlSelect2, (err, result) => {
          if (err) {
            console.log(err);
          }
          console.log("Insert success");
        });
      } else {
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
    }

    ioSocket &&
      ioSocket.emit("feedFromServer", {
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

    ioSocket &&
      ioSocket.emit("feedFromServer2", {
        topic: topic,
        data: message.toString(),
      });

    // đóng kết nối của client
    // client.end();
  });
}
var ioSocket;

io.on("connection", (socket) => {
  console.log("socketIO: new client connected ");

  socket.on("changeFeedData", (patternData) => {
    try {
      const data = JSON.parse(patternData);
      console.log(JSON.parse(patternData));
      if (data.message.name === "RELAY" || data.message.name == "LIGHT") {
        client2.publish(data.topic, JSON.stringify(data.message));
        console.log("Publish success");
      } else {
        client.publish(data.topic, JSON.stringify(data.message));
        console.log("Publish success");
      }
    } catch (err) {
      console.log(err);
    }
  });

  ioSocket = socket;
});

/**
 * @swagger
 * /getAllFeeds:
 *  get:
 *      description: GET all feeds of Adafruit IoT
 *      responses:
 *          200:
 *              description: Success
 */

app.get("/getAllFeeds", (req, res) => {
  axios
    .get(`https://io.adafruit.com/api/v2/CSE_BBC/feeds`)
    .then((res1) => res.send(res1.data))
    .catch((err) => console.log(err, "err"));
});

app.get("/", (req, res) => {
  res.send({code: 200, message:"successful"})
  console.log("SERVER connected");
});

/**
 * @swagger
 * /api/register:
 *  post:
 *      description: POST information for registering new account.
 *      parameters:
 *      - name: account
 *        in: body
 *        required: true
 *        schema:
 *           type: object
 *           properties:
 *               username:
 *                   type: string
 *               password:
 *                   type: string
 *               password2:
 *                   type: string
 *           example:
 *                username: quan0402
 *                password: quan0402
 *                password2: quan0402
 *      responses:
 *          200:
 *              description: Success
 */

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
          res.send({
            // message: err
            code: 402,
            message: "failed",
          });
        }

        if (result.length > 0) {
          res.send({
            // message: "Username existed!"
          });
        } else {
          bcrypt.hash(password, saltRounds, (err, hash) => {
            if (err) {
              res.send({
                code: 404,
                message: "failed",
              });
            }

            database.query(
              "INSERT INTO users (username, password) VALUES (?,?)",
              [username, hash],
              (err, result) => {
                if (err) {
                  console.log(err);
                  res.send({
                    code: 403,
                    message: "failed",
                  });
                } else
                  res.send({
                    ...result,
                    code: 200,
                    message: "succesful",
                  });
              }
            );
          });
        }
      }
    );
  else
    res.send({
      code: 401,
      message: "Password confirm doesn't match!",
    });
});

/**
 * @swagger
 * /api/login:
 *  get:
 *      description: GET loggedIn state and user (if already logged in)
 *      responses:
 *          200:
 *              description: Success
 */

app.get("/api/login", (req, res) => {
  if (req.session.token) {
    res.send({ loggedIn: true, user: req.session.token });
  } else {
    res.send({ loggedIn: false });
  }
});

/**
 * @swagger
 * /api/login:
 *  post:
 *      description: POST account for logging in.
 *      parameters:
 *      - name: account
 *        in: body
 *        required: true
 *        schema:
 *           type: object
 *           properties:
 *               username:
 *                   type: string
 *               password:
 *                   type: string
 *           example:
 *                username: quan0402
 *                password: quan0402
 *      responses:
 *          200:
 *              description: Success
 */

app.post("/api/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  database.query(
    "SELECT * FROM users WHERE username = ?;",
    username,
    (err, result) => {
      if (err) {
        res.send({
          // err: err
          code: 500,
          message: "failed",
        });
      }

      if (result.length > 0) {
        bcrypt.compare(password, result[0].password, (error, response) => {
          if (response) {
            req.session.token = "abc" + result[0].password;
            // console.log(req.session.token);
            // res.sendStatus(200)
            res.send({
              ...result,
              code: 200,
              message: "Successful",
            });
          } else {
            res.send({
              code: 401,
              message: "Wrong username/password combination!",
              // message: "failed"
            });
          }
        });
      } else {
        res.send({
          code: 402,
          message: "User doesn't exist",
        });
      }
    }
  );
});

/**
 * @swagger
 * /api/logout:
 *  get:
 *      description: GET response after logging out
 *      responses:
 *          200:
 *              description: Success
 */

app.get("/api/logout", (req, res) => {
  req.session.destroy(null);
  res.clearCookie("userId");
  res.send({ message: "logout" });
});

/**
 *
 *
 * alert-feature
 *
 *
 */
const admin = require("firebase-admin");
const serviceAccount = require("./smarttomatofarm-firebase-adminsdk-j0civ-24e81aa790.json");
const registrationToken =
  "ceYpnIiuTSy3dR_dzjBQ1R:APA91bHS7ZELu_e8AxiVXAxCMrDsRibAztzb8_G9iT8zFbj-GKgNKbm4GeegSq4oFbIlRbVNL9Jm4FpDmQnnECh_HXBQLRkPp-lw8679elSgRL_pSHz8MpFsoejn9-zpy1ocPkHpsp9F";

const alertEvents = require("events");
const alertEmitter = new alertEvents.EventEmitter();
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

alertEmitter.on("clientready", () => {
  client.on("message", function (topic, message) {
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
      console.log(
        "----------------------\nTopic: ",
        topic,
        "\nMessage: ",
        message.toString()
      );
      console.log("--------State");
      console.log(state);
      if (state.active) {
        if (state.alertState == "empty") {
          checkConstrain(table, values.data);
        }
        if (
          state.alertState == "processing" ||
          state.alertState == "pending|cannotHandle"
        ) {
          checkToCompleteTask(table, values.data);
        }
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
      if (state.active) {
        if (state.alertState == "empty") {
          checkConstrain(table, values.data);
        }
        if (
          state.alertState == "processing" ||
          state.alertState == "pending|cannotHandle"
        ) {
          checkToCompleteTask(table, values.data);
        }
      }
    }
  });
});

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
  humidity: {
    upper_bound: 55,
    lower_bound: 50,
  },
};

const mLowerBound = "lower_bound";
const mUpperBound = "upper_bound";

async function loadConstrain() {
  await axios.get(`http://localhost:3001/constrain`).then((res) => {
    let result = res.data;
    result.forEach((i) => {
      constrain[i.type].lower_bound = i.lower_bound;
      constrain[i.type].upper_bound = i.upper_bound;
    });
  });
  console.log(constrain);
}

loadConstrain();

function checkToCompleteTask(type, data) {
  console.log("-----checkToCompleteTask");
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
    if (state.humidity != "") {
      if (
        dhumid <= constrain.humidity.upper_bound &&
        dhumid >= constrain.humidity.lower_bound
      ) {
        completetask();
        console.log("check complete ok");
      }

      return;
    }
  } else {
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
  console.log("-----checkconstrain");
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

    if (constrain.humidity.lower_bound > dhumid) {
      state.humidity = mLowerBound;
      flag = true;
    } else if (constrain.humidity.upper_bound < dhumid) {
      state.humidity = mUpperBound;
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
    state.humidity == mLowerBound
  ) {
    console.log("-----\ncheck cannotHanlde");
    alertEmitter.emit("cannotHandle");
  } else if (flag) {
    console.log("-----\ncheck handle");
    console.log(state);
    alertEmitter.emit("handle");
  }
}
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
  console.log("-----\nsendfcm");
}

var state = {
  active: true,
  alertState: "empty",
  moisture: "",
  humidity: "",
  temperature: "",
  light: "",
};

var alertTimeOut;

alertEmitter.on("cannotHandle", () => {
  console.log("-----cannotHandle");
  pub2Loa("activate");
  state.alertState = "pending|cannotHandle";
  let m = {
    data: {
      title: "Tình trạng khu vườn không tốt",
      body: "Hiện tại chúng tôi không thể cải thiện.",
      detail:
        "Hiện tại, chúng tôi không thể cải thiện tình trạng của khu vườn. Hãy kiểm tra khu vườn ngay.",
      alert: "cannotHandle",
      id: "dadn",
      soil: state.moisture,
      temp: state.temperature,
      light: state.light,
      humid: state.humidity,
    },
    token: registrationToken,
  };
  sendFCM(m);
});
alertEmitter.on("handle", () => {
  console.log("-----handle");
  pub2Loa("activate");
  state.alertState = "pending";
  let m = {
    data: {
      title: "Tình trạng khu vườn không tốt",
      body: "Hãy xác nhận công tác điều chỉnh.",
      detail:
        "Chúng tôi sẽ thực hiện công tác điều chỉnh nếu bạn không xác nhận trong 5 phút.",
      alert: "alert",
      id: "dadn",
      soil: state.moisture,
      temp: state.temperature,
      light: state.light,
      humid: state.humidity,
    },
    token: registrationToken,
  };
  sendFCM(m);
  console.log(state);
  alertTimeOut = setTimeout(() => {
    if (state.alertState == "pending") {
      pub2Loa("deactivate");
      runTask();
    }
  }, 1000 * 10);
});
app.get("/api/activatealert", (req, res) => {
  res.json({
    active: state.active.toString(),
  });
});
app.post("/api/activatealert", (req, res) => {
  if (req.body.activate == "true") {
    state.active = true;
  } else {
    state.active = false;
    resetState();
  }
  res.json({
    active: state.active.toString(),
  });
});
app.post("/api/receiveresponefromapp", (req, res) => {
  console.log("-----receiveresponefromapp");
  console.log("body.action: " + req.body.action);

  if (
    state.alertState == "pending" ||
    state.alertState == "pending|cannotHandle"
  ) {
    pub2Loa("deactivate");
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
  } else {
    res.json({ id: "", status: "" });
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
    pub2MayBom("activate");
  }
  if (state.humidity == mUpperBound) {
    pub2Quat("activate");
  }
  if (state.light == mUpperBound) {
    pub2MaiChe("activate-dong");
  }
  if (state.light == mLowerBound) {
    pub2MaiChe("activate-mo");
  }
}

function completetask() {
  let m = {
    data: {
      alert: "taskCompleted",
    },
    token: registrationToken,
  };
  console.log("completeTask");
  sendFCM(m);
  if (state.moisture == mLowerBound) {
    pub2MayBom("deactivate");
  }
  if (state.humidity == mUpperBound) {
    pub2Quat("deactivate");
  }
  if (state.light != "") pub2MaiChe("deactivate");
  resetState();
}

async function resetState() {
  state.alertState = "empty";
  state.moisture = "";
  state.temperature = "";
  state.light = "";
  state.humidity = "";
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
  }, 1000 * 20);
}

function pub2Quat(action) {
  let data;
  if (action == "activate") data = -200;
  else data = 0;
  let feed = `CSE_BBC/feeds/bk-iot-drv`;
  //let feed = `quanledinh/feeds/bk-iot-drv`;
  let id = [10];
  id.forEach((i) => {
    let message = `{\"id\":\"${i}\",\"name\":\"DRV_PWM\",\"data\":\"${data}\",\"unit\":\"\"}`;
    client.publish(feed, message);
  });
}

function pub2MayBom(action) {
  let data;
  if (action == "activate") data = 1;
  else data = 0;
  let feed = `CSE_BBC1/feeds/bk-iot-relay`;
  //let feed = `quanledinh/feeds/bk-iot-relay`;
  let id = [11];

  id.forEach((i) => {
    let message = `{\"id\": \"${i}\", \"name\": \"RELAY\", \"data\": \"${data}\", \"unit\": \"\"}`;
    client2.publish(feed, message);
  });
}

function pub2MaiChe(action) {
  let data;
  if (action == "activate-mo") data = -150;
  else if (action == "activate-dong") data = 150;
  else data = 0;
  let feed = `CSE_BBC/feeds/bk-iot-drv`;
  //let feed = `quanledinh/feeds/bk-iot-drv`;
  let id = [11];

  id.forEach((i) => {
    let message = `{\"id\":\"${i}\",\"name\":\"DRV_PWM\",\"data\":\"${data}\",\"unit\":\"\"}`;
    client.publish(feed, message);
  });
}

function pub2Loa(action) {
  let data;
  if (action == "activate") data = 500;
  else data = 0;
  let feed = `CSE_BBC/feeds/bk-iot-speaker`;
  //let feed = `quanledinh/feeds/bk-iot-speaker`;
  let id = [2];

  id.forEach((i) => {
    let message = `{\"id\":\"${i}\",\"name\":\"SPEAKER\",\"data\":\"${data}\",\"unit\":\"\"}`;
    client.publish(feed, message);
  });
}

server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
  updateClient();
});

// ----------------------------------
