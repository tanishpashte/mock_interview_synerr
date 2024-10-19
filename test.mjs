import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import { getAuth, createUserWithEmailAndPassword, updateProfile, onAuthStateChanged, signOut  } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';

const firebaseConfig = {
  apiKey: "AIzaSyB00jg1XzU4mrgy-xvN0GrOQmNpDO3dnaA",
  authDomain: "user-auth-728d9.firebaseapp.com",
  projectId: "user-auth-728d9",
  storageBucket: "user-auth-728d9.appspot.com",
  messagingSenderId: "671173028984",
  appId: "1:671173028984:web:ddc9dc9837b1bc0514d18d",
  measurementId: "G-QWBB7JQBG6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// console.log("Firebase initialized:", app); // Debugging line
// if (!auth) {
//   console.error("Firebase Auth failed to load");
// } else {
//   console.log("Firebase Auth loaded successfully");
// }

// Function to update UI based on auth state
function updateUI(user) {
  // console.log(document);
  // console.log("Updating UI for user:", user); // Debugging line
  const authNav = document.getElementById('nav-right');
  const userNav = document.getElementById('user-nav');
  const usernameSpan = document.getElementById('username');

  // console.log("Auth Nav:", authNav); // Debugging line
  // console.log("User Nav:", userNav); // Debugging line
  
  if (user) {
    console.log("User is signed in, updating UI"); // Debugging line
    authNav.style.display = 'none';
    userNav.style.display = 'flex';
    usernameSpan.textContent = user.displayName || user.email;
  } else {
    console.log("No user signed in, reverting UI"); // Debugging line
    authNav.style.display = 'flex';
    userNav.style.display = 'none';
  }
}

// Listen for auth state changes
onAuthStateChanged(auth, (user) => {
  // console.log("Auth state changed:", user); // Debugging line
  updateUI(user);
  if (user) {
    // User is signed in, redirect to index.html if not already there
    if (window.location.pathname !== '/index.html') {
      window.location.href = '/index.html';
    }
  }
});

// Handle form submission
if (window.location.pathname.includes('signup-page.html')){
  const signupForm = document.getElementById("signup-form");
signupForm.addEventListener("submit", (e) => {
  e.preventDefault();
  console.log("Signup form submitted"); // Debugging line
  const username = document.getElementById("signup-username").value;
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;
  const confirmPassword = document.getElementById("signup-confirm-password").value;

  // heck if passwords match
  if (password !== confirmPassword) {
    console.error("Passwords do not match");
    // You might want to display this error to the user
    return;
  }

  // Create a new user
  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed up successfully
      const user = userCredential.user;
      console.log("User signed up:", user);
      // Update the user's profile with the username
      return updateProfile(user, {
        displayName: username
      });
    })
    .then(() => {
      console.log("Username added to profile");
      console.log("Profile updated"); // Debugging line
      window.location.href = "/index.html";
      updateUI(auth.currentUser); // Manually update UI after profile update
      // You might want to redirect the user or update the UI here
      
    })
    .catch((error) => {
      // Handle errors
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error("Error:", errorCode, errorMessage);
    });
});
}

// Simple logout function
// Logout function using Firebase
function logout() {
  signOut(auth).then(() => {
    console.log("User signed out successfully");
    // Clear any additional user session data if needed
    // localStorage.removeItem('user');
    
    // Update UI
    updateUI(null);
    
    // Redirect to login page
    window.location.href = 'index.html';
  }).catch((error) => {
    console.error("Error signing out:", error);
    alert("Failed to sign out. Please try again.");
  });
}

// Check if we're on the index page
if (window.location.pathname.includes('index.html')) {
  document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded");
    const logoutLink = document.getElementById('logout-link');
    console.log("Logout link:", logoutLink);
    
    if (logoutLink) {
      logoutLink.addEventListener('click', function(e) {
        e.preventDefault();
        logout();
      });
    } else {
      console.error("Logout link not found in the DOM");
    }
  });
} else {
  console.log("Not on index.html, current path:", window.location.pathname);
}


// console.log("Firebase has been initialized: ", app);
updateUI(auth.currentUser);
console.log("update successfully");


