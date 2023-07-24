const { render, run_msg } = require('wolt');
const app = require('express')();

app.get("/", async (req, res) => {
  res.send(
    await render("index.jsx", { app_name: "Wolt" })
    //               ^                ^ 
    //              file             data
  )
})

app.listen(7500, ()=> {
  run_msg({open: true, port: 7500})
})