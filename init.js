#!/usr/bin/env node

const fs = require("fs");
const util = require("util");
const spawn = util.promisify(require("child_process").spawn);
const exec = util.promisify(require("child_process").exec);

const templateDir = __dirname + "/starter";
const projectDir = process.cwd();



async function copyFolder(srcDir, destDir) {
  try {
    const items = await fs.promises.readdir(srcDir);
    for (const item of items) {
      const origFilePath = `${srcDir}/${item}`;
      const targetFilePath = `${destDir}/${item}`;
      const stats = await fs.promises.lstat(origFilePath);

      if (stats.isFile()) {
        await fs.promises.copyFile(origFilePath, targetFilePath);
      } else if (stats.isDirectory()) {
        await fs.promises.mkdir(targetFilePath);
        await copyFolder(origFilePath, targetFilePath);
      }
    }
  } catch (error) {
    console.error("Error copying folder:", error);
  }
}


async function main() {
  try {
    console.log('Installing....');
    await exec("npm i express nodemon wolt")

    await copyFolder(templateDir, projectDir);
    console.log("Starter template copied!");
    
    
    let pkg = fs.readFileSync(projectDir + '/package.json');
    pkg = JSON.parse(pkg);
    if (!pkg.scripts) pkg.scripts = {};
    pkg.scripts.dev = 'npx nodemon app.js';
    fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));


    console.clear()
    console.log('Starting....');
    await spawn(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', ["run", "dev"], { stdio: "inherit" })

  } catch (error) {
    console.error("Error:", error);
  }
}

main();

// другой асинхронный код

// async function run() {
//   console.clear()
//   console.log('Installing....');
//   await exec("npm i express nodemon")
//   console.clear()
//   console.log('Starting....');
//   await spawn(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', ["run", "dev"], { stdio: "inherit" })
// }
// run()
