const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

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

// setting ejs as view engine
app.set('view engine', 'ejs');

/* MIDDLE WARE */
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

/* PSUEDO DATABASE */
// url data
const urlDatabase = {
  b2xVn2: 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com',
};

// users data
const users = {
  userRandomID: {
    id: 'userRandomID',
    email: 'user@example.com',
    password: 'purple-monkey-dinosaur',
  },
  user2RandomID: {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: 'dishwasher-funk',
  },
};

/* ROUTES */
// Homepage GET /
app.get('/', (req, res) => {
  res.send('welcome to my server');
});

// Browse GET /urls
app.get('/urls', (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    userID: req.cookies['user_id'],
  };
  res.render('urls_index', templateVars);
});

// Form to Add new URL - important to be above GET /urls/:shortURL
app.get('/urls/new', (req, res) => {
  const templateVars = {
    userID: req.cookies['user_id'],
  };
  res.render('urls_new.ejs', templateVars);
});

// Read GET /urls/:shortURL
app.get('/urls/:shortURL', (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    userID: req.cookies['user_id'],
  };
  res.render('urls_show.ejs', templateVars);
});

// Edit POST /urls/:shortURL/update
app.post('/urls/:shortURL/update', (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = longURL;

  // POST => GET => Redirect pattern
  res.redirect('/urls');
});

// Add POST /urls
app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

// Delete POST /urls/:shortURL/delete
app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

// Functionality GET /u/:shortURL - visit site
app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(`${longURL}`);
});

// Functionality - POST /logout - clear cookies
app.post('/logout', (req, res) => {
  res.clearCookie('user_id').redirect('/urls');
});

// Functionality - GET /register - registration form
app.get('/register', (req, res) => {
  const templateVars = {
    userID: req.cookies['user_id'],
  };
  res.render('urls_register', templateVars);
});

// Functionality - POST /register - create new account
app.post('/register', (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.status(400).send('valid info please');
    return;
  }

  for (const userKey in users) {
    if (users[userKey].email === req.body.email) {
      res.status(400).send('account already exists');
      return;
    }
  }

  const userID = generateRandomString();
  users[userID] = {
    id: userID,
    email: req.body.email,
    password: req.body.password,
  };

  res.cookie('user_id', userID).redirect('/urls');
});

// GET login form
app.get('/login', (req, res) => {
  const cookieID = req.cookies['user_id'];
  const templateVars = {
    userID: cookieID,
  };
  res.render('urls_login', templateVars);
});

// login
app.post('/login', (req, res) => {
  // check if valid info has been submitted
  if (!req.body.email || !req.body.password) {
    res.status(400).send('valid info please');
    return;
  }

  // check if account exists
  for (const userKey in users) {
    if (users[userKey].email === req.body.email) {
      const userID = users[userKey].id;

      // set cookie
      res.cookie('user_id', userID).redirect('/urls');
      return;
    }
  }
  res.status(400).send('account does not exists');
  return;
});

// turn on server
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
