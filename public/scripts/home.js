const personal = document.getElementById("personal-info");
let uuid = "@";
const a = document.createElement("a");
const url = document.URL;

fetch("http://localhost:4000/user/uuid")
  .then((response) => response.json())
  .then((data) => {
    if (data.success) {
      uuid = data.uuid;
      if (!window.location.href.includes("profile")) {
        a.setAttribute("href", `profile/${uuid}`);
      } else {
        a.setAttribute("href", `../profile/${uuid}`);
        if (!(uuid == window.location.pathname.split("/").pop())) {
          const editProfile = document.getElementById("edit");
          editProfile.style.visibility = "hidden";
        }
      }
    }
  });

async function getPoem() {
  const id = window.location.pathname.split("/").pop();
  const response = await fetch(`/poem/${id}`);
  const data = await response.json();

  if (data.success) {
    renderPost(data.poem);
    renderCommentForm(data.user);
    renderComments(data.comments);
    console.log(data.comments);
  }
}

function renderComments(comments) {
  const commentConteiner = document.getElementById("comment");
  comments.forEach((comment) => {
    const commentDiv = document.createElement("div");
    commentDiv.classList.add("comment");

    const commentHTML = `<div class="post-header">
            <div class="autor-foto" onclick="window.location.href = '/profile/${comment.uuid}'" style="cursor: pointer">
                <img src="${comment.foto}" alt="autor">
            </div>
            <div class="autor">
                <span class="name">${comment.autor}</span>
                <spam class="uuid">${comment.uuid}</span>
            </div>
        </div>
        <div class="post-message">
            <p>${comment.body}</p>
        </div>`;

    commentDiv.innerHTML = commentHTML;

    commentConteiner.appendChild(commentDiv);
  });
}

function renderCommentForm(user) {
  const commentConteiner = document.getElementById("comment");
  const comment = document.createElement("div");
  comment.classList.add("form-comment");
  const htmlComment = `<h3>Comentarios</h3><br><br><div class="post-header">
            <div class="autor-foto" onclick="window.location.href = '/profile/${user.uuid}'" style="cursor: pointer">
                <img src="${user.foto}" alt="autor">
            </div>
            <div class="autor">
                <span class="name">${user.name}</span>
                <spam class="uuid">${user.uuid}</span>
            </div>
        </div>
        <div class="post-message">
            <textarea name="comment" id="comment-input" placeholder="Escribe aquí tu opinión"></textarea>
        </div>
        <br>
        <div class="btn-comment">
          <button onclick="setComment()">Comentar</button>
        </div>`;

  comment.innerHTML = htmlComment;

  commentConteiner.appendChild(comment);
}

function setComment() {
  const comment = document.getElementById("comment-input").value;
  const options = {
    method: "POST",
    mode: "cors",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      comment: comment,
    }),
  };

  const id = window.location.pathname.split("/").pop();

  fetch(`/comment/${id}`, options)
    .then((response) => response.json())
    .then((data) => {
      if (!data.success) {
        alert(data.error);
      } else {
        window.location.reload();
      }
    });
}

async function getFollowers() {
  const num = document.getElementById("num_followers");

  const uuid = window.location.pathname.split("/").pop();
  await fetch(`http://localhost:4000/followers/${uuid}`)
    .then((response) => response.json())
    .then((data) => {
      if (!data.success) {
        num.innerHTML = "0";
      } else {
        num.innerHTML = data.count.low;
      }
    });
  console.log("llegue aqui");
}

a.innerHTML =
  "<span class='material-symbols-outlined'>person</span><p>Perfil</p>";
personal.appendChild(a);

async function handleSubmit() {
  const body = document.getElementById("body").value;
  const title = document.getElementById("title").value;
  const message = document.getElementById("message").value;
  //Validaciones ->

  if (!(body && title && message)) {
    return;
  }

  //Peticion ->
  const options = {
    method: "POST",
    mode: "cors",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      body: body,
      title: title,
      message: message,
    }),
  };

  await fetch("/posts/add", options)
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        window.location.href = "/home";
      } else {
        console.log(data.error);
      }
    });
  return;
}

