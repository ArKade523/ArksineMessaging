const socket = io();

const form = document.getElementById('form');
const input = document.getElementById('input');
let connected = false;
let user_id;
let username;

console.log("cookie")
console.log(document.cookie)


socket.on('user connected', user => {
    console.log(`${user.name} connected`);
    if (getCookie("user_id")) {
        console.log("cookie user id exists")
        user_id = getCookie("user_id")
    } else {
        user_id = user.id
    }

    if (getCookie("username")) {
        console.log("cookie username exists")
        username = getCookie("username")
    } else {
        username = user.name;
    }
    
    // document.cookie = `user_id=${user_id}`
    setCookie("user_id", user_id, 1)
    // document.cookie = `username=${username}`
    setCookie("username", username, 1)
    connected = true;
})

form.addEventListener('submit', e => {
    e.preventDefault();
    if (input.value) {
        let msg = {
            message: input.value,
            user: {
                id: user_id,
                name: username
            },
            conversation: 1
        }
        socket.emit('chat message', msg);
        input.value= '';
    }
});

socket.on('previous messages', conversation_messages => {
    for (let i = 0; i < conversation_messages.text.length; i++) {
        if (conversation_messages.user_id[i] === user_id) {
            let item = document.createElement('li');
            item.textContent = conversation_messages.text[i];
            item.classList.add('user-message');
            messages.appendChild(item);
            messages.appendChild(document.createElement('br'));
            messages.appendChild(document.createElement('br'));
            window.scrollTo(0, document.body.scrollHeight);
        } else {
            let name = document.createElement('p')
            let item = document.createElement('li');
            item.textContent = conversation_messages.text[i];
            name.textContent = conversation_messages.username[i];
            messages.appendChild(name);
            messages.appendChild(item);
            messages.appendChild(document.createElement('br'));
            messages.appendChild(document.createElement('br'));
            window.scrollTo(0, document.body.scrollHeight);
        }
    }
})

socket.on('chat message', msg => {
    let name = document.createElement('p')
    let item = document.createElement('li');
    console.log(msg);
    console.log(msg.user.name);
    item.textContent = msg.message;
    name.textContent = msg.user.name;
    messages.appendChild(name);
    messages.appendChild(item);
    messages.appendChild(document.createElement('br'));
    messages.appendChild(document.createElement('br'));
    window.scrollTo(0, document.body.scrollHeight);
})

$(() => {
    $("#send").click(() => {
        if (input.value) {
            $("#messages").append(`
            <li class="user-message">${$(input).val()}</li>
            <br /><br />
            `)
            window.scrollTo(0, document.body.scrollHeight);
        }
    })
})

/*----Code to use Cookies----*/
function setCookie(cname,cvalue,exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    let expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
        c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
        }
    }
    return "";
}