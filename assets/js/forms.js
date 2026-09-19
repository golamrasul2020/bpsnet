/* ==========================================================================
   BPS FORMS.JS — client-side validation + demo submission handlers
   (Replace the fake "submitDemo" calls with real fetch() to your
   PHP/Laravel/Node endpoint once the backend is available.)
   ========================================================================== */
(function ($) {
  "use strict";

  function submitDemo(form, messageEl, successText) {
    form.classList.add('was-validated');
    if (!form.checkValidity()) return false;

    // Placeholder for backend integration, e.g.:
    // fetch('/api/contact.php', { method: 'POST', body: new FormData(form) })
    if (messageEl) {
      messageEl.innerHTML = `<div class="alert alert-success py-2 mb-0"><i class="bi bi-check-circle-fill"></i> ${successText}</div>`;
    }
    form.reset();
    form.classList.remove('was-validated');
    return true;
  }

  document.addEventListener('bps:componentLoaded', function (e) {
    if (e.detail.file !== 'newsletter.html') return;
    const nlForm = document.getElementById('newsletterForm');
    if (!nlForm) return;
    nlForm.addEventListener('submit', function (ev) {
      ev.preventDefault();
      const msg = document.getElementById('newsletterMsg');
      const email = document.getElementById('newsletterEmail');
      if (email.checkValidity()) {
        msg.innerHTML = '<span class="text-white"><i class="bi bi-check-circle-fill text-accent-c"></i> Thank you for subscribing!</span>';
        nlForm.reset();
      } else {
        msg.innerHTML = '<span class="text-warning">Please enter a valid email address.</span>';
      }
    });
  });

  document.addEventListener('DOMContentLoaded', function () {
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
      contactForm.addEventListener('submit', function (e) {
        e.preventDefault();
        submitDemo(contactForm, document.getElementById('contactFormMsg'), 'Your message has been received. BPS will contact you soon.');
      });
    }

    const membershipForm = document.getElementById('membershipForm');
    if (membershipForm) {
      membershipForm.addEventListener('submit', function (e) {
        e.preventDefault();
        submitDemo(membershipForm, document.getElementById('membershipFormMsg'), 'Application submitted successfully. Our membership committee will review it shortly.');
      });
    }

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', function (e) {
        e.preventDefault();
        document.getElementById('loginFormMsg').innerHTML =
          '<div class="alert alert-info py-2"><i class="bi bi-info-circle-fill"></i> Member login will be enabled once BPS connects its member database.</div>';
      });
    }
  });
})(window.jQuery);