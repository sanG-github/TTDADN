const express = require('express');
const path = require('path');
const axios = require('axios');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({extended: false}));

app.use(express.static(__dirname + '/public'));

app.get('/getAllFeeds', (req, res) => {
	axios
		.get(
			`https://io.adafruit.com/api/v2/${process.env.USER}/feeds?X-AIO-Key=${process.env.KEY}`
		)
		.then((res1) => res.status(200).send(res1.data))
		.catch((err) => console.log(err, 'err'));
});

app.post('/changeFeed', (req, res) => {
	axios
		.post(
			`https://io.adafruit.com/api/v2/${process.env.USER}/feeds/${req.body.feedName}/data?X-AIO-Key=${process.env.KEY}`,
			{
				datum: {value: req.body.value},
			}
		)
		.then((res1) => console.log(res1))
		.catch((err) => console.log(err, 'err'));
});

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
	console.log(`App listening at PORT:`, port);
});