function renderResult(content) {
  const container = document.getElementById("main-container");
  while (container.hasChildNodes()) {
    container.removeChild(container.firstChild);
  }
  const users = content.users;
  users.forEach((user) => {
    const userCard = document.createElement("div");
    userCard.classList.add("user-card");

    const name = user.name;
    const uuid = user.uuid;
    let fotoURL = user.foto;

    userCard.id = `${uuid}`;
    userCard.addEventListener(
      "click",
      (event) => {
        const target = event.target.id;
        window.location.href = `http://localhost:4000/profile/${target}`;
        console.log(target);
      },
      true
    );

    const userInnerHTML = `<div class="img-container">
            <img src="${fotoURL}" alt="${name}" width="64px" height="64px">
        </div>
        <div class="user-info">
            <h4 class="text-overflow">${name}</h3>
            <span class="uuid">${uuid}</span>
        </div>
        `;

    userCard.innerHTML = userInnerHTML;

    container.appendChild(userCard);
  });

  const posts = content.posts;
  renderPost(posts);
}

async function search() {
  const field = document.getElementById("search-field").value;

  if (!field) {
    return;
  }

  const options = {
    method: "POST",
    mode: "cors",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      field: field,
    }),
  };

  await fetch("http://localhost:4000/search", options)
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        renderResult(data.content);
      } else {
        console.log(data.error);
      }
    });
}

function closeSession() {
  const options = {
    method: "DELETE",
    mode: "cors",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
  };

  fetch("http://localhost:4000/sesion", options)
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        window.location.href = "http://localhost:4000/";
      } else {
        console.log("Error al cerrar sesion");
      }
    });
}

async function getPost() {
  const uuid = window.location.pathname.split("/").pop();
  await fetch(`http://localhost:4000/post/${uuid}`)
    .then((response) => response.json())
    .then((data) => {
      if (!data.success) {
        //posts.innerHTML = "0";
      } else {
        console.log(data.posts);
        const postsToRender = data.posts;
        renderPost(postsToRender);
      }
    });
}

async function getSaved() {
  await fetch("/saved/post")
    .then((response) => response.json())
    .then((data) => {
      if (!data.success) {
        //logxd
      } else {
        console.log(data.posts);
        const postsToRender = data.posts;
        renderPost(postsToRender);
      }
    });
}

async function getFeed() {
  await fetch(`http://localhost:4000/post`)
    .then((response) => response.json())
    .then((data) => {
      if (!data.success) {
        //posts.innerHTML = "0";
      } else {
        console.log(data.posts);
        const postsToRender = data.posts;
        renderPost(postsToRender);
      }
    });
}

function addLike(id) {
  fetch(`/like/${id}`, {
    method: "POST",
    mode: "cors",
    credentials: "same-origin",
  })
    .then((response) => response.json())
    .then((data) => {
      if (!data.success) {
        alert(data.error);
      }
    });
}

function removeLike(id) {
  fetch(`/like/${id}`, {
    method: "DELETE",
    mode: "cors",
    credentials: "same-origin",
  })
    .then((response) => response.json())
    .then((data) => {
      if (!data.success) {
        alert(data.error);
      }
    });
}

function addSave(id) {
  fetch(`/save/${id}`, {
    method: "POST",
    mode: "cors",
    credentials: "same-origin",
  })
    .then((response) => response.json())
    .then((data) => {
      if (!data.success) {
        alert(data.error);
      }
    });
}

function removeSave(id) {
  fetch(`/save/${id}`, {
    method: "DELETE",
    mode: "cors",
    credentials: "same-origin",
  })
    .then((response) => response.json())
    .then((data) => {
      if (!data.success) {
        alert(data.error);
      }
    });
}

