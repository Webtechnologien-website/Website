document.addEventListener('DOMContentLoaded', function () {
    const banner = document.getElementById('cookie-consent-banner');
    const acceptButton = document.getElementById('accept-cookies');
  
    // Check if the user has already given consent
    if (!localStorage.getItem('cookieConsent')) {
      banner.style.display = 'block';
    }
  
    // Handle the accept button click
    acceptButton.addEventListener('click', function () {
      localStorage.setItem('cookieConsent', 'true');
      banner.style.display = 'none';
    });
});