// ============================================================
// Deniz — Portfolio interactions
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    initMobileNav();
    initScrollReveal();
    initSkillBars();
    initPortfolioFilter();
    initContactForm();
    initParticles();
    initTypewriter();
    initSlider();
    initVideoFallbacks();
});

/* ---------- Graceful video fallback (any <video poster>) ---------- */
// If a background/demo video can't load (offline, host blocked, etc.), swap it
// for its poster image so the page never shows a broken player.
function attachVideoFallback(video) {
    video.addEventListener('error', () => {
        const poster = video.getAttribute('poster');
        if (!poster) return;
        const img = document.createElement('img');
        img.className = video.className;
        img.src = poster;
        img.alt = 'Önizleme';
        img.loading = 'lazy';
        video.replaceWith(img);
    }, true);
}

function initVideoFallbacks() {
    document.querySelectorAll('video[poster]').forEach(attachVideoFallback);
}

/* ---------- Mobile nav toggle ---------- */
function initMobileNav() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    if (!hamburger || !navLinks) return;

    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('open');
        hamburger.classList.toggle('open');
    });

    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('open');
            hamburger.classList.remove('open');
        });
    });
}

/* ---------- Scroll reveal ---------- */
function initScrollReveal() {
    const items = document.querySelectorAll('.reveal');
    if (!items.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    items.forEach(item => observer.observe(item));
}

/* ---------- Animated skill bars (about page) ---------- */
function initSkillBars() {
    const bars = document.querySelectorAll('.skill-fill');
    if (!bars.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                el.style.width = el.dataset.width + '%';
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.4 });

    bars.forEach(bar => observer.observe(bar));
}

/* ---------- Portfolio filter (projects page) ---------- */
function initPortfolioFilter() {
    const buttons = document.querySelectorAll('.filter-btn');
    const items = document.querySelectorAll('.portfolio-item');
    if (!buttons.length || !items.length) return;

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.dataset.filter;
            items.forEach(item => {
                const match = filter === 'all' || item.dataset.category === filter;
                item.classList.toggle('hidden', !match);
            });
        });
    });
}

/* ---------- Ambient particle / ember animation ---------- */
function initParticles() {
    const canvas = document.getElementById('fx-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const colors = ['240, 57, 155', '139, 47, 224', '46, 92, 240'];
    let particles = [];
    let width, height, dpr;

    function resize() {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function makeParticle() {
        return {
            x: Math.random() * width,
            y: height + Math.random() * 100,
            r: Math.random() * 1.6 + 0.6,
            speed: Math.random() * 0.35 + 0.12,
            drift: (Math.random() - 0.5) * 0.3,
            color: colors[Math.floor(Math.random() * colors.length)],
            flicker: Math.random() * Math.PI * 2,
            baseAlpha: Math.random() * 0.5 + 0.25,
        };
    }

    function init() {
        resize();
        const count = width < 700 ? 22 : 46;
        particles = Array.from({ length: count }, makeParticle);
    }

    function tick() {
        ctx.clearRect(0, 0, width, height);
        particles.forEach(p => {
            p.y -= p.speed;
            p.x += p.drift;
            p.flicker += 0.02;
            if (p.y < -20) Object.assign(p, makeParticle(), { y: height + 10 });

            const alpha = p.baseAlpha * (0.6 + 0.4 * Math.sin(p.flicker));
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r * 2.4, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${p.color}, ${alpha * 0.15})`;
            ctx.fill();

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${p.color}, ${alpha})`;
            ctx.fill();
        });
        requestAnimationFrame(tick);
    }

    init();
    window.addEventListener('resize', () => { init(); });

    if (!reduceMotion) {
        requestAnimationFrame(tick);
    } else {
        // Draw a single static frame for reduced-motion users.
        ctx.clearRect(0, 0, width, height);
        particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${p.color}, ${p.baseAlpha})`;
            ctx.fill();
        });
    }
}

/* ---------- Typewriter role-cycling text (hero) ---------- */
function initTypewriter() {
    const el = document.querySelector('.type-target');
    if (!el) return;

    // Types a single line once and stops — kept deliberately calm/minimal
    // rather than looping, so the hero doesn't feel over-animated.
    const phrase = 'Full-Stack Geliştirici & Güvenlik Meraklısı';
    const cursor = document.querySelector('.hero-role-line .cursor');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion) {
        el.textContent = phrase;
        if (cursor) cursor.classList.add('done');
        return;
    }

    let charIndex = 0;

    function step() {
        charIndex++;
        el.textContent = phrase.slice(0, charIndex);
        if (charIndex < phrase.length) {
            setTimeout(step, 55 + Math.random() * 35);
        } else if (cursor) {
            setTimeout(() => cursor.classList.add('done'), 2200);
        }
    }

    step();
}

/* ---------- Showcase slider (images + video) ---------- */
function initSlider() {
    const slider = document.querySelector('.slider');
    if (!slider) return;

    const slides = Array.from(slider.querySelectorAll('.slide'));
    const dotsWrap = slider.querySelector('.slider-dots');
    const prevBtn = slider.querySelector('.slider-arrow.prev');
    const nextBtn = slider.querySelector('.slider-arrow.next');
    if (!slides.length) return;

    let current = 0;
    let timer = null;
    const DURATION = 5000;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Build dots
    const dots = slides.map((_, i) => {
        const btn = document.createElement('button');
        btn.className = 'slider-dot';
        btn.type = 'button';
        btn.setAttribute('aria-label', `Slayt ${i + 1}`);
        btn.addEventListener('click', () => goTo(i, true));
        dotsWrap.appendChild(btn);
        return btn;
    });

    function playVideos(slide) {
        slide.querySelectorAll('video').forEach(v => {
            v.currentTime = 0;
            v.play().catch(() => {});
        });
    }

    function pauseVideos(slide) {
        slide.querySelectorAll('video').forEach(v => v.pause());
    }

    function render() {
        slides.forEach((s, i) => {
            s.classList.toggle('is-active', i === current);
            if (i === current) playVideos(s); else pauseVideos(s);
        });
        dots.forEach((d, i) => d.classList.toggle('is-active', i === current));
    }

    function goTo(index, manual) {
        current = (index + slides.length) % slides.length;
        render();
        if (manual) restart();
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    function restart() {
        if (timer) clearInterval(timer);
        if (!reduceMotion) timer = setInterval(next, DURATION);
    }

    if (nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1, true));
    if (prevBtn) prevBtn.addEventListener('click', () => goTo(current - 1, true));

    slider.addEventListener('mouseenter', () => { if (timer) clearInterval(timer); });
    slider.addEventListener('mouseleave', restart);

    render();
    restart();
}

/* ---------- Contact form (demo only, no backend) ---------- */
function initContactForm() {
    const form = document.getElementById('contactForm');
    const success = document.getElementById('formSuccess');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (success) {
            success.classList.add('show');
            success.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        form.reset();
    });
}
