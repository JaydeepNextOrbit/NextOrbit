document.addEventListener('DOMContentLoaded', () => {
  // 0. Development Environment Check
  if (window.location.protocol === 'file:') {
    console.warn(
      '⚠️ FORM-SUBMIT NOTICE: You are opening this page directly as a file (file://).\n' +
      'Form submissions (AJAX) will not work due to browser security restrictions.\n' +
      'Please run this project using a local web server (e.g., the included server.ps1 or "npx serve").'
    );
  }

  // 1. Sticky Header
  const header = document.getElementById('site-header');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // 1b. Hamburger Menu Toggle
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const navLinks = document.getElementById('nav-links');

  if (hamburgerBtn && navLinks) {
    hamburgerBtn.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      hamburgerBtn.classList.toggle('active');
      hamburgerBtn.setAttribute('aria-expanded', isOpen);
    });

    // Close menu when a nav link is clicked
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        hamburgerBtn.classList.remove('active');
        hamburgerBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // 2. Scroll Reveal Animations (Intersection Observer)
  const revealElements = document.querySelectorAll('.reveal-text, .reveal-section, .slide-left, .slide-right, .about-fade-up');

  // Check if user prefers reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!prefersReducedMotion) {
    const revealOptions = {
      threshold: 0.15,
      rootMargin: "0px 0px -50px 0px"
    };

    const revealOnScroll = new IntersectionObserver(function (entries, observer) {
      entries.forEach(entry => {
        if (!entry.isIntersecting) {
          return;
        } else {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, revealOptions);

    revealElements.forEach(el => {
      revealOnScroll.observe(el);
    });
  } else {
    // If reduced motion is preferred, make everything visible immediately
    revealElements.forEach(el => {
      el.classList.add('visible');
    });
  }

  // 3. Hero Background Image Sequence (Canvas Animation)
  const heroBgSequence = document.querySelector('.hero-bg-sequence');
  const canvas = document.getElementById('hero-canvas');

  if (canvas && !prefersReducedMotion) {
    const ctx = canvas.getContext('2d');
    const frameCount = 80;
    const currentFrame = index => (
      `<img src=hero/Earth_converting_to_digital_world_202604291901_${index.toString().padStart(3, '0')}.jpg`
    );

    const images = [];
    let imagesLoaded = 0;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      if (imagesLoaded > 0) drawFrame(frameIndex);
    };

    const drawFrame = (index) => {
      if (!images[index] || !images[index].complete) return;

      const hRatio = canvas.width / images[index].width;
      const vRatio = canvas.height / images[index].height;
      const ratio = Math.max(hRatio, vRatio);
      const centerShift_x = (canvas.width - images[index].width * ratio) / 2;
      const centerShift_y = (canvas.height - images[index].height * ratio) / 2;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(images[index], 0, 0, images[index].width, images[index].height,
        centerShift_x, centerShift_y, images[index].width * ratio, images[index].height * ratio);
    };

    for (let i = 0; i < frameCount; i++) {
      const img = new Image();
      img.src = currentFrame(i);
      img.onload = () => {
        imagesLoaded++;
        if (imagesLoaded === 1) {
          resizeCanvas();
          drawFrame(0);
        }
      };
      images.push(img);
    }

    window.addEventListener('resize', resizeCanvas);

    // Scroll-based animation
    const heroSection = document.getElementById('hero');
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const sectionTop = heroSection.offsetTop;
      // The total distance we can scroll while the hero is sticky
      const scrollDistance = heroSection.offsetHeight - window.innerHeight;

      let progress = (scrollY - sectionTop) / scrollDistance;
      if (progress < 0) progress = 0;
      if (progress > 1) progress = 1;

      const frameIndex = Math.min(
        frameCount - 1,
        Math.floor(progress * frameCount)
      );

      requestAnimationFrame(() => drawFrame(frameIndex));
    };

    window.addEventListener('scroll', handleScroll);
  } else if (canvas) {
    // Fallback for reduced motion
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = 'hero/Earth_converting_to_digital_world_202604291900_000.jpg';
    img.onload = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const hRatio = canvas.width / img.width;
      const vRatio = canvas.height / img.height;
      const ratio = Math.max(hRatio, vRatio);
      const centerShift_x = (canvas.width - img.width * ratio) / 2;
      const centerShift_y = (canvas.height - img.height * ratio) / 2;
      ctx.drawImage(img, 0, 0, img.width, img.height, centerShift_x, centerShift_y, img.width * ratio, img.height * ratio);
    };
  }

  // Removed parallax effect since hero is now sticky

  // 4. Smooth scrolling for nav links (fallback for browsers without scroll-behavior: smooth)
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop,
          behavior: 'smooth'
        });

        // Update active class on nav
        document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
        if (this.classList.contains('logo')) {
          document.querySelector('.nav-links a[href="#hero"]').classList.add('active');
        } else {
          this.classList.add('active');
        }
      }
    });
  });

  // 5. Curious Orbit Video Fading Logic
  const curiousVideo = document.getElementById('curious-video');
  if (curiousVideo) {
    let fadeAnimationFrameId = null;
    let fadingOutRef = false;
    let currentOpacity = 0;

    const fadeTo = (targetOpacity, duration) => {
      if (fadeAnimationFrameId) {
        cancelAnimationFrame(fadeAnimationFrameId);
      }
      const startOpacity = currentOpacity;
      const startTime = performance.now();

      const animateFade = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        currentOpacity = startOpacity + (targetOpacity - startOpacity) * progress;
        curiousVideo.style.opacity = currentOpacity;

        if (progress < 1) {
          fadeAnimationFrameId = requestAnimationFrame(animateFade);
        }
      };
      fadeAnimationFrameId = requestAnimationFrame(animateFade);
    };

    // Fade in when the video starts playing (or initially)
    curiousVideo.addEventListener('playing', () => {
      fadingOutRef = false;
      fadeTo(1, 500);
    });

    // Monitor for the fade-out threshold
    curiousVideo.addEventListener('timeupdate', () => {
      const remainingTime = curiousVideo.duration - curiousVideo.currentTime;
      // Start fade out 0.55 seconds before the end
      if (remainingTime <= 0.55 && !fadingOutRef && curiousVideo.duration > 0) {
        fadingOutRef = true;
        fadeTo(0, 500);
      }
    });

    // Handle seamless loop
    curiousVideo.addEventListener('ended', () => {
      curiousVideo.style.opacity = 0;
      currentOpacity = 0;
      setTimeout(() => {
        curiousVideo.currentTime = 0;
        curiousVideo.play().catch(e => console.error("Auto-play prevented", e));
      }, 100);
    });
  }

  // 6. Mouse Tracking for Expertise Section Spotlight
  const expertiseSection = document.getElementById('expertise');
  if (expertiseSection) {
    expertiseSection.addEventListener('mousemove', (e) => {
      const rect = expertiseSection.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      expertiseSection.style.setProperty('--mouse-x', `${x}%`);
      expertiseSection.style.setProperty('--mouse-y', `${y}%`);
    });
  }

  // 7. Schedule Table — Highlight Today's Row
  const scheduleTable = document.getElementById('schedule-table');
  if (scheduleTable) {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayName = dayNames[new Date().getDay()];
    const rows = scheduleTable.querySelectorAll('tbody tr');
    rows.forEach(row => {
      const dayCell = row.querySelector('td:first-child');
      if (dayCell && dayCell.textContent.trim() === todayName) {
        row.classList.add('today-row');
      }
    });
  }

  // 8. Contact Form Validation & Submission
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    const emailInput = document.getElementById('contact-email');
    const phoneInput = document.getElementById('contact-phone');
    const descInput = document.getElementById('contact-description');
    const submitBtn = document.getElementById('contact-submit-btn');
    const successMsg = document.getElementById('form-success');

    const emailError = document.getElementById('email-error');
    const phoneError = document.getElementById('phone-error');
    const descError = document.getElementById('description-error');

    // Validation helpers
    const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isValidPhone = (phone) => /[\d]{7,}/.test(phone.replace(/[\s\-\(\)\+]/g, ''));

    const setError = (input, errorEl, msg) => {
      input.classList.add('invalid');
      input.classList.remove('valid');
      errorEl.textContent = msg;
      errorEl.classList.add('show');
    };

    const clearError = (input, errorEl) => {
      input.classList.remove('invalid');
      errorEl.textContent = '';
      errorEl.classList.remove('show');
    };

    const setValid = (input, errorEl) => {
      input.classList.add('valid');
      input.classList.remove('invalid');
      errorEl.textContent = '';
      errorEl.classList.remove('show');
    };

    // Live validation on blur
    emailInput.addEventListener('blur', () => {
      if (!emailInput.value.trim()) {
        setError(emailInput, emailError, 'Email address is required.');
      } else if (!isValidEmail(emailInput.value.trim())) {
        setError(emailInput, emailError, 'Please enter a valid email address.');
      } else {
        setValid(emailInput, emailError);
      }
    });

    phoneInput.addEventListener('blur', () => {
      if (!phoneInput.value.trim()) {
        setError(phoneInput, phoneError, 'Contact number is required.');
      } else if (!isValidPhone(phoneInput.value.trim())) {
        setError(phoneInput, phoneError, 'Please enter a valid phone number (min 7 digits).');
      } else {
        setValid(phoneInput, phoneError);
      }
    });

    descInput.addEventListener('blur', () => {
      if (!descInput.value.trim()) {
        setError(descInput, descError, 'Project description is required.');
      } else if (descInput.value.trim().length < 10) {
        setError(descInput, descError, 'Description must be at least 10 characters.');
      } else {
        setValid(descInput, descError);
      }
    });

    // Clear error on input
    emailInput.addEventListener('input', () => clearError(emailInput, emailError));
    phoneInput.addEventListener('input', () => clearError(phoneInput, phoneError));
    descInput.addEventListener('input', () => clearError(descInput, descError));

    // Form submission
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Validate all fields
      let hasErrors = false;

      if (!emailInput.value.trim()) {
        setError(emailInput, emailError, 'Email address is required.');
        hasErrors = true;
      } else if (!isValidEmail(emailInput.value.trim())) {
        setError(emailInput, emailError, 'Please enter a valid email address.');
        hasErrors = true;
      } else {
        setValid(emailInput, emailError);
      }

      if (!phoneInput.value.trim()) {
        setError(phoneInput, phoneError, 'Contact number is required.');
        hasErrors = true;
      } else if (!isValidPhone(phoneInput.value.trim())) {
        setError(phoneInput, phoneError, 'Please enter a valid phone number (min 7 digits).');
        hasErrors = true;
      } else {
        setValid(phoneInput, phoneError);
      }

      if (!descInput.value.trim()) {
        setError(descInput, descError, 'Project description is required.');
        hasErrors = true;
      } else if (descInput.value.trim().length < 10) {
        setError(descInput, descError, 'Description must be at least 10 characters.');
        hasErrors = true;
      } else {
        setValid(descInput, descError);
      }

      if (hasErrors) return;

      // Show loading state
      submitBtn.classList.add('loading');
      submitBtn.disabled = true;

      // Real form submission using FormSubmit.co AJAX
      const formData = new FormData(contactForm);
      const data = Object.fromEntries(formData.entries());
      const endpoint = contactForm.getAttribute('action');

      fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      })
        .then(response => response.json())
        .then(data => {
          console.log('FormSubmit Response:', data);
          if (data.success === "true" || data.success === true) {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
            successMsg.classList.add('show');
            contactForm.reset();

            // Clear all valid states
            [emailInput, phoneInput, descInput].forEach(input => {
              input.classList.remove('valid', 'invalid');
            });

            // Hide success message after 6 seconds
            setTimeout(() => {
              successMsg.classList.remove('show');
            }, 6000);
          } else {
            throw new Error(data.message || 'Form submission failed');
          }
        })
        .catch(error => {
          submitBtn.classList.remove('loading');
          submitBtn.disabled = false;

          console.error('Submission Error:', error);

          let errorMsg = error.message;
          if (window.location.protocol === 'file:') {
            errorMsg = 'FormSubmit does not work when opening files directly. Please use a local web server (like server.ps1) to test the contact form.';
          } else if (error.message.includes('Failed to fetch')) {
            errorMsg = 'Unable to reach the submission server. Please check your internet connection or try again later.';
          }

          alert('Error: ' + errorMsg);
        });
    });
  }
});
