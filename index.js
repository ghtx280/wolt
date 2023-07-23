/* ATTENTION!!!
This code looks bad and will be rewritten (the functionality will not change),
but it is usable now.
If you find any errors, please report them in issues :) */

const fs   = require("fs");
const path = require("path");
const url  = require("url");

const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

function r_str(t) {
  let r = "";
  let n = "abcdefghijklmnopqrstuvwxyz";
  let a = 0;
  for (; a < t; )
    (r += n.charAt(Math.floor(Math.random() * n.length))), (a += 1);
  return r;
}

function breckets(text, param) {
  const matches = [];
  let startIndex = null;
  let braceCount = 0;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === "{" && text[i - 1] !== "\\") {
      if (startIndex === null) startIndex = i;
      braceCount++;
    } else if (text[i] === "}" && text[i - 1] !== "\\") {
      braceCount--;
      if (braceCount === 0) {
        const match = text.slice(startIndex, i + 1);
        const content = match.slice(1, -1).trim();
        if (param === "m") {
          matches.push(match);
        } else {
          matches.push({ match, content });
        }
        startIndex = null;
      }
    }
  }
  return matches;
}

function parse_template(input) {
  const mtags = (tag) => {
    const st = (e) => tag.startsWith(e);
    if (!(st("<script") || st("<style"))) {
      for (let match of Array.from(new Set(breckets(tag, "m")))) {
        if (tag.startsWith("<{") && tag.endsWith("}>")) {
          tag = tag.slice(1, -1);
        }
        tag = tag.replaceAll(match, `$${match}`);
      }
    }
    return tag;
  };

  input = input.replace(/<style.*?>[\s\S]*?<\/style>/g, (match) => {
    return match.replace(/\s+/g, " ").trim();
  });

  let sc_count = 0; // scropt tags
  let sc_matches = [];
  input = input.replace(/(<script.*?>)(.*?)<\/script>/gs, (match, tag, js) => {
    let key = `@@SC${sc_count}@@`;
    sc_matches.push({ key, js, match });
    sc_count++;
    return key;
  });

  let rb_count = 0; // round breckets
  let rb_matches = [];
  input = input.replace(/(\$)?\(\s*(<.+?>)\s*\)/gs, (match, add, cnt) => {
    let key = `@@RB${rb_count}@@`;
    rb_matches.push({
      key,
      cnt: `\n${add || ""}(\`${mtags(cnt.replaceAll("`", "\\`"))}\`)\n`,
      match,
    });
    rb_count++;
    return key;
  });

  let bq_count = 0; // backquotes
  let bq_matches = [];
  input = input.replace(/^\s*`\s*([\S\s]+?)\s*`\s*$/gm, (match, cnt) => {
    let key = `@@BQ${bq_count}@@`;
    bq_matches.push({
      key,
      cnt: `\n$html += \`${mtags(cnt.replaceAll("`", "\\`"))}\`\n`,
      match,
    });
    bq_count++;
    return key;
  });

  // /<(\w+)(?:\s+[^>]+)?>([^<]*)<\/\1>|<!?(\w+)(?:\s+[^>]+)?>|<\/.+>/g
  input = input.replaceAll(/\\?<.+>|\\?<[\S\s]+?>$/gm, (tag) => {
    let esc
    tag = tag.replaceAll("\\<", () => (esc = 1, "&lt;"))
    if (!esc) {
      return `\n$html += \`${mtags(tag.replaceAll("`", "\\`"))}\`\n`;
    }
    else {
      return tag.replaceAll("`", "\\`")
    }
  });

  for (const e of rb_matches) {
    input = input.replace(e.key, e.cnt);
  }

  for (const e of bq_matches) {
    input = input.replace(e.key, e.cnt);
  }

  for (const e of sc_matches) {
    input = input.replace(
      e.key,
      `\n$html += \`${e.match
        .replaceAll("`", "\\`")
        .replaceAll("${", "\\$\\{")}\`\n`.replace("</script>", "<\\/script>")
    );
  }
  return input;
}

