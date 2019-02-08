const uuid = require('uuid/v1');
//const mongodb = require('mongodb');

module.exports = {
    home(req, res, next) {
        console.log(req.db);
        res.status(200).send("hello");
    },

    test(req, res, next) {
        
    },

    checkToken(req, res) {
        console.log(req.body);
        res.sendStatus(200);
      },
    
      logout(req,res) {
        console.log("LOGGING OUT");
        res.clearCookie("token").send();
    },

    authenticate(req, res, next) {
        const { username, password } = req.body;
        console.log(username);
        req.db.collection(CONSTANTS.USERS).findOne({ username: username }, function(err, user) {
              if (err) console.log("elbaszodott");
              if (user) {
                console.log(user);
                  // Issue token

                  if (user.password === password) {

                  const payload = { username };
                  const token = jwt.sign(payload, secret, {
                    expiresIn: '1h'
                  });
                  //res.status(200).send();
                  res.cookie('token', token, { httpOnly: true }).sendStatus(200);
                } else {
                  res.status(403).send();
                }
            }
            
          });
    },

    register(req, res) {
        console.log(req.body.username)
        console.log(req.body.password);
        const {username, password} = req.body;
        const user = new User(username,password);
        req.db.collection("users").save(user, function(err) {
          if (err) {
            res.status(500)
              .send("Error registering new user please try again.");
          } else {
            res.status(200).send("Welcome to the club!");
          }
        });
      },

};
