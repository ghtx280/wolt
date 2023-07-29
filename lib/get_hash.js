module.exports = function get_hash(length) {
  let randomString = "";
  let characters = "abcdefghijklmnopqrstuvwxyz";
  let charCount = 0;

  for (; charCount < length; ) {
    const randomChar = characters.charAt(Math.floor(Math.random() * characters.length));
    randomString += randomChar;
    charCount += 1;
  }

  return randomString;
};
