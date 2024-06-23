const { getUser, setUser } = require('../model/conection');
const crypto = require('crypto');

async function create(req, res) {
    const name = req.body.name;
    const email = req.body.email;
    const birth = req.body.birthday;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;

    if(!(name && email && password && confirmPassword)) {
        return res.status(400).json({success: false, error: "Missing fields"});
    }

    if(password != confirmPassword) {
        return res.status(400).json({success: false, error: "Passwords doesn't match"});
    }

    const Already = await getUser(email);
    if(Already) {
        console.log(Already);
        return res.status(400).json({success: false, error: "Already exists"});
    }

    const hashedPassword = crypto.createHash('sha256').update(password, 'utf8').digest('hex');

    if(setUser(email, hashedPassword, name, birth)) {
        return res.status(200).json({success: true});
    }else{
        return res.status(417).json({success: true, error: "Something Went Wrong"});
    }
}

module.exports = {
    create
}