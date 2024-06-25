function handleSubmit() {
    let name = document.getElementById("name").value;
    let email = document.getElementById("email").value;
    let pass = document.getElementById("password").value;
    let confPass = document.getElementById("confirmPassword").value;
    let birthday = document.getElementById("birth").value;

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
            confirmPassword: confPass,
            birthday: birthday
        })
    };

    fetch("http://localhost:4000/user/add", options)
        .then(response => response.json())
        .then(data => {
            if(data.success) {
                window.location.href = "http://localhost:4000/";
            }else{
                console.log(data.error);
            }
        });

}