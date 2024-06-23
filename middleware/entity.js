const {searchUsers, seachPost} = require('../model/conection');

async function get(req, res) {
    const pattern = req.body.field;
    let content = {
        users: [],
        posts: []
    };
    content.users = await searchUsers(pattern);
    content.posts = await seachPost(pattern);

    return res.status(200).json({success: true, content: content});
}

module.exports = {
    get
}