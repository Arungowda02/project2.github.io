const express = require('express');
const cookieParser = require("cookie-parser");
const sessions = require('express-session');
const http = require('http');
var parseUrl = require('body-parser');
const app = express();

var mysql = require('mysql');
const { encode } = require('punycode');

let encodeUrl = parseUrl.urlencoded({ extended: false });

app.use(sessions({
    secret: "thisismysecrctekey",
    saveUninitialized:true,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }, 
    resave: false
}));

app.use(cookieParser());

var con = mysql.createConnection({
    host: "localhost",
    user: "'root'", 
    password: "password", 
    database: "user_registrations"
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/register.html');
})

app.post('/register', encodeUrl, (req, res) => {
    var firstName = req.body.firstName;
    var lastName = req.body.lastName;
    var userName = req.body.userName;
    var password = req.body.password;

    con.connect(function(err) {
        if (err){
            console.log(err);
        };
        con.query(`SELECT * FROM users WHERE username = '${userName}' AND password  = '${password}'`, function(err, result){
            if(err){
                console.log(err);
            };
            if(Object.keys(result).length > 0){
                res.sendFile(__dirname + '/failReg.html');
            }else{
            
            function userPage(){
                
                req.session.user = {
                    firstname: firstName,
                    lastname: lastName,
                    username: userName,
                    password: password 
                };

                res.send(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <title>Login and register form with Node.js, Express.js and MySQL</title>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
                </head>
                <body>
                    <div class="container">
                        <h3>Hi, ${req.session.user.firstname} ${req.session.user.lastname}</h3>
                        <a href="/">Log out</a>
                    </div>
                </body>
                </html>
                `);
            }
                
                var sql = `INSERT INTO users (firstname, lastname, username, password) VALUES ('${firstName}', '${lastName}', '${userName}', '${password}')`;
                con.query(sql, function (err, result) {
                    if (err){
                        console.log(err);
                    }else{
                        
                        userPage();
                    };
                });

        }

        });
    });


});

app.get("/index", (req, res)=>{
    res.sendFile(__dirname + "/index.html");
});

app.post("/dashboard", encodeUrl, (req, res)=>{
    var userName = req.body.userName;
    var password = req.body.password;

    con.connect(function(err) {
        if(err){
            console.log(err);
        };
        con.query(`SELECT * FROM users WHERE username = '${userName}' AND password = '${password}'`, function (err, result) {
          if(err){
            console.log(err);
          };

          function userPage(){
            
            req.session.user = {
                firstname: result[0].firstname,
                lastname: result[0].lastname,
                username: userName,
                password: password 
            };

            res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <title>Login and register form with Node.js, Express.js and MySQL</title>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
            </head>
            <body>
                <div class="container">
                    <h3>Hi, ${req.session.user.firstname} ${req.session.user.lastname}</h3>
                    <a href="/">Log out</a>
                </div>
            </body>
            </html>
            `);
        }

        if(Object.keys(result).length > 0){
            userPage();
        }else{
            res.sendFile(__dirname + '/failLog.html');
        }

        });
    });
});

app.listen(4000, ()=>{
    console.log("Server running on port 4000");
});