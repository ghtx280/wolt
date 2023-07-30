const unique = (arr) => Array.from(new Set(arr));

const fs   = require("fs");
const path = require("path");

const brackets     = require("./brackets");
const match_groups = require("./match_groups");
const parse_props  = require("./parse_props");

const REGEXP = require("./REGEXP");

module.exports = function comps_structure(currentDir, content, DATA = {}, OPT = {}) {

  content = content.replaceAll("$page", DATA.$page || "{page}");

  let stop = false;
  let href = false;
  let components = [];

  for (const { match, groups } of match_groups(content, REGEXP.COMPS)) {
    let [file, props, slot] = groups;
    
    stop  = true;
    props = parse_props(props);
    href  = props.href?.slice(1, -1);
    
    if (file === "inc" && !href) {
      throw Error("<inc> must contain href attribute with path to file");
    }

    if (slot) {
      for (let match of unique(brackets(slot, "m"))) {
        slot = slot.replaceAll(match, `$${match}`);
      }
    }

    file = href || `${file.trim().toLowerCase()}.jsx`;
    let filePath = path.join(currentDir, file);
    let fileContent = fs.readFileSync(
      filePath,
      props.encoding || OPT.encoding || "utf8"
    );

    const component = {
      file,
      props,
      slot,
      initiator: match,
      content: fileContent,
    };

    if (stop) {
      component.components = comps_structure(path.dirname(filePath), fileContent).components;
    }

    components.push(component);
  }

  return { content, components };
}
