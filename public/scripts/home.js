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
            }
            
            
        }
    });

    a.setAttribute('href', '#');


a.innerHTML = "<span class='material-symbols-outlined'>person</span><p>Perfil</p>"
personal.appendChild(a);



async function handleSubmit() {
    const body = document.getElementById('body').value;
    const title = document.getElementById('title').value;
    //Validaciones ->

    if(!(body && title)) {
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
            title: title
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

        const userInnerHTML = `<div class="img-container">
            <img src="${fotoURL}" alt="${name}">
        </div>
        <div class="user-info">
            <h4 class="text-overflow">${name}</h3>
            <span class="uuid">${uuid}</span>
        </div>
        `;

        userCard.innerHTML = userInnerHTML;

        container.appendChild(userCard);
    });
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