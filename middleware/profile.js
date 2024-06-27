const { setFollow, setFriendRequest, updateFriendRequest, deleteFriendRequest, countFollowers, getProfilePost, getFeedbyUUID } = require('../model/conection');

async function follow(uuid, body) {
    return await setFollow(uuid, body.uuid);
}

async function sendFriendRequest(uuid, body) {
    return await setFriendRequest(uuid, body.uuid);
}

async function acceptFriendRequest(uuid, body) {
    return await updateFriendRequest(uuid, body.uuid);
}

async function declineFriendRequest(uuid, body) {
    return await deleteFriendRequest(uuid, body.uuid);
}

async function numFollowers(uuid) {
    return await countFollowers(uuid);
}

async function getPosts(uuid) {
    return await getProfilePost(uuid);
}

async function getFeed(uuid) {
    return await getFeedbyUUID(uuid);
}

module.exports = {
    follow, sendFriendRequest, acceptFriendRequest, declineFriendRequest, numFollowers, getPosts, getFeed
}