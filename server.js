var path = require("path");
var express = require('express');
var cookieParser = require('cookie-parser');// cookie parser is tied into express sessions and passport to provide user session experience
var bodyParser = require('body-parser');// used to allow the server to read json
var morgan = require('morgan'); // allows server to print all requests made and display on console window.

var app = express();
var port = process.env.PORT || 8080;
//var address = "localhost"; //"192.168.254.33";//192.168.254.33";//254.33
var server = require('http').createServer(app);
//var io  = require('socket.io').listen(server);
var session = require("express-session");//used to create user sessions with passport
var passport = require("passport");//used to authenicate users in the app
var flash = require('connect-flash');//used to display messages to the



require('./passport')(passport); // pass passport to configure passport to our app


//app.use(morgan('dev')); // log requests to the console
app.use(cookieParser()); // read cookies (needed for auth)
// configure body parser to parse json object on server
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(session({
    secret: "thisisthesecretforsession",//secret session cookie is signed with this secret to prevent tampering
    cookie: { maxAge: 10000 },// global time for all user sessions which  expires after 10s, value in milliseconds,
                                            //Each session has a unique cookie object to accompany it. This allows
                                            //you to alter the session cookie per visitor. This is shown in remember me login feature


    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session()); // passport uses the previous session  declared to piggy back off of
app.use(flash()); // use connect-flash for flash messages stored in session
// routes ======================================================================

const PATH_SRC = path.resolve(__dirname, 'views/public');
//expose public folder as static assets
app.use(express.static(PATH_SRC));
//tell nodejs server where your template files are located
app.set('views', path.join(__dirname, 'views'));
//we specify to the server that we are using ejs template language
app.set('view engine', 'ejs');

require('./routes')(app, passport); // load our routes and pass in our app with our fully configured passport


// START THE SERVER and listen on port 8080
// =============================================================================
server.listen(port, () => {
    var port1 = server.address().port;
    //var address1 = server.address().address;
    //address1 +
    console.log('Server is listening at %s', ":" + port1);
});
