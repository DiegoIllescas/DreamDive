async function handleSubmit() {
    const uuid = document.getElementById('uuid').value;

    //Validaciones aqui ->
    if(!uuid) {
        return;
    }

    //Peticion al server ->
    const options = {
        method: 'POST',
        mode: 'cors',
        credentials: 'same-origin',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            uuid: uuid
        })
    };

    await fetch('http://localhost:4000/account/add', options)
        .then(response => response.json())
        .then(data => {
            if(data.success) {
                window.location.href = "http://localhost:4000/home";
            }else{
                console.log(data.error);
            }
        });
}