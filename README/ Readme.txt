This app utilised Express Web framework,MongoDB as database store.
Features employed are "log in and register with Facebook and Google"
.env used for creation of environment variables level-1 Security.
App uses Session cookies/ so users do not require re-login unless they log-out or close the browser

This project is a testomony on How various Features can be combined to
create meaningful and simple application for new learners


Some errors
Error no.1 :- multiple Entries in Mongo-Databases.
Solution:- Created GoogleID and FacebookID in Schema. so it created uniq ID.

2) Error no.2: opens secrete page even after logged out:
solution:- use "isAuthenticated" method to prevent user from access to secret page once they log out.

3)Erros no.3 FacebookStrategy is not declared
Solution: passportjs.io page does not talk about creating variable with name FacebookStrategy
this error is addressed be creating const
--const FacebookStrategy = require('passport-facebook').Strategy; --

4)Error no.4: findOrCreate not found.
solution: npm install mongoose-findorcreate
var findOrCreate = require('mongoose-findorcreate');

Some Random Information:

1)Simple plugin for Mongoose which adds a findOrCreate method to models.
 This is useful for libraries like "Passport which require it."
2)click below to understand serialize and deserialize.
https://stackoverflow.com/questions/27637609/understanding-passport-serialize-deserialize
