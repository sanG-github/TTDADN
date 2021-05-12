const express = require("express");
const path = require("path");
const axios = require("axios");
require("dotenv").config();

const app = express();
const port = 3000;

app.use(express.static(__dirname + "/public"));

app.get("/getAllFeeds", (req, res) => {
	axios
		.get(
			`https://io.adafruit.com/api/v2/${process.env.USER}/feeds?X-AIO-Key=${process.env.KEY}`
		)
		.then((res1) => res.send(res1.data))
		.catch((err) => console.log(err));
});

app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(port, () => {
	console.log(`App listening at PORT:`, port);
});
