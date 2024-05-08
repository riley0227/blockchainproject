// login.js
document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    var studentId = document.getElementById('studentId').value;
    var password = document.getElementById('password').value;
    
    // Here you would normally send the credentials to the server
    // For the purposes of this example, we will simulate a successful login

    // Simulate server response
    if (studentId === 'expectedId' && password === 'expectedPassword') {
        // Set a flag in localStorage to simulate a session (for demonstration purposes only)
        localStorage.setItem('loggedIn', true);
        window.location.href = 'vote.html';
    } else {
        alert('Invalid Student ID or Password');
    }
});
