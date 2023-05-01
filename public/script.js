const socket = io();

const form = document.querySelector("#form");
const input = document.querySelector("input#input");
const listMessages = document.querySelector("div#messages");

const logoutButton = document.querySelector("button#logout");

let typingTimer = null;

const username = sessionStorage.getItem('user');
document.querySelector('p#showusername').textContent = username;


function parseMessageDate(date) {
    const currentDate = new Date();
    if (currentDate.getDate() == date.getDate() && currentDate.getMonth() == date.getMonth() && currentDate.getFullYear() == currentDate.getFullYear()) {
        return `Hoy a las ${date.getHours()}:${date.getMinutes()}`
    } else {
        return `${date.getDate()}/${date.getMonth()}/${date.getFullYear()} a las ${date.getHours()}:${date.getMinutes()}`
    }
}


form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!input.value) return;
    socket.emit('message', { username, date: Date.now() }, input.value);

    input.value = '';
});

input.addEventListener('keydown', (e) => {
    socket.emit('setTyping', username);
});

logoutButton.addEventListener('click', () => {
    window.sessionStorage.removeItem('user');
    socket.emit('userDisconnected', username);
    location.reload();
});


socket.emit('userConnected', username);

socket.on('newMessage', (authorData, msg) => {
    const { username, date } = authorData;

    const li = document.createElement('li');
    li.innerHTML = `
          <div>
            <h3>
                ${username}
                <span class="lm-date">- ${parseMessageDate(new Date(date))}</span>
            </h3>
            <p>${msg}</p>
          </div>
    `
    listMessages.appendChild(li);
    window.scrollTo(0, document.scrollingElement.scrollHeight);
});

socket.on('connected', () => {
    const li = document.createElement('li');
    li.innerHTML = `<b>user connected!</b>`
    listMessages.appendChild(li);
});

socket.on('disconnected', () => {
    const li = document.createElement('li');
    li.innerHTML = `<b>user disconnected :c</b>`
    listMessages.appendChild(li);
});

socket.on('userTyping', (user, state) => {
    const div = document.querySelector('div#chatinput');
    const p = document.createElement('p');
    if (!typingTimer) {
        p.setAttribute('id', 'ptyping');
        div.classList.remove('chatb');
        p.textContent = state ? `${user} esta escribiendo...` : '';
        div.appendChild(p);
        clearTimeout(typingTimer);
    }

    typingTimer = setTimeout(() => {
        div.removeChild(p);
        div.classList.add('chatb');
        typingTimer = null;
    }, 2000);
});

socket.on('updateListOfUsers', (listOfUsers) => {
    const listElement = document.querySelector('ul#listOfUsers');
    listElement.innerHTML = '';

    listOfUsers.forEach((user) => {
        const li = document.createElement('li');
        li.textContent = user;
        li.classList.add('cl-item');
        listElement.appendChild(li);
    });
    console.log(listOfUsers)
});

window.addEventListener('unload', () => {
    socket.emit('userDisconnected', username);
    console.log('saliendo')
});