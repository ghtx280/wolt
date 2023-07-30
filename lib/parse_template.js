const unique = (arr) => Array.from(new Set(arr));

const REGEXP   = require("./REGEXP");
const brackets = require("./brackets");

module.exports = function parse_template(input) {

  const convert_braces = (tag) => {
    const st = (e) => tag.startsWith(e);
    if (!(st("<script") || st("<style"))) {
      for (let match of unique(brackets(tag, "m"))) {
        tag = tag.replaceAll(match, `$${match}`);
      }
    }
    return tag;
  };

  input = input.replace(/{\/\*.+?\*\/}/gs, "")
  input = input.replace(/<!--.+?-->/gs, "")
  // input = input.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, "")


  let comp_count = 0; // inc (conponents)
  let comp_matches = [];
  input = input.replace(REGEXP.COMPS, (match) => {
    let key = `@@COMP${comp_count}@@`;
    comp_matches.push({ key, match });
    comp_count++;
    return key;
  });
  

  input = input.replace(REGEXP.STYLE, (match) => {
    return match.replace(/\s+/g, " ").trim();
  });

  let sc_count = 0; // script tags
  let sc_matches = [];
  input = input.replace(REGEXP.SCRIPT, (match, start_tag, js, end_tag) => {

    start_tag = start_tag.replace(/{"(.+)"}/,"<$1>")
    end_tag = end_tag.replace(/{"(.+)"}/,"<\\$1>").replace("</script>","<\\/script>")
    
    js = js.replaceAll("`", "\\`")
    js = js.replaceAll("${", "\\$\\{")
    js = js.replace(/(["'])%\s+(.+)\s+%\1/g, "${$2}")
    
    match = `\n$html += \`${start_tag + js + end_tag}\`\n`
    
    let key = `@@SC${sc_count}@@`;
    sc_matches.push({ key, match });
    sc_count++;
    return key;
  });


  let rb_count = 0; // round brackets
  let rb_matches = [];
  for (let item of brackets(input,"mp", ['(',')'])) {
    let prefix = item[0].trim()
    let match = item.slice(2,-1).trim()

    if ( prefix === "$" || (match.startsWith("<") && match.endsWith(">")) ) {
      match = `(\`${convert_braces(match.replaceAll("`", "\\`"))}\`)`
    } else {
      match = `(${match})`
    }

    input = input.replace(item.slice(1), () => {
      let key = `@@RB${rb_count}@@`;
      rb_matches.push({ key, match });
      rb_count++;
      return key;
    });
  }
  

  let bt_count = 0; // backticks
  let bt_matches = [];
  input = input.replace(REGEXP.BACKTICKS, (match, prefix, cnt) => {
    
    if (!prefix) {
      match = `\n$html += \`${convert_braces(cnt.replaceAll("`", "\\`"))}\`\n`
    }

    let key = `@@BT${bt_count}@@`;
    bt_matches.push({ key, match });
    bt_count++;
    return key;
  });

  

  // REGEXP.TAGS 
  input = input.replaceAll(/<(\w+)(?:\s+[^>]+)?>([^<]*)<\/\1>|<!?(\w+)(?:\s+[^>]+)?>|<\/.+>/g, (tag) => {
    let esc
    tag = tag.replaceAll("\\<", () => (esc = 1, "&lt;"))
    tag = tag.replaceAll("\\>", () => (esc = 1, "&gt;"))
    tag = tag.replaceAll("`", "\\`")
    tag = !esc ? `\n$html += \`${convert_braces(tag)}\`\n` : tag

    return tag.replace(/@@BT\d@@/g, "${(()=>{let $html = ''\n$&\nreturn $html})()}")  
  });
  
  
  for (const matches of [
    rb_matches,
    bt_matches,
    sc_matches,
    comp_matches
  ]) {
    for (const e of matches) {
      input = input.replace(e.key, e.match.replaceAll("$","$$$$"));
    }
  }
  return input;
}