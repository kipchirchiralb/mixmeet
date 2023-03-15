const express = require("express")
const app = express()

require("./services/main")

app.set("view engine", "ejs")
app.use(express.static("public"))


app.get("/", (req,res)=>{
    res.render("index")
})

app.get("/sign-in", (req,res)=>{
    res.render("sign-in")
})

app.get("/sign-up", (req,res)=>{
    res.render("sign-up")
})

app.listen(3001, ()=>{
    console.log("app running!!...")
})

// create a db called mixmeet
// have a table called users(user_id)
