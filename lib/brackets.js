module.exports = function brackets(text, param, del = ['{', '}']) {
  
  let matches = [];
  let startIndex = null;
  let braceCount = 0;

  for (let i = 0; i < text.length; i++) {
    if (text[i] === del[0] && text[i - 1] !== "\\") {
      if (startIndex === null) startIndex = i;
      braceCount++;
    } else if (text[i] === del[1] && text[i - 1] !== "\\") {
      braceCount--;
      if (braceCount === 0) {
        const match = text.slice(startIndex, i + 1);
        const prev = text[startIndex - 1]
        const content = match.slice(1, -1).trim();
        if (param === "m") {
          matches.push(match);
        }
        else if (param === "mp") {
          matches.push(prev+match);
        }
        else {
          matches.push({ match, content });
        }
        startIndex = null;
      }
    }
  }
  return matches;
}