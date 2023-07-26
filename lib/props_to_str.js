module.exports = function props_to_str(props) {
  let str = ""
  for (const [prop, val] of Object.entries(props)) {
    str += `"${prop}":${val},`
  }
  return `{${str.slice(0,-1)}}`
}