async function render(file, data = {}, opt = {}) {
  if (!file) file = "index.html";

  const filePath = path.join(process.cwd(), file);

  try {
    let html = fs.readFileSync(filePath, "utf8");

    html = html.replace(/^\s*'html5';?/g, "<!DOCTYPE html>");

    function setInc(currentDir, content) {
      content = content.replaceAll("$page", data.$page || "{page}");

      let test = false;

      content = content.replace(
        /<(inc|[A-Z]\w+)\s*(.*?)\s*\/?>((.*)<\/(inc|[A-Z]\w+)>)?/g,
        (match, file, props = "", _, slot = "") => {
          test = true;
          if (props === "/") props = "";

          let href;

          if (file === "inc") {
            props = props
              .replace(/(\w+)\s*=\s*["'`](.+?)["'`]/g, '"$1":"$2",')
              .slice(0, -1);
            href = JSON.parse(`{${props}}`).href;
            props = props.replace(/:["'`]([\S\s]*?)["'`]/g, ":`$1`");
            for (let { match, content } of Array.from(
              new Set(breckets(props))
            )) {
              props = props.replaceAll(match, `$${match}`);
            }
          } else {
            if (props) {
              props = props.replace(/(\w)\s*=\s*\{/g, "$1:{");
              for (let { match, content } of Array.from(
                new Set(breckets(props))
              )) {
                props = props.replaceAll(match, content + ",");
              }
              if (props.endsWith(",")) {
                props = props.slice(0, -1);
              }
            }
          }
          slot = slot.replaceAll("\n", "");

          for (let { match } of Array.from(new Set(breckets(slot)))) {
            slot = slot.replaceAll(match, `$${match}`);
          }

          const filePath = path.join(
            currentDir,
            href || file.trim().toLowerCase() + ".jsx"
          );
          const fileContent = fs.readFileSync(filePath, "utf8");
          const hash = r_str(5);

          return setInc(
            path.dirname(filePath),
            `async function $comp_${file}_${hash}($slot,$prop){
              ${fileContent}
            }
            await $comp_${file}_${hash}(\`${slot}\`,{${props}})`
          );
        }
      );

      if (test) setInc(currentDir, content);
      return content;
    }

    html = setInc(process.cwd(), html);

    const helpers = {
      // $html: "",
      $: (ctx) => $html += ctx,
      $_: (ctx) => ctx,
      $timeout: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
      $fetch: {
        json: async (url) => (await fetch(url)).json(),
        text: async (url) => (await fetch(url)).text(),
      },
      $range: (...a) => {
        let b, c, d;
        1 === a.length
          ? ((b = 1), (c = a[0]), (d = 1))
          : 2 === a.length
          ? (([b, c] = a), (d = 1))
          : 3 === a.length && ([b, c, d] = a);
        const e = [];
        for (let f = b; f <= c; f += d) e.push(f);
        return e;
      },
    };

    let hlps = `let {${Object.keys(helpers)}} = $helpers;\n`;
    let vars = `let {${Object.keys(data)}} = $data;\n`;

    let raw = hlps + vars + parse_template(html);
    raw = raw.replace(/className\s*=\s*(["'`])/g, "class=$1");
    // raw = raw.replace(/^\s+/gm, "");
    raw = raw.replaceAll("\\<","&lt;")

    let bq 
    raw = raw.replace(/`|^\s+/gm, (match) => "`" === match ? ((bq = !bq), match) : bq ? match : "" );

    try {
      function obj_to_str(obj) {
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

      if (opt?.mode === "client") {
        html = `<script>
          let $html = "";
          (async function($helpers,$data){
            document.currentScript.remove()
            ${raw}
            document.write($html)
          })(
            ${obj_to_str(helpers)},
            ${obj_to_str(data)}
          )
        </script>`.replace(/^\s+/gm, "");
      } else {
        if (opt?.raw !== "all") {
          html = await new AsyncFunction(
            `let $html = "";
            const $helpers = ${obj_to_str(helpers)};
            const $data = ${obj_to_str(data)};
            ${raw}
            ;return $html`
          )()
        }
        if (opt?.raw === "all") html = raw;
        if (opt?.raw === "add") html += `\n<!--\n${raw}\n-->`;
      }
    } catch (err) {
      html = `<h2>${err + ""}</h2><p>${
        err.stack
      }</p><style>body{color:#fff;background:#0e0808;margin:30px}h2{color:#ff5e5e;font-family:sans-serif}</style>`;
      if (opt.raw) html += `\n<!--\n${raw}\n-->`;
    }
    return html;
  } catch (err) {
    console.error(err);
    return err;
  }
}

async function router(app, paths) {
  let obj = {};
  for (let [key, val] of Object.entries(paths)) {
    app.get(key, async (req, res) => {
      if (typeof val === "string") {
        obj = { page: val };
      }
      if (typeof val === "function") {
        obj = await val(req, res);
      }

      obj.data ||= {};
      obj.data.$page = obj.$page || obj.page;
      obj.data.$path = req.path;
      obj.data.$slug = req.params;
      res.send(await render(obj.file || "index.html", obj.data, obj.options));
    });
  }
}

module.exports = { render, router };