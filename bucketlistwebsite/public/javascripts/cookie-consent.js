document.addEventListener('DOMContentLoaded', function () {
  const cookieBanner = document.getElementById('cookie-consent-banner');
  const acceptCookiesButton = document.getElementById('accept-cookies');

  // Function to set a cookie
  function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
  }

  // Function to get a cookie
  function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  // Check if the cookie consent has already been accepted
  if (getCookie('cookiesAccepted') !== 'true') {
    cookieBanner.style.display = 'flex';
  }

  // Set the cookie when the user accepts
  acceptCookiesButton.addEventListener('click', function () {
    setCookie('cookiesAccepted', 'true', 365);
    cookieBanner.style.display = 'none';
  });
});