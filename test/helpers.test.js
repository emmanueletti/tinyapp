const assert = require('chai').assert;
const { getUserByEmail } = require('../lib/helpers');

const testUsers = {
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

describe('find user by email function', () => {
  it('should return a user object when given valid email', () => {
    const user = getUserByEmail('user@example.com', testUsers);
    const expectedOutput = testUsers.userRandomID;
    assert.deepEqual(user, expectedOutput);
  });

  it('should return undefined when given invalid email', () => {
    const user = getUserByEmail('wrongemail', testUsers);
    const expectedOutput = undefined;
    assert.equal(user, expectedOutput);
  });

  //
});
