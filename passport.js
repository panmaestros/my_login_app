
// load all the things we need
var LocalStrategy   = require('passport-local').Strategy;
var bcrypt = require('bcrypt-nodejs');
var mysqlpool = require('./mysql').pool;
var moment = require('moment');


const minutesLocked = 20; //2

// expose this function to app using module.exports

module.exports = function(passport) {
  	// =========================================================================
      // passport session setup ==================================================
      // =========================================================================
      // required for persistent login sessions
      // passport needs ability to serialize and unserialize users out of session

      // used to serialize the user for the session
      passport.serializeUser(function(user,done) {
  		done(null, user.id);
      });

      // used to deserialize the user
      passport.deserializeUser(function(id,done) {
        mysqlpool.getConnection(function(err, connection){
          connection.query("select * from users where id = ?",[id],function(err,rows){
            if(err){
              connection.release();
              done(null,false);
            }
            else{
              connection.release();
        			done(err, rows[0]);
            }
          });

        });

    });


 	// =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
	// by default, if there was no name, it would just be called 'local'

    passport.use('local-signup', new LocalStrategy({
      usernameField : 'username',
      passwordField : 'password',
      passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, username, password, done) {
        process.nextTick(function(){
          const data = req.body;//JSON.parse(JSON.stringify(req.body));

  		// find a user whose email is the same as the forms email
  		// we are checking to see if the user trying to login already exists
          if(data.confirm!=data.password)
          {
            console.log("Passwords are not matching");
            return done(null, false, req.flash('registerMessage', 'Passwords are not matching.'));
          }

          mysqlpool.getConnection(function(err, connection){

            connection.query("select * from users where username = ?",[data.username],function(err,rows){
      			  //console.log(rows);
              if (err)
              {
                connection.release();
                return done(err);
              }
      			  if (rows.length>0) {
                console.log("That username is already taken");
                connection.release();
                return done(null, false, req.flash('registerMessage', 'That username is already taken.'));
              }
              else {

                // Create a password salt
                const salt = bcrypt.genSaltSync(10);

                const newUserMysql = new Object();
                newUserMysql.username = data.username;
                newUserMysql.password = bcrypt.hashSync(data.password, salt);  // use the generateHash function in our user model
                newUserMysql.salt = salt;



        				const insertQuery = "insert into users ( username, password,salt) values (?,?,?)";
        				//console.log(insertQuery);
                //[newUserMysql.email, newUserMysql.password,newUserMysql.username,newUserMysql.firstname,newUserMysql.lastname]
        				connection.query(insertQuery,[newUserMysql.username, newUserMysql.password, newUserMysql.salt],function(err,result){
          				//newUserMysql.id = rows.insertId;
                  //connection.query("select * from subscriber where email = ?",[newUserMysql.email],function(err,rows){
                  if (err)
                  {
                    connection.release();
                    return done(err);
                  }

                  console.log(rows)
                      //newUserMysql.id = rows[0].id;
                  newUserMysql.id = result.insertId;
                  //console.log(rows.insertId)
                  console.log(newUserMysql);
                  connection.release();
          				return done(null, newUserMysql);
                  //return done(null, false, req.flash('signupMessage', 'The account is registered.'));
                  //});
        			    });


              }

            });

          });

		    });
      }));

    function calculateMinutes(startDate,endDate)
    {
       var start_date = moment(startDate, 'YYYY-MM-DD HH:mm:ss');
       var end_date = moment(endDate, 'YYYY-MM-DD HH:mm:ss');
       var duration = moment.duration(end_date.diff(start_date));
       var minutes = duration.asMinutes();
       return minutes;
    }

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-login', new LocalStrategy({
          // by default, local strategy uses username and password, we will override with email
          usernameField : 'username',
          passwordField : 'password',
          passReqToCallback : true // allows us to pass back the entire request to the callback
      },
      function(req, username, password, done) { // callback with email and password from our form
        process.nextTick(function(){
          const input = req.body;//JSON.parse(JSON.stringify(req.body));
         //console.log(input);
          const data = {
              password : input.password,
              username : input.username
          };

          const ipaddress = req.ip;
          //console.log("Password is here "+data.password);
          mysqlpool.getConnection(function(err, connection){

            connection.query("select * from ipslocked where ipaddress = ?",[ipaddress],function(iperr,ipdata){
              if (iperr)
              {
                connection.release();
                return done(iperr);
              }

              if(ipdata.length>0)
              {
                if(ipdata[0].lastLockedTime!=null)
                {
                  const lockedTime = moment(ipdata[0].lastLockedTime).format("YYYY-MM-DD HH:mm:ss")
                  const myCurrentTime =  moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
                  console.log("LockedTIME:"+lockedTime);
                  console.log("myCurrentTime:"+myCurrentTime);
                  const lockMinutes = calculateMinutes(lockedTime,myCurrentTime);
                  console.log("Locked Minutes:"+lockMinutes);
                  if(lockMinutes>minutesLocked)//2
                  {
                    connection.query("update ipslocked set lastLockedTime = ? where ipaddress = ?",[null,ipaddress],function(newerr,result){
                      if (newerr)
                      {
                        console.log("Error resetting last locked date.")
                        connection.release();
                        return done(null, false, req.flash('loginMessage', 'Oops! Error resetting your last locked time.')); // create the loginMessage and save it to session as flashdata
                      }

                    });
                  }
                  else {
                    connection.release();
                    console.log("Your ipaddress is suspended for 20 minutes");
                    return done(null, false, req.flash('loginMessage', 'Your ipaddress is suspended for 20 minutes.')); // req.flash is the way to set flashdata using connect-flash
                  }
                }
              }

              connection.query("select * from users where username = ?",[data.username],function(err,rows){
                  if (err)
                  {
                    connection.release();
                    return done(err);
                  }
                  if (!rows.length) {
                    console.log("No user found");
                    connection.release();
                    return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash
                  }
                  if (rows[0].failedLoginAttempts>2) {
                    console.log("Your account is locked");
                    connection.release();
                    return done(null, false, req.flash('loginMessage', 'Your account is locked.')); // req.flash is the way to set flashdata using connect-flash
                  }

                //console.log("check password here");
                  // if the user is found but the password is wrong
                  const salt = rows[0].salt;
                  const hashpassword = bcrypt.hashSync(data.password,salt);
                  const storedpassword = rows[0].password;
                  console.log("New Password:"+hashpassword);
                  console.log("Stored Password:"+storedpassword)
                  if ( hashpassword !== storedpassword )//(!bcrypt.compareSync(data.password, rows[0].password))//if (!( rows[0].password == password))
                  {
                    console.log("Password incorrect");
                    //increment failed login count and update failed login count
                    const newfailedcount = rows[0].failedLoginAttempts +1;
                    connection.query("update users set failedLoginAttempts= ? where username = ?",[newfailedcount,rows[0].username],function(err,result){
                      if (err)
                      {
                        connection.release();
                        return done(null, false, req.flash('loginMessage', 'Oops! Error updating your failed count.')); // create the loginMessage and save it to session as flashdata
                      }

                      connection.release();
                      return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata
                    });

                  }
                  else {
                    const newfailedcount = 0;
                    connection.query("update users set failedLoginAttempts= ? where username = ?",[newfailedcount,rows[0].username],function(err,result){
                      if (err)
                      {
                        connection.release();
                        return done(null, false, req.flash('loginMessage', 'Oops! Error updating your failed count.')); // create the loginMessage and save it to session as flashdata
                      }

                      console.log("hello,user has logged in");
                      //console.log("Remember:"+req.body.remember);
          						if (req.body.remember) {
                        console.log("Remember me");
          							req.session.cookie.maxAge =  60 * 1000; // allow user to extend there current session to an hours. Cookie expires after 1 minute //60 *
          						} else {
                        console.log("Dont Remember");
                        //req.session.cookie.expires= false;//set req.session.cookie.expires to false to enable the cookie to remain for only the duration of the user-agent.
          						}

                      // all is well, return successful user
                      connection.release();
                      return done(null, rows[0]);
                    });

                  }
              });
            });

    		  });

        });

      }));

};
