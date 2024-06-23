const express = require('express');
const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');
const session = require('express-session');
const store = new session.MemoryStore();
const cookieParser = require('cookie-parser')


const auth = require('./middleware/auth');
const users = require('./middleware/user');

let app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(session({
    secret: 'some secret',
    cookie: { maxAge: 1000 * 60 * 60 * 3},
    saveUninitialized: false,
    resave: false,
    store
}));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

app.get('/', function(req, res) {
    res.render('index');
});

app.get('/signup', (req, res) => {
    res.render('signup');
});

app.get('/home', (req, res) => {
    const cookie = req.cookies['connect.sid'].substring(2,34);
    if(store.sessions[cookie]) {
        res.render('home');
    }else{
        res.redirect('/');
    } 

});

app.get('/identify', (req, res) => {
    res.render('identify');
});

app.post('/user/add', users.create);

app.post('/login', auth.login);

app.listen(4000);

console.log('Server Started on Port 4000');

module.exports = app;