function renderPost(posts) {
  const container = document.getElementById("posts");
  while (container.hasChildNodes()) {
    container.removeChild(container.firstChild);
  }

  posts.forEach((post) => {
    const postContainer = document.createElement("div");
    postContainer.classList.add("post");

    const profileURL = post.foto;
    const autor = post.autor;
    const message = post.message;
    const title = post.title;
    const bodywithout = post.body;
    const id = post.id;

    const body = bodywithout.replace(/\n/g, "<br>");

    const postInnerHTML = `<div class="post-header">
            <div class="autor-foto" onclick="window.location.href = '/profile/${
              post.uuid
            }'" style="cursor: pointer">
                <img src="${profileURL}" alt="autor">
            </div>
            <div class="autor">
                <span class="name">${autor}</span>
                <spam class="uuid">${post.uuid}</span>
            </div>
        </div>
        <div class="post-message">
            <p>${message}</p>
        </div>
        <div class="poem">
            <h3>${title}</h3><br>
            <p>${body}</p>
         </div>
        <div class="interact">
            <a href="/comments/${
              id.low
            }"><span class="material-symbols-outlined">chat_bubble</span><span class="info-post">${
      post.comments.low
    }</span></a>
            <a id="favorite-${id.low}"><span class="material-symbols-outlined ${
      post.likeFlag ? "selected" : ""
    }">favorite</span><span class="info-post">${post.likes.low}<span></a>
            <a id="saved-${id.low}"><span class="material-symbols-outlined ${
      post.savedFlag ? "saved" : ""
    }">bookmark</span></a>
        </div>`;

    postContainer.innerHTML = postInnerHTML;
    container.appendChild(postContainer);
  });

  const likesElements = document.querySelectorAll('[id^="favorite-"]');
  likesElements.forEach((element) => {
    element.addEventListener("click", () => {
      if (element.firstChild.classList.contains("selected")) {
        element.firstChild.classList.remove("selected");
        element.lastChild.textContent =
          parseInt(element.lastChild.textContent) - 1;
        removeLike(element.id.split("-")[1]);
      } else {
        element.firstChild.classList.add("selected");
        element.lastChild.textContent =
          parseInt(element.lastChild.textContent) + 1;
        addLike(element.id.split("-")[1]);
      }
    });
  });

  const savedElements = document.querySelectorAll('[id^="saved-"]');
  savedElements.forEach((element) => {
    element.addEventListener("click", () => {
      if (element.firstChild.classList.contains("saved")) {
        element.firstChild.classList.remove("saved");
        removeSave(element.id.split("-")[1]);
      } else {
        element.firstChild.classList.add("saved");
        addSave(element.id.split("-")[1]);
      }
    });
  });
}

// profile ejs

// Abrir modal al hacer clic en "Editar Perfil"
document.getElementById("edit").addEventListener("click", function () {
  document.getElementById("editModal").style.display = "block";
});

// Cerrar modal
function closeEditModal() {
  document.getElementById("editModal").style.display = "none";
}

document
  .getElementById("editForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const name = document.getElementById("editName").value;
    const description = document.getElementById("editDescription").value;

    const editPhoto = document.getElementById("editPhoto").files[0];
    const editBackground = document.getElementById("editBackground").files[0];

    const data = {
      name: name,
      description: description,
    };

    // Convertir foto a Base64 (si se seleccionó)
    if (editPhoto) {
      data.photo = await toBase64(editPhoto);
    }

    // Convertir fondo a Base64 (si se seleccionó)
    if (editBackground) {
      data.background = await toBase64(editBackground);
    }

    //console.log(data); // Verificar que las imágenes estén incluidas en data

    fetch("/updateProfile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (response.ok) {
          closeEditModal();
          location.reload(); // Recargar la página después de actualizar
        } else {
          throw new Error("Error al actualizar el perfil");
        }
      })
      .catch((error) => {
        alert(error.message);
      });
  });

// Función auxiliar para convertir a Base64
async function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}
