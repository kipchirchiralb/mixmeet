// const express = require("express")
const mysql = require("mysql")
// const app = express()
const app = require("express")()
require("./services/main")
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "mixmeet"
})
db.connect((err)=>{
    if(err){
        console.log(err)
    }else{
        console.log("db conn successful(app)")
    }
})



app.get("/", (req,res)=>{
    res.send("MixMeet")
})

app.listen(3001, ()=>{
    console.log("app running!!...")
})

// create a db called mixmeet
// have a table called users(user_id)
