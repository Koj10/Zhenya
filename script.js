/**
 * НАБИУЛЛИН — Premium Landing Scripts
 */

(function () {
  'use strict';

  const VaP_FOLDERS = ['VaP', 'Vap'];
  const PORTFOLIO_BATCH = 8;
  let VaP_BASE = 'VaP/';

  const VIDEO_MIME = {
    mp4: 'video/mp4',
    webm: 'video/webm',
    mov: 'video/quicktime',
    m4v: 'video/mp4',
  };

  const header = document.getElementById('header');
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');
  const spotlight = document.getElementById('spotlightCursor');
  const contactForm = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');
  const formError = document.getElementById('formError');
  const contactSubmit = document.getElementById('contactSubmit');

  // ---- Nav overlay (mobile) ----
  const overlay = document.getElementById('navOverlay');

  function closeNav() {
    burger?.classList.remove('burger--active');
    nav?.classList.remove('nav--open');
    header?.classList.remove('header--nav-open');
    overlay?.classList.remove('nav-overlay--visible');
    overlay?.setAttribute('aria-hidden', 'true');
    burger?.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('nav-open');
    if (!document.querySelector('.modal--open')) {
      document.body.style.overflow = '';
    }
  }

  function openNav() {
    burger?.classList.add('burger--active');
    nav?.classList.add('nav--open');
    header?.classList.add('header--nav-open');
    overlay?.classList.add('nav-overlay--visible');
    overlay?.setAttribute('aria-hidden', 'false');
    burger?.setAttribute('aria-expanded', 'true');
    document.body.classList.add('nav-open');
    document.body.style.overflow = 'hidden';
  }

  burger?.addEventListener('click', () => {
    const isOpen = nav?.classList.contains('nav--open');
    isOpen ? closeNav() : openNav();
  });

  overlay?.addEventListener('click', closeNav);

  nav?.querySelectorAll('.nav__link').forEach((link) => {
    link.addEventListener('click', () => {
      if (window.innerWidth < 1024) closeNav();
    });
  });

  document.querySelector('.header__cta')?.addEventListener('click', () => {
    if (window.innerWidth < 1024) closeNav();
  });

  // ---- Header scroll state ----
  let ticking = false;
  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(() => {
        header?.classList.toggle('header--scrolled', window.scrollY > 40);
        ticking = false;
      });
      ticking = true;
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---- Cursor spotlight ----
  let mouseX = 0;
  let mouseY = 0;
  let spotX = 0;
  let spotY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }, { passive: true });

  function animateSpotlight() {
    spotX += (mouseX - spotX) * 0.08;
    spotY += (mouseY - spotY) * 0.08;
    if (spotlight) {
      spotlight.style.left = `${spotX}px`;
      spotlight.style.top = `${spotY}px`;
    }
    requestAnimationFrame(animateSpotlight);
  }
  animateSpotlight();

  // ---- Scroll reveal ----
  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal--visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );
  revealEls.forEach((el) => revealObserver.observe(el));

  window.addEventListener('load', () => {
    document.querySelectorAll('.hero .reveal').forEach((el, i) => {
      setTimeout(() => el.classList.add('reveal--visible'), 150 + i * 120);
    });
  });

  // ---- Button flash ----
  document.querySelectorAll('.btn--primary').forEach((btn) => {
    btn.addEventListener('mousedown', () => btn.classList.add('btn--flash'));
    btn.addEventListener('animationend', () => btn.classList.remove('btn--flash'));
  });

  // ---- Lightbox modal ----
  let modal = document.querySelector('.modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.className = 'modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Просмотр медиа');
    modal.innerHTML = `
      <div class="modal__content">
        <button class="modal__close" aria-label="Закрыть">&times;</button>
        <button class="modal__nav modal__nav--prev" aria-label="Предыдущее">&#8249;</button>
        <button class="modal__nav modal__nav--next" aria-label="Следующее">&#8250;</button>
        <div class="modal__viewer"></div>
        <p class="modal__caption"></p>
      </div>
    `;
    document.body.appendChild(modal);
  }

  const modalViewer = modal.querySelector('.modal__viewer');
  const modalCaption = modal.querySelector('.modal__caption');
  const modalClose = modal.querySelector('.modal__close');
  const modalPrev = modal.querySelector('.modal__nav--prev');
  const modalNext = modal.querySelector('.modal__nav--next');

  let lightboxItems = [];
  let lightboxIndex = 0;

  function videoMime(src) {
    const ext = src.split('.').pop()?.toLowerCase().split('?')[0];
    return VIDEO_MIME[ext] || '';
  }

  function renderLightbox() {
    if (!modalViewer) return;
    modalViewer.innerHTML = '';
    const item = lightboxItems[lightboxIndex];
    if (!item) return;

    if (item.type === 'video') {
      const video = document.createElement('video');
      video.controls = true;
      video.autoplay = true;
      video.playsInline = true;
      video.preload = 'auto';
      video.src = item.src;
      video.addEventListener('error', () => {
        modalViewer.innerHTML = `
          <p class="modal__error">
            Не удалось воспроизвести видео.<br>
            Запустите <code>npm run media</code> для конвертации в MP4.
          </p>`;
      });
      modalViewer.appendChild(video);
    } else {
      const img = document.createElement('img');
      img.src = item.src;
      img.alt = item.title;
      modalViewer.appendChild(img);
    }

    if (modalCaption) modalCaption.textContent = item.title;
    if (modalPrev) modalPrev.disabled = lightboxIndex <= 0;
    if (modalNext) modalNext.disabled = lightboxIndex >= lightboxItems.length - 1;
  }

  function openLightbox(items, index) {
    lightboxItems = items;
    lightboxIndex = index;
    renderLightbox();
    modal.classList.add('modal--open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('modal--open');
    if (modalViewer) {
      const video = modalViewer.querySelector('video');
      if (video) {
        video.pause();
        video.removeAttribute('src');
        video.load();
      }
      modalViewer.innerHTML = '';
    }
    if (!nav?.classList.contains('nav--open')) {
      document.body.style.overflow = '';
    }
  }

  function stepLightbox(delta) {
    const next = lightboxIndex + delta;
    if (next < 0 || next >= lightboxItems.length) return;
    lightboxIndex = next;
    renderLightbox();
  }

  modalClose?.addEventListener('click', closeModal);
  modalPrev?.addEventListener('click', () => stepLightbox(-1));
  modalNext?.addEventListener('click', () => stepLightbox(1));
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('modal--open')) {
      if (e.key === 'Escape') closeNav();
      return;
    }
    if (e.key === 'Escape') closeModal();
    if (e.key === 'ArrowLeft') stepLightbox(-1);
    if (e.key === 'ArrowRight') stepLightbox(1);
  });

  // ---- Portfolio from VaP ----
  const masonry = document.getElementById('portfolioMasonry');
  const portfolioStatus = document.getElementById('portfolioStatus');
  const portfolioFilters = document.getElementById('portfolioFilters');
  const portfolioHint = document.getElementById('portfolioHint');
  const portfolioStats = document.getElementById('portfolioStats');
  const portfolioMore = document.getElementById('portfolioMore');

  let portfolioItems = [];
  let activeFilter = 'all';
  let visibleLimit = { all: PORTFOLIO_BATCH, image: PORTFOLIO_BATCH, video: PORTFOLIO_BATCH };
  let videoPreviewObserver = null;

  function resetVisibleLimits() {
    visibleLimit = { all: PORTFOLIO_BATCH, image: PORTFOLIO_BATCH, video: PORTFOLIO_BATCH };
  }

  function getFilteredEntries() {
    return portfolioItems
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => activeFilter === 'all' || item.type === activeFilter);
  }

  function getShownCount() {
    const filtered = getFilteredEntries();
    const limit = visibleLimit[activeFilter] ?? PORTFOLIO_BATCH;
    return Math.min(limit, filtered.length);
  }

  function getVisibleIndexSet() {
    const filtered = getFilteredEntries();
    const shown = getShownCount();
    return new Set(filtered.slice(0, shown).map((entry) => entry.index));
  }

  function classifyAspect(width, height) {
    const ratio = width / height;
    if (ratio < 0.85) return 'portrait';
    if (ratio > 1.25) return 'landscape';
    return 'square';
  }

  function applyAspectClass(el, width, height) {
    const aspect = classifyAspect(width, height);
    el.classList.add(`media-item--${aspect}`);
  }

  function createMediaElement(item, index) {
    const src = `${VaP_BASE}${encodeURIComponent(item.file)}`;
    const article = document.createElement('article');
    article.className = 'media-item reveal';
    article.dataset.index = String(index);
    article.dataset.type = item.type;
    article.dataset.src = src;
    article.dataset.title = item.title;

    const overlay = document.createElement('div');
    overlay.className = 'media-item__overlay';
    article.appendChild(overlay);

    const badge = document.createElement('span');
    badge.className = 'media-item__badge';
    badge.textContent = item.type === 'video' ? 'Видео' : 'Фото';
    article.appendChild(badge);

    if (item.type === 'video') {
      const video = document.createElement('video');
      video.className = 'media-item__media';
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.preload = 'none';
      video.dataset.src = src;
      video.addEventListener('loadedmetadata', () => {
        applyAspectClass(article, video.videoWidth, video.videoHeight);
      });
      const playPreview = () => {
        if (!video.dataset.loaded) {
          video.src = video.dataset.src;
          video.load();
          video.dataset.loaded = '1';
        }
        video.play().catch(() => {});
      };
      const stopPreview = () => {
        video.pause();
        video.currentTime = 0;
      };
      video.addEventListener('mouseenter', playPreview);
      video.addEventListener('mouseleave', stopPreview);
      article.appendChild(video);
      videoPreviewObserver?.observe(article);

      const play = document.createElement('span');
      play.className = 'media-item__play';
      play.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
      article.appendChild(play);
    } else {
      const img = document.createElement('img');
      img.className = 'media-item__media';
      img.src = src;
      img.alt = item.title;
      img.loading = 'lazy';
      img.decoding = 'async';
      img.addEventListener('load', () => {
        applyAspectClass(article, img.naturalWidth, img.naturalHeight);
      });
      article.appendChild(img);
    }

    if (item.title) {
      const caption = document.createElement('span');
      caption.className = 'media-item__caption';
      caption.textContent = item.title;
      article.appendChild(caption);
    }

    article.addEventListener('click', () => {
      const visible = getVisibleLightboxItems();
      const idx = visible.findIndex((v) => v.src === src);
      openLightbox(visible, idx >= 0 ? idx : 0);
    });

    return article;
  }

  function getVisibleLightboxItems() {
    return portfolioItems
      .filter((item) => activeFilter === 'all' || item.type === activeFilter)
      .map((item) => ({
        type: item.type,
        src: `${VaP_BASE}${encodeURIComponent(item.file)}`,
        title: item.title,
      }));
  }

  function countRemainingItems() {
    const filtered = getFilteredEntries();
    return Math.max(0, filtered.length - getShownCount());
  }

  function refreshPortfolioVisibility() {
    if (!masonry) return;

    const visibleSet = getVisibleIndexSet();

    masonry.querySelectorAll('.media-item').forEach((el) => {
      const index = Number(el.dataset.index);
      const matchFilter = activeFilter === 'all' || el.dataset.type === activeFilter;

      if (!matchFilter) {
        el.classList.add('media-item--hidden');
        return;
      }

      el.classList.toggle('media-item--hidden', !visibleSet.has(index));
    });

    updatePortfolioMoreBtn();
  }

  function updatePortfolioMoreBtn() {
    if (!portfolioMore) return;

    const remaining = countRemainingItems();
    if (remaining <= 0) {
      portfolioMore.setAttribute('hidden', '');
      return;
    }

    portfolioMore.removeAttribute('hidden');
    const label = portfolioMore.querySelector('.btn__text');
    if (label) label.textContent = `Показать ещё (${remaining})`;
  }

  function applyPortfolioFilter(filter) {
    activeFilter = filter;

    portfolioFilters?.querySelectorAll('.filter-btn').forEach((btn) => {
      btn.classList.toggle('filter-btn--active', btn.dataset.filter === filter);
    });

    refreshPortfolioVisibility();
  }

  function showMorePortfolio() {
    const remaining = countRemainingItems();
    const step = Math.min(PORTFOLIO_BATCH, remaining);
    visibleLimit[activeFilter] = getShownCount() + step;

    const visibleSet = getVisibleIndexSet();
    masonry?.querySelectorAll('.media-item').forEach((el) => {
      const index = Number(el.dataset.index);
      if (visibleSet.has(index)) {
        el.classList.add('reveal--visible');
      }
    });

    refreshPortfolioVisibility();
  }

  function setupVideoPreviewObserver() {
    if (videoPreviewObserver) videoPreviewObserver.disconnect();
    if (!window.IntersectionObserver) return;

    videoPreviewObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target.querySelector('video');
          if (!video) return;
          if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
            if (!video.dataset.loaded) {
              video.src = video.dataset.src;
              video.load();
              video.dataset.loaded = '1';
            }
            video.play().catch(() => {});
          } else {
            video.pause();
            video.currentTime = 0;
          }
        });
      },
      { threshold: [0, 0.6] }
    );
  }

  function renderPortfolio(items) {
    if (!masonry) return;

    masonry.innerHTML = '';
    portfolioItems = items;
    setupVideoPreviewObserver();

    if (items.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'portfolio__empty';
      empty.textContent = 'Портфолио пока пустое. Добавьте файлы в папку VaP и запустите node build-vap.js';
      masonry.appendChild(empty);
      portfolioFilters?.setAttribute('hidden', '');
      portfolioStats?.setAttribute('hidden', '');
      portfolioMore?.setAttribute('hidden', '');
      portfolioHint?.removeAttribute('hidden');
      return;
    }

    portfolioHint?.setAttribute('hidden', '');
    portfolioFilters?.removeAttribute('hidden');

    const photoCount = items.filter((i) => i.type === 'image').length;
    const videoCount = items.filter((i) => i.type === 'video').length;
    if (portfolioStats) {
      portfolioStats.textContent = `${photoCount} фото · ${videoCount} видео`;
      portfolioStats.removeAttribute('hidden');
    }

    const hasVideo = videoCount > 0;
    const hasImage = photoCount > 0;
    portfolioFilters?.querySelector('[data-filter="video"]')?.toggleAttribute('hidden', !hasVideo);
    portfolioFilters?.querySelector('[data-filter="image"]')?.toggleAttribute('hidden', !hasImage);

    resetVisibleLimits();

    items.forEach((item, i) => {
      const el = createMediaElement(item, i);
      if (i < 6) el.classList.add('reveal--visible');
      else revealObserver.observe(el);
      masonry.appendChild(el);
    });

    applyPortfolioFilter(activeFilter);
  }

  async function fetchManifest() {
    for (const folder of VaP_FOLDERS) {
      try {
        const res = await fetch(`${folder}/media.json`);
        if (res.ok) {
          const data = await res.json();
          return { data, base: `${data.folder || folder}/` };
        }
      } catch {
        /* try next folder */
      }
    }
    throw new Error('manifest not found');
  }

  async function loadPortfolio() {
    try {
      const { data, base } = await fetchManifest();
      VaP_BASE = base.endsWith('/') ? base : `${base}/`;
      const items = (data.items || []).filter((item) => item.file);
      portfolioStatus?.remove();
      renderPortfolio(items);
    } catch {
      if (portfolioStatus) {
        portfolioStatus.textContent = 'Не удалось загрузить портфолио. Запустите: npm run dev';
        portfolioStatus.className = 'portfolio__empty';
      }
    }
  }

  portfolioFilters?.querySelectorAll('.filter-btn').forEach((btn) => {
    btn.addEventListener('click', () => applyPortfolioFilter(btn.dataset.filter || 'all'));
  });

  portfolioMore?.addEventListener('click', showMorePortfolio);

  loadPortfolio();

  // ---- Contact form → Telegram ----
  contactForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    formSuccess.hidden = true;
    formError.hidden = true;

    const nameInput = contactForm.querySelector('#name');
    const phoneInput = contactForm.querySelector('#phone');
    const telegramInput = contactForm.querySelector('#telegram');
    const name = nameInput?.value.trim() || '';
    const phone = phoneInput?.value.trim() || '';
    const telegram = telegramInput?.value.trim() || '';

    if (!name || !phone) {
      [nameInput, phoneInput].forEach((input) => {
        if (!input?.value.trim()) {
          input.style.borderColor = 'var(--burgundy)';
        }
      });
      return;
    }

    const submitBtn = contactSubmit || contactForm.querySelector('.btn--primary');
    const btnText = submitBtn?.querySelector('.btn__text');
    const originalText = btnText?.textContent || 'Отправить';

    submitBtn.disabled = true;
    if (btnText) btnText.textContent = 'Отправка…';

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, telegram }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Ошибка отправки');
      }

      contactForm.reset();
      formSuccess.hidden = false;
    } catch {
      formError.textContent = 'Не удалось отправить заявку. Позвоните: 8 982 112-05-81';
      formError.hidden = false;
    } finally {
      submitBtn.disabled = false;
      if (btnText) btnText.textContent = originalText;
    }
  });

  contactForm?.querySelectorAll('.form-input').forEach((input) => {
    input.addEventListener('input', () => {
      input.style.borderColor = '';
    });
  });

  // ---- Smooth anchor scroll ----
  function scrollToTarget(target) {
    const headerH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h'), 10) || 72;
    const extra = target.id === 'contactForm' ? 24 : 0;
    const top = target.getBoundingClientRect().top + window.scrollY - headerH - extra;
    window.scrollTo({ top, behavior: 'smooth' });
    if (target.id === 'contactForm') {
      const nameInput = target.querySelector('#name');
      window.setTimeout(() => nameInput?.focus({ preventScroll: true }), 500);
    }
  }

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const id = anchor.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const navWasOpen = nav?.classList.contains('nav--open');
      if (navWasOpen) closeNav();
      if (navWasOpen) {
        requestAnimationFrame(() => requestAnimationFrame(() => scrollToTarget(target)));
      } else {
        scrollToTarget(target);
      }
    });
  });

  // ---- Parallax on hero ----
  const hero = document.getElementById('hero');
  if (hero && window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY;
      if (scrolled < window.innerHeight) {
        hero.style.transform = `translateY(${scrolled * 0.15}px)`;
      }
    }, { passive: true });
  }
})();
