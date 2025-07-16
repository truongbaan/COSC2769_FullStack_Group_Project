const PORT = 5000
const express = require('express')
const app = express()

app.set("view engine", "ejs")

app.get('/', (req, res) => {
    console.log('Running')
    res.render("index")//file name in the views
})
// app.get('/api',(req, res) => {
//     console.log("Hello frontend")
//     res.json("Hi frontend")
// })
app.listen(PORT)
