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
            }else{
                console.log(data.error);
            }
        });
}

const posts_container = document.getElementById('posts');
