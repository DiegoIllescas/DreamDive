const {
  getPosts,
  setPosts,
  setLike,
  unsetLike,
  setSave,
  unsetSave,
  getPostbyId,
  setComment,
  getAllComments,
} = require("../model/conection");

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

async function getById(id, uuid) {
  return await getPostbyId(id, uuid);
}

async function addComment(uuid, id, comment) {
  return await setComment(uuid, id, comment);
}

async function getComments(id) {
  return await getAllComments(id);
}

module.exports = {
  create,
  getSugerence,
  addlike,
  removeLike,
  addSave,
  removeSave,
  getById,
  addComment,
  getComments,
};
