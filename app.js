let express = require('express');
let path = require('path');
let logger = require('morgan');
let bodyParser = require('body-parser');
let neo4j = require('neo4j-driver');
require('dotenv').config();

(async () => {
    const URI = 'neo4j://localhost';
    const USER = 'neo4j';
    const PASSWORD = process.env.DB_PASSWORD;
    let driver;

    try{
        driver = neo4j.driver(URI, neo4j.auth.basic(USER, PASSWORD));
        const serverInfo = await driver.getServerInfo();
        console.log('Connection to the DB estabilished');
        //console.log(serverInfo);
    }catch(err){
        console.log(`Connection error\n${err}\nCause: ${err.cause}`);
        await driver.close()
        return;
    }
})();

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

