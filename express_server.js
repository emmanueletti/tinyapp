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

/* DATABASE */
// url data
// const urlDatabase = {
//   b2xVn2: 'http://www.lighthouselabs.ca',
//   '9sm5xK': 'http://www.google.com',
// };

const urlDatabase = {
  b6UTxQ: {
    longURL: 'https://www.tsn.ca',
    userID: 'aJ48lW',
  },
  i3BoGr: {
    longURL: 'https://www.google.ca',
    userID: 'aJ48lW',
  },
  abcdef: {
    longURL: 'https://www.xkcd.com',
    userID: 'user3RandomID',
  },
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
  user3RandomID: {
    id: 'user3RandomID',
    email: 'aa@gmail.com',
    password: '123',
  },
};

/**
 * Search through user database and finds the id of the user object that has the key:value passed in
 * Useful when you only know (for example) an existing email and would like to know the id of the account it belongs to
 * @param {string} key - you already know
 * @param {string} value
 * @returns user's id property || undefined if not found
 */
const findCorrespondingId = (key, value) => {
  for (const userKey in users) {
    if (users[userKey][key] === value) {
      return users[userKey].id;
    }
  }
  return undefined;
};

const checkEmailExists = (email) => {
  for (const userKey in users) {
    if (users[userKey].email === email) {
      return true;
    }
  }
  return false;
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

  console.log(templateVars.urls.urlDatabase);
  res.render('urls_index', templateVars);
});

// Form to Add new URL - important to be above GET /urls/:shortURL
app.get('/urls/new', (req, res) => {
  // client not logged in
  if (!req.cookies['user_id']) {
    res.status(401).send('Error: please log in first');
    return;
  }

  const templateVars = {
    userID: req.cookies['user_id'],
  };
  res.render('urls_new.ejs', templateVars);
});

// Read GET /urls/:shortURL
app.get('/urls/:shortURL', (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    userID: req.cookies['user_id'],
  };
  res.render('urls_show.ejs', templateVars);
});

// Edit POST /urls/:shortURL/update
app.post('/urls/:shortURL/update', (req, res) => {
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
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

// Functionality GET /u/:shortURL - visit site
app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
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
