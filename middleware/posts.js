const { getPosts, setPosts, setLike, unsetLike, setSave, unsetSave } = require('../model/conection');

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

async function addSave(uuid, id) {
    return await setSave(uuid, id);
}

async function removeSave(uuid, id) {
    return await unsetSave(uuid, id);
}

module.exports = {
    create, getSugerence, addlike, removeLike, addSave, removeSave
}