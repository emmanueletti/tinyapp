const express = require('express');
const morgan = require('morgan');
const app = express();
const PORT = 8080;

// setting ejs as view engine
app.set('view engine', 'ejs');

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

app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

app.get('/urls/:shortURL', (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };

  res.render('urls_show.ejs', templateVars);
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
