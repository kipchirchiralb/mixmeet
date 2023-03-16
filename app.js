const express = require("express")
const bcrypt = require("bcrypt")

const app = express()

require("./services/main")

app.set("view engine", "ejs")
app.use(express.static("public"))
app.use(express.urlencoded({extended: false}))

//method chaining
const db = require("mysql").createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "mixmeet"
})

app.get("/", (req,res)=>{
    res.render("index")
})

app.get("/sign-in", (req,res)=>{
    res.render("sign-in")
})

app.get("/sign-up", (req,res)=>{
    res.render("sign-up")
})

app.post("/sign-up", (req,res)=>{
    // get data - body-parser **
    // check if confirm pass & password match **
    // check if email is already used/ existing ** 
    // encrypt password / create a hash **
    // store all details in db - insert statement
    console.log(req.body)
    if(req.body.password === req.body.confirm){
        // proceed

        db.query("SELECT email FROM users WHERE email = ?", [req.body.email], (err, results)=>{
            if(results.length>0){
                // email exist in db
                res.render("sign-up", {error: true, errorMessage: "Email already exists. Use another or login"})
            }else{
                //proceed
                bcrypt.hash(req.body.password, 4, function(err, hash){
                    // we have access to the hashed pass as hash
                    db.query("INSERT INTO users(username,email,password,image_link,bio) values(?,?,?,?,?)", [req.body.username,req.body.email,hash,"image.png",req.body.bio ], (error)=>{
                        // end
                        if(error){
                            res.render("sign-up", {error: true, errorMessage: "Contact Admin, and tell them something very terrible is going on in the server"})
                        }else{
                            res.redirect("/sign-in") // sucessful signup
                        }
                    })
                })
            }
        } )
    }else{
        res.render("sign-up", {error: true, errorMessage: "Password and confirm Password do not match"})
    }
})



app.listen(3001, ()=>{
    console.log("app running!!...")
})
