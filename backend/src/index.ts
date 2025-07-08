//same like index.js, just change to js, if use import, then would require install extra @types
const PORT = 5000
const express = require('express')
const app = express()

app.set("view engine", "ejs")

app.get('/', (req : any, res : any) => {
    console.log('Running')
    res.render("index")//file name in the views
})
app.listen(PORT)
