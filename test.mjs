// Firebase imports and initialization
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  updateProfile, 
  onAuthStateChanged, 
  signOut, 
  signInWithEmailAndPassword, 
  deleteUser, 
  GoogleAuthProvider,
  signInWithPopup
} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';

const firebaseConfig = {
  apiKey: "AIzaSyB00jg1XzU4mrgy-xvN0GrOQmNpDO3dnaA",
  authDomain: "user-auth-728d9.firebaseapp.com",
  projectId: "user-auth-728d9",
  storageBucket: "user-auth-728d9.appspot.com",
  messagingSenderId: "671173028984",
  appId: "1:671173028984:web:ddc9dc9837b1bc0514d18d",
  measurementId: "G-QWBB7JQBG6"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// UI update function
function updateUI(user) {
  const authNav = document.getElementById('nav-right');
  const userNav = document.getElementById('user-nav');
  const usernameSpan = document.getElementById('username');
  
  if (!authNav || !userNav || !usernameSpan) {
    console.error("One or more DOM elements not found");
    return;
  }

  if (user) {
    // Hide auth navigation and show user navigation
    authNav.style.display = 'none';
    userNav.style.display = 'flex';
    
    // Update username or email display
    usernameSpan.textContent = user.displayName || user.email;
  } else {
    // Show auth navigation and hide user navigation
    authNav.style.display = 'flex';
    userNav.style.display = 'none';
  }
}

onAuthStateChanged(auth, (user) => {
  // Only update the UI, no redirection handled here
  updateUI(user);
});

// Authentication functions
function signUp(username, email, password) {
  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      return updateProfile(userCredential.user, { displayName: username });
    })
    .then(() => {
      console.log("Sign up successful");
      window.location.href = 'https://tanishpashte.github.io/mock_interview_synerr/';
      updateUI(auth.currentUser);
    })
    .catch((error) => {
      console.error("Error:", error.code, error.message);
    });
}

function signIn(email, password) {
  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      console.log("Sign in successful");
      window.location.href = 'https://tanishpashte.github.io/mock_interview_synerr/';
      updateUI(auth.currentUser);
    })
    .catch((error) => {
      console.error("Error signing in:", error.code, error.message);
      alert("Failed to sign in. Please check your email and password.");
    });
}

function logout() {
  signOut(auth).then(() => {
    localStorage.removeItem('user');
    updateUI(null);
    window.location.href = 'https://tanishpashte.github.io/mock_interview_synerr/';
  }).catch((error) => {
    console.error("Error signing out:", error);
    alert("Failed to sign out. Please try again.");
  });
}

function deleteAccount() {
  const user = auth.currentUser;
  if (!user) {
    alert("You must be signed in to delete your account.");
    return;
  }

  if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
    deleteUser(user).then(() => {
      localStorage.removeItem('user');
      window.location.href = 'https://tanishpashte.github.io/mock_interview_synerr/';
      updateUI(null);
      alert("Your account has been deleted successfully.");
    }).catch((error) => {
      console.error("Error deleting user account:", error);
      if (error.code === 'auth/requires-recent-login') {
        alert("For security reasons, please sign out and sign in again before deleting your account.");
      } else {
        alert("Failed to delete account. Please try again later.");
      }
    });
  }
}

function handleGoogleAuth() {
  const provider = new GoogleAuthProvider();
  signInWithPopup(auth, provider)
  .then((result) => {
    console.log("User authenticated with Google successfully:", result.user);
    window.location.href = 'https://tanishpashte.github.io/mock_interview_synerr/';
    updateUI(auth.currentUser);
  }).catch((error) => {
      console.error("Error authenticating with Google:", error.code, error.message);
      alert("Failed to authenticate with Google. Please try again.");
    });
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
  const currentPath = window.location.pathname;

  if (currentPath.includes('signup-page.html')) {
    const signupForm = document.getElementById("signup-form");
    const googleSignupButton = document.getElementById("google-signup-button");

    if (signupForm) {
      signupForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const username = document.getElementById("signup-username").value;
        const email = document.getElementById("signup-email").value;
        const password = document.getElementById("signup-password").value;
        const confirmPassword = document.getElementById("signup-confirm-password").value;

        if (password !== confirmPassword) {
          console.error("Passwords do not match");
          return;
        }

        signUp(username, email, password);
      });
    }

    if (googleSignupButton) {
      googleSignupButton.addEventListener("click", handleGoogleAuth);
    }

  } else if (currentPath.includes('signin-page.html')) {
    const signinForm = document.getElementById("signin-form");
    const googleSigninButton = document.getElementById("google-signin-button");

    if (signinForm) {
      signinForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = document.getElementById("signin-email").value;
        const password = document.getElementById("signin-password").value;
        signIn(email, password);
      });
    }

    if (googleSigninButton) {
      googleSigninButton.addEventListener("click", handleGoogleAuth);
    }

  } else if (currentPath.includes('index.html') || currentPath === '/mock_interview_synerr/') {
    const logoutLink = document.getElementById('logout-link');
    const deleteAccountButton = document.getElementById('delete-account-button');

    if (logoutLink) {
      logoutLink.addEventListener('click', (e) => {
        e.preventDefault();
        logout();
      });
    }

    if (deleteAccountButton) {
      deleteAccountButton.addEventListener('click', deleteAccount);
    }
  }
});

document.getElementById('interview-button').addEventListener('click', function() {
  // Mock function to check if the user is logged in
  // Replace this with your actual logic to check login status
  // function isUserLoggedIn() {
  //   // This should return true if the user is logged in, false otherwise
  //   // For example, you might check if a token exists in local storage
  //   return localStorage.getItem('userLoggedIn') === 'true';
  // }
  console.log('interview button clicked');

  if (auth.currentUser) {
    window.location.href = 'https://tanishpashte.github.io/mock_interview_synerr/interview.html';
  } else {
    window.location.href = 'https://tanishpashte.github.io/mock_interview_synerr/signin-page.html';
  }
});

// Initial UI update
// updateUI(auth.currentUser);