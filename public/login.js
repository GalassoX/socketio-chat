const form = document.querySelector('form#form-login');
const usernameInput = document.querySelector('input#username');

form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!usernameInput.value) return;

    window.sessionStorage.setItem('user', usernameInput.value);

    window.location.replace('/');
});