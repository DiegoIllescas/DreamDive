const { getPosts, setPosts } = require('../model/conection');

async function create(uuid, body) {
    return await setPosts(uuid, body);
}

async function getSugerence(req, res) {
    let posts = await getPosts();

    return posts;
}

module.exports = {
    create, getSugerence
}