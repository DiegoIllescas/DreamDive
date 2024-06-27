const { setFollow, setFriendRequest, updateFriendRequest, deleteFriendRequest } = require('../model/conection');

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

module.exports = {
    follow, sendFriendRequest, acceptFriendRequest, declineFriendRequest
}