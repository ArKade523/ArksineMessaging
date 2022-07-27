const email = document.getElementById('email');
const password1 = document.getElementById('password');
const password2 = document.getElementById('password2');
const submit = document.getElementById('submit');
const pass_verification = document.getElementById('password-verification');

const checkPasswords = () => {
    if (password1.value === password2.value) {
        pass_verification.style.color = 'green';
        pass_verification.innerHTML = 'Passwords Match!';
        pass_verification.style.margin = '0 0 2vh 0';
    } else {
        pass_verification.style.color = 'red';
        pass_verification.innerHTML = 'Passwords do not Match!';
        pass_verification.style.margin = '0 0 2vh 0';
    }

    console.log('checked passwords');
}

// submit.onclick(validateEmail(email));