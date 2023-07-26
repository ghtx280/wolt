module.exports = function obj_to_str(obj) {
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === "function") {
      return `@_FUNC_@${value
        .toString()
        .replace(/\s*[\r\n\t]\s*/g, "")
      }@_FUNC_@`;
    }
    return value;
  }).replace(/"?@_FUNC_@"?/g, "");
}