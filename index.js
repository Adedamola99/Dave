'use strict';
/* ================================================================
   DAVE AKPAN — LUXURY PORTFOLIO  |  index.js
   All animation logic. No dependencies.
   ================================================================ */

/* ── UTILS ── */
const qs    = (s, r = document) => r.querySelector(s);
const qsAll = (s, r = document) => [...r.querySelectorAll(s)];
const lerp  = (a, b, n) => a + (b - a) * n;

const CONFIG = {
    LOADER_MS:            2400,
    HERO_INTERVAL_MS:     5500,
    CAMPAIGN_INTERVAL_MS: 6000,
    TESTIMONIAL_MS:       7000,
};

/* ═══════════════════════════════════════════
   1. CUSTOM CURSOR
═══════════════════════════════════════════ */
function initCursor() {
    const cursor = qs('#cursor');
    if (!cursor || window.matchMedia('(pointer: coarse)').matches) {
        // Touch device — hide cursor elements, restore system cursor
        if (cursor) cursor.style.display = 'none';
        document.body.style.cursor = '';
        return;
    }

    const dot  = qs('.cursor-dot',  cursor);
    const ring = qs('.cursor-ring', cursor);

    let mx = -200, my = -200;
    let rx = -200, ry = -200;
    let dx = -200, dy = -200;

    window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });

    // Hover state on interactive elements
    qsAll('[data-magnetic], .masonry-item, .campaign-btn, .t-btn, .hero-dot').forEach(el => {
        el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });

    // Drag state on editorial
    const dragEl = qs('#editorialsDrag');
    if (dragEl) {
        dragEl.addEventListener('mouseenter', () => document.body.classList.add('cursor-drag'));
        dragEl.addEventListener('mouseleave', () => document.body.classList.remove('cursor-drag'));
    }

    (function raf() {
        dx = lerp(dx, mx, 0.88);
        dy = lerp(dy, my, 0.88);
        rx = lerp(rx, mx, 0.09);
        ry = lerp(ry, my, 0.09);

        dot.style.transform  = `translate(${dx}px,${dy}px) translate(-50%,-50%)`;
        ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
        requestAnimationFrame(raf);
    })();
}

/* ═══════════════════════════════════════════
   2. SCROLL PROGRESS BAR
═══════════════════════════════════════════ */
function initScrollProgress() {
    const bar = qs('#scrollProgress');
    if (!bar) return;
    const update = () => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.width = (window.scrollY / max * 100).toFixed(2) + '%';
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
}

/* ═══════════════════════════════════════════
   3. CINEMATIC LOADER
═══════════════════════════════════════════ */
function initLoader() {
    const loader = qs('#loader');
    const fill   = qs('#loaderFill');
    const count  = qs('#loaderCount');
    if (!loader) { triggerHeroIntro(); return; }

    document.body.style.overflow = 'hidden';

    const start = performance.now();
    const dur   = CONFIG.LOADER_MS;

    function easeOutExpo(t) { return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t); }

    function tick(now) {
        const t      = Math.min((now - start) / dur, 1);
        const eased  = easeOutExpo(t);
        const pct    = Math.round(eased * 100);

        fill.style.width  = pct + '%';
        count.textContent = pct;

        if (t < 1) {
            requestAnimationFrame(tick);
        } else {
            // Dismiss loader
            loader.classList.add('is-done');
            document.body.style.overflow = '';

            setTimeout(triggerHeroIntro, 120);
            setTimeout(() => { loader.style.display = 'none'; }, 1100);
        }
    }

    requestAnimationFrame(tick);
}

/* ── Trigger hero intro after loader ── */
function triggerHeroIntro() {
    // 1. Title words wipe up
    const heroTitle = qs('#heroTitle');
    if (heroTitle) heroTitle.classList.add('is-revealed');

    // 2. Reveal text-reveal-line inners in hero heading
    // (handled above via class)

    // 3. Badge, desc, CTA fade in
    const heroEls = [
        qs('#heroBadge'),
        qs('#heroDesc'),
        qs('#heroCta'),
    ];
    heroEls.forEach((el, i) => {
        if (!el) return;
        setTimeout(() => el.classList.add('in-view'), 200 + i * 110);
    });

    // 4. Fire the scroll-reveal observer for any elements already in viewport
    setTimeout(checkViewportElements, 300);
}

/* ═══════════════════════════════════════════
   4. NAVIGATION
═══════════════════════════════════════════ */
function initNav() {
    const nav  = qs('#mainNav');
    const ham  = qs('#hamburger');
    const menu = qs('#mobileMenu');
    if (!nav) return;

    // Sticky glass effect
    window.addEventListener('scroll', () => {
        nav.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });

    // Hamburger open/close
    if (ham && menu) {
        function toggleMenu(open) {
            ham.classList.toggle('open', open);
            ham.setAttribute('aria-expanded', open);
            menu.classList.toggle('open', open);
            menu.setAttribute('aria-hidden', !open);
            document.body.style.overflow = open ? 'hidden' : '';
        }

        ham.addEventListener('click', () => toggleMenu(!ham.classList.contains('open')));

        qsAll('.mobile-link').forEach(link => {
            link.addEventListener('click', () => toggleMenu(false));
        });

        // Close on Escape
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape' && menu.classList.contains('open')) toggleMenu(false);
        });
    }

    // Smooth scroll for all anchor links
    qsAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
            const id     = a.getAttribute('href');
            const target = qs(id);
            if (!target) return;
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth' });
        });
    });

    // Active link highlight via IntersectionObserver
    const sections  = qsAll('section[id], div[id]');
    const navLinks  = qsAll('.nav-link');
    const sectionIO = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                navLinks.forEach(l => {
                    const match = l.getAttribute('href') === `#${id}`;
                    l.style.color = match ? 'var(--ivory)' : '';
                });
            }
        });
    }, { threshold: 0.45 });
    sections.forEach(s => sectionIO.observe(s));
}

/* ═══════════════════════════════════════════
   5. HERO SLIDESHOW
═══════════════════════════════════════════ */
function initHeroSlider() {
    const heroImg    = qs('#heroImage');
    const slideNodes = qsAll('.hero-slide');
    const dots       = qsAll('.hero-dot');
    const counter    = qs('#heroSlideNum');
    if (!heroImg || slideNodes.length < 2) return;

    const srcs = slideNodes.map(s => s.dataset.src).filter(Boolean);
    let current = 0;

    // Pre-load all images
    srcs.forEach(src => { const img = new Image(); img.src = src; });

    // Apply inline transition once (override parallax handler's transform)
    heroImg.style.transition = 'opacity .75s ease, transform 7s linear';

    function goTo(idx) {
        current = idx;
        heroImg.style.opacity = '0';

        setTimeout(() => {
            heroImg.src = srcs[idx];
            heroImg.style.opacity = '1';
        }, 380);

        dots.forEach((d, i) => {
            d.classList.toggle('active', i === idx);
            d.setAttribute('aria-current', i === idx ? 'true' : 'false');
        });
        if (counter) counter.textContent = String(idx + 1).padStart(2, '0');
    }

    // Dot clicks
    dots.forEach((d, i) => {
        d.addEventListener('click', () => { clearInterval(timer); goTo(i); timer = setInterval(advance, CONFIG.HERO_INTERVAL_MS); });
    });

    function advance() { goTo((current + 1) % srcs.length); }
    let timer = setInterval(advance, CONFIG.HERO_INTERVAL_MS);
}

/* ═══════════════════════════════════════════
   6. HERO PARALLAX
═══════════════════════════════════════════ */
function initHeroParallax() {
    const heroImg = qs('#heroImage');
    if (!heroImg) return;

    window.addEventListener('scroll', () => {
        const y = window.scrollY;
        if (y < window.innerHeight * 1.2) {
            // Subtle upward drift as user scrolls
            heroImg.style.transform = `scale(1.08) translateY(${y * 0.18}px)`;
        }
    }, { passive: true });
}

/* ═══════════════════════════════════════════
   7. ABOUT IMAGE PARALLAX
═══════════════════════════════════════════ */
function initAboutParallax() {
    const mainImg = qs('.about-img-main img');
    if (!mainImg) return;

    window.addEventListener('scroll', () => {
        const rect = mainImg.closest('.about-img-main').getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
            const pct   = 1 - rect.bottom / (window.innerHeight + rect.height);
            mainImg.style.transform = `scale(1.12) translateY(${pct * 40}px)`;
        }
    }, { passive: true });
}

