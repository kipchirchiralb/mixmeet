const express = require("express")
const bcrypt = require("bcrypt")
const session = require("express-session")

const app = express()

require("./services/main")

app.set("view engine", "ejs")
app.use(express.static("public"))
app.use(express.urlencoded({extended: false}))
app.use(session({
    secret: 'keyboardcat',
    resave: false,
    saveUninitialized: true
  }))

//method chaining
const db = require("mysql").createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "mixmeet"
})

app.get("/", (req,res)=>{
    if(req.session.user){
        res.render("home", {user: req.session.user})
    }else{
        res.render("index")
    }
})

app.get("/sign-in", (req,res)=>{
    res.render("sign-in")
})

app.get("/sign-out", (req,res)=>{
    req.session.destroy(() => {
        res.redirect("/");
      });
})

app.post("/sign-in", (req,res)=>{
    // confirm that email is registered
    // compare password provided with the hash in db
    db.query("SELECT * FROM users WHERE email = ?",[req.body.email],(error,results)=>{
        // handle error
        if(results.length>0){
            //proceed
            bcrypt.compare(req.body.password, results[0].password, (err,match)=>{
                if(match){
                    // create session
                    // console.log(results)
                    req.session.user = results[0]
                    // console.log(req.sessionID)
                    res.redirect("/")
                }else{
                    res.render("sign-in", {error: true, errorMessage: "Incorrect Password"})
                }
            })
        }else{
            res.render("sign-in", {error: true, errorMessage: "Email not registered."})
        }
    })
})

// reset password using OTP- emails,text messages
// postman

app.get("/sign-up", (req,res)=>{
    res.render("sign-up")
})

app.get("/all-users", (req,res)=>{
    if(req.session.user){
        db.query("SELECT * FROM users", (err,result)=>{
            res.json(result)    
        })
    }else{
        res.json({error: "Log in"})
    }
   
})

app.post("/sign-up", (req,res)=>{
    // get data - body-parser **
    // check if confirm pass & password match **
    // check if email is already used/ existing ** 
    // encrypt password / create a hash **
    // store all details in db - insert statement
    // console.log(req.body)
    if(req.body.password === req.body.confirm){
        db.query("SELECT email FROM users WHERE email = ?", [req.body.email], (err, results)=>{
            if(results.length>0){
                // email exist in db
                res.render("sign-up", {error: true, errorMessage: "Email already exists. Use another or login"})
            }else{
                bcrypt.hash(req.body.password, 4, function(err, hash){
                    // we have access to the hashed pass as hash
                    db.query("INSERT INTO users(username,email,password,image_link,bio) values(?,?,?,?,?)", [req.body.username,req.body.email,hash,"image.png",req.body.bio ], (error)=>{
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
