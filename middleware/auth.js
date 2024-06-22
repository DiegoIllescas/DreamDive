const { json } = require('body-parser');
require('dotenv').config();

async function login(req, res) {
    const email = req.body.email;
    const password = req.body.password;

    console.log(email + ' ' + password);

    res.status(200);
}

module.exports = {
    login
}