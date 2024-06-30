const { getPosts, setPosts, setLike, unsetLike } = require('../model/conection');

async function create(uuid, body) {
    return await setPosts(uuid, body);
}

async function getSugerence(uuid) {
    let posts = await getPosts(uuid);
    return posts;
}

async function addlike(uuid, id) {
    return await setLike(uuid, id);
}

async function removeLike(uuid, id) {
    return await unsetLike(uuid, id);
}

module.exports = {
    create, getSugerence, addlike, removeLike
}