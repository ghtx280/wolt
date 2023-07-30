const brackets = require("./brackets");
const match_groups = require("./match_groups");

const unique = (arr) => Array.from(new Set(arr));

module.exports = function parse_props(input) {
  const obj = {};

  for (const { match, groups } of match_groups(input, /(\w+)\s*=\s*(["'`])(.+?)\2/g)) {
    let [prop, _, content] = groups;

    for (const b_val of unique(brackets(content, "m"))) {
      content = content.replaceAll(b_val, `$${b_val}`)
    }

    obj[prop] = `\`${content}\``
    input = input.replace(match, "")
  }

  for (const { match, content } of brackets(input)) {
    const regex = new RegExp(`(\\w+)\\s*=\\s*${match.replace(/\W/g, "\\$&")}`)

    input = input.replace(regex, (_, prop) => {
      obj[prop] = content
      return ""
    })
  }

  return obj;
}