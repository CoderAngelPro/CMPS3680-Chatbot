const loginFormContainer  = document.getElementById('loginFormContainer');
const signupFormContainer = document.getElementById('signupFormContainer');
const formTitle           = document.getElementById('formTitle');
const loginForm           = document.getElementById('loginForm');
const signupForm          = document.getElementById('signupForm');


function showLogin ()  {
  loginFormContainer.style.display = 'block';
  signupFormContainer.style.display = 'none';
  formTitle.textContent = 'Welcome to FredBot';
}
function showSignup () {
  loginFormContainer.style.display = 'none';
  signupFormContainer.style.display = 'block';
  formTitle.textContent = 'Create FredBot Account';
}
document.getElementById('showSignupLink').onclick = e => { e.preventDefault(); showSignup(); };
document.getElementById('showLoginLink').onclick  = e => { e.preventDefault(); showLogin();  };


async function post (url, body) {
  const r = await fetch(url, {
    method : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body   : JSON.stringify(body)
  });
  if (!r.ok) throw new Error((await r.json()).error || r.statusText);
  return r.json();
}


loginForm.addEventListener('submit', async e => {
  e.preventDefault();
  const email    = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value;

  try {
    const { token } = await post('/auth/login', { email, password });
    localStorage.token = token;
    location.href = '/';    
  } catch (err) {
    alert('Login failed: ' + err.message);
  }
});


signupForm.addEventListener('submit', async e => {
  e.preventDefault();
  const email    = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value;
  const confirm  = document.getElementById('confirmPassword').value;

  if (password !== confirm) {
    alert('Passwords do not match'); return;
  }

  try {
    await post('/auth/register', { email, password });
    alert('Account created! Please log in.');
    showLogin();
  } catch (err) {
    alert('Sign-up error: ' + err.message);
  }
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
          .catch(console.error);
}

showLogin();