require('dotenv').config();

const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongodb');

const app = express();
const { Schema } = mongoose;

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })



app.use(cors());
app.use(express.static('public'));
app.get('/', (req, res) => { res.sendFile(__dirname + '/views/index.html') });

app.use(bodyParser.urlencoded( { extended: false } ));
app.use(bodyParser.json());

app.post();

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
});