/* ═══════════════════════════════════════════
   8. SCROLL REVEAL  (the core engine)
   ─────────────────────────────────────────
   Strategy:
   • .anim-reveal elements: standard opacity+translateY
   • .trl elements: wrap content in .trl-inner span that wipes up
   • Both triggered by a single, forgiving IntersectionObserver
   • checkViewportElements() also runs at init to catch anything
     already on screen when the page loads / loader finishes.
═══════════════════════════════════════════ */
let observer;

function initScrollReveal() {
    // ── A. Text-reveal lines: wrap content in animated inner span ──
    qsAll('.trl').forEach((line, globalIdx) => {
        // Don't double-wrap
        if (line.querySelector('.trl-inner')) return;

        const delay = parseInt(line.dataset.delay || '0');

        const inner = document.createElement('span');
        inner.className    = 'trl-inner';
        inner.style.transitionDelay = delay + 'ms';

        // Move children into inner span
        while (line.firstChild) inner.appendChild(line.firstChild);
        line.appendChild(inner);
    });

    // ── B. Create the observer (very forgiving threshold) ──
    observer = new IntersectionObserver(onIntersect, {
        threshold:  0.05,
        rootMargin: '0px 0px 0px 0px',
    });

    // ── C. Observe everything that needs revealing ──
    qsAll('.anim-reveal, .trl').forEach(el => observer.observe(el));

    // ── D. About image blocks also need revealing ──
    qsAll('.about-img-main, .about-img-sub').forEach(el => {
        el.classList.add('anim-reveal');
        observer.observe(el);
    });
}

function onIntersect(entries) {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el    = entry.target;
        const delay = parseInt(el.dataset.delay || '0');

        if (el.classList.contains('anim-reveal')) {
            setTimeout(() => el.classList.add('is-visible'), delay);
        }
        if (el.classList.contains('trl')) {
            const inner = el.querySelector('.trl-inner');
            if (inner) setTimeout(() => inner.classList.add('is-up'), delay);
        }

        observer.unobserve(el);
    });
}

/* Called after loader dismisses to catch above-fold elements */
function checkViewportElements() {
    qsAll('.anim-reveal:not(.is-visible), .trl').forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
            // Force-fire for anything already visible
            onIntersect([{ isIntersecting: true, target: el }]);
        }
    });
}

/* ═══════════════════════════════════════════
   9. CAMPAIGN SLIDER
═══════════════════════════════════════════ */
function initCampaignSlider() {
    const items   = qsAll('.campaign-item');
    const prevBtn = qs('#campaignPrev');
    const nextBtn = qs('#campaignNext');
    const bar     = qs('#campaignBar');
    if (!items.length) return;

    let current = 0;

    function show(idx) {
        items.forEach(i => i.classList.remove('active'));
        items[idx].classList.add('active');
        if (bar) bar.style.width = `${((idx + 1) / items.length) * 100}%`;
        current = idx;
    }

    function advance() { show((current + 1) % items.length); }
    function retreat() { show((current - 1 + items.length) % items.length); }

    let timer = setInterval(advance, CONFIG.CAMPAIGN_INTERVAL_MS);
    function resetTimer() { clearInterval(timer); timer = setInterval(advance, CONFIG.CAMPAIGN_INTERVAL_MS); }

    nextBtn?.addEventListener('click', () => { advance(); resetTimer(); });
    prevBtn?.addEventListener('click', () => { retreat(); resetTimer(); });

    // Swipe support on campaign reel
    const reel = qs('.campaign-reel');
    if (reel) {
        let touchX = 0;
        reel.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
        reel.addEventListener('touchend',   e => {
            const diff = touchX - e.changedTouches[0].clientX;
            if (Math.abs(diff) > 50) { diff > 0 ? advance() : retreat(); resetTimer(); }
        });
    }

    show(0); // set bar to 33% on load
}

