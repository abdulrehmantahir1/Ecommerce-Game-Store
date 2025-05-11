document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
  
    if (loginForm) {
      loginForm.addEventListener('submit', e => {
        e.preventDefault();
        const data = {
          email: loginForm.email.value,
          password: loginForm.password.value
        };
        fetch('http://localhost:3000/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        })
          .then(res => res.json())
          .then(result => {
            if (result.success) {
              alert('Login successful!');

               // Save user ID and role in localStorage
            if (result.user && result.user.id) {
              localStorage.setItem('user_id', result.user.id);
            }
            localStorage.setItem('role', result.role);  // Save the role in localStorage

    // Redirect based on user role
    if (result.role === 'admin') {
      window.location.href = 'admin.html';  // Redirect to admin page
    } else {
      window.location.href = 'index.html';  // Redirect to the customer index page
    }

             
            } else {
              alert('Login failed: ' + result.message);
            }
          });
      });
    }
  
    if (registerForm) {
      registerForm.addEventListener('submit', e => {
        e.preventDefault();
        const data = {
          username: registerForm.name.value,
          email: registerForm.email.value,
          password: registerForm.password.value
        };
        fetch('http://localhost:3000/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        })
          .then(res => res.json())
          .then(result => {
            if (result.message) {
              alert('Registered! Please login.');
              window.location.href = 'login.html';
            } else {
              alert('Registration failed: ' + result.message);
            }
          })
          .catch(err => {
            console.error('Error:', err);
            alert('Something went wrong during registration.');
          });
      });
    }
  });
  