function handleClick() {
    let name = document.getElementById("name").value;
    let email = document.getElementById("email").value;
    let pass = document.getElementById("password").value;
    let confPass = document.getElementById("confirmPassword").value;

    //Validaciones aqui ->

    //peticion ->

    const options = {
        method: 'POST',
        mode: 'cors',
        credentials: 'same-origin',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: name,
            email: email,
            password: pass,
            confirmPassword: confPass
        })
    };

    fetch("http://192.168.0.18:4000/user/add", options)
        .then(response => response.json())
        .then(data => {
            if(data.success) {
                window.location.href = "http://192.168.0.18:4000/";
            }else{
                console.log(data.error);
            }
        });

}