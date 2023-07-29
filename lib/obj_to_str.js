module.exports = function (obj) {
  let s_count = -1, s_matches = [];
  let f_count = -1, f_matches = [];

  return JSON.stringify(obj, (_, val) => {
    if ("string" == typeof val && val.startsWith("`") && val.endsWith("`")) {
      s_count++
      s_matches.push(val.toString())
      return `@STRNG${s_count}@`
    }
    if ("function" == typeof val) {
      f_count++
      f_matches.push(val.toString())
      return `@FNCTN${f_count}@`
    }
    return val;
  })
  .replace(/"@STRNG(\d+)@"/g, (_, i) => s_matches[i])
  .replace(/"@FNCTN(\d+)@"/g, (_, i) => f_matches[i])
};