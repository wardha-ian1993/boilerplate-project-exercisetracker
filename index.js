require('dotenv').config();

const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
const { Schema } = mongoose;

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })

const userSchema = new Schema({
  username: { type: String, required: true },
  log: [{
    description: { type: String, required: true },
    duration: { type: Number, default: 0 },
    date: { type: Date, required: true }
  }]
});

const User = mongoose.model("User", userSchema);

app.use(cors());
app.use(express.static('public'));
app.get('/', (req, res) => { res.sendFile(__dirname + '/views/index.html') });

app.use(bodyParser.urlencoded( { extended: false } ));
app.use(bodyParser.json());

app.post('/api/users', async (req, res) => {
  const { username } = req.body;
  await User.create({ username: username });
  
  const user = await User.findOne({ username: username });
  res.json({ id: user.id, username: username });
});

app.post('/api/users/:_id/exercises', async (req, res) => {
  try {
    const userId = req.params._id;
    const { description, duration, date } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newExercise = {
      description: description,
      duration: parseInt(duration),
      date: date ? new Date(date) : new Date()
    };


    user.log.push(newExercise);
    await user.save();

    res.json({
      _id: user._id,
      username: user.username,
      description: newExercise.description,
      duration: newExercise.duration,
      date: newExercise.date.toDateString()
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({}, 'username'); // Retrieve only usernames
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/users/:_id/logs', async (req, res) => {
  const userId = req.params._id;
  const { from, to, limit } = req.query;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let logs = user.log;

    if (from && to) {
      logs = logs.filter(log => log.date >= new Date(from) && log.date <= new Date(to));
    }
    if (limit) {
      logs = logs.slice(0, parseInt(limit));
    }

    const logCount = logs.length;

    const response = {
      _id: userId,
      username: user.username,
      count: logCount,
      log: logs
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
});
