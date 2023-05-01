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

    const h3 = document.createElement('h3');
    h3.textContent = username;

    const span = document.createElement('span');
    span.classList.add('lm-date');
    span.textContent = ` - ${parseMessageDate(new Date(date))}`;

    h3.appendChild(span);

    const div = document.createElement('div');
    div.appendChild(h3);

    const p = document.createElement('p');
    p.classList.add('lm-msg');
    p.textContent = msg;

    div.appendChild(p);

    listMessages.appendChild(div);

    window.scrollTo(0, document.scrollingElement.scrollHeight);
});

socket.on('connected', () => {
    const div = document.createElement('div');
    div.classList.add('chat-ann');

    const h4 = document.createElement('h4');
    h4.textContent = 'User connected';
    div.appendChild(h4);

    listMessages.appendChild(div);
});

socket.on('disconnected', () => {
    const div = document.createElement('div');
    div.classList.add('chat-ann');

    const h4 = document.createElement('h4');
    h4.textContent = 'User disconnected';
    div.appendChild(h4);

    listMessages.appendChild(div);
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

    const pCount = document.querySelector('p#cl-count');
    pCount.innerHTML =
        listOfUsers.length !== 1
            ? `<b><i>${listOfUsers.length} usuarios conectados</b></i>`
            : `<b><i>${listOfUsers.length} usuario conectado</b></i>`;
});

window.addEventListener('unload', () => {
    socket.emit('userDisconnected', username);
    console.log('saliendo')
});