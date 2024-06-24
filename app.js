const express = require('express');
const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');
const session = require('express-session');
const store = new session.MemoryStore();
const cookieParser = require('cookie-parser')


const auth = require('./middleware/auth');
const users = require('./middleware/user');
const posts = require('./middleware/posts');
const entity = require('./middleware/entity');

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
        if(JSON.parse(store.sessions[cookie]).user.uuid){
            res.render('home');
        }else{
            res.redirect('/final-steps');
        }
    }else{
        res.redirect('/');
    } 
});

app.get('/final-steps', (req, res) => {
    const cookie = req.cookies['connect.sid'].substring(2,34);
    if(store.sessions[cookie]) {
        res.render('createAccount');
    }else{
        res.redirect('/');
    } 
});

app.get('/identify', (req, res) => {
    res.render('identify');
});

app.get('/user/uuid', (req, res) => {
    const cookie = req.cookies['connect.sid'].substring(2,34);
    return res.status(200).json({success: true, uuid: JSON.parse(store.sessions[cookie]).user.uuid})
});

app.get(/^\/profile\/@.+$/, async (req, res) => {
    const cookie = req.cookies['connect.sid'].substring(2,34);
    if(store.sessions[cookie]) {
        res.render('profile', {user : await users.getUserByUUID(JSON.parse(store.sessions[cookie]).user.uuid)});
    }else{
        res.redirect('/');
    } 
});

app.post('/user/add', users.create);

app.post('/login', auth.login);

app.post('/account/add', async (req, res) => {
    const cookie = req.cookies['connect.sid'].substring(2,34);
    if(store.sessions[cookie]) {
        if(await users.setUUID(JSON.parse(store.sessions[cookie]).user.email, req.body.uuid)) {
            req.session.user.uuid = req.body.uuid;
            res.status(200).json({success: true});
        }else{
            res.status(400).json({success : false, error: "Soething went wrong"});
        }
    }else{
        res.redirect('/');
    }
});

app.post('/posts/add', async (req, res) => {
    const cookie = req.cookies['connect.sid'].substring(2,34);
    if(store.sessions[cookie]) {
        if(await posts.create(JSON.parse(store.sessions[cookie]).user.uuid, req.body)) {
            res.status(200).json({success: true});
        }else{
            res.status(400).json({success: false, error: "Something went wrong"})
        }
    }else{
        res.redirect('/');
    }
});

app.post('/search', entity.get);

app.listen(4000);

console.log('Server Started on Port 4000');

module.exports = app;

