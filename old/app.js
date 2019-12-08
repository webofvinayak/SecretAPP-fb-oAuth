//jshint esversion:6

require('dotenv').config();

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const md5 = require("md5");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const app = express();
//Mongoose todo's
   mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser:true,useUnifiedTopology: true});

   const userSchema = new mongoose.Schema({
     email:String,
     password:String
   });




    const User = new mongoose.model("User",userSchema);
/////////////
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

//TODO

app.get("/",function(req,res){
  res.render("home");
});

app.get("/login",function(req,res){
  res.render("login");
});

app.get("/register",function(req,res){
  res.render("register");
});

//// All Post requests---

app.post("/register",function(req,res){

    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
        const newUser = new User({
        email: req.body.username,
        password:hash
      });
      newUser.save(function(err){
        if(err){console.log(err);}else{res.render("secrets");}
       });

    });




     });

app.post("/login",function(req,res){
  const username = req.body.username;
  const password = req.body.password;
  console.log("here is your password-->  "+password);
  User.findOne({email:username},function(err,foundOne){
      if(err){
          console.log(err);
      }else{
        if(foundOne){
          bcrypt.compare(password,foundOne.password,function(err,result){
           if(!err){ if(result==true){res.render("secrets");}}
          });
        }

      }
   });
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
})
