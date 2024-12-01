document.addEventListener('DOMContentLoaded', function() {
  const cookieBanner = document.getElementById('cookie-consent-banner');
  const acceptButton = document.getElementById('accept-cookies');

  // de functie om een cookie te plaatsen 
  function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
  }

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

  // Cals cookieconsent niet is geaccepteerd blijven de banner laten zien
  if (!getCookie('cookieConsent')) {
    cookieBanner.style.display = 'block';
  }

  // zoja dan accepteren we de cookie en laten we de banner weg
  acceptButton.addEventListener('click', function() {
    setCookie('cookieConsent', 'true', 365);
    cookieBanner.style.display = 'none';
  });
});