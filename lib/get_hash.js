module.exports = function get_hash(length) {
  let randomString = "";
  let characters = "abcdefghijklmnopqrstuvwxyz";
  let charCount = 0;

  // Generate a random string with the specified length
  for (; charCount < length; ) {
    // Choose a random character from the 'characters' string
    const randomChar = characters.charAt(Math.floor(Math.random() * characters.length));
    randomString += randomChar;
    charCount += 1;
  }

  return randomString;
};
