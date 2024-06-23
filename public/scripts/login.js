function handleClick() {
    let email = document.getElementById("email").value;
    let pass = document.getElementById("password").value;

    //Validaciones aqui ->


    //Envio de peticion ->

    const options = {
        method: 'POST',
        mode: 'cors',
        credentials: 'same-origin',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email: email,
            password: pass
        })
    };

    fetch("http://192.168.0.18:4000/login", options)
        .then(response => response.json())
        .then(data => {
            if(data.success) {

            }else{

            }
        });
}