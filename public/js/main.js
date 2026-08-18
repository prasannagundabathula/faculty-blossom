/**
 * BVCITS - Bonam Venkata Chalamayya Institute of Technology & Science
 * Main Frontend Logic, Sliders, Lightbox, and Portal Auth Modal Integration
 */

document.addEventListener('DOMContentLoaded', () => {
  initPreloader();
  initStickyNav();
  initAnimatedCounters();
  initAchievementsSlider();
  initAchievementModal();
  initGalleryLightbox();
  initTestimonialsSlider();
  initBackToTop();
  initScrollReveal();
  initPortalModal();
});

/* ==========================================================================
   1. Preloader
   ========================================================================== */
function initPreloader() {
  const preloader = document.getElementById('preloader');
  if (!preloader) return;

  window.addEventListener('load', () => {
    setTimeout(() => {
      preloader.classList.add('fade-out');
    }, 400);
  });

  setTimeout(() => {
    if (!preloader.classList.contains('fade-out')) {
      preloader.classList.add('fade-out');
    }
  }, 2000);
}

/* ==========================================================================
   2. Sticky Navbar & ScrollSpy
   ========================================================================== */
function initStickyNav() {
  const header = document.getElementById('mainHeader');
  const navLinks = document.querySelectorAll('nav.links a');
  const sections = document.querySelectorAll('section[id], div[id]');
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileNav = document.querySelector('nav.links');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }

    let currentId = '';
    const scrollPos = window.scrollY + 140;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentId = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentId}`) {
        link.classList.add('active');
      }
    });
  });

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', () => {
      const isOpen = mobileNav.classList.contains('mobile-open');
      if (isOpen) {
        mobileNav.classList.remove('mobile-open');
        mobileNav.style.display = 'none';
      } else {
        mobileNav.classList.add('mobile-open');
        mobileNav.style.display = 'flex';
        mobileNav.style.flexDirection = 'column';
        mobileNav.style.position = 'absolute';
        mobileNav.style.top = '100%';
        mobileNav.style.left = '0';
        mobileNav.style.right = '0';
        mobileNav.style.background = 'var(--paper)';
        mobileNav.style.padding = '20px 24px';
        mobileNav.style.borderBottom = '2px solid var(--gold)';
        mobileNav.style.boxShadow = 'var(--shadow-md)';
        mobileNav.style.gap = '16px';
      }
    });

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 900) {
          mobileNav.classList.remove('mobile-open');
          mobileNav.style.display = 'none';
        }
      });
    });
  }
}

/* ==========================================================================
   3. Animated Counters (IntersectionObserver)
   ========================================================================== */
function initAnimatedCounters() {
  const statElements = document.querySelectorAll('.stat-counter');
  if (!statElements.length) return;

  const observer = new IntersectionObserver((entries, observerInstance) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const targetVal = parseFloat(el.getAttribute('data-target'));
        const prefix = el.getAttribute('data-prefix') || '';
        const suffix = el.getAttribute('data-suffix') || '';
        const duration = 1800;
        const startTime = performance.now();

        const updateCounter = (currentTime) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const easeOut = 1 - Math.pow(1 - progress, 3);
          const currentVal = (targetVal % 1 !== 0) ? (easeOut * targetVal).toFixed(2) : Math.floor(easeOut * targetVal);

          el.textContent = `${prefix}${currentVal}${suffix}`;

          if (progress < 1) {
            requestAnimationFrame(updateCounter);
          } else {
            el.textContent = `${prefix}${targetVal}${suffix}`;
          }
        };

        requestAnimationFrame(updateCounter);
        observerInstance.unobserve(el);
      }
    });
  }, { threshold: 0.3 });

  statElements.forEach(el => observer.observe(el));
}

/* ==========================================================================
   4. College Achievements Slider
   ========================================================================== */
function initAchievementsSlider() {
  const track = document.getElementById('achievementsTrack');
  const prevBtn = document.getElementById('achievePrevBtn');
  const nextBtn = document.getElementById('achieveNextBtn');
  if (!track) return;

  let currentIndex = 0;
  let autoScrollTimer = null;
  const cards = track.querySelectorAll('.achievement-card');
  const totalCards = cards.length;

  function getCardsPerView() {
    if (window.innerWidth <= 640) return 1;
    if (window.innerWidth <= 1040) return 2;
    return 3;
  }

  function updateSlider() {
    const cardsPerView = getCardsPerView();
    const maxIndex = Math.max(0, totalCards - cardsPerView);
    if (currentIndex > maxIndex) currentIndex = 0;
    if (currentIndex < 0) currentIndex = maxIndex;

    const cardWidth = cards[0].offsetWidth;
    const gap = 24;
    const offset = currentIndex * (cardWidth + gap);
    track.style.transform = `translateX(-${offset}px)`;
  }

  function nextSlide() {
    const cardsPerView = getCardsPerView();
    const maxIndex = Math.max(0, totalCards - cardsPerView);
    currentIndex = (currentIndex >= maxIndex) ? 0 : currentIndex + 1;
    updateSlider();
  }

  function prevSlide() {
    const cardsPerView = getCardsPerView();
    const maxIndex = Math.max(0, totalCards - cardsPerView);
    currentIndex = (currentIndex <= 0) ? maxIndex : currentIndex - 1;
    updateSlider();
  }

  if (nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); resetAutoScroll(); });
  if (prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); resetAutoScroll(); });

  window.addEventListener('resize', updateSlider);

  function startAutoScroll() {
    autoScrollTimer = setInterval(nextSlide, 4500);
  }

  function resetAutoScroll() {
    clearInterval(autoScrollTimer);
    startAutoScroll();
  }

  track.addEventListener('mouseenter', () => clearInterval(autoScrollTimer));
  track.addEventListener('mouseleave', startAutoScroll);

  startAutoScroll();
}

/* ==========================================================================
   5. Achievement Detail Popup Modal
   ========================================================================== */
function initAchievementModal() {
  const veil = document.getElementById('achievementModalVeil');
  const closeBtn = document.getElementById('achievementModalClose');
  const cards = document.querySelectorAll('.achievement-card');
  if (!veil) return;

  const achievementDetails = {
    'eapcet-admissions': {
      title: '100% AP EAPCET Admissions 2026',
      category: 'Admissions 2026',
      date: 'August 2026',
      img: 'images/campus_aerial_100percent.jpg',
      highlights: '100% seat allotment in autonomous engineering courses with top EAPCET rankers across coastal Andhra Pradesh.',
      text: 'Bonam Venkata Chalamayya Institute of Technology and Science achieved record 100% seat fill during the first phase of EAPCET admissions. Parents and technical aspirants choose BVCITS for its NAAC "A" grade, UGC autonomy, modern computing laboratories, and unmatched campus placement track record in East Godavari district.'
    },
    'tcs-achievers': {
      title: 'TCS Achievers Bag 7.09 LPA CTC',
      category: 'Campus Placements',
      date: 'July 2026',
      img: 'images/tcs_achievers_7lpa.jpg',
      highlights: 'G. Ratnaraju (ECE - 22H41A0482) and G. Meenakshi (CSE - 22H41A0580) secure high-package TCS Ninja/Digital offers.',
      text: 'Our students demonstrated excellence during the #2026_Placements drive, clearing multi-stage competitive coding assessments and technical interviews. The structured Campus Recruitment Training (CRT) from 2nd year and CodeQuest algorithm arenas provided the winning edge.'
    },
    'code-build-impact': {
      title: 'Code. Build. Impact. Initiative',
      category: 'Computer Science',
      date: 'June 2026',
      img: 'images/cse_code_build_impact.jpg',
      highlights: 'Advanced industry coding studios, full stack incubator, and competitive programming bootcamps in CSE & IT.',
      text: 'The Department of Computer Science & Engineering launched the Code.Build.Impact initiative, enabling students to collaborate on live cloud architectures, AI models, and regional automation tools for aquaculture and logistics in the Godavari delta.'
    },
    'hackathon-winners': {
      title: 'Smart India Hackathon Finalists',
      category: 'Student Innovation',
      date: 'May 2026',
      img: 'images/achievers_students.jpg',
      highlights: 'Multidisciplinary student teams qualify for national hackathon grand finale with AI delta solutions.',
      text: 'Student creators led by P. Sai Lakshmi presented automated IoT rainwater monitoring and delta agricultural yield optimization models, competing against premier institutions nationwide.'
    },
    'green-campus-award': {
      title: 'Eco-Sustainable Botanical Campus',
      category: 'Eco Campus',
      date: 'April 2026',
      img: 'images/campus_life_walkway.jpg',
      highlights: 'Recognized for lush coconut groves, automated rainwater harvesting, solar power arrays, and tranquil garden walkways.',
      text: 'Spread across scenic acres in Batlapalem, Amalapuram, BVCITS provides a peaceful, pollution-free learning haven with high-speed Wi-Fi across green open-air study gazebos and botanical avenues.'
    }
  };

  cards.forEach(card => {
    card.addEventListener('click', () => {
      const id = card.getAttribute('data-id');
      const data = achievementDetails[id];
      if (data) {
        document.getElementById('achieveModalImg').src = data.img;
        document.getElementById('achieveModalCategory').textContent = data.category;
        document.getElementById('achieveModalDate').textContent = data.date;
        document.getElementById('achieveModalTitle').textContent = data.title;
        document.getElementById('achieveModalHighlights').textContent = data.highlights;
        document.getElementById('achieveModalText').textContent = data.text;
        veil.classList.add('active');
      }
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', () => veil.classList.remove('active'));
  veil.addEventListener('click', (e) => {
    if (e.target === veil) veil.classList.remove('active');
  });
}

/* ==========================================================================
   6. Gallery Filter & Fullscreen Lightbox
   ========================================================================== */
function initGalleryLightbox() {
  const filterBtns = document.querySelectorAll('.gallery-filter-btn');
  const items = document.querySelectorAll('.gallery-item');
  const veil = document.getElementById('lightboxVeil');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const closeBtn = document.getElementById('lightboxClose');
  const prevBtn = document.getElementById('lightboxPrev');
  const nextBtn = document.getElementById('lightboxNext');

  let currentGalleryIndex = 0;
  let activeItems = Array.from(items);

  // Filter Buttons
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter');

      items.forEach(item => {
        const cat = item.getAttribute('data-category');
        if (filter === 'all' || cat === filter) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });

      activeItems = Array.from(items).filter(it => it.style.display !== 'none');
    });
  });

  // Open Lightbox
  items.forEach(item => {
    item.addEventListener('click', () => {
      currentGalleryIndex = activeItems.indexOf(item);
      if (currentGalleryIndex === -1) currentGalleryIndex = 0;
      showLightboxImage(currentGalleryIndex);
      if (veil) veil.classList.add('active');
    });
  });

  function showLightboxImage(idx) {
    if (!activeItems[idx]) return;
    const img = activeItems[idx].querySelector('img');
    const title = activeItems[idx].querySelector('.gallery-overlay-title')?.textContent || '';
    const sub = activeItems[idx].querySelector('.gallery-overlay-sub')?.textContent || '';
    if (lightboxImg && img) lightboxImg.src = img.src;
    if (lightboxCaption) lightboxCaption.textContent = `${title} — ${sub}`;
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      currentGalleryIndex = (currentGalleryIndex <= 0) ? activeItems.length - 1 : currentGalleryIndex - 1;
      showLightboxImage(currentGalleryIndex);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      currentGalleryIndex = (currentGalleryIndex >= activeItems.length - 1) ? 0 : currentGalleryIndex + 1;
      showLightboxImage(currentGalleryIndex);
    });
  }

  if (closeBtn) closeBtn.addEventListener('click', () => veil?.classList.remove('active'));
  if (veil) {
    veil.addEventListener('click', (e) => {
      if (e.target === veil) veil.classList.remove('active');
    });
  }
}

/* ==========================================================================
   7. Testimonials Slider
   ========================================================================== */
function initTestimonialsSlider() {
  const pagination = document.getElementById('testiPagination');
  if (!pagination) return;
  // Dynamic pagination dots if needed
}

/* ==========================================================================
   8. Back to Top Button
   ========================================================================== */
function initBackToTop() {
  const btn = document.getElementById('backToTopBtn');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      btn.classList.add('show');
    } else {
      btn.classList.remove('show');
    }
  });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ==========================================================================
   9. Scroll Reveal Animations
   ========================================================================== */
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal-up');
  if (!reveals.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  reveals.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)';
    observer.observe(el);
  });

  // Inject revealed class style
  const style = document.createElement('style');
  style.textContent = `.reveal-up.revealed { opacity: 1 !important; transform: translateY(0) !important; }`;
  document.head.appendChild(style);
}

/* ==========================================================================
   10. Portal Login Modal Integration (Fixing "Authenticating..." Bug)
   ========================================================================== */
function initPortalModal() {
  const veil = document.getElementById('veil');
  const closeBtn = document.getElementById('modalCloseBtn');
  const modalBody = document.getElementById('modalBody');
  const navLoginBtn = document.getElementById('navLoginBtn');
  const heroLoginBtn = document.getElementById('heroLoginBtn');

  function openPortalModal() {
    if (!veil || !modalBody) return;

    // If already logged in, redirect directly to role dashboard
    if (window.BVCITS_AUTH && window.BVCITS_AUTH.isLoggedIn()) {
      const role = window.BVCITS_AUTH.getUserRole();
      window.location.href = window.BVCITS_AUTH.getDashboardUrlForRole(role);
      return;
    }

    // Render fresh interactive authentication form
    if (window.BVCITS_AUTH) {
      window.BVCITS_AUTH.renderLoginForm(modalBody, (result) => {
        window.location.href = result.redirectUrl;
      });
    }

    veil.classList.add('active');
  }

  function closePortalModal() {
    if (veil) veil.classList.remove('active');
  }

  if (navLoginBtn) navLoginBtn.addEventListener('click', openPortalModal);
  if (heroLoginBtn) heroLoginBtn.addEventListener('click', openPortalModal);
  if (closeBtn) closeBtn.addEventListener('click', closePortalModal);

  if (veil) {
    veil.addEventListener('click', (e) => {
      if (e.target === veil) closePortalModal();
    });
  }

  // Open modal if URL has hash #portal-login or query ?login=true
  if (window.location.hash === '#portal-login' || window.location.search.includes('login=true')) {
    openPortalModal();
  }
}
