const express = require('express');
const path = require('path');
const logger = require('morgan');
const neo4j = require('neo4j-driver');
const crypto = require('crypto');
const bodyParser = require('body-parser');
const session = require('express-session');
require('dotenv').config();

const auth = require('./middleware/auth');

let driver;

(async () => {
    const URI = 'neo4j://localhost';
    const USER = 'neo4j';
    const PASSWORD = process.env.DB_PASSWORD;

    try{
        driver = neo4j.driver(URI, neo4j.auth.basic(USER, PASSWORD));
        const serverInfo = await driver.getServerInfo();
        console.log('Connection to the DB estabilished');
    }catch(err){
        console.log(`Connection error\n${err}\nCause: ${err.cause}`);
        await driver.close()
        return;
    }
})();

let app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(session({
    secret: 'some secret',
    cookie: { maxAge: 60000},
    saveUninitialized: false,
    resave: false
}));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res) {
    res.render('index');
});

app.get('/signup', (req, res) => {
    res.render('signup');
});

app.get('/home', (req, res) => {
    res.render('home');
});

app.get('/identify', (req, res) => {
    res.render('identify');
});

app.post('/user/add');

app.post('/login', auth.login);

app.listen(4000);
console.log('Server Started on Port 4000');

module.exports = app;

