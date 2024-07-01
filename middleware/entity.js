const { searchUsers, seachPost } = require("../model/conection");

async function search(pattern, uuid) {
  let content = {
    users: [],
    posts: [],
  };

  content.users = await searchUsers(pattern);
  content.posts = await seachPost(pattern, uuid);

  return content;
}

module.exports = {
  search,
};
