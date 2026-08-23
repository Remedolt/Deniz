
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
    initSpaceScenes();
});

function initSpaceScenes() {
    document.querySelectorAll('[data-space-scene]').forEach(createSpaceScene);
}

function createSpaceScene(canvas) {
    const ctx = canvas.getContext('2d');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const shootingStarsEnabled = canvas.dataset.shootingStars === 'true';
    const planetEnabled = canvas.dataset.planet === 'true';

    let width = 0, height = 0, dpr = 1;
    let stars = [];
    let planet = null;
    let shootingStar = null;
    let nextShootAt = 0;

    function resize() {
        const rect = canvas.getBoundingClientRect();
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        width = Math.max(rect.width, 1);
        height = Math.max(rect.height, 1);
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        buildStars();
        if (planetEnabled) buildPlanet();
    }

    function buildStars() {
        const count = Math.min(220, Math.max(70, Math.round((width * height) / 4200)));
        const brandHues = ['240,57,155', '139,47,224', '46,92,240'];
        stars = Array.from({ length: count }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            r: Math.random() * 1.3 + 0.35,
            phase: Math.random() * Math.PI * 2,
            speed: Math.random() * 0.02 + 0.008,
            hue: Math.random() < 0.15 ? brandHues[Math.floor(Math.random() * brandHues.length)] : '255,255,255',
            glow: Math.random() < 0.08,
        }));
    }

    function buildPlanet() {
        const r = Math.min(width, height) * 0.52;
        const mapW = 640, mapH = 320;
        const map = document.createElement('canvas');
        map.width = mapW;
        map.height = mapH;
        const mctx = map.getContext('2d');

        const base = mctx.createLinearGradient(0, 0, 0, mapH);
        base.addColorStop(0, '#d9c6b2');
        base.addColorStop(0.12, '#c9784f');
        base.addColorStop(0.5, '#a8502f');
        base.addColorStop(0.88, '#8f3f28');
        base.addColorStop(1, '#d9c6b2');
        mctx.fillStyle = base;
        mctx.fillRect(0, 0, mapW, mapH);

        const blobColors = ['rgba(90,47,31,0.45)', 'rgba(201,120,79,0.35)', 'rgba(61,26,17,0.4)', 'rgba(216,163,120,0.28)'];
        Array.from({ length: 46 }, () => ({
            x: Math.random() * mapW,
            y: Math.random() * mapH,
            rx: Math.random() * 70 + 20,
            ry: Math.random() * 30 + 10,
            color: blobColors[Math.floor(Math.random() * blobColors.length)],
        })).forEach(b => {
            [-mapW, 0, mapW].forEach(offset => {
                mctx.beginPath();
                mctx.fillStyle = b.color;
                mctx.ellipse(b.x + offset, b.y, b.rx, b.ry, 0, 0, Math.PI * 2);
                mctx.fill();
            });
        });

        Array.from({ length: 42 }, () => ({
            x: Math.random() * mapW,
            y: Math.random() * mapH * 0.86 + mapH * 0.07,
            r: Math.random() * 10 + 3,
        })).forEach(c => {
            [-mapW, 0, mapW].forEach(offset => {
                const cx = c.x + offset;
                mctx.beginPath();
                mctx.fillStyle = 'rgba(20,8,5,0.5)';
                mctx.arc(cx, c.y, c.r, 0, Math.PI * 2);
                mctx.fill();
                mctx.beginPath();
                mctx.strokeStyle = 'rgba(255,210,180,0.35)';
                mctx.lineWidth = Math.max(0.6, c.r * 0.18);
                mctx.arc(cx - c.r * 0.25, c.y - c.r * 0.25, c.r * 0.7, 0, Math.PI * 2);
                mctx.stroke();
            });
        });

        const northCap = mctx.createLinearGradient(0, 0, 0, mapH * 0.12);
        northCap.addColorStop(0, 'rgba(255,250,245,0.85)');
        northCap.addColorStop(1, 'rgba(255,250,245,0)');
        mctx.fillStyle = northCap;
        mctx.fillRect(0, 0, mapW, mapH * 0.12);

        const southCap = mctx.createLinearGradient(0, mapH * 0.88, 0, mapH);
        southCap.addColorStop(0, 'rgba(255,250,245,0)');
        southCap.addColorStop(1, 'rgba(255,250,245,0.85)');
        mctx.fillStyle = southCap;
        mctx.fillRect(0, mapH * 0.88, mapW, mapH * 0.12);

        const buffer = document.createElement('canvas');
        buffer.width = Math.ceil(r * 2);
        buffer.height = Math.ceil(r * 2);

        planet = {
            cx: width * 0.84,
            cy: height * 0.8,
            r,
            rotation: Math.random() * Math.PI * 2,
            map, mapW, mapH,
            buffer, bctx: buffer.getContext('2d'),
        };
    }

    function drawPlanet() {
        if (!planetEnabled || !planet) return;
        const p = planet;
        p.rotation += 0.0009;
        const lightLon = -0.85;
        const d = p.r * 2;
        const numStrips = Math.max(90, Math.min(220, Math.round(p.r / 1.1)));
        const bctx = p.bctx;

        bctx.clearRect(0, 0, d, d);
        bctx.save();
        bctx.beginPath();
        bctx.arc(p.r, p.r, p.r, 0, Math.PI * 2);
        bctx.closePath();
        bctx.clip();

        for (let i = 0; i < numStrips; i++) {
            const t = i / (numStrips - 1);
            const sx = Math.max(-1, Math.min(1, -1 + 2 * t));
            const halfH = Math.sqrt(Math.max(0, 1 - sx * sx)) * p.r;
            if (halfH < 0.4) continue;
            const theta = Math.asin(sx);
            const longitude = theta + p.rotation;
            const srcX = (((longitude / (Math.PI * 2)) * p.mapW) % p.mapW + p.mapW) % p.mapW;
            const destX = p.r + sx * p.r;
            const stripW = Math.max(1.4, (2 * p.r / numStrips) * 2.3);
            const destY = p.r - halfH;
            const destH = halfH * 2;

            bctx.drawImage(p.map, srcX, 0, 3, p.mapH, destX - stripW / 2, destY, stripW, destH);
        }

        const lightSteps = 28;
        const shadeGrad = bctx.createLinearGradient(0, 0, d, 0);
        const highlightGrad = bctx.createLinearGradient(0, 0, d, 0);
        for (let i = 0; i <= lightSteps; i++) {
            const frac = i / lightSteps;
            const sx = Math.max(-1, Math.min(1, -1 + 2 * frac));
            const theta = Math.asin(sx);
            const brightness = Math.max(0, Math.cos(theta - lightLon));
            const shade = Math.min(0.88, 1 - (0.16 + 0.84 * brightness));
            shadeGrad.addColorStop(frac, `rgba(6,2,1,${shade})`);
            const hi = brightness > 0.82 ? (brightness - 0.82) * 0.45 : 0;
            highlightGrad.addColorStop(frac, `rgba(255,205,160,${hi})`);
        }
        bctx.fillStyle = shadeGrad;
        bctx.fillRect(0, 0, d, d);
        bctx.fillStyle = highlightGrad;
        bctx.fillRect(0, 0, d, d);

        bctx.restore();

        ctx.save();
        ctx.filter = 'blur(1.1px)';
        ctx.drawImage(p.buffer, p.cx - p.r, p.cy - p.r);
        ctx.restore();

        ctx.save();
        ctx.filter = 'blur(6px)';
        ctx.beginPath();
        ctx.arc(p.cx, p.cy, p.r * 1.03, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(240,140,90,0.35)';
        ctx.lineWidth = Math.max(2, p.r * 0.05);
        ctx.stroke();
        ctx.restore();

        ctx.beginPath();
        ctx.arc(p.cx, p.cy, p.r * 1.005, lightLon - 1.15, lightLon + 1.15);
        ctx.strokeStyle = 'rgba(255,205,170,0.5)';
        ctx.lineWidth = Math.max(1, p.r * 0.012);
        ctx.stroke();
    }

    function drawNebula() {
        const g1 = ctx.createRadialGradient(width * 0.22, height * 0.28, 0, width * 0.22, height * 0.28, Math.max(width, height) * 0.6);
        g1.addColorStop(0, 'rgba(139,47,224,0.18)');
        g1.addColorStop(1, 'rgba(139,47,224,0)');
        ctx.fillStyle = g1;
        ctx.fillRect(0, 0, width, height);

        const g2 = ctx.createRadialGradient(width * 0.82, height * 0.7, 0, width * 0.82, height * 0.7, Math.max(width, height) * 0.55);
        g2.addColorStop(0, 'rgba(46,92,240,0.16)');
        g2.addColorStop(1, 'rgba(46,92,240,0)');
        ctx.fillStyle = g2;
        ctx.fillRect(0, 0, width, height);
    }

    function drawStars(animated) {
        stars.forEach(st => {
            if (animated) st.phase += st.speed;
            const alpha = animated ? 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(st.phase)) : 0.75;
            ctx.beginPath();
            if (st.glow) {
                ctx.shadowBlur = 6;
                ctx.shadowColor = `rgba(${st.hue},0.9)`;
            } else {
                ctx.shadowBlur = 0;
            }
            ctx.fillStyle = `rgba(${st.hue},${alpha})`;
            ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.shadowBlur = 0;
    }

    function maybeSpawnShootingStar(time) {
        if (!shootingStarsEnabled) return;
        if (!nextShootAt) nextShootAt = time + 2500 + Math.random() * 3500;
        if (!shootingStar && time > nextShootAt) {
            const angle = Math.PI / 4 + (Math.random() * 0.3 - 0.15);
            shootingStar = {
                x: Math.random() * width * 0.55,
                y: Math.random() * height * 0.35,
                vx: Math.cos(angle),
                vy: Math.sin(angle),
                len: 0,
                maxLen: 80 + Math.random() * 60,
                life: 0,
                maxLife: 40,
            };
        }
    }

    function drawShootingStar() {
        if (!shootingStar) return;
        const s = shootingStar;
        const speed = 9;
        s.life++;
        s.x += s.vx * speed;
        s.y += s.vy * speed;
        s.len = Math.min(s.maxLen, s.len + speed);
        const tailX = s.x - s.vx * s.len;
        const tailY = s.y - s.vy * s.len;
        const grad = ctx.createLinearGradient(s.x, s.y, tailX, tailY);
        grad.addColorStop(0, 'rgba(255,255,255,0.95)');
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();

        if (s.life > s.maxLife || s.x > width + 60 || s.y > height + 60) {
            shootingStar = null;
            nextShootAt = 0;
        }
    }

    function tick(time) {
        ctx.clearRect(0, 0, width, height);
        drawNebula();
        drawStars(true);
        drawPlanet();
        maybeSpawnShootingStar(time);
        drawShootingStar();
        requestAnimationFrame(tick);
    }

    resize();
    window.addEventListener('resize', resize);

    if (reduceMotion) {
        ctx.clearRect(0, 0, width, height);
        drawNebula();
        drawStars(false);
        drawPlanet();
    } else {
        requestAnimationFrame(tick);
    }
}

function attachVideoFallback(video) {
    let swapped = false;
    const swap = () => {
        if (swapped) return;
        swapped = true;
        const canvas = document.createElement('canvas');
        canvas.className = video.className;
        canvas.setAttribute('data-space-scene', '');
        canvas.setAttribute('data-shooting-stars', 'true');
        video.replaceWith(canvas);
        createSpaceScene(canvas);
    };

    video.addEventListener('error', swap, true);
    video.querySelectorAll('source').forEach(src => src.addEventListener('error', swap, true));
    setTimeout(() => {
        if (video.readyState === 0) swap();
    }, 6000);
}

function initVideoFallbacks() {
    document.querySelectorAll('video').forEach(attachVideoFallback);
}

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
        ctx.clearRect(0, 0, width, height);
        particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${p.color}, ${p.baseAlpha})`;
            ctx.fill();
        });
    }
}

function initTypewriter() {
    const el = document.querySelector('.type-target');
    if (!el) return;

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
