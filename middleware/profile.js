const { setFollow } = require('../model/conection');

async function follow(uuid, body) {
    return await setFollow(uuid, body.uuid);
}

module.exports = {
    follow
}