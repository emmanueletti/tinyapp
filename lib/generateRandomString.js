const generateRandomString = () => {
  let output = '';

  // generate 6 random value betweena ascii a(65) and z(122)
  for (let i = 0; i < 6; i++) {
    let randomNum = Math.floor(Math.random() * (122 - 97) + 97);
    output += String.fromCharCode(randomNum);
  }

  return output;
};

module.exports = generateRandomString;
