const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const findCorrespondingId = require('./lib/findCorrespondingId');
const urlDatabase = require('./lib/urlDatabase');
const users = require('./lib/usersDataBase');
const generateRandomString = require('./lib/generateRandomString');
const urlsForUser = require('./lib/urlsForUser');
const checkEmailExists = require('./lib/checkEmailExists');

const app = express();
const PORT = 8080;

// setting ejs as view engine
app.set('view engine', 'ejs');

/* MIDDLE WARE */
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

/* ROUTES */

// Homepage GET /
app.get('/', (req, res) => {
  res.redirect('/login');
});

/* CORE B.R.E.A.D FUNCTIONALITY */

// Browse GET /urls
app.get('/urls', (req, res) => {
  // client not logged in
  if (!req.cookies['user_id']) {
    res.status(401).render('urls_prompt');
    return;
  }

  // templateVars urls property is a filtered verion of the url database
  // only contains shortLinks that belong to particular user_id
  const templateVars = {
    urls: urlsForUser(req.cookies['user_id']),
    userID: req.cookies['user_id'],
  };

  res.render('urls_index', templateVars);
});

// Form to Add new URL - important to be above GET /urls/:shortURL
app.get('/urls/new', (req, res) => {
  // client not logged in
  if (!req.cookies['user_id']) {
    res.status(401).render('urls_prompt');
    return;
  }

  const templateVars = {
    userID: req.cookies['user_id'],
  };

  res.render('urls_new.ejs', templateVars);
});

// Read GET /urls/:shortURL
app.get('/urls/:shortURL', (req, res) => {
  // accessing shortlink that doesn't exist at all
  if (!urlDatabase[req.params.shortURL]) {
    res.status(401).render('urls_accessError');
  }

  // accessing shortlink that doesnt belong to user
  if (req.cookies['user_id'] !== urlDatabase[req.params.shortURL].userID) {
    res.status(401).render('urls_accessError');
    return;
  }

  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    userID: req.cookies['user_id'],
  };

  res.render('urls_show.ejs', templateVars);
});

// Edit POST /urls/:shortURL/update
app.post('/urls/:shortURL/update', (req, res) => {
  // request does not have a user id cookie - cURLers
  if (!req.cookies['user_id']) {
    res.status(401).render('urls_accessError');
    return;
  }

  // accessing shortlink that doesnt belong to user
  if (req.cookies['user_id'] !== urlDatabase[req.params.shortURL].userID) {
    res.status(401).render('urls_accessError');
    return;
  }

  const longURL = req.body.longURL;
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL].longURL = longURL;

  // POST => GET => Redirect pattern
  res.redirect('/urls');
});

// Add POST /urls
app.post('/urls', (req, res) => {
  // client not logged in
  if (!req.cookies['user_id']) {
    res.status(401).send('Error: Please login first');
    return;
  }

  const shortURL = generateRandomString();

  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.cookies['user_id'],
  };

  urlDatabase[shortURL].longURL = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

// Delete POST /urls/:shortURL/delete
app.post('/urls/:shortURL/delete', (req, res) => {
  // request does not have a user id cookie - cURLers
  if (!req.cookies['user_id']) {
    res.status(401).render('urls_accessError');
    return;
  }

  // accessing shortlink that doesnt belong to user
  if (req.cookies['user_id'] !== urlDatabase[req.params.shortURL].userID) {
    res.status(401).render('urls_accessError');
    return;
  }

  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

// Functionality GET /u/:shortURL - visiting a site using the shortlink
app.get('/u/:shortURL', (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    res.status(400).send('Error: link does not exist');
    return;
  }

  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(`${longURL}`);
});

// Functionality - POST /logout - clear cookies
app.post('/logout', (req, res) => {
  res.clearCookie('user_id').redirect('/login');
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

  if (checkEmailExists(req.body.email)) {
    res.status(400).send('account already exists');
    return;
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
  // user already logged in
  if (req.cookies['user_id']) {
    res.redirect('/urls');
    return;
  }

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
  if (checkEmailExists(req.body.email)) {
    const userID = findCorrespondingId('email', req.body.email);

    // check if password is correct
    if (users[userID].password === req.body.password) {
      // set cookie
      res.cookie('user_id', userID).redirect('/urls');
      return;
    }

    res.status(403).send('wrong password');
    return;
  }

  res.status(403).send('account does not exists');
});

// turn on server
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
