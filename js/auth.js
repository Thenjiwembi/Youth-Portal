// js/auth.js

document.addEventListener("DOMContentLoaded", () => {
  // --- 1. SIGNUP FORM LOGIC ---
  const signupForm = document.getElementById("signup-form");
  if (signupForm) {
    signupForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const user = {
        fullName: document.getElementById("signup-fullname").value,
        email: document.getElementById("signup-email").value,
        location: document.getElementById("signup-location").value,
        qualification: "Diploma",
        skills: "HTML, CSS, JavaScript"
      };

      // Store in localStorage
      localStorage.setItem("userProfile", JSON.stringify(user));
      localStorage.setItem("isLoggedIn", "true");

      alert("Account created successfully! Redirecting to your profile...");
      window.location.href = "profile.html";
    });
  }

  // --- 2. LOGIN FORM LOGIC ---
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("login-email").value;

      // Fetch or create user data
      let storedUser = JSON.parse(localStorage.getItem("userProfile")) || {
        fullName: "Registered User",
        email: email,
        location: "Cape Town",
        qualification: "Diploma",
        skills: "JavaScript, PHP"
      };

      storedUser.email = email;
      localStorage.setItem("userProfile", JSON.stringify(storedUser));
      localStorage.setItem("isLoggedIn", "true");

      window.location.href = "profile.html";
    });
  }

  // --- 3. PROFILE PAGE DISPLAY & EDIT LOGIC ---
  const profileForm = document.getElementById("profile-form");
  if (profileForm) {
    // Load current values
    const storedData = localStorage.getItem("userProfile");
    if (storedData) {
      const user = JSON.parse(storedData);
      document.getElementById("profile-fullname").value = user.fullName || "";
      document.getElementById("profile-email").value = user.email || "";
      document.getElementById("profile-location").value = user.location || "";
      document.getElementById("profile-qualification").value = user.qualification || "Diploma";
      document.getElementById("profile-skills").value = user.skills || "";

      document.getElementById("display-fullname").textContent = user.fullName || "User Profile";
      document.getElementById("display-email").textContent = user.email || "";
      
      const initials = (user.fullName || "User").split(" ").map(n => n[0]).join("").toUpperCase();
      document.getElementById("avatar-initials").textContent = initials;
    }

    // Save profile changes
    profileForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const updatedUser = {
        fullName: document.getElementById("profile-fullname").value,
        email: document.getElementById("profile-email").value,
        location: document.getElementById("profile-location").value,
        qualification: document.getElementById("profile-qualification").value,
        skills: document.getElementById("profile-skills").value
      };

      localStorage.setItem("userProfile", JSON.stringify(updatedUser));

      // Update UI headings
      document.getElementById("display-fullname").textContent = updatedUser.fullName;
      document.getElementById("display-email").textContent = updatedUser.email;
      
      const statusMsg = document.getElementById("save-status");
      statusMsg.style.display = "inline";
      setTimeout(() => { statusMsg.style.display = "none"; }, 3000);
    });
  }

  // --- 4. LOGOUT LOGIC ---
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.setItem("isLoggedIn", "false");
      window.location.href = "login.html";
    });
  }
});