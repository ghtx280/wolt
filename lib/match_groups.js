module.exports = function match_groups(text, regex) {
  const matches = [];
  let match;
  while (match = regex.exec(text)) matches.push(match);
  return matches.map(m => ({
    match: m[0],
    groups: m.slice(1)
  }))
}