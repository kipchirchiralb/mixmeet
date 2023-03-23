const express = require("express");
const bcrypt = require("bcrypt");
const session = require("express-session");
const multer = require("multer");

const app = express();

require("./services/main");

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    secret: "keyboardcat",
    resave: false,
    saveUninitialized: true,
  })
);

//method chaining
const db = require("mysql").createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "mixmeet",
});
//multer js code
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, __dirname + "/public/images/profiles");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

// momment js , Intl formatting--
app.get("/", (req, res) => {
  if (req.session.user) {
    // sql joins - create join to get both users and posts in the the same query - you get one result array
    db.query("SELECT * FROM  users", (error,allUsers)=>{
        db.query("SELECT * FROM posts", (error,allPosts)=>{
          res.render("home", { user: req.session.user, users: allUsers, posts: allPosts });
        })
    })
  } else {
    res.render("index");
  }
});

app.get("/sign-in", (req, res) => {
  res.render("sign-in");
});

app.get("/sign-out", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

app.post("/sign-in", (req, res) => {
  // confirm that email is registered
  // compare password provided with the hash in db
  db.query(
    "SELECT * FROM users WHERE email = ?",
    [req.body.email],
    (error, results) => {
      // handle error
      if (results.length > 0) {
        //proceed
        bcrypt.compare(req.body.password, results[0].password, (err, match) => {
          if (match) {
            // create session
            // console.log(results)
            req.session.user = results[0];
            // console.log(req.sessionID)
            res.redirect("/");
          } else {
            res.render("sign-in", {
              error: true,
              errorMessage: "Incorrect Password",
            });
          }
        });
      } else {
        res.render("sign-in", {
          error: true,
          errorMessage: "Email not registered.",
        });
      }
    }
  );
});

// reset password using OTP- emails,text messages
// postman

app.get("/sign-up", (req, res) => {
  res.render("sign-up");
});

app.get("/all-users", (req, res) => {
  if (req.session.user) {
    db.query("SELECT * FROM users", (err, result) => {
      res.json(result);
    });
  } else {
    res.json({ error: "Log in" });
  }
});

app.post("/sign-up", upload.single("image"), (req, res) => {
  // get data - body-parser **
  // check if confirm pass & password match **
  // check if email is already used/ existing **
  // encrypt password / create a hash **
  // store all details in db - insert statement
  // console.log(req.body)
  // console.log(req.file)
  let fileType = req.file.mimetype.slice(req.file.mimetype.indexOf("/") + 1);
  if (req.body.password === req.body.confirm) {
    db.query(
      "SELECT email FROM users WHERE email = ?",
      [req.body.email],
      (err, results) => {
        if (results.length > 0) {
          // email exist in db
          res.render("sign-up", {
            error: true,
            errorMessage: "Email already exists. Use another or login",
          });
        } else {
          bcrypt.hash(req.body.password, 4, function (err, hash) {
            // we have access to the hashed pass as hash
            db.query(
              "INSERT INTO users(username,email,password,image_link,image_type,bio) values(?,?,?,?,?,?)",
              [
                req.body.username,
                req.body.email,
                hash,
                req.file.filename,
                fileType,
                req.body.bio,
              ],
              (error) => {
                if (error) {
                  res.render("sign-up", {
                    error: true,
                    errorMessage:
                      "Contact Admin, and tell them something very terrible is going on in the server",
                  });
                } else {
                  res.redirect("/sign-in"); // sucessful signup
                }
              }
            );
          });
        }
      }
    );
  } else {
    res.render("sign-up", {
      error: true,
      errorMessage: "Password and confirm Password do not match",
    });
  }
});

app.post("/new-post" ,upload.single("image"), (req,res)=>{
  if(req.session.user){
      db.query("INSERT INTO posts(post_message, post_image_link, post_owner_id) VALUES(?,?,?)", [req.body.post, req.file.filename, req.session.user.user_id], (err)=>{
        if(!err){
          res.redirect("/")
        }else{
          res.send("Contact admin - - sql error")
        }
      })
  }else{
    res.render("sign-in")
  }
})

app.listen(3001, () => {
  console.log("app running!!...");
});
