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

app.get('/explore', (req, res) => {
    if(!req.cookies['connect.sid']) {
        return res.redirect('/');
    }

    const cookie = req.cookies['connect.sid'].substring(2,34);
    if(!store.sessions[cookie]) {
        return res.redirect('/');
    }

    return res.render('explore');
});

app.get('/public', (req, res) => {
    if(!req.cookies['connect.sid']) {
        return res.redirect('/');
    }

    const cookie = req.cookies['connect.sid'].substring(2,34);
    if(!store.sessions[cookie]) {
        return res.redirect('/');
    }

    return res.render('public');
});

app.get('/saved', (req, res) => {
    if(!req.cookies['connect.sid']) {
        return res.redirect('/');
    }

    const cookie = req.cookies['connect.sid'].substring(2,34);
    if(!store.sessions[cookie]) {
        return res.redirect('/');
    }

    return res.render('saved');
});

app.get('/messages', (req, res) => {
    if(!req.cookies['connect.sid']) {
        return res.redirect('/');
    }

    const cookie = req.cookies['connect.sid'].substring(2,34);
    if(!store.sessions[cookie]) {
        return res.redirect('/');
    }

    return res.render('messages');
});

app.get('/notifications', (req, res) => {
    if(!req.cookies['connect.sid']) {
        return res.redirect('/');
    }

    const cookie = req.cookies['connect.sid'].substring(2,34);
    if(!store.sessions[cookie]) {
        return res.redirect('/');
    }

    return res.render('notifications');
});

app.get('/calendar', (req, res) => {
    if(!req.cookies['connect.sid']) {
        return res.redirect('/');
    }

    const cookie = req.cookies['connect.sid'].substring(2,34);
    if(!store.sessions[cookie]) {
        return res.redirect('/');
    }

    return res.render('calendar');
});


app.get('/config', (req, res) => {
    if(!req.cookies['connect.sid']) {
        return res.redirect('/');
    }

    const cookie = req.cookies['connect.sid'].substring(2,34);
    if(!store.sessions[cookie]) {
        return res.redirect('/');
    }

    return res.render('config');
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

app.get('/sugerence', posts.getSugerence);

app.get('/followers/:uuid', async (req, res) => {
    const num = await profile.numFollowers(req.params.uuid);

    res.status(200).json({success: true, count: num});
});

app.get('/post/:uuid', async (req, res) => {
    const posts = await profile.getPosts(req.params.uuid);

    return res.status(200).json({success: true, posts: posts});
});

app.get('/post', async (req, res) => {
    const postArr = await posts.getSugerence();

    return res.status(200).json({success: true, posts: postArr});
});

app.get('/post/foryou', async (req, res) => {
    if(!req.cookies['connect.sid']) {
        return res.redirect('/');
    }

    const cookie = req.cookies['connect.sid'].substring(2,34);
    if(!store.sessions[cookie]) {
        return res.redirect('/');
    }

    console.log(JSON.parse(store.sessions[cookie]).user.uuid);

    let posts = await profile.getFeed(JSON.parse(store.sessions[cookie]).user.uuid)

    return res.status(200).json({success: true, posts: posts})
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

app.post('/search', entity.get);

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
});

app.put('/friendship/decline', async (req, res) => {
    if(!req.cookies['connect.sid']) {
        return res.redirect('/');
    }

    const cookie = req.cookies['connect.sid'].substring(2,34);
    if(!store.sessions[cookie]) {
        return res.redirect('/');
    }

    if(! await profile.declineFriendRequest(JSON.parse(store.sessions[cookie]).user.uuid, req.body)) {
        return res.status(400).json({ success: false , error : "Algo salio mal"});
    }

    return res.status(200).json({success: true});
});

app.delete('/sesion', (req, res) => {
    req.session.destroy((err) => {
        if(!err) {
            return res.status(200).json({success: true});
        }
    });
});

app.listen(4000);

console.log('Server Started on Port 4000');

module.exports = app;

