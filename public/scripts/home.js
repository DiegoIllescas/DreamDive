const personal = document.getElementById("personal-info");
let uuid = "@";
const a = document.createElement('a');
const url = document.URL;
 
 fetch("http://localhost:4000/user/uuid")
    .then(response => response.json())
    .then(data => {
        if(data.success) {
            uuid = data.uuid;
            if(!window.location.href.includes('profile')) {
                a.setAttribute('href', `profile/${uuid}`);
            }else{
                a.setAttribute('href', `../profile/${uuid}`);
                if(!(uuid == window.location.pathname.split('/').pop())) {
                    const editProfile = document.getElementById('edit');
                    editProfile.style.visibility = 'hidden';
                }
            }
        }
    });


async function getFollowers() {
    const num = document.getElementById('num_followers');

    const uuid = window.location.pathname.split('/').pop();
    await fetch(`http://localhost:4000/followers/${uuid}`).then(response => response.json()).then(data => {
        if(!data.success) {
            num.innerHTML = "0";
        }else {
            num.innerHTML = data.count.low;
        }
    });
    console.log('llegue aqui');
}

a.innerHTML = "<span class='material-symbols-outlined'>person</span><p>Perfil</p>"
personal.appendChild(a);



async function handleSubmit() {
    const body = document.getElementById('body').value;
    const title = document.getElementById('title').value;
    const message = document.getElementById('message').value;
    //Validaciones ->

    if(!(body && title && message)) {
        return;
    }

    //Peticion ->
    const options = {
        method: 'POST',
        mode: 'cors',
        credentials: 'same-origin',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            body: body,
            title: title,
            message: message
        })
    };

    await fetch('http://localhost:4000/posts/add', options)
        .then(response => response.json())
        .then(data => {
            if(data.success) {
                window.location.href = "http://localhost:4000/home";
            }else{
                console.log(data.error);
            }
        });
    return;
}

function renderResult(content) {
    const container = document.getElementById('main-container');
    while(container.hasChildNodes()) {
        container.removeChild(container.firstChild);
    }
    const users = content.users;
    users.forEach(user => {
        const userCard = document.createElement('div');
        userCard.classList.add('user-card');
        

        const name = user.name;
        const uuid = user.uuid;
        let fotoURL = user.foto;
        if(url.substring(0, url.lastIndexOf('/'))) {
            fotoURL = '../' + fotoURL;
        }

        userCard.id = `${uuid}`;
        userCard.addEventListener('click', (event) => {
            const target = event.target.id;
            window.location.href = `http://localhost:4000/profile/${target}`;
            console.log(target);
        }, true);

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
    const field = document.getElementById('search-field').value;

    if(!field) {
        return;
    }

    const options = {
        method: 'POST',
        mode: 'cors',
        credentials: 'same-origin',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            field: field
        })
    }

    await fetch ('http://localhost:4000/search', options)
        .then(response => response.json())
        .then(data => {
            if(data.success) {
                renderResult(data.content);
            }else{
                console.log(data.error);
            }
        });
}

function closeSession() {
    const options = {
        method: 'DELETE',
        mode: 'cors',
        credentials: 'same-origin',
        headers: {
            "Content-Type": "application/json"
        }
    }

    fetch('http://localhost:4000/sesion', options)
    .then(response => response.json())
    .then(data => {
        if(data.success) {
            window.location.href = "http://localhost:4000/";   
        }else{
            console.log('Error al cerrar sesion');
        }
    });
}

async function getPost() {
    const posts = document.getElementById('posts');

    const uuid = window.location.pathname.split('/').pop();
    await fetch(`http://localhost:4000/post/${uuid}`).then(response => response.json()).then(data => {
        if(!data.success) {
            posts.innerHTML = "0";
        }else {
            console.log(data.posts);
            const postsToRender = data.posts;
            renderPost(postsToRender);
        }
    });
}

async function getFeed() {
    await fetch(`http://localhost:4000/post`).then(response => response.json()).then(data => {
        if(!data.success) {
            posts.innerHTML = "0";
        }else {
            console.log(data.posts);
            const postsToRender = data.posts;
            renderPost(postsToRender);
            const likesElements = document.querySelectorAll('[id^="favorite-"]');
            likesElements.forEach(element => {
                element.addEventListener('click', () => {
                    if(element.firstChild.classList.contains("selected")) {
                        element.firstChild.classList.remove("selected");
                        element.lastChild.textContent = parseInt(element.lastChild.textContent) - 1;
                        removeLike(element.id.split("-")[1]);
                    }else {
                        element.firstChild.classList.add("selected");
                        element.lastChild.textContent = parseInt(element.lastChild.textContent) + 1;
                        addLike(element.id.split("-")[1]);
                    }
                });
            });
        }
    });
}

function addLike(id) {
    fetch(`/like/${id}`, { method: "POST", mode: 'cors', credentials: 'same-origin' })
    .then(response => response.json())
    .then(data => {
        if(!data.success) {
            alert(data.error);
        }
    });
}

function removeLike(id) {
    fetch(`/like/${id}`, { method: "DELETE", mode: 'cors', credentials: 'same-origin' })
    .then(response => response.json())
    .then(data => {
        if(!data.success) {
            alert(data.error);
        }
    });
}

function renderPost(posts) {
    const container = document.getElementById('posts');
    while(container.hasChildNodes()) {
        container.removeChild(container.firstChild);
    }

    posts.forEach((post) => {
        const postContainer = document.createElement('div');
        postContainer.classList.add('post');
        postContainer.id = `${post.id.low}`;

        const profileURL = '../'+ post.foto;
        const autor = post.autor;
        const message = post.message;
        const title = post.title;
        const bodywithout = post.body;
        const id = post.id;

        const body = bodywithout.replace(/\n/g, "<br>");

        const postInnerHTML = `<div class="post-header">
            <div class="autor-foto">
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
            <a><span class="material-symbols-outlined">chat_bubble</span></a>
            <a id="favorite-${post.id.low}"><span class="material-symbols-outlined ${post.likeFlag ? "selected" : ""}">favorite</span><span class="info-post">${post.likes.low}<span></a>
            <a><span class="material-symbols-outlined">bookmark</span></a>
        </div>`;

        postContainer.innerHTML = postInnerHTML;
        container.appendChild(postContainer);
    });
}

// profile ejs

// Abrir modal al hacer clic en "Editar Perfil"
document.getElementById('edit').addEventListener('click', function() {
    document.getElementById('editModal').style.display = 'block';
});

// Cerrar modal
function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
}

document.getElementById('editForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const name = document.getElementById('editName').value;
    const description = document.getElementById('editDescription').value;

    const editPhoto = document.getElementById('editPhoto').files[0];
    const editBackground = document.getElementById('editBackground').files[0];

    const data = {
        name: name,
        description: description
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

    fetch('/updateProfile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
        .then(response => {
            if (response.ok) {
                closeEditModal();
                location.reload(); // Recargar la página después de actualizar
            } else {
                throw new Error('Error al actualizar el perfil');
            }
        })
        .catch(error => {
            alert(error.message);
        });
});

// Función auxiliar para convertir a Base64
async function toBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
}





