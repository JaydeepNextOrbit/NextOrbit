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
  let scrolledState = false;

  window.addEventListener('scroll', () => {
    const isScrolled = window.scrollY > 50;
    if (isScrolled !== scrolledState) {
      scrolledState = isScrolled;
      header.classList.toggle('scrolled', isScrolled);
    }
  }, { passive: true });

  // 1c. Scroll Spy for Dynamic Navigation Highlights (Optimized to avoid layout thrashing)
  const spySections = document.querySelectorAll('section[id], header[id]');
  const navItems = document.querySelectorAll('.nav-links a');

  let cachedSectionLayouts = [];
  const cacheSectionLayouts = () => {
    cachedSectionLayouts = Array.from(spySections).map(section => ({
      top: section.offsetTop,
      height: section.offsetHeight,
      id: section.getAttribute('id')
    }));
  };

  // Cache initial layouts and update them on resize
  cacheSectionLayouts();
  window.addEventListener('resize', cacheSectionLayouts);

  const updateActiveNavLink = () => {
    let currentId = '';
    const scrollPosition = window.scrollY + 140; // Offset for sticky header height

    for (let i = 0; i < cachedSectionLayouts.length; i++) {
      const layout = cachedSectionLayouts[i];
      if (scrollPosition >= layout.top && scrollPosition < layout.top + layout.height) {
        const idVal = layout.id;
        // Map about components to the main "about" nav key
        if (idVal.startsWith('about')) {
          currentId = '#about';
        } else if (idVal === 'design-showcase' || idVal === 'curious-orbit') {
          currentId = '#creations'; // Highlight Creations during the showcase sections
        } else {
          currentId = '#' + idVal;
        }
      }
    }

    if (currentId) {
      navItems.forEach(item => {
        if (item.getAttribute('href') === currentId) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      });
    }
  };

  window.addEventListener('scroll', updateActiveNavLink, { passive: true });
  updateActiveNavLink(); // Trigger once on page load to highlight initial section

  // 1b. Hamburger Menu Toggle & Overlay
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const navLinks = document.getElementById('nav-links');
  const navOverlay = document.getElementById('nav-overlay');

  if (hamburgerBtn && navLinks) {
    const toggleMenu = (open) => {
      const isOpen = typeof open === 'boolean' ? open : !navLinks.classList.contains('open');
      navLinks.classList.toggle('open', isOpen);
      hamburgerBtn.classList.toggle('active', isOpen);
      hamburgerBtn.setAttribute('aria-expanded', isOpen);
      if (navOverlay) {
        navOverlay.classList.toggle('open', isOpen);
      }
    };

    hamburgerBtn.addEventListener('click', () => toggleMenu());

    // Close menu when a nav link is clicked
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => toggleMenu(false));
    });

    // Close menu when overlay is clicked
    if (navOverlay) {
      navOverlay.addEventListener('click', () => toggleMenu(false));
    }
  }

  // 2. Scroll Reveal Animations (Intersection Observer)
  const isMobileOrTablet = () => window.innerWidth < 1024;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  const triggerHeroTextReveal = () => {
    document.querySelectorAll('#hero .reveal-text').forEach(el => el.classList.add('visible'));
  };

  const revealElements = document.querySelectorAll('.reveal-text, .reveal-section, .slide-left, .slide-right, .about-fade-up');

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

    // Trigger reveal immediately only if prefers-reduced-motion is true
    // (preloader will trigger it otherwise)
  } else {
    // If reduced motion is preferred, make everything visible immediately
    revealElements.forEach(el => {
      el.classList.add('visible');
    });
    triggerHeroTextReveal();
  }

  // 3. Hero Background Video Autoplay and Loop Trigger
  const video = document.getElementById('hero-video');
  const heroSection = document.getElementById('hero');

  if (video) {
    // Reveal text immediately
    triggerHeroTextReveal();

    // Ensure the video plays (browsers sometimes block autoplay until user interaction)
    const playVideo = () => {
      video.play().catch(err => {
        console.log("Autoplay blocked initially, waiting for user interaction.", err);
        const playOnInteraction = () => {
          video.play().catch(() => {});
          document.removeEventListener('click', playOnInteraction);
          document.removeEventListener('scroll', playOnInteraction);
        };
        document.addEventListener('click', playOnInteraction);
        document.addEventListener('scroll', playOnInteraction);
      });
    };

    if (video.readyState >= 1) {
      playVideo();
    } else {
      video.addEventListener('loadedmetadata', playVideo);
    }
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

  // 7. Schedule Table â€” Highlight Today's Row
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
    const generalErrorMsg = document.getElementById('form-general-error');
    const errorDetailsText = document.getElementById('error-details-text');
    const adminNotice = document.getElementById('error-admin-notice');

    const emailError = document.getElementById('email-error');
    const phoneError = document.getElementById('phone-error');
    const descError = document.getElementById('description-error');

    // Validation helpers
    const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isValidPhone = (phone) => {
      const clean = phone.replace(/\D/g, ''); // strip all non-digits
      return clean.length === 10;
    };

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
        setError(phoneInput, phoneError, 'Please enter a valid 10-digit contact number.');
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
    // Form submission
    contactForm.addEventListener('submit', async (e) => {
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
        setError(phoneInput, phoneError, 'Please enter a valid 10-digit contact number.');
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

      // Hide previous messages
      successMsg.classList.remove('show');
      if (generalErrorMsg) generalErrorMsg.classList.remove('show');

      // Show loading state
      submitBtn.classList.add('loading');
      submitBtn.disabled = true;

      try {
        const formData = new FormData(contactForm);
        formData.append("access_key", import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || "884f9961-70dd-4fba-84cd-84183cb41fc4");

        const response = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          body: formData
        });

        const data = await response.json();

        if (response.ok && data.success) {
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
          throw new Error(data.message || 'Form submission failed.');
        }
      } catch (error) {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;

        console.error('Web3Forms Submission Error:', error);

        let details = error.message || 'Unknown error occurred.';

        if (generalErrorMsg && errorDetailsText && adminNotice) {
          // Display error details in notification
          errorDetailsText.textContent = `Error Details: ${details}`;

          // Detect if it is a Web3Forms Access Key issue or validation issue
          const isKeyError = details.toLowerCase().includes('access key') || 
                             details.toLowerCase().includes('invalid') || 
                             details.toLowerCase().includes('key') || 
                             details.toLowerCase().includes('not found');

          if (isKeyError) {
            adminNotice.style.display = 'block';
          } else {
            adminNotice.style.display = 'none';
          }

          // Show error banner
          generalErrorMsg.classList.add('show');
        } else {
          // Fallback if elements aren't in DOM
          alert('Error: ' + details);
        }
      }
    });
  }

  // 9. BorderGlow Component Integration (React Bits Port)
  const glowCards = document.querySelectorAll('.border-glow-card');
  const borderGlowConfig = {
    edgeSensitivity: 31,
    glowColor: "220 90% 75%", /* Custom royal blue HSL glow coordinates */
    backgroundColor: "var(--bg-secondary)",
    borderRadius: 16,
    glowRadius: 75,
    glowIntensity: 1.8, /* Softened intensity for clean white surface */
    coneSpread: 38,
    colors: ['#3B82F6', '#0D9488', '#F59E0B'], /* Custom royal blue, teal, and amber pop */
    fillOpacity: 0.15 /* Muted opacity to prevent bleeding into content */
  };

  function parseHSL(hslStr) {
    const match = hslStr.match(/([\d.]+)\s*([\d.]+)%?\s*([\d.]+)%?/);
    if (!match) return { h: 40, s: 80, l: 80 };
    return { h: parseFloat(match[1]), s: parseFloat(match[2]), l: parseFloat(match[3]) };
  }

  function buildGlowVars(glowColor, intensity) {
    const { h, s, l } = parseHSL(glowColor);
    const base = `${h}deg ${s}% ${l}%`;
    const opacities = [100, 60, 50, 40, 30, 20, 10];
    const keys = ['', '-60', '-50', '-40', '-30', '-20', '-10'];
    const vars = {};
    for (let i = 0; i < opacities.length; i++) {
      vars[`--glow-color${keys[i]}`] = `hsl(${base} / ${Math.min(opacities[i] * intensity, 100)}%)`;
    }
    return vars;
  }

  const GRADIENT_POSITIONS = ['80% 55%', '69% 34%', '8% 6%', '41% 38%', '86% 85%', '82% 18%', '51% 4%'];
  const GRADIENT_KEYS = ['--gradient-one', '--gradient-two', '--gradient-three', '--gradient-four', '--gradient-five', '--gradient-six', '--gradient-seven'];
  const COLOR_MAP = [0, 1, 2, 0, 1, 2, 1];

  function buildGradientVars(colors) {
    const vars = {};
    for (let i = 0; i < 7; i++) {
      const c = colors[Math.min(COLOR_MAP[i], colors.length - 1)];
      vars[GRADIENT_KEYS[i]] = `radial-gradient(at ${GRADIENT_POSITIONS[i]}, ${c} 0px, transparent 50%)`;
    }
    vars['--gradient-base'] = `linear-gradient(${colors[0]} 0 100%)`;
    return vars;
  }

  const getCenterOfElement = (el) => {
    const { width, height } = el.getBoundingClientRect();
    return [width / 2, height / 2];
  };

  const getEdgeProximity = (el, x, y) => {
    const [cx, cy] = getCenterOfElement(el);
    const dx = x - cx;
    const dy = y - cy;
    let kx = Infinity;
    let ky = Infinity;
    if (dx !== 0) kx = cx / Math.abs(dx);
    if (dy !== 0) ky = cy / Math.abs(dy);
    return Math.min(Math.max(1 / Math.min(kx, ky), 0), 1);
  };

  const getCursorAngle = (el, x, y) => {
    const [cx, cy] = getCenterOfElement(el);
    const dx = x - cx;
    const dy = y - cy;
    if (dx === 0 && dy === 0) return 0;
    const radians = Math.atan2(dy, dx);
    let degrees = radians * (180 / Math.PI) + 90;
    if (degrees < 0) degrees += 360;
    return degrees;
  };

  // Check for reduced motion
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  glowCards.forEach(card => {
    // 1. Apply Styles
    card.style.setProperty('--card-bg', borderGlowConfig.backgroundColor);
    card.style.setProperty('--edge-sensitivity', borderGlowConfig.edgeSensitivity);
    card.style.setProperty('--border-radius', `${borderGlowConfig.borderRadius}px`);
    card.style.setProperty('--glow-padding', `${borderGlowConfig.glowRadius}px`);
    card.style.setProperty('--cone-spread', borderGlowConfig.coneSpread);
    card.style.setProperty('--fill-opacity', borderGlowConfig.fillOpacity);

    // Apply glow vars
    const glowVars = buildGlowVars(borderGlowConfig.glowColor, borderGlowConfig.glowIntensity);
    Object.entries(glowVars).forEach(([k, v]) => {
      card.style.setProperty(k, v);
    });

    // Apply gradient vars
    const gradVars = buildGradientVars(borderGlowConfig.colors);
    Object.entries(gradVars).forEach(([k, v]) => {
      card.style.setProperty(k, v);
    });

    // If reduced motion is preferred, don't set up mouse movement listener,
    // just display a nice static background gradient
    if (prefersReduced) {
      card.style.setProperty('--edge-proximity', '50');
      card.style.setProperty('--cursor-angle', '135deg');
      return;
    }

    // 2. Interaction
    card.addEventListener('pointermove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const edge = getEdgeProximity(card, x, y);
      const angle = getCursorAngle(card, x, y);

      card.style.setProperty('--edge-proximity', `${(edge * 100).toFixed(3)}`);
      card.style.setProperty('--cursor-angle', `${angle.toFixed(3)}deg`);
    });

    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--edge-proximity', '0');
    });

    // Intro Sweep animation on mount
    card.classList.add('sweep-active');
    card.style.setProperty('--cursor-angle', '110deg');

    const animateValue = ({ start = 0, end = 100, duration = 1000, delay = 0, onUpdate, onEnd }) => {
      setTimeout(() => {
        const t0 = performance.now();
        function tick() {
          const elapsed = performance.now() - t0;
          const t = Math.min(elapsed / duration, 1);
          const val = start + (end - start) * (t * t * (3 - 2 * t)); // easeInOut
          onUpdate(val);
          if (t < 1) requestAnimationFrame(tick);
          else if (onEnd) onEnd();
        }
        requestAnimationFrame(tick);
      }, delay);
    };

    animateValue({ duration: 500, start: 0, end: 100, onUpdate: v => card.style.setProperty('--edge-proximity', v) });
    animateValue({ duration: 1500, start: 110, end: 465, onUpdate: v => card.style.setProperty('--cursor-angle', `${v}deg`) });
    animateValue({ delay: 1500, duration: 1500, start: 100, end: 0, 
      onUpdate: v => card.style.setProperty('--edge-proximity', v),
      onEnd: () => card.classList.remove('sweep-active')
    });
  });

  // 10. Featured Creations Hover Expand Accordion Gallery Controller
  const gallery = document.getElementById('hover-expand-gallery');
  if (gallery) {
    const cards = gallery.querySelectorAll('.gallery-card');
    
    const setActiveCard = (activeIndex) => {
      cards.forEach((card, index) => {
        if (index === activeIndex) {
          card.classList.add('active');
        } else {
          card.classList.remove('active');
        }
      });
    };

    cards.forEach((card, index) => {
      // Hover event for desktop
      card.addEventListener('mouseenter', () => {
        setActiveCard(index);
      });

      // Click/Pointerdown event for touch devices
      card.addEventListener('click', () => {
        setActiveCard(index);
      });
    });
  }

  // 11. Hyperspeed Canvas Warp-Speed Animation Initializer
  const initHyperspeed = (canvasId, sectionId) => {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = canvas.width = canvas.offsetWidth || window.innerWidth;
    let height = canvas.height = canvas.offsetHeight || 300;
    
    // Check reduced motion setting
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const stars = [];
    const count = isMobileOrTablet() ? 100 : 300;
    const speed = 3.2; // Optimized speed for a true warp sensation
    const colors = ['#00ffff', '#ff007f', '#a855f7', '#3b82f6'];

    const initStar = (s = {}) => {
      const angle = Math.random() * Math.PI * 2;
      const radius = 5 + Math.random() * 80;
      s.x = Math.cos(angle) * radius;
      s.y = Math.sin(angle) * radius;
      s.z = 100 + Math.random() * 900;
      s.prevZ = s.z;
      s.color = colors[Math.floor(Math.random() * colors.length)];
      s.speedMult = 0.6 + Math.random() * 1.4;
      s.width = 1 + Math.random() * 2;
      return s;
    };

    for (let i = 0; i < count; i++) {
      stars.push(initStar({}));
    }

    const resizeCanvas = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth || window.innerWidth;
      height = canvas.height = canvas.offsetHeight || 300;
    };

    // Run immediately to ensure resolution matches CSS bounding boxes on DOM load
    resizeCanvas();

    window.addEventListener('resize', resizeCanvas);

    let frameId;
    const render = () => {
      // Use semi-transparent fill for a beautiful warp trails effect
      ctx.fillStyle = 'rgba(9, 13, 22, 0.18)';
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      stars.forEach(s => {
        s.prevZ = s.z;
        if (!prefersReducedMotion) {
          s.z -= speed * s.speedMult;
        } else {
          s.z -= 0.1 * s.speedMult; // slow drift for reduced motion accessibility
        }

        if (s.z <= 0) {
          initStar(s);
          s.z = 1000;
          s.prevZ = 1000;
        }

        const scale = 400 / s.z;
        const prevScale = 400 / s.prevZ;

        // Apply bend/distortion (Cyberpunk style bend)
        const bendX = Math.sin(s.z * 0.0035) * 0.6 * 80;
        const bendY = Math.cos(s.z * 0.0035) * 0.6 * 80;

        const x1 = cx + (s.x + bendX) * scale;
        const y1 = cy + (s.y + bendY) * scale;

        const x2 = cx + (s.x + bendX) * prevScale;
        const y2 = cy + (s.y + bendY) * prevScale;

        // Draw line if within canvas bounds
        if (x1 >= 0 && x1 <= width && y1 >= 0 && y1 <= height) {
          ctx.strokeStyle = s.color;
          ctx.lineWidth = s.width * (scale / 5);
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
      });

      frameId = requestAnimationFrame(render);
    };

    // Intersection observer to pause/resume animation when not visible to save CPU resources
    const section = document.getElementById(sectionId);
    if (section) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            cancelAnimationFrame(frameId);
            render();
          } else {
            cancelAnimationFrame(frameId);
          }
        });
      }, { threshold: 0.05 });
      
      observer.observe(section);
    }
  };

  // Initialize hyperspeed background for "Ready to Launch Your Next Project?" (CTA section)
  initHyperspeed('hyperspeed-canvas', 'about-cta');

  // Initialize hyperspeed background for "About NextOrbit Creations" banner section
  initHyperspeed('about-hyperspeed-canvas', 'about');

  // 6. Pricing Discount Auto-Calculation
  const pricingCards = document.querySelectorAll('.pricing-card');
  pricingCards.forEach(card => {
    const originalPriceEl = card.querySelector('.original-price');
    const currentPriceEl = card.querySelector('.price');
    if (originalPriceEl && currentPriceEl) {
      const originalText = originalPriceEl.textContent;
      const currentText = currentPriceEl.textContent;
      
      const originalVal = parseFloat(originalText.replace(/[^0-9]+/g, ""));
      const currentVal = parseFloat(currentText.replace(/[^0-9]+/g, ""));
      
      if (!isNaN(originalVal) && !isNaN(currentVal) && originalVal > currentVal) {
        const discountPercent = Math.round(((originalVal - currentVal) / originalVal) * 100);
        let badgeEl = card.querySelector('.discount-badge');
        if (!badgeEl) {
          badgeEl = document.createElement('div');
          badgeEl.className = 'discount-badge';
          const innerContainer = card.querySelector('.border-glow-inner');
          if (innerContainer) {
            innerContainer.appendChild(badgeEl);
          } else {
            card.appendChild(badgeEl);
          }
        }
        badgeEl.textContent = `${discountPercent}% OFF`;
      }
    }
  });
});
