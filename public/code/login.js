async function try_login(){
    username = document.getElementById("username").value;
    password = document.getElementById("password").value;
    window.location.href = "discussion.html";

    // if ((username.length > 5 && username.length <= 20) && (password.length > 5 && password.length <= 20)){

    //     var user = {
    //         name: username,
    //         pw: password,
    //         voted_args: [],
    //         vated_props: [],
    //     }

    //     const options = {
    //         method: 'Post',
    //         headers: {
    //             'Content-Type': 'application/json',
    //         },
    //         body: JSON.stringify(user)
    //     };

    //     const response = await fetch('/login_user', options);
    //     const temp = await response.json();

    //     const result = temp[1].result;

    //     if (result == "login" && result == "new_user"){
    //         localStorage.setItem('username', JSON.stringify({username: username}));
    //         window.location.href = "discussion.html";
    //     } else if (result == "wrong_password") {
    //         document.getElementById("password_info").textContent = "check password . . .";
    //     } else if(result == "user_not_found"){
    //         document.getElementById("username_info").textContent = "check username . . .";
    //         // new user
    //     }


    // } else {
    //     // password or use
    // }

}