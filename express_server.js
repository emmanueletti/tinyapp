const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');

const app = express();
const PORT = 8080;

const generateRandomString = () => {
  let output = '';

  // generate 6 random value betweena ascii a(65) and z(122)
  for (let i = 0; i < 6; i++) {
    let randomNum = Math.floor(Math.random() * (122 - 97) + 97);
    output += String.fromCharCode(randomNum);
  }

  return output;
};

generateRandomString();

// setting ejs as view engine
app.set('view engine', 'ejs');

// MIDDLE WARE
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));

// PSUEDO DATABASE
const urlDatabase = {
  b2xVn2: 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com',
};

// ROUTES
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

app.get('/urls/new', (req, res) => {
  res.render('urls_new.ejs');
});

app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.get('/urls/:shortURL', (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
  };
  res.render('urls_show.ejs', templateVars);
});

app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  res.redirect(`${urlDatabase[shortURL]}`);
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
