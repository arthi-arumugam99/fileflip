// FileFlip Landing Page Scripts

document.addEventListener('DOMContentLoaded', function() {
  // Mobile menu toggle
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const navLinks = document.querySelector('.nav-links');

  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });
  }

  // Animate download counter on scroll
  const downloadCounter = document.getElementById('download-counter');
  if (downloadCounter) {
    let hasAnimated = false;
    const targetNumber = 47832;

    const animateCounter = () => {
      if (hasAnimated) return;

      const rect = downloadCounter.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        hasAnimated = true;
        let current = 0;
        const increment = targetNumber / 60;
        const timer = setInterval(() => {
          current += increment;
          if (current >= targetNumber) {
            downloadCounter.textContent = targetNumber.toLocaleString();
            clearInterval(timer);
          } else {
            downloadCounter.textContent = Math.floor(current).toLocaleString();
          }
        }, 16);
      }
    };

    window.addEventListener('scroll', animateCounter);
    animateCounter(); // Check on load
  }

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return;

      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        const headerOffset = 80;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });

        // Close mobile menu if open
        if (navLinks) navLinks.classList.remove('active');
      }
    });
  });

  // FAQ accordion
  document.querySelectorAll('.faq-item summary').forEach(summary => {
    summary.addEventListener('click', function() {
      const details = this.parentElement;
      const allDetails = document.querySelectorAll('.faq-item');

      allDetails.forEach(item => {
        if (item !== details && item.hasAttribute('open')) {
          item.removeAttribute('open');
        }
      });
    });
  });

  // Email form submission (placeholder - connect to your backend)
  const emailForm = document.querySelector('.email-form');
  if (emailForm) {
    emailForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const email = this.querySelector('input[type="email"]').value;

      // Show success message
      const content = this.closest('.email-content');
      content.innerHTML = `
        <div class="email-success">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="24" fill="#10b981"/>
            <path d="M15 24l6 6 12-12" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <h3>You're on the list!</h3>
          <p>Check your inbox at ${email} to confirm your subscription.</p>
        </div>
      `;
    });
  }

  // Track download button clicks (placeholder for analytics)
  document.querySelectorAll('a[href*="/download"]').forEach(btn => {
    btn.addEventListener('click', function() {
      const os = this.href.includes('windows') ? 'Windows' :
                 this.href.includes('macos') ? 'macOS' : 'Linux';
      console.log('Download clicked:', os);
      // Add your analytics tracking here
    });
  });

  // Add scroll-triggered animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-fade-in-up');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.feature-card, .testimonial-card, .format-category, .step').forEach(el => {
    el.style.opacity = '0';
    observer.observe(el);
  });
});
