/* ===================================
   MEXIMCO — Interactive Effects Engine
   Each feature is a self-contained module.
   A failure in one will NOT affect the others.
   =================================== */

'use strict';

/* ===========================================
   1. PSYCHEDELIC CANVAS — INTERACTION ONLY
   Only animates on mouse/touch activity.
   Canvas stays clear when idle (no background animation).
   =========================================== */
(function initCanvas() {
    const canvas = document.getElementById('psychedelic-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    const isMobile = window.innerWidth < 768 || 'ontouchstart' in window;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let particles = [];
    let ripples = [];
    let geometricShapes = [];
    let frameCount = 0;
    let lastParticleTime = 0;
    let isPointerMoving = false;

    const MAX_PARTICLES = isMobile ? 30 : 100;
    const MAX_SHAPES = isMobile ? 4 : 10;
    const PARTICLE_BATCH = isMobile ? 2 : 3;
    const PARTICLE_INTERVAL = isMobile ? 50 : 30;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class Particle {
        constructor(x, y) {
            this.x = x; this.originX = x;
            this.y = y; this.originY = y;
            this.size = isMobile ? Math.random() * 1.5 + 0.8 : Math.random() * 2.5 + 1;
            this.life = 1;
            this.decay = isMobile ? Math.random() * 0.025 + 0.012 : Math.random() * 0.018 + 0.008;
            this.velocityX = (Math.random() - 0.5) * (isMobile ? 1.5 : 2);
            this.velocityY = (Math.random() - 0.5) * (isMobile ? 1.5 : 2);
            this.angle = Math.random() * Math.PI * 2;
            this.angularSpeed = (Math.random() - 0.5) * 0.15;
            this.orbit = Math.random() * (isMobile ? 12 : 20) + 8;
            this.type = Math.random() > 0.5 ? 'orbit' : 'trail';
            this.hueOffset = Math.random() * 360;
        }
        update() {
            this.life -= this.decay;
            if (this.type === 'orbit') {
                this.angle += this.angularSpeed;
                this.x = this.originX + Math.cos(this.angle) * this.orbit * this.life;
                this.y = this.originY + Math.sin(this.angle) * this.orbit * this.life;
            } else {
                this.x += this.velocityX; this.y += this.velocityY;
                this.velocityX *= 0.97; this.velocityY *= 0.97;
            }
        }
        draw() {
            if (this.life <= 0) return;
            const hue = (Date.now() * 0.06 + this.hueOffset) % 360;
            ctx.beginPath();
            ctx.arc(this.x, this.y, Math.max(0.5, this.size * this.life), 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${hue}, 100%, 70%, ${this.life * (isMobile ? 0.7 : 0.85)})`;
            if (!isMobile) { ctx.shadowColor = `hsla(${hue}, 100%, 60%, 0.6)`; ctx.shadowBlur = 8; }
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }

    class Ripple {
        constructor(x, y) {
            this.x = x; this.y = y; this.radius = 0;
            this.maxRadius = isMobile ? 60 + Math.random() * 30 : 90 + Math.random() * 60;
            this.speed = isMobile ? 2 + Math.random() * 1.5 : 2.5 + Math.random() * 2;
            this.life = 1;
        }
        update() { this.radius += this.speed; this.life = 1 - (this.radius / this.maxRadius); }
        draw() {
            if (this.life <= 0) return;
            const hue = (Date.now() * 0.04 + this.radius * 0.5) % 360;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.strokeStyle = `hsla(${hue}, 100%, 65%, ${this.life * (isMobile ? 0.5 : 0.7)})`;
            ctx.lineWidth = isMobile ? 1.5 : 2.5;
            if (!isMobile) { ctx.shadowColor = `hsla(${hue}, 100%, 60%, 0.5)`; ctx.shadowBlur = 12; }
            ctx.stroke();
            ctx.shadowBlur = 0;
            if (!isMobile) {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius * 0.55, 0, Math.PI * 2);
                ctx.strokeStyle = `hsla(${(hue + 140) % 360}, 90%, 70%, ${this.life * 0.5})`;
                ctx.lineWidth = 1.5; ctx.stroke();
            }
        }
    }

    class GeometricShape {
        constructor(x, y) {
            this.x = x; this.y = y;
            this.rotation = Math.random() * Math.PI * 2;
            this.rotationSpeed = (Math.random() - 0.5) * 0.06;
            this.size = Math.random() * 15 + 8;
            this.sides = Math.floor(Math.random() * 4) + 3;
            this.life = 1; this.decay = 0.012;
            this.drift = { x: (Math.random() - 0.5), y: (Math.random() - 0.5) };
        }
        update() {
            this.life -= this.decay; this.rotation += this.rotationSpeed;
            this.x += this.drift.x; this.y += this.drift.y;
        }
        draw() {
            if (this.life <= 0) return;
            const hue = (Date.now() * 0.04 + this.rotation * 57) % 360;
            const s = this.size * this.life;
            ctx.save(); ctx.translate(this.x, this.y); ctx.rotate(this.rotation);
            ctx.beginPath();
            for (let i = 0; i <= this.sides; i++) {
                const a = (i / this.sides) * Math.PI * 2;
                i === 0 ? ctx.moveTo(Math.cos(a) * s, Math.sin(a) * s) : ctx.lineTo(Math.cos(a) * s, Math.sin(a) * s);
            }
            ctx.closePath();
            ctx.strokeStyle = `hsla(${hue}, 100%, 65%, ${this.life * 0.6})`;
            ctx.lineWidth = 2;
            ctx.shadowColor = `hsla(${hue}, 100%, 60%, 0.4)`; ctx.shadowBlur = 6;
            ctx.stroke(); ctx.shadowBlur = 0; ctx.restore();
        }
    }

    // Wave rings — ONLY fires while pointer is actively moving
    function drawWaveField(x, y) {
        return; // Disabled organic wave rings around cursor per user request
        if (isMobile || !isPointerMoving) return;
        const t = Date.now() * 0.002;
        for (let w = 0; w < 3; w++) {
            ctx.beginPath();
            const r = 18 + w * 12, pts = 48;
            const hue = (t * 30 + w * 80) % 360;
            for (let i = 0; i <= pts; i++) {
                const a = (i / pts) * Math.PI * 2;
                const d = Math.sin(a * 4 + t + w) * 10;
                const px = x + Math.cos(a) * (r + d);
                const py = y + Math.sin(a) * (r + d);
                i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.strokeStyle = `hsla(${hue}, 100%, 65%, ${0.35 - w * 0.08})`;
            ctx.lineWidth = 1.5;
            ctx.shadowColor = `hsla(${hue}, 100%, 60%, 0.3)`; ctx.shadowBlur = 5;
            ctx.stroke(); ctx.shadowBlur = 0;
        }
    }

    // Main loop — SKIPS entirely when nothing to render
    function animate() {
        requestAnimationFrame(animate);
        frameCount++;
        const now = Date.now();

        // If no active elements and pointer idle, canvas stays clear — return early
        const hasContent = particles.length > 0 || ripples.length > 0 || geometricShapes.length > 0 || isPointerMoving;
        if (!hasContent) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (isPointerMoving && now - lastParticleTime > PARTICLE_INTERVAL) {
            if (particles.length < MAX_PARTICLES) {
                for (let p = 0; p < PARTICLE_BATCH; p++) particles.push(new Particle(mouseX, mouseY));
            }
            if (!isMobile && frameCount % 8 === 0 && geometricShapes.length < MAX_SHAPES) {
                geometricShapes.push(new GeometricShape(mouseX, mouseY));
            }
            lastParticleTime = now;
        }

        drawWaveField(mouseX, mouseY);

        let i = particles.length;
        while (i--) {
            particles[i].update();
            particles[i].life <= 0 ? particles.splice(i, 1) : particles[i].draw();
        }
        let j = ripples.length;
        while (j--) {
            ripples[j].update();
            ripples[j].life <= 0 ? ripples.splice(j, 1) : ripples[j].draw();
        }
        if (!isMobile) {
            let k = geometricShapes.length;
            while (k--) {
                geometricShapes[k].update();
                geometricShapes[k].life <= 0 ? geometricShapes.splice(k, 1) : geometricShapes[k].draw();
            }
        }
    }

    let pointerMoveTimer;
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX; mouseY = e.clientY;
        isPointerMoving = true;
        clearTimeout(pointerMoveTimer);
        pointerMoveTimer = setTimeout(() => { isPointerMoving = false; }, 150);
    });

    document.addEventListener('touchmove', (e) => {
        const touch = e.touches[0];
        if (touch) {
            mouseX = touch.clientX; mouseY = touch.clientY;
            isPointerMoving = true;
            clearTimeout(pointerMoveTimer);
            pointerMoveTimer = setTimeout(() => { isPointerMoving = false; }, 200);
        }
    }, { passive: true });

    document.addEventListener('touchstart', (e) => {
        const touch = e.touches[0];
        if (touch) {
            mouseX = touch.clientX; mouseY = touch.clientY;
            ripples.push(new Ripple(touch.clientX, touch.clientY));
            for (let p = 0; p < (isMobile ? 5 : 10); p++) {
                const particle = new Particle(touch.clientX, touch.clientY);
                particle.velocityX = (Math.random() - 0.5) * (isMobile ? 5 : 8);
                particle.velocityY = (Math.random() - 0.5) * (isMobile ? 5 : 8);
                particle.size = Math.random() * 3 + 1; particle.decay = 0.018;
                particle.type = 'trail'; particles.push(particle);
            }
        }
    }, { passive: true });

    document.addEventListener('click', (e) => {
        ripples.push(new Ripple(e.clientX, e.clientY));
        for (let i = 0; i < 10; i++) {
            const p = new Particle(e.clientX, e.clientY);
            p.velocityX = (Math.random() - 0.5) * 8; p.velocityY = (Math.random() - 0.5) * 8;
            p.size = Math.random() * 3 + 1; p.decay = 0.018; p.type = 'trail';
            particles.push(p);
        }
    });

    animate();
})();


/* ===========================================
   2. MUSHROOM CURSOR
   =========================================== */
(function initCursor() {
    const cursor = document.getElementById('cursor');
    const cursorTrail = document.getElementById('cursor-trail-dot');
    if (!cursor || !cursorTrail) return;
    if (window.innerWidth < 768) {
        cursor.style.display = 'none';
        cursorTrail.style.display = 'none';
        return;
    }

    let cursorX = 0, cursorY = 0, trailX = 0, trailY = 0;

    document.addEventListener('mousemove', (e) => {
        cursorX = e.clientX; cursorY = e.clientY;
    });

    let angle = 0;
    function updateCursor() {
        // Mushroom follows mouse directly
        cursor.style.left = cursorX + 'px';
        cursor.style.top = cursorY + 'px';
        // Trailing ring lags behind
        trailX += (cursorX - trailX) * 0.12;
        trailY += (cursorY - trailY) * 0.12;
        cursorTrail.style.left = trailX + 'px';
        cursorTrail.style.top = trailY + 'px';
        requestAnimationFrame(updateCursor);
    }
    updateCursor();

    // Hover state on interactive elements
    document.querySelectorAll('a, button, .product-card, .service-card, .impact-card, .role-card, .btn, .phase-node, .rocket-btn, .rocket-phase-pip').forEach(el => {
        el.addEventListener('mouseenter', () => { cursor.classList.add('hover-active'); cursorTrail.classList.add('hover-active'); });
        el.addEventListener('mouseleave', () => { cursor.classList.remove('hover-active'); cursorTrail.classList.remove('hover-active'); });
    });

    // Click burst: briefly scale the mushroom
    document.addEventListener('click', () => {
        cursor.style.transition = 'transform 0.1s';
        cursor.style.transform = 'translate(-50%, -50%) scale(1.5)';
        setTimeout(() => {
            cursor.style.transform = 'translate(-50%, -50%) scale(1)';
            cursor.style.transition = '';
        }, 120);
    });
})();


/* ===========================================
   3. LUCIDE ICONS INIT
   =========================================== */
(function initLucide() {
    function tryInit() {
        if (typeof lucide === 'undefined') { setTimeout(tryInit, 100); return; }
        lucide.createIcons();
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', tryInit);
    } else {
        tryInit();
    }
})();


/* ===========================================
   4. DASH SCRUBBER (removes -- from text)
   =========================================== */
document.addEventListener('DOMContentLoaded', () => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    let node;
    while ((node = walker.nextNode())) {
        if (node.nodeValue.includes('--')) {
            node.nodeValue = node.nodeValue.replace(/--/g, '\u2014');
        }
    }
});


/* ===========================================
   3. SCROLL ANIMATIONS (IntersectionObserver)
   =========================================== */
(function initScrollAnimations() {
    const elements = document.querySelectorAll('.animate-on-scroll');
    if (!elements.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    elements.forEach(el => observer.observe(el));
})();


/* ===========================================
   4. NAVBAR SCROLL EFFECT
   =========================================== */
(function initNavbar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    function handleNavScroll() {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    }
    window.addEventListener('scroll', handleNavScroll, { passive: true });
    handleNavScroll();
})();


/* ===========================================
   5. MOBILE MENU TOGGLE
   =========================================== */
(function initMobileMenu() {
    const navToggle = document.getElementById('nav-toggle');
    const navLinks = document.getElementById('nav-links');
    if (!navToggle || !navLinks) return;

    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
    });
    navLinks.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });
})();


/* ===========================================
   6. SMOOTH SCROLL FOR NAV LINKS
   =========================================== */
(function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const top = target.getBoundingClientRect().top + window.scrollY - 80;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });
})();


/* ===========================================
   7. ANIMATED STAT COUNTERS
   =========================================== */
(function initCounters() {
    const statNumbers = document.querySelectorAll('.stat-number[data-target]');
    if (!statNumbers.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.getAttribute('data-target'));
                animateCounter(el, target);
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    statNumbers.forEach(el => observer.observe(el));

    function animateCounter(el, target) {
        const duration = 1500;
        const startTime = performance.now();
        function step(timestamp) {
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.floor(eased * target).toLocaleString();
            if (progress < 1) requestAnimationFrame(step);
            else el.textContent = target.toLocaleString();
        }
        requestAnimationFrame(step);
    }
})();


/* ===========================================
   8. MAGNETIC BUTTON EFFECT
   =========================================== */
(function initMagneticButtons() {
    if (window.innerWidth < 768) return;
    document.querySelectorAll('.magnetic-btn').forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translate(0, 0)';
            btn.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
            setTimeout(() => { btn.style.transition = ''; }, 400);
        });
    });
})();


/* ===========================================
   9. TEXT SCRAMBLE ON HERO TITLE
   =========================================== */
(function initTextScramble() {
    class TextScramble {
        constructor(el) {
            this.el = el;
            this.chars = '!<>-_\\/[]{}—=+*^?#________';
            this.frame = 0;
            this.queue = [];
            this.frameRequest = null;
        }
        setText(newText) {
            const oldText = this.el.innerText;
            const length = Math.max(oldText.length, newText.length);
            const promise = new Promise(resolve => this.resolve = resolve);
            this.queue = [];
            for (let i = 0; i < length; i++) {
                const from = oldText[i] || '';
                const to = newText[i] || '';
                const start = Math.floor(Math.random() * 40);
                const end = start + Math.floor(Math.random() * 40);
                this.queue.push({ from, to, start, end });
            }
            cancelAnimationFrame(this.frameRequest);
            this.frame = 0;
            this.update();
            return promise;
        }
        update() {
            let output = '', complete = 0;
            for (let i = 0, n = this.queue.length; i < n; i++) {
                let { from, to, start, end, char } = this.queue[i];
                if (this.frame >= end) {
                    complete++;
                    output += to;
                } else if (this.frame >= start) {
                    if (!char || Math.random() < 0.28) {
                        char = this.chars[Math.floor(Math.random() * this.chars.length)];
                        this.queue[i].char = char;
                    }
                    output += char;
                } else {
                    output += from;
                }
            }
            this.el.innerText = output;
            if (complete === this.queue.length) {
                this.resolve && this.resolve();
            } else {
                this.frameRequest = requestAnimationFrame(() => this.update());
                this.frame++;
            }
        }
    }

    setTimeout(() => {
        document.querySelectorAll('.title-line').forEach((line, i) => {
            const originalText = line.textContent;
            const scrambler = new TextScramble(line);
            setTimeout(() => scrambler.setText(originalText), 800 + i * 350);
        });
    }, 300);
})();


/* ===========================================
   10. PARALLAX HERO DEPTH EFFECT
   =========================================== */
(function initParallax() {
    if (window.innerWidth < 768) return;
    const heroBg = document.querySelector('.hero-bg-pattern');
    const heroContent = document.querySelector('.hero-content');

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        const heroHeight = window.innerHeight;
        if (scrollY < heroHeight) {
            const progress = scrollY / heroHeight;
            if (heroBg) heroBg.style.transform = `scale(${1 + progress * 0.08}) translateY(${scrollY * 0.3}px)`;
            if (heroContent) {
                heroContent.style.transform = `translateY(${scrollY * 0.15}px)`;
                heroContent.style.opacity = String(1 - progress * 0.7);
            }
        }
    }, { passive: true });
})();


/* ===========================================
   11. 3D TILT EFFECT ON CARDS
   =========================================== */
(function initTiltCards() {
    if (window.innerWidth < 768) return;
    document.querySelectorAll('.product-card, .hero-showcase-card, .contact-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;
            const rotateX = (y - 0.5) * -12; // increased intensity slightly
            const rotateY = (x - 0.5) * 12;
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
            card.style.transition = 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
            setTimeout(() => { card.style.transition = ''; }, 600);
        });
    });
})();

/* ===========================================
   11b. MAGNETIC BUTTON EFFECTS
   =========================================== */
(function initMagneticButtons() {
    if (window.innerWidth < 768) return;
    const magneticElements = document.querySelectorAll('.btn, .nav-link, .phase-node');

    magneticElements.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            // Calculate distance from center
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            // Apply magnetic pull (strength factor 0.3)
            btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
            btn.style.transition = 'none'; // remove transition for snappy tracking
        });

        btn.addEventListener('mouseleave', () => {
            // Spring back to center
            btn.style.transform = 'translate(0px, 0px)';
            btn.style.transition = 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)'; // bouncy spring back
        });
    });
})();


/* ===========================================
   12. CHART.JS — IMPACT SECTION CHARTS
   =========================================== */
(function initImpactCharts() {
    // Wait for Chart.js to be available
    function tryInit() {
        if (typeof Chart === 'undefined') {
            setTimeout(tryInit, 200);
            return;
        }

        const chartDefaults = {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 1800, easing: 'easeOutQuart' },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(20,20,20,0.9)',
                    titleColor: '#fff',
                    bodyColor: '#999',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderWidth: 1,
                }
            },
        };

        const grayPalette = [
            'rgba(255,255,255,0.75)',
            'rgba(180,180,180,0.55)',
            'rgba(110,110,110,0.45)',
        ];

        // Farmers chart — doughnut showing earnings boost
        const farmersEl = document.getElementById('farmersChart');
        if (farmersEl) {
            new Chart(farmersEl.getContext('2d'), {
                type: 'doughnut',
                data: {
                    labels: ['Income Increase', 'Waste Reduced', 'Price Stability'],
                    datasets: [{
                        data: [65, 20, 15],
                        backgroundColor: grayPalette,
                        borderColor: 'transparent',
                        hoverOffset: 8,
                    }]
                },
                options: {
                    ...chartDefaults,
                    cutout: '65%',
                    plugins: {
                        ...chartDefaults.plugins,
                        legend: {
                            display: true,
                            position: 'bottom',
                            labels: { color: '#888', font: { size: 11 }, boxWidth: 10, padding: 12 }
                        }
                    }
                }
            });
        }

        // Buyers chart — bar showing quality metrics
        const buyersEl = document.getElementById('buyersChart');
        if (buyersEl) {
            new Chart(buyersEl.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: ['Quality', 'Supply', 'Traceability', 'Trust'],
                    datasets: [{
                        label: 'Score',
                        data: [98, 95, 100, 92],
                        backgroundColor: grayPalette[0],
                        borderRadius: 6,
                        borderSkipped: false,
                    }]
                },
                options: {
                    ...chartDefaults,
                    scales: {
                        x: {
                            grid: { color: 'rgba(255,255,255,0.04)' },
                            ticks: { color: '#666', font: { size: 11 } },
                        },
                        y: {
                            min: 80,
                            max: 100,
                            grid: { color: 'rgba(255,255,255,0.06)' },
                            ticks: { color: '#666', font: { size: 11 }, callback: v => v + '%' },
                        }
                    }
                }
            });
        }

        // Growth chart — line showing market expansion
        const growthEl = document.getElementById('growthChart');
        if (growthEl) {
            new Chart(growthEl.getContext('2d'), {
                type: 'line',
                data: {
                    labels: ['2025', '2026', '2027', '2028'],
                    datasets: [{
                        label: 'Market Expansion',
                        data: [12, 30, 58, 100],
                        borderColor: 'rgba(255,255,255,0.8)',
                        backgroundColor: 'rgba(255,255,255,0.04)',
                        borderWidth: 2,
                        tension: 0.45,
                        fill: true,
                        pointBackgroundColor: '#fff',
                        pointRadius: 4,
                        pointHoverRadius: 6,
                    }]
                },
                options: {
                    ...chartDefaults,
                    scales: {
                        x: {
                            grid: { color: 'rgba(255,255,255,0.04)' },
                            ticks: { color: '#666', font: { size: 11 } },
                        },
                        y: {
                            grid: { color: 'rgba(255,255,255,0.06)' },
                            ticks: { color: '#666', font: { size: 11 }, callback: v => v + 'x' },
                        }
                    }
                }
            });
        }
    }

    tryInit();
})();


/* ===========================================
   13. GSAP ROCKET ROADMAP — INTERACTIVE
   Click phase nodes, prev/next, or pip dots
   to fly the rocket through each phase.
   =========================================== */
(function initRocketRoadmap() {
    const phaseData = [
        {
            title: 'Phase I — Prototype',
            items: ['2,200 sq ft HQ in Dhaka', 'Trial runs with 5 farmer partners', 'Initial product line: 4 powders', 'ISO certification process begins']
        },
        {
            title: 'Phase II — Mid-Scale Facility',
            items: ['20,000 sq ft processing facility', '50+ partner farmers onboarded', 'Export pilot to Malaysia & UAE', 'Full GMP-compliant production']
        },
        {
            title: 'Phase III — Regional Expansion',
            items: ['Satellite hubs in 5 divisions', 'Online & retail distribution network', 'R&D unit with university partners', '500+ metric tons annual capacity']
        },
        {
            title: 'Phase IV — Global Export',
            items: ['Export to Europe & North America', 'Branded product line launch', '1,000+ farmer ecosystem', 'Bangladesh\'s #1 mushroom exporter']
        }
    ];

    // Path lengths for progress fill effect
    const pathLengths = [0, 500, 1000, 1500];

    function tryInit() {
        if (typeof gsap === 'undefined' || typeof MotionPathPlugin === 'undefined') {
            setTimeout(tryInit, 200); return;
        }
        gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

        const rocket = document.getElementById('rocket-icon');
        const pathDone = document.getElementById('flight-path-done');
        const detail = document.getElementById('phase-detail');
        const detailInner = document.getElementById('phase-detail-inner');
        const closeBtn = document.getElementById('phase-detail-close');
        const prevBtn = document.getElementById('rocket-prev');
        const nextBtn = document.getElementById('rocket-next');
        const pips = document.querySelectorAll('.rocket-phase-pip');
        const nodes = document.querySelectorAll('.phase-node');
        const labels = document.querySelectorAll('.phase-label');

        if (!rocket) return;

        gsap.set(rocket, { xPercent: -50, yPercent: -50 });

        // Create paused timeline
        const tl = gsap.timeline({ paused: true });
        tl.to(rocket, {
            duration: 1,
            motionPath: {
                path: '#flight-path',
                align: '#flight-path',
                alignOrigin: [0.5, 0.5],
                autoRotate: true,
            },
            ease: 'none',
        });

        const progressValues = [0, 0.33, 0.66, 1];
        let currentPhase = 0;
        let detailOpen = false;

        function showDetail(phaseIndex) {
            const d = phaseData[phaseIndex];
            detailInner.innerHTML = `
                <h4>${d.title}</h4>
                <ul>${d.items.map(i => '<li>' + i + '</li>').join('')}</ul>
            `;
            detail.classList.add('visible');
            detailOpen = true;
        }

        function hideDetail() {
            detail.classList.remove('visible');
            detailOpen = false;
        }

        function goToPhase(index, showPopup) {
            currentPhase = Math.max(0, Math.min(3, index));

            // Animate rocket along path
            gsap.to(tl, { progress: progressValues[currentPhase], duration: 1.4, ease: 'power2.inOut' });

            // Fill completed path
            if (pathDone) {
                pathDone.style.strokeDashoffset = String(1500 - pathLengths[currentPhase]);
            }

            // Update active states on nodes
            nodes.forEach((n, i) => n.classList.toggle('active', i <= currentPhase));

            // Update active state on labels
            labels.forEach((l, i) => {
                l.classList.toggle('active', i === currentPhase);
                l.style.opacity = i <= currentPhase ? '1' : '0.45';
            });

            // Update pip dots
            pips.forEach((p, i) => p.classList.toggle('active', i === currentPhase));

            // Prev / Next buttons
            if (prevBtn) prevBtn.disabled = currentPhase === 0;
            if (nextBtn) nextBtn.disabled = currentPhase === 3;

            // Ignite flame
            if (typeof window.__igniteFire === 'function') window.__igniteFire();

            if (showPopup) showDetail(currentPhase);
            else hideDetail();
        }


        // Initialize at phase 0
        goToPhase(0, false);

        // Phase node clicks
        nodes.forEach((node, i) => {
            node.addEventListener('click', () => {
                if (i === currentPhase && !detailOpen) showDetail(i);
                else goToPhase(i, true);
            });
        });

        // Phase label clicks
        labels.forEach((label, i) => {
            label.addEventListener('click', () => goToPhase(i, true));
        });

        // Pip dot clicks
        pips.forEach((pip, i) => {
            pip.addEventListener('click', () => goToPhase(i, true));
        });

        // Prev / Next
        if (prevBtn) prevBtn.addEventListener('click', () => goToPhase(currentPhase - 1, false));
        if (nextBtn) nextBtn.addEventListener('click', () => goToPhase(currentPhase + 1, false));

        // Close detail
        if (closeBtn) closeBtn.addEventListener('click', hideDetail);

        // Auto-advance to phase 1 when section scrolls into view
        ScrollTrigger.create({
            trigger: '#future',
            start: 'top 60%',
            once: true,
            onEnter: () => { if (currentPhase === 0) goToPhase(1, false); }
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            const section = document.getElementById('future');
            if (!section) return;
            const rect = section.getBoundingClientRect();
            if (rect.top > window.innerHeight || rect.bottom < 0) return;
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goToPhase(currentPhase + 1, false);
            if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') goToPhase(currentPhase - 1, false);
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showDetail(currentPhase); }
            if (e.key === 'Escape') hideDetail();
        });
    }

    tryInit();
})();


/* ===========================================
   14. BACK TO TOP BUTTON
   =========================================== */
(function initBackToTop() {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;
    window.addEventListener('scroll', () => {
        btn.classList.toggle('visible', window.scrollY > 600);
    }, { passive: true });
    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
})();


/* ===========================================
   15. ACTIVE NAV LINK HIGHLIGHTING
   =========================================== */
(function initActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    if (!sections.length || !navLinks.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                navLinks.forEach(link => {
                    const href = link.getAttribute('href');
                    link.classList.toggle('nav-link--active', href === '#' + id);
                });
            }
        });
    }, { threshold: 0.35, rootMargin: '-60px 0px 0px 0px' });

    sections.forEach(s => observer.observe(s));
})();


/* ===========================================
   16. SCROLL PROGRESS BAR
   =========================================== */
(function initScrollProgress() {
    const bar = document.getElementById('scroll-progress');
    if (!bar) return;
    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        const total = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.width = (scrolled / total * 100).toFixed(1) + '%';
    }, { passive: true });
})();


/* ===========================================
   17. HERO MOUSE SPOTLIGHT
   =========================================== */
(function initHeroSpotlight() {
    const hero = document.querySelector('.hero');
    if (!hero || window.innerWidth < 768) return;

    // Inject spotlight div if missing
    let spotlight = document.getElementById('hero-spotlight');
    if (!spotlight) {
        spotlight = document.createElement('div');
        spotlight.id = 'hero-spotlight';
        hero.prepend(spotlight);
    }

    hero.addEventListener('mousemove', (e) => {
        const rect = hero.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width * 100).toFixed(1);
        const y = ((e.clientY - rect.top) / rect.height * 100).toFixed(1);
        hero.style.setProperty('--mx', x + '%');
        hero.style.setProperty('--my', y + '%');
    });
})();


/* ===========================================
   18. STARFIELD CANVAS (Rocket Section)
   =========================================== */
(function initStarfield() {
    const canvas = document.getElementById('starfield-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let stars = [];
    let shootingStars = [];
    let W, H, animId;

    const colors = ['#ffffff', '#e0f7fa', '#ffccbc', '#d1c4e9'];

    function resize() {
        const section = canvas.closest('section') || canvas.parentElement;
        W = canvas.width = section ? section.offsetWidth : window.innerWidth;
        H = canvas.height = section ? section.offsetHeight : window.innerHeight;
        buildStars();
    }

    function buildStars() {
        stars = Array.from({ length: 300 }, () => ({
            x: Math.random() * W,
            y: Math.random() * H,
            r: Math.random() * 1.5 + 0.2, // size
            alpha: Math.random(),
            baseAlpha: Math.random() * 0.5 + 0.3,
            vx: (Math.random() - 0.5) * 0.2, // horizontal drift
            vy: (Math.random() - 0.5) * 0.2, // vertical drift
            twinkleSpeed: Math.random() * 0.02 + 0.005,
            color: colors[Math.floor(Math.random() * colors.length)]
        }));
    }

    function createShootingStar() {
        shootingStars.push({
            x: Math.random() * W,
            y: 0,
            len: Math.random() * 80 + 20,
            speed: Math.random() * 10 + 15,
            angle: Math.PI / 4 + (Math.random() * 0.2 - 0.1), // roughly 45 degrees
            life: 1.0
        });
    }

    function draw() {
        // Clear the canvas fully to maintain the #000000 CSS background beneath
        ctx.clearRect(0, 0, W, H);

        // Draw background stars
        stars.forEach(s => {
            // drifting
            s.x += s.vx;
            s.y += s.vy;
            if (s.x < 0) s.x = W;
            if (s.x > W) s.x = 0;
            if (s.y < 0) s.y = H;
            if (s.y > H) s.y = 0;

            // twinkling
            s.alpha += s.twinkleSpeed;
            let currentAlpha = s.baseAlpha + Math.sin(s.alpha) * 0.3;
            if (currentAlpha < 0.1) currentAlpha = 0.1;

            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            // Apply slight color variation
            ctx.fillStyle = s.color;
            ctx.globalAlpha = currentAlpha;
            ctx.fill();
        });
        ctx.globalAlpha = 1.0;

        // Draw and update shooting stars
        if (Math.random() < 0.01) { // 1% chance per frame to spawn
            createShootingStar();
        }

        for (let i = shootingStars.length - 1; i >= 0; i--) {
            let ss = shootingStars[i];
            ss.x -= Math.cos(ss.angle) * ss.speed;
            ss.y += Math.sin(ss.angle) * ss.speed;
            ss.life -= 0.02;

            ctx.beginPath();
            ctx.moveTo(ss.x, ss.y);
            ctx.lineTo(ss.x + Math.cos(ss.angle) * ss.len, ss.y - Math.sin(ss.angle) * ss.len);

            let grad = ctx.createLinearGradient(ss.x, ss.y, ss.x + Math.cos(ss.angle) * ss.len, ss.y - Math.sin(ss.angle) * ss.len);
            grad.addColorStop(0, `rgba(255, 255, 255, ${ss.life})`);
            grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

            ctx.lineWidth = 1.5;
            ctx.strokeStyle = grad;
            ctx.stroke();

            if (ss.life <= 0 || ss.x < 0 || ss.y > H) {
                shootingStars.splice(i, 1);
            }
        }

        animId = requestAnimationFrame(draw);
    }

    // Only animate when section is visible
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) { resize(); draw(); }
            else { cancelAnimationFrame(animId); }
        });
    }, { threshold: 0.1 });

    const section = canvas.closest('section');
    if (section) observer.observe(section);
    window.addEventListener('resize', resize, { passive: true });
})();


/* ===========================================
   19. ROCKET FLAME (ignites during flight)
   =========================================== */
(function initRocketFlame() {
    // Wrap the original goToPhase so flame fires during animation
    const flame = document.getElementById('rocket-flame');
    if (!flame) return;

    // Observe rocket element for GSAP transforms
    // Light flame for 1.6s whenever rocket moves
    const rocket = document.getElementById('rocket-icon');
    if (!rocket) return;

    let flameTimer;
    const origGoToPhase = window.__rocketGoToPhase;

    // Expose flame trigger globally so rocket module can call it
    window.__igniteFire = function () {
        flame.classList.add('burning');
        clearTimeout(flameTimer);
        flameTimer = setTimeout(() => flame.classList.remove('burning'), 1700);
    };
})();

/* ===========================================
   20. ACTIVE NAV LINK HIGHLIGHTER
   =========================================== */
(function initActiveNavLinks() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links .nav-link');

    function highlightNav() {
        let scrollY = window.scrollY;

        sections.forEach(current => {
            const sectionHeight = current.offsetHeight;
            const sectionTop = current.offsetTop - 120; // Offset for navbar
            const sectionId = current.getAttribute('id');

            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('nav-link--active');
                    if (link.getAttribute('href') === '#' + sectionId) {
                        link.classList.add('nav-link--active');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', highlightNav, { passive: true });
    // Run once on load
    highlightNav();
})();
