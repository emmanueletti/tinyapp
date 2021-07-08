const bcrypt = require('bcrypt');

// user database
const users = {
  userRandomID: {
    id: 'userRandomID',
    email: 'user@example.com',
    hashedPassword: '$2b$10$LVMpzr3z57gMiXbhxmiHAe0.r0Gzh.2kUykZMc/EJXTVy.5OEbh06', // 'purple-monkey-dinosaur'
  },
  user2RandomID: {
    id: 'user2RandomID',
    email: 'user2@example.com',
    hashedPassword: '$2b$10$w.WH3HgfLhEAKUnUFZgGO.oeGyChgU5a22WuH.Fq/Tv543dJ.Hq.C', // 'dishwasher-funk'
  },
  user3RandomID: {
    id: 'user3RandomID',
    email: 'a@gmail.com',
    hashedPassword: '$2b$10$FkNb6fKA6kvBbNfm64HG2.fPaiNbeQxcAubEqkbjnKYlM8nOBvFFC', // '123'
  },
};

const urlDatabase = {
  b6UTxQ: {
    longURL: 'https://www.tsn.ca',
    userID: 'aJ48lW',
  },
  i3BoGr: {
    longURL: 'https://www.google.ca',
    userID: 'userRandomID',
  },
  abc: {
    longURL: 'https://www.xkcd.com',
    userID: 'user3RandomID',
  },
  def: {
    longURL: 'https://www.youtube.com',
    userID: 'userRandomID',
  },
};

module.exports = { urlDatabase, users };
