# My Medullun Submission by Mark Springer

## Synopsis

This project is a basic login and register web application built using Node-Express using EJS templates and MySQL. For this project there are four web pages located in the views folder and in the ejs subfolder as follows:

* Index (Home) page: `views/ejs/index.js` - This page is the home page and the default page shoen to the user. It contains only a navigation to the login and register pages
* Register page: `views/ejs/register.js` - This page is the register page where you can create a new user for the website by inputing a username and password.
* Login page: `views/ejs/login.js` - This page is the login page where you can log into your account with username and password. The login page has extra protection features to prevent unwanted attackers from access an account. The extra protection features are as follows:

...Enter an incorrect password three times for a particular user and your account would be locked. A successful login also resets the amount failed attempts made.
... Entering random usernames and passwords 13 times in the span of 10 minutes would result in your ipaddress being block from logging in for 20 minutes.
... When logging in, if you do check the 'Remember Me' checkbox then your active session is 1 minute long. If you dont then your active session is 10 seconds long. Then you will be logged out again.
... Your password is encrypted using a salt, which is the maximum security I know to put on password policies.

* Profile page: `view/ejs/profile.js` - When a user successfully registers or logs, the user can view their username, encrypted password and id.

## Prerequisites

This project is built with Nodejs and a MySQL so the following software are required to be installed.

1. Download and install nodejs and the npm package manager with this link: [https://nodejs.org/en/download/]
2. You must download MySQL Server and MySQL Workbench using the mysql installer, follow this link: [https://dev.mysql.com/downloads/installer/]

## Installation Instructions

To install this project you complete the instructions set below.

1. Open MySQL workbench and create a local instance and record the port, username and password when creating the instance.
2. Open the npm package console window that comes installed with nodejs
3. Clone this repo: git clone [https://github.com/panmaestros/my_login_app.git]
4. Go to the directory of the clone project in your npm package console wwindow.
5. Install packages by running this command: `npm install`
6. Edit the mysql.js database configuration file with the port, username and password from the mysql local instance you created above : `mysql.js`
7. Create the database schema in the mysql instance by copying the entire MySQL code in the create_database.js file and pasting it into a new query window in your MySQL instance : `mysql_scripts/create_database.js`
8. Launch the app by using this command: `npm start`
9. Visit in your browser at: [http://localhost:8080]

## Data Model Explained



## Tests

Describe and show how to run the tests.


## API Reference

* User Authentication was built using Passport API:[https://github.com/jaredhanson/passport]
* Connection and querying of the MySQL database was done using MySQL API: [https://github.com/mysqljs/mysql]
* Session management was done using Express Session and Cookie Parser API: [https://github.com/expressjs/session] & [https://github.com/expressjs/cookie-parser]
* Password encryptionwas done using Bcrypt API: [https://www.npmjs.com/package/bcrypt-nodejs]
* EJS was used as the templating language to built the webUI pages: [https://github.com/tj/ejs]
* Brute force attack prevention was done using Express Rate Limit API: [https://github.com/nfriedly/express-rate-limit]

## Disclaimer Notes

* This project will not be maintained or updated anymore.
* This project was not built using the latest ES6 syntax and Promises. This was mainly due to the libraries being used. As such this project may be outdated soon.
