/* ATTENTION!!!
This code looks bad and will be rewritten (the functionality will not change),
but it is usable now.
If you find any errors, please report them in issues :) */

const fs   = require("fs");
const path = require("path");

const obj_to_str      = require("./lib/obj_to_str");
const props_to_str    = require("./lib/props_to_str");
const parse_template  = require("./lib/parse_template");
const comps_structure = require("./lib/comps_structure");

const HELPERS = require("./lib/HELPERS");


// render function

async function render(FILE = "index.html", DATA = {}, OPT = {}) {
  let HTML;

  try {
    HTML = fs.readFileSync(
      path.join(process.cwd(), FILE),
      OPT.encoding || "utf8"
    );

    let structure = comps_structure(process.cwd(), HTML, DATA, OPT);

    function traverse_comps(component, parent = null) {
      if ( !component || !component.components || component.components.length === 0 ) {
        handle_comp(component, parent);
        return;
      }
      for (const nestedComponent of component.components) {
        traverse_comps(nestedComponent, component);
      }
      handle_comp(component, parent);
    }

    let is_replacing;

    function handle_comp(comp, parent) {
      if (!is_replacing) {
        // Compiling components
        comp.content = parse_template(comp.content);
        // --------------------
      } else {
        // Replacing components
        if (!parent) return;
        parent.content = parent.content.replace(comp.initiator, () => {
          return `await(async($slot,$prop)=>{
            ${comp.content}
            return ''
            })(\`${comp.slot || ""}\`,${props_to_str(comp.props)})`;
        });
        // --------------------
      }
    }

    traverse_comps(structure);
    is_replacing = true;
    traverse_comps(structure);

    HTML = structure.content;


    // fs.writeFileSync(path.join(process.cwd(), "struct.json"), JSON.stringify(structure))
    // console.dir(structure, { depth: null });


    let RAW = `
      let {${Object.keys(HELPERS)}} = $helpers;
      let {${Object.keys(DATA)}} = $data;
      ${HTML}
    `

    RAW = RAW.replace(/className\s*=\s*(["'`])/g, "class=$1");
    RAW = RAW.replaceAll("\\<", "&lt;");
    RAW = RAW.replaceAll("\\>", "&gt;");


    // Don't format inside back quotes
    let btc;
    RAW = RAW.replace(/`|^\s+/gm, (match) =>
      "`" === match ? ((btc = !btc), match) : btc ? match : ""
    );
    // -------------------------------

    const AsyncFunction = Object.getPrototypeOf(
      async function () {}
    ).constructor;

    if (OPT?.mode === "client") {
      HTML = `<script>
        let $html = "";
        (async function($helpers,$data){
          document.currentScript.remove()
          ${RAW}
          document.write($html)
        })(
          ${obj_to_str(HELPERS)},
          ${obj_to_str(DATA)}
        )
      </script>`;
    } else {
      if (OPT?.raw !== "all") {
        HTML = await new AsyncFunction(
          `let $html = "";
          const $helpers = ${obj_to_str(HELPERS)};
          const $data    = ${obj_to_str(DATA)};
          ${RAW}
          ;return $html`
        )();
      }
      if (OPT?.raw === "all") HTML = RAW;
      if (OPT?.raw === "add") HTML += `\n<!--\n${RAW}\n-->`;
    }
  } catch (err) {
    HTML = `<h2>${(err + "").replaceAll("<", "&lt;")}</h2>
    <p>${err.stack.replaceAll("<", "&lt;")}</p>
    <style>
      body{
        color:#fff;
        background:#0e0808;
        margin:30px
      }
      h2{
        color:#ff5e5e;
        font-family:sans-serif
      }
    </style>`;
    if (OPT.raw && typeof RAW !== "undefined") HTML += `\n<!--\n${RAW}\n-->`;
    console.error(err);
  }

  return HTML;
}


// router function

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




function run_msg(p = {}) {
  const port = p.port || 7500;
  const open = p.open || false;
  const host = `http://localhost:${port}`;
  console.clear();
  console.log("\x1b[33m%s\x1b[0m", "Wolt is running!");
  console.log("\x1b[36m%s\x1b[0m", host);
  if (open) {
    const start =
      process.platform == "darwin"
        ? "open"
        : process.platform == "win32"
        ? "start"
        : "xdg-open";
    require("child_process").exec(start + " " + host);
  }
}

module.exports = { render, router, run_msg };