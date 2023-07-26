const breckets = require("./breckets");

const unique = (arr) => Array.from(new Set(arr));

module.exports = function parse_props(input) {
  const obj = {};

  while (true) {
    let [match, prop, quote, content] = input.match(/(\w+)\s*=\s*(["'`])(.+)\2/) || []
    if (!match) break

    for (const b_val of unique(breckets(content, "m"))) {
      content = content.replaceAll(b_val, '$'+b_val)
    }

    obj[prop] = `\`${content}\``

    input = input.replace(match, "")
  }

  for (const { match, content } of breckets(input)) {
    const regex = new RegExp(`(\\w+)\\s*=\\s*${match.replace(/\W/g, "\\$&")}`)

    input = input.replace(regex, (_, prop) => {
      obj[prop] = content
      return ""
    })
  }

  return obj;
}