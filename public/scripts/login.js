async function handleSubmit() {
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

    await fetch("http://localhost:4000/login", options)
        .then(response => response.json())
        .then(data => {
            if(data.success) {
                window.location.href = "http://localhost:4000/home";
            }else{
                console.log(data.error);
            }
        });
}