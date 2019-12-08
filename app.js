//jshint esversion:6

require('dotenv').config();

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const md5 = require("md5");
const session =require("express-session");
const passport =require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
var findOrCreate = require('mongoose-findorcreate');


const app = express();
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));
app.use(session({
    secret: "our secret",
    resave: false,
    saveUninitialized: false
 }));

app.use(passport.initialize());
app.use(passport.session());

//Mongoose todo's
   mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser:true,useUnifiedTopology: true});
   mongoose.set("useCreateIndex",true);


  // Create gooleID or facebookId otherwise there will be multiple
  //entries in Database as same user logins multiple tile
   const userSchema = new mongoose.Schema({
     email:String,
     password:String,
     googleId:String,
     facebookId:String,
     facebookName:String,
     secret: String
   });


      userSchema.plugin(passportLocalMongoose);
      userSchema.plugin(findOrCreate);

      const User = new mongoose.model("User",userSchema);

      passport.use(User.createStrategy());

      //passport.serializeUser(User.serializeUser());
      //passport.deserializeUser(User.deserializeUser());

      passport.serializeUser(function(user, done) {
        //console.log("I am userID"+user.id)
          done(null, user.id);
      });

      passport.deserializeUser(function(id, done) {
         User.findById(id, function(err, user) {
           if(err){console.log("We Find Error here*************");}
         done(err, user);
        });
     });

     //Facebook oaut

     passport.use(new FacebookStrategy({
      clientID: process.env.FACEBOOK_APP_ID,
     clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: "http://localhost:3000/auth/facebook/callback",
    profileFields: ['id', 'displayName', 'photos', 'email']
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile);
    User.findOrCreate({ facebookId: profile.id,facebookName:profile.displayName }, function (err, user) {
      return cb(err, user);
    });
  }
));

app.get('/auth/facebook',
  passport.authenticate('facebook'));


  app.get('/auth/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/login' }),
    function(req, res) {
      // Successful authentication, redirect home.
      res.redirect('/secrets');
    });
  //Google oauth

        passport.use(new GoogleStrategy({
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: "http://localhost:3000/auth/google/secrets",
          //userProfileURL: "https://www.googleapis.com/outh2/v3/userinfo"
          //callbackURL: "http://www.example.com/auth/google/secrets"
        },
        function(accessToken, refreshToken, profile, cb) {
          console.log(profile);
          User.findOrCreate({ googleId: profile.id }, function (err, user) {
            console.log("i am user "+user);
            return cb(err, user);
          });
        }
      ));

/////////////



//TODO

app.get("/",function(req,res){
  res.render("home");
});

app.get("/auth/google",
  passport.authenticate("google", { scope: ["profile"] }));

app.get("/auth/google/secrets",
    passport.authenticate("google", { failureRedirect: "/login" }),
    function(req, res) {
      // Successful authentication, redirect home.
      res.redirect('/secrets');
});

app.get("/login",function(req,res){
  res.render("login");
});

app.get("/register",function(req,res){
  res.render("register");
});

app.get("/secrets",function(req,res){
if(req.isAuthenticated()){
  User.find({"secret":{$ne:null}},function(err,foundUser){
     if(err){
       console.log(err);
     }else{
       if(foundUser){
         res.render("secrets",{userWithSecret:foundUser});
       }
     }

  });
} else{res.redirect("/");}



// if(req.isAuthenticated()){
//     res.render("secrets");
//   }else{
//     res.redirect("/login");
//   }

});
app.get("/submit",function(req,res){
   if(req.isAuthenticated()){
     res.render("submit");
   }else{
     res.redirect("/login");
   }

});

app.get("/logout",function(req,res){
  req.logout();
  res.redirect("/");
});

//// All Post requests---

app.post("/register",function(req,res){

   User.register({username:req.body.username},req.body.password,function(err,user){
      if(err){
        console.log(err);
        res.redirect("/register");
      }else{
          passport.authenticate("local")(req,res,function(){
            res.redirect("/secrets");
        });
      }
   });
});

app.post("/login",function(req,res){
  const user = new User({
    username: req.body.username,
    password: req.body.password,
  });

  console.log("user object --> " +user);

  req.login(user,function(err){
    if(err){
      console.log(err);
    }else{
      passport.authenticate("local")(req,res,function(){
        res.redirect("/secrets");
      });
    }

  });

});

app.post("/submit",function(req,res){
   const submittedSecret=req.body.secret;
  //since session remembers user who is logged in we use user.id
  console.log(req.user+"  userID-->  "+req.user.id);
   User.findById(req.user.id,function(err,foundUser){
    if(err){
      console.log(err);
    }else{
      if(foundUser){foundUser.secret = submittedSecret;
      foundUser.save(function(){
        res.redirect("/secrets");
      });
    }else{console.log("no_user found **");}
  }
   });


});

app.listen(3000, function() {
  console.log("* Server starts on port 3000 *");
})
