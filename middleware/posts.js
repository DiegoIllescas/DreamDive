const { getPosts, setPosts } = require('../model/conection');

async function create(uuid, body) {
    return await setPosts(uuid, body);
}

module.exports = {
    create
}