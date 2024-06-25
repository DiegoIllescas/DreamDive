const express = require('express');
const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');
const session = require('express-session');
const store = new session.MemoryStore();
const cookieParser = require('cookie-parser')
require('dotenv').config();


const auth = require('./middleware/auth');
const users = require('./middleware/user');
const posts = require('./middleware/posts');
const entity = require('./middleware/entity');
const profile = require('./middleware/profile');
const { error } = require('console');

let app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(session({
    secret: process.env.SECRET_KEY,
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
    return res.render('index');
});

app.get('/signup', (req, res) => {
    res.render('signup');
});

app.get('/home', (req, res) => {
    if(!req.cookies['connect.sid']) {
        return res.redirect('/');
    }
    const cookie = req.cookies['connect.sid'].substring(2,34);

    if(!store.sessions[cookie]) {
        return res.redirect('/final-steps');
    }
    
    if(!JSON.parse(store.sessions[cookie]).user.uuid) {
        return res.redirect('/final-steps');
    }

    return res.render('home');
});

app.get('/final-steps', (req, res) => {
    if(!req.cookies['connect.sid']) {
        return res.redirect('/');
    }

    const cookie = req.cookies['connect.sid'].substring(2,34);
    if(!store.sessions[cookie]) {
        return res.redirect('/');
    }

    if(JSON.parse(store.sessions[cookie]).user.uuid) {
        return res.redirect('/home');
    }

    return res.render('createAccount');
});

app.get('/identify', (req, res) => {
    res.render('identify');
});

app.get('/user/uuid', (req, res) => {
    if(!req.cookies['connect.sid']) {
        return res.redirect('/');
    }

    const cookie = req.cookies['connect.sid'].substring(2,34);

    return res.status(200).json({success: true, uuid: JSON.parse(store.sessions[cookie]).user.uuid})
});

app.get('/profile/:uuid', async (req, res) => {
    if(!req.cookies['connect.sid']) {
        return res.redirect('/');
    }

    const cookie = req.cookies['connect.sid'].substring(2,34);
    if(!store.sessions[cookie]) {
        return res.redirect('/');
    }

    return res.render('profile', {user : await users.getUserByUUID(req.params.uuid)});
});

app.post('/user/add', users.create);

app.post('/login', auth.login);

app.post('/account/add', async (req, res) => {
    if(!req.cookies['connect.sid']) {
        return res.redirect('/');
    }

    const cookie = req.cookies['connect.sid'].substring(2,34);
    if(!store.sessions[cookie]) {
        return res.redirect('/');
    }

    if(! await users.setUUID(JSON.parse(store.sessions[cookie]).user.email, req.body.uuid)) {
        return res.status(400).json({success : false, error: "Algo salio mal"});   
    }

    req.session.user.uuid = req.body.uuid;
    return res.status(200).json({success: true});
});

app.post('/posts/add', async (req, res) => {
    if(!req.cookies['connect.sid']) {
        return res.redirect('/');
    }

    const cookie = req.cookies['connect.sid'].substring(2,34);
    if(!store.sessions[cookie]) {
        return res.redirect('/');
    }

    if(! await posts.create(JSON.parse(store.sessions[cookie]).user.uuid, req.body)) {
        return res.status(400).json({success : false, error: "Algo salio mal"});
    }
    
    return res.status(200).json({success: true});
});

app.post('/follow/add', async (req, res) => {
    if(!req.cookies['connect.sid']) {
        return res.redirect('/');
    }

    const cookie = req.cookies['connect.sid'].substring(2,34);
    if(!store.sessions[cookie]) {
        return res.redirect('/');
    }

    if(! await profile.follow(JSON.parse(store.sessions[cookie]).user.uuid, req.body)) {
        return res.status(400).json({success: false, error: "Algo salio mal"});
    }

    return res.status(200).json({success : true});
});

app.post('/friendship/send', async (req, res) => {
    if(!req.cookies['connect.sid']) {
        return res.redirect('/');
    }

    const cookie = req.cookies['connect.sid'].substring(2,34);
    if(!store.sessions[cookie]) {
        return res.redirect('/');
    }

    if(! await profile.sendFriendRequest(JSON.parse(store.sessions[cookie]).user.uuid, req.body)) {
        return res.status(400).json({success: false, error: "Algo salio mal"});
    }

    return res.status(200).json({success: true});
});

app.put('/friendship/accept', async (req, res) => {
    if(!req.cookies['connect.sid']) {
        return res.redirect('/');
    }

    const cookie = req.cookies['connect.sid'].substring(2,34);
    if(!store.sessions[cookie]) {
        return res.redirect('/');
    }

    if(! await profile.acceptFriendRequest(JSON.parse(store.sessions[cookie]).user.uuid, req.body)) {
        return res.status(400).json({ success: false , error : "Algo salio mal"});
    }

    return res.status(200).json({success: true});
})

app.post('/search', entity.get);

app.listen(4000);

console.log('Server Started on Port 4000');

module.exports = app;

