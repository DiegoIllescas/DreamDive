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

    await fetch('http://192.168.0.18:4000/posts/add', options)
        .then(response => response.json())
        .then(data => {
            if(data.success) {
                window.location.href = "http://192.168.0.18:4000/home";
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
        const fotoURL = user.foto;

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

    await fetch ('http://192.168.0.18:4000/search', options)
        .then(response => response.json())
        .then(data => {
            if(data.success) {
                console.log(data.content);
                renderResult(data.content);
            }else{
                console.log(data.error);
            }
        });
}