let express = require('express');
let path = require('path');
let logger = require('morgan');
let bodyParser = require('body-parser');
let neo4j = require('neo4j-driver');

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view_engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res) {
    res.send('Funciona');
})

app.listen(4000);
console.log('Server Started on Port 4000');

module.exports = app;