/* ═══════════════════════════════════════════
   10. TESTIMONIALS
═══════════════════════════════════════════ */
function initTestimonials() {
    const items = qsAll('.testimonial');
    const dots  = qsAll('.t-dot');
    const prev  = qs('#tPrev');
    const next  = qs('#tNext');
    if (!items.length) return;

    let current = 0;

    function show(idx) {
        items.forEach(t  => t.classList.remove('active'));
        dots.forEach( d  => { d.classList.remove('active'); d.setAttribute('aria-current','false'); });
        items[idx].classList.add('active');
        dots[idx]?.classList.add('active');
        dots[idx]?.setAttribute('aria-current','true');
        current = idx;
    }

    function advance() { show((current + 1) % items.length); }
    function retreat() { show((current - 1 + items.length) % items.length); }

    let timer = setInterval(advance, CONFIG.TESTIMONIAL_MS);
    function resetTimer() { clearInterval(timer); timer = setInterval(advance, CONFIG.TESTIMONIAL_MS); }

    next?.addEventListener('click', () => { advance(); resetTimer(); });
    prev?.addEventListener('click', () => { retreat(); resetTimer(); });
    dots.forEach((d, i) => d.addEventListener('click', () => { show(i); resetTimer(); }));

    show(0);
}

/* ═══════════════════════════════════════════
   11. DRAGGABLE EDITORIAL SCROLL
═══════════════════════════════════════════ */
function initDragScroll() {
    const wrap  = qs('#editorialsDrag');
    const track = qs('#editorialsTrack');
    if (!wrap || !track) return;

    let isDragging = false;
    let startX     = 0;
    let scrollLeft = 0;
    let velocity   = 0;
    let lastX      = 0;
    let rafId      = null;

    wrap.addEventListener('mousedown', e => {
        isDragging = true;
        startX     = e.pageX - wrap.offsetLeft;
        scrollLeft = wrap.scrollLeft;
        lastX      = e.pageX;
        if (rafId) cancelAnimationFrame(rafId);
    });

    window.addEventListener('mouseup', () => {
        if (!isDragging) return;
        isDragging = false;
        applyMomentum();
    });

    window.addEventListener('mousemove', e => {
        if (!isDragging) return;
        e.preventDefault();
        const x    = e.pageX - wrap.offsetLeft;
        const walk = (x - startX) * 1.5;
        velocity   = e.pageX - lastX;
        lastX      = e.pageX;
        wrap.scrollLeft = scrollLeft - walk;
    });

    function applyMomentum() {
        function step() {
            velocity      *= 0.91;
            wrap.scrollLeft -= velocity;
            if (Math.abs(velocity) > 0.6) rafId = requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }

    // Touch support
    let tx = 0;
    wrap.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
    wrap.addEventListener('touchmove',  e => {
        const diff  = tx - e.touches[0].clientX;
        wrap.scrollLeft += diff * 0.9;
        tx = e.touches[0].clientX;
    }, { passive: true });
}

/* ═══════════════════════════════════════════
   12. LIGHTBOX
═══════════════════════════════════════════ */
function initLightbox() {
    const box      = qs('#lightbox');
    const boxImg   = qs('#lightboxImg');
    const closeBtn = qs('#lightboxClose');
    if (!box || !boxImg) return;

    qsAll('.masonry-item').forEach(item => {
        item.setAttribute('role', 'button');
        item.setAttribute('tabindex', '0');
        item.setAttribute('aria-label', 'View image full size');

        function open() {
            const src = item.querySelector('img')?.src;
            if (!src) return;
            boxImg.src = src;
            boxImg.alt = item.querySelector('img')?.alt || 'Portfolio image';
            box.classList.add('is-open');
            document.body.style.overflow = 'hidden';
            closeBtn?.focus();
        }

        item.addEventListener('click', open);
        item.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') open(); });
    });

    function close() {
        box.classList.remove('is-open');
        document.body.style.overflow = '';
        setTimeout(() => { boxImg.src = ''; }, 500);
    }

    closeBtn?.addEventListener('click', close);
    box.addEventListener('click', e => { if (e.target === box) close(); });
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && box.classList.contains('is-open')) close();
    });
}

/* ═══════════════════════════════════════════
   13. INIT
═══════════════════════════════════════════ */
function init() {
    initCursor();
    initScrollProgress();
    initScrollReveal();   // set up observer BEFORE loader fires
    initLoader();         // loader fires, then calls triggerHeroIntro
    initNav();
    initHeroSlider();
    initHeroParallax();
    initAboutParallax();
    initCampaignSlider();
    initTestimonials();
    initDragScroll();
    initLightbox();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
