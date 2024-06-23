const { getUser } = require('../model/conection');
const crypto = require('crypto');

async function login(req, res) {
    const email = req.body.email;
    const password = req.body.password;

    if(!(email && password)){
        return res.status(400).json({success: false, error: 'Enter the email and password'});
    }

    const user = await getUser(email);
    if(!user) {
        return res.status(400).json({success: false, error: 'Invalid login credentials'});
    }

    if(crypto.createHash('sha256').update(password, 'utf8').digest('hex') != user.password) {
        return res.status(400).json({success: false, error: 'Invalid login credentials'});
    }

    const uuid = user.uuid;

    req.session.auth = true;
    req.session.user = {
        email, uuid
    };
    return res.status(200).json({success: true, session: req.session});
}

module.exports = {
    login
}