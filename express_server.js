const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const findCorrespondingId = require('./lib/findCorrespondingId');
const urlDatabase = require('./database/urlDatabase');
const users = require('./database/usersDataBase');
const generateRandomString = require('./lib/generateRandomString');
const urlsForUser = require('./lib/urlsForUser');
const checkEmailExists = require('./lib/checkEmailExists');
const userIdAuthentication = require('./lib/userIdAuthentication');

const app = express();
const PORT = 8080;

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

/* CORE B.R.E.A.D / C.R.U.D FUNCTIONALITY */

// Browse Feature - GET /urls
app.get('/urls', (req, res) => {
  const userID = req.cookies['user_id'];

  /// authenticate presense of or validity of user_id from request cookie
  const failedAuthentication = userIdAuthentication(users, userID, res);
  if (failedAuthentication) {
    return failedAuthentication;
  }

  // filter urls to just the ones belonging to userID
  const templateVars = {
    userID,
    urls: urlsForUser(userID),
  };

  return res.render('urls_index', templateVars);
});

// Form to Add new URL - important to be above GET /urls/:shortURL
app.get('/urls/new', (req, res) => {
  const userID = req.cookies['user_id'];

  // authenticate presense of or validity of user_id from request cookie
  const failedAuthentication = userIdAuthentication(users, userID, res);
  if (failedAuthentication) {
    return failedAuthentication;
  }

  return res.render('urls_new.ejs', { userID });
});

// Read Feature - GET /urls/:shortURL
app.get('/urls/:shortURL', (req, res) => {
  const userID = req.cookies['user_id'];
  const shortURL = req.params.shortURL;

  // authenticate presense of or validity of user_id from request cookie
  const failedAuthentication = userIdAuthentication(users, userID, res);
  if (failedAuthentication) {
    return failedAuthentication;
  }

  // check if requested short link is in database
  if (!urlDatabase[shortURL]) {
    return res.status(400).send('<h2> This link does not exist </h2>');
  }

  // check if user cookie id matches the user id of the requested short link
  if (userID !== urlDatabase[shortURL].userID) {
    return res.status(401).send('<h2> You do not own this link </h2>');
  }

  const templateVars = {
    shortURL,
    userID,
    longURL: urlDatabase[shortURL].longURL,
  };

  return res.render('urls_show.ejs', templateVars);
});

// Edit Feature - POST /urls/:shortURL/update
app.post('/urls/:shortURL/update', (req, res) => {
  const userID = req.cookies['user_id'];
  const longURL = req.body.longURL;
  const shortURL = req.params.shortURL;

  // authenticate presense of or validity of user_id from request cookie
  const failedAuthentication = userIdAuthentication(users, userID, res);
  if (failedAuthentication) {
    return failedAuthentication;
  }

  // check if request is accessing shortlink with user id that matches user_id cookie
  if (userID !== urlDatabase[shortURL].userID) {
    return res.status(401).send('<h2> Cannot Edit: You do not own this link </h2>');
  }

  // change the longURL property of the shortURL object
  urlDatabase[shortURL].longURL = longURL;

  // POST => GET => Redirect pattern
  // send user to urls
  return res.redirect('/urls');
});

// Add POST /urls
app.post('/urls', (req, res) => {
  const userID = req.cookies['user_id'];

  // authenticate presense of or validity of user_id from request cookie
  const failedAuthentication = userIdAuthentication(users, userID, res);
  if (failedAuthentication) {
    return failedAuthentication;
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
  // first check if userID is present
  // then check if user_id cookie matches something in our database
  // then check
  // user already logged in

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
