async function handleSubmit() {
    const uuid = document.getElementById('uuid').value;

    //Validaciones aqui ->

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

    await fetch('http://192.168.0.18:4000/account/add', options)
        .then(response => response.json())
        .then(data => {
            if(data.success) {
                window.location.href = "http://192.168.0.18:4000/home";
            }else{
                console.log(data.error);
            }
        });
}