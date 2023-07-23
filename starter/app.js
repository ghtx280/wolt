const { render } = require('wolt');
const app = require('express')();

app.get("/", async (req, res) => {
  res.send(await render("index.jsx",{
    app_name: "Wolt",
    rand_num: Math.floor(Math.random() * 1000)
  }))
})


app.listen(7500, ()=>{
  console.clear(); 
  console.log('\x1b[33m%s\x1b[0m', 'Wolt is running!');
  console.log('\x1b[36m%s\x1b[0m','http://localhost:7500');
})