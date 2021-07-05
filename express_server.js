const express = require('express');
const morgan = require('morgan');
const app = express();
const PORT = 8080;

// middleware
app.use(morgan('dev'));

// data
const urlDatabase = {
  b2xVn2: 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com',
};

// routes
app.get('/', (req, res) => {
  res.send('welcome to my server');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.use(function (req, res, next) {
  res.status(404).send("Sorry can't find that!");
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
