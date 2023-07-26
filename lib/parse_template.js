const unique = (arr) => Array.from(new Set(arr));

const REGEXP   = require("./REGEXP");
const breckets = require("./breckets");

module.exports = function parse_template(input) {

  const mtags = (tag) => {
    const st = (e) => tag.startsWith(e);
    if (!(st("<script") || st("<style"))) {
      for (let match of unique(breckets(tag, "m"))) {
        tag = tag.replaceAll(match, `$${match}`);
      }
    }
    return tag;
  };


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


  let rb_count = 0; // round breckets
  let rb_matches = [];
  for (let item of breckets(input,"mp", ['(',')'])) {
    let prefix = item[0].trim()
    let match = item.slice(2,-1).trim()

    if ( prefix === "$" || (match.startsWith("<") && match.endsWith(">")) ) {
      match = `(\`${mtags(match.replaceAll("`", "\\`"))}\`)`
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
  input = input.replace(REGEXP.BACKTICKS, (match, cnt) => {
    match =  `\n$html += \`${mtags(cnt.replaceAll("`", "\\`"))}\`\n`

    let key = `@@BT${bt_count}@@`;
    bt_matches.push({ key, match });
    bt_count++;
    return key;
  });

  // /<(\w+)(?:\s+[^>]+)?>([^<]*)<\/\1>|<!?(\w+)(?:\s+[^>]+)?>|<\/.+>/g
  input = input.replaceAll(REGEXP.TAGS, (tag) => {
    let esc
    tag = tag.replaceAll("\\<", () => (esc = 1, "&lt;"))
    if (!esc) {
      return `\n$html += \`${mtags(tag.replaceAll("`", "\\`"))}\`\n`;
    }
    else {
      return tag.replaceAll("`", "\\`")
    }
  });


 // Then it'll be good here :)

  for (const e of rb_matches) {
    input = input.replace(e.key, e.match);
  }

  for (const e of bt_matches) {
    input = input.replace(e.key, e.match);
  }

  for (const e of sc_matches) {
    input = input.replace(e.key, e.match);
  }

  for (const e of comp_matches) {
    input = input.replace(e.key, e.match);
  }

  return input;
}