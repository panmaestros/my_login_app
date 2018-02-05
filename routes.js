
var RateLimit = require('express-rate-limit');//express-rate-limit is used to prevent brute force attacks on the server
var mysqlpool = require('./mysql').pool; // get the pool configuration to make queries to the mysql database
var moment = require('moment'); // moment is used for processing  all javascript and mysql dates

//the rate limit achieves the foollowing objective:
//a) 13 failed login attempts regardless of username in the span of 10 minutes
//the limiter object created is placed in the app login route before your passport login authentication
var limiter = new RateLimit({
  windowMs: 10*60*1000,// 10*60*1000 //10*1000, // 10 minutes to keep record in memory.
  max: 13, //2// limit each IP to 13 requests per windowMs, max number of connections during windowMs milliseconds before sending a 429 response
  delayMs: 0, // disable delaying - full speed until the max limit is reached
  message: 'Too many requests, please try again later.',//Error message returned when max is exceeded.
  onLimitReached: function(req, res, options){

    console.log("Limit Reached called");
    const myLockTime =  moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    const ipaddress = req.ip;
      mysqlpool.getConnection(function(err, connection){

        connection.query("select * from ipslocked where ipaddress = ?",[ipaddress],function(err,rows){
          if (err)
          {
            connection.release();
            return done(err);
          }
          if (rows.length>0) {
            if(rows[0].lastLockedTime!==null)
            {
              connection.release();
              return;
            }
            connection.query("update ipslocked set lastLockedTime= ? where ipaddress = ?",[myLockTime, ipaddress],function(err,result){
              if(err){
                console.log("Error updating locked time:"+err);
                connection.release();
                return err;
              }
              else{
                connection.release();
                return;
              }
            });
          }
          else {
            const insertQuery = "insert into ipslocked ( ipaddress, lastLockedTime) values (?,?)";
            connection.query(insertQuery,[ipaddress, myLockTime],function(err,result){
              if (err)
              {
                console.log("Error inserting new locked user:"+err);
                connection.release();
                return err;
              }

          });
        }

      });

    });
  }
});

// app/routes.js
module.exports = function(app, passport) {

    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    //app.use(upload);
    app.get('/login', isNotLoggedIn, function(req, res) {
        // render the page and pass in any flash data if it exists
        //console.log(req.user);
        var options = {};
        options.message = req.flash('loginMessage');

        res.render('ejs/login', options);
    });
    // process the login form


    app.post('/login', limiter, passport.authenticate('local-login', {
        successRedirect: '/profile', // redirect to the secure profile section
        failureRedirect: '/login', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));


    app.get('/register', isNotLoggedIn, function(req, res) {
        // render the page and pass in any flash data if it exists
        var options = {};
        options.message = req.flash('registerMessage');

        res.render('ejs/register', options);
    });

    // process the signup form
    app.post('/register', passport.authenticate('local-signup', {
        successRedirect: '/profile', // redirect to the secure profile section
        failureRedirect: '/register', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));


    app.get('/logout', isLoggedIn, function(req, res) {

        req.logout();
        res.redirect('/login');
    });


    app.get("/profile", isLoggedIn,
        function(req, res) {
            var options = {};
            options.user = req.user;

            res.render('ejs/profile', options);
        });




    app.get("/*", function(req, res) {
        res.render('ejs/index');
    });

    // route middleware to make sure
    function isLoggedIn(req, res, next) {

        // if user is authenticated in the session, carry on
        if (req.isAuthenticated())
            return next();
        // if they aren't redirect them to the home page
        res.redirect('/');
    }

    // route middleware to make sure
    function isNotLoggedIn(req, res, next) {

        // if user is authenticated in the session, carry on
        if (!req.isAuthenticated())
            return next();
        // if they aren't redirect them to the home page
        res.redirect('/profile');
    }
}
