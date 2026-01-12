document.addEventListener('DOMContentLoaded', () => {

    // Intersection Observer for Reveal Animations
    const observerOptions = {
        threshold: 0.1, // Trigger when 10% of the element is visible
        rootMargin: "0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.reveal, .reveal-text, .revealable-delay-1, .revealable-delay-2');
    revealElements.forEach(el => observer.observe(el));

    // Optional: Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {

            const targetId = this.getAttribute('href');
            if (targetId === '#' || targetId === '') return;

            // Allow default behavior if navigating to another page/route
            const isHashOnly = targetId.startsWith('#');
            if (!isHashOnly) return;

            e.preventDefault();
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // 2-Click Google Maps
    const loadMapBtn = document.getElementById('load-map-btn');
    if (loadMapBtn) {
        loadMapBtn.addEventListener('click', () => {
            const placeholder = document.getElementById('map-placeholder');
            const target = document.getElementById('map-target');

            // Hide placeholder
            placeholder.style.display = 'none';

            // Show target container
            target.style.display = 'block';

            // Create Iframe dynamically
            const iframe = document.createElement('iframe');
            // Address: Peterstraße 1, Berlin
            iframe.src = "https://maps.google.com/maps?q=Peterstra%C3%9Fe+1%2C+Berlin&t=&z=15&ie=UTF8&iwloc=&output=embed";
            iframe.width = "100%";
            iframe.height = "100%";
            iframe.style.border = "0";
            iframe.allowFullscreen = "";
            iframe.loading = "lazy";

            target.appendChild(iframe);
        });
    }

    // Design Switcher Logic relative to W1/W2/W3...
    const designSelect = document.getElementById('design-select');
    const themeStylesheet = document.getElementById('theme-stylesheet');

    if (designSelect && themeStylesheet) {
        // Load saved theme
        const savedTheme = localStorage.getItem('tw-theme');
        if (savedTheme) {
            themeStylesheet.setAttribute('href', savedTheme);
            designSelect.value = savedTheme;
        }

        // Listen for changes
        designSelect.addEventListener('change', (e) => {
            const newTheme = e.target.value;
            themeStylesheet.setAttribute('href', newTheme);
            localStorage.setItem('tw-theme', newTheme);

            // Auto-scroll to top
            window.scrollTo({ top: 0, behavior: 'instant' });

            // Trigger resize to fix Canvas dimensions if switching to W5
            setTimeout(() => {
                window.dispatchEvent(new Event('resize'));
            }, 100);
        });
    }

    console.log("TW Website Components Initialized");

    // --- W2 Scroll Animation Logic ---
    const scrollSection = document.querySelector('.scroll-showcase');
    const scrollObject = document.querySelector('.scroll-object');
    const scrollText = document.querySelector('.scroll-text');

    if (scrollSection && scrollObject) {
        window.addEventListener('scroll', () => {
            // Check if section is visible (display: none check)
            if (getComputedStyle(scrollSection).display === 'none') return;

            const rect = scrollSection.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const sectionHeight = scrollSection.offsetHeight;

            // Calculate progress based on how far we've scrolled into the container
            // rect.top goes from viewportHeight (entering) to -sectionHeight (leaving)

            // We want animation to be active mainly when the sticky part is LOCKED
            // The sticky part locks when top <= 0.

            // Let's normalize progress: 
            // 0 = section top touches viewport top (Sticky starts)
            // 1 = section bottom touches viewport bottom (Sticky ends approx)

            // top is 0 at start. top is -(sectionHeight - viewportHeight) at end.
            const travelDistance = sectionHeight - viewportHeight;
            const currentScroll = -rect.top;

            let rawProgress = currentScroll / travelDistance;

            // Clamp raw progress
            rawProgress = Math.max(0, Math.min(rawProgress, 1));

            // Make animation finish earlier (at 85% of scroll), leaving 15% as "pause"
            // Map 0 -> 0.85 to 0 -> 1
            const animationEnd = 0.85;
            let animProgress = rawProgress / animationEnd;
            animProgress = Math.min(animProgress, 1); // Cap at 1

            // Apply Effects based on animProgress
            // Scale: 0.5 -> 2.5 (Dramatic growth)
            const scale = 0.5 + (animProgress * 2.0);

            // Rotate: 0 -> 90deg
            const rotate = animProgress * 90;

            // Opacity/Blur filter?
            // Let's keep it simple: Scale & Rotate
            scrollObject.style.transform = `scale(${scale}) rotate(${rotate}deg)`;

            // Text Fade In Logic (at 60% of animation progress)
            if (animProgress > 0.6) {
                if (scrollText) {
                    scrollText.style.opacity = '1';
                    scrollText.style.transform = 'translateY(0)';
                }
            } else {
                if (scrollText) {
                    scrollText.style.opacity = '0';
                    scrollText.style.transform = 'translateY(20px)';
                }
            }
        });
    }
});

// --- W5 High-End Logic ---
const heroW5 = document.querySelector('.hero-w5');
const cube = document.getElementById('w5-cube');
const cursorDot = document.querySelector('[data-cursor-dot]');
const cursorOutline = document.querySelector('[data-cursor-outline]');

// Only run if W5 hero exists (it always exists in HTML but might be hidden)
// We check visibility/display to save performance
if (heroW5 && cube) {

    // Custom Cursor Logic
    window.addEventListener('mousemove', function (e) {
        // Only active if W5 is the current design (simple check: is heroW5 visible?)
        // Note: getComputedStyle is expensive in loop, maybe check once on scroll/resize or global state
        // For now, let's just update positions always, but toggle visibility via CSS.

        const posX = e.clientX;
        const posY = e.clientY;

        // Dot follows immediately
        if (cursorDot) {
            cursorDot.style.left = `${posX}px`;
            cursorDot.style.top = `${posY}px`;
        }

        // Outline follows with delay
        if (cursorOutline) {
            cursorOutline.animate({
                left: `${posX}px`,
                top: `${posY}px`
            }, { duration: 500, fill: "forwards" });
        }
    });

    // Add hover effect for links/buttons
    document.querySelectorAll('a, button, .bento-card').forEach(el => {
        el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
    });

    // 3D Scroll Logic for W5
    window.addEventListener('scroll', () => {
        // Only if w5 is visible
        if (getComputedStyle(heroW5).display === 'none') return;

        const scrollY = window.scrollY;
        const maxScroll = window.innerHeight * 1.5; // Rotate fully over 1.5 viewport heights

        // Rotation calculations
        // Rotate X and Y based on scroll
        const rotationX = (scrollY / maxScroll) * 360;
        const rotationY = (scrollY / maxScroll) * 360;

        // Also move it slightly parallax
        const translateY = scrollY * 0.5;

        // Apply transform
        // maintain initial center position using translateZ if needed or just rotate
        // The cube css has initial transforms on faces, parent has transform-style: preserve-3d
        // We rotate the PARENT container #w5-cube

        cube.style.transform = `rotateX(${rotationX}deg) rotateY(${rotationY}deg)`;

        // Fade out if scrolling past the hero section
        // Hero height is approx 200vh now (per css update).
        // Let's fade out as we exit the hero.
        const heroRect = heroW5.getBoundingClientRect();
        // heroRect.bottom goes from 2*viewport (start) to 0 (end)
        if (heroRect.bottom < window.innerHeight) {
            const fadeOutProgress = 1 - (heroRect.bottom / window.innerHeight);
            // 0 -> 1 as we leave
            // Opacity: 1 -> 0

            // Ideally we target the container .w5-3d-scene
            const scene = document.querySelector('.w5-3d-scene');
            if (scene) {
                scene.style.opacity = Math.max(0, 1 - fadeOutProgress * 2); // fade fast
            }
        } else {
            const scene = document.querySelector('.w5-3d-scene');
            if (scene) scene.style.opacity = '1';
        }
    });

    // Mouse Move Parallax on Cube (when not scrolling) for extra "High End" feel
    window.addEventListener('mousemove', (e) => {
        if (getComputedStyle(heroW5).display === 'none') return;

        const x = (window.innerWidth / 2 - e.clientX) / 50;
        const y = (window.innerHeight / 2 - e.clientY) / 50;

        const orbs = document.querySelectorAll('.w5-orb');
        orbs.forEach((orb, index) => {
            const speed = index + 1;
            const x = (window.innerWidth - e.pageX * speed) / 100;
            const y = (window.innerHeight - e.pageY * speed) / 100;
            orb.style.transform = `translateX(${x}px) translateY(${y}px)`;
        });
    });

    // --- W5 About Effects ---

    // 1. 3D Tilt Cards
    const cards = document.querySelectorAll('.tilt-card');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Calculate center
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            // Rotation values (-15 to 15 deg)
            const rotateX = ((y - centerY) / centerY) * -10;
            const rotateY = ((x - centerX) / centerX) * 10;

            // Set transform
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

            // Move Glare properly - follow mouse
            const glare = card.querySelector('.tilt-glare');
            if (glare) {
                // Adjust glare position
                glare.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.15) 0%, transparent 60%)`;
                glare.style.opacity = '1';
            }
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg)`;
            const glare = card.querySelector('.tilt-glare');
            if (glare) glare.style.opacity = '0';
        });
    });

    // 2. Scramble Text Effect
    class TextScramble {
        constructor(el) {
            this.el = el;
            this.chars = '!<>-_\\/[]{}—=+*^?#________';
            this.update = this.update.bind(this);
        }
        setText(newText) {
            const oldText = this.el.innerText;
            const length = Math.max(oldText.length, newText.length);
            const promise = new Promise((resolve) => this.resolve = resolve);
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
            let output = '';
            let complete = 0;
            for (let i = 0, n = this.queue.length; i < n; i++) {
                let { from, to, start, end, char } = this.queue[i];
                if (this.frame >= end) {
                    complete++;
                    output += to;
                } else if (this.frame >= start) {
                    if (!char || Math.random() < 0.28) {
                        char = this.randomChar();
                        this.queue[i].char = char;
                    }
                    output += `<span class="dud">${char}</span>`;
                } else {
                    output += from;
                }
            }
            this.el.innerHTML = output;
            if (complete === this.queue.length) {
                this.resolve();
            } else {
                this.frameRequest = requestAnimationFrame(this.update);
                this.frame++;
            }
        }
        randomChar() {
            return this.chars[Math.floor(Math.random() * this.chars.length)];
        }
    }

    // Initialize Scramble on Observe
    const scrambleEls = document.querySelectorAll('.scramble-text');
    scrambleEls.forEach(el => {
        const fx = new TextScramble(el);
        const finalText = el.getAttribute('data-text') || el.innerText;

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    fx.setText(finalText);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        observer.observe(el);
    });

    // 3. Particle System for Services
    const canvas = document.getElementById('w5-particles');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        const particleCount = 60;
        let animationId;

        function resizeCanvas() {
            // Set internal resolution to match display size (CSS pixels)
            const rect = canvas.getBoundingClientRect();

            // If section is hidden (display: none), rect will be 0.
            // Fallback to window size to ensure particles have somewhere to live initially.
            if (rect.width === 0 || rect.height === 0) {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            } else {
                canvas.width = rect.width;
                canvas.height = rect.height;
            }
        }
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.vx = (Math.random() - 0.5) * 0.5; // low speed
                this.vy = (Math.random() - 0.5) * 0.5;
                this.size = Math.random() * 2 + 1;
            }
            update() {
                this.x += this.vx;
                this.y += this.vy;

                // Bounce
                if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
                if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
            }
            draw() {
                ctx.fillStyle = 'rgba(139, 92, 246, 0.5)';
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Init Particles
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        // Mouse Interaction
        let mouse = { x: null, y: null };
        window.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            if (e.clientX >= rect.left && e.clientX <= rect.right &&
                e.clientY >= rect.top && e.clientY <= rect.bottom) {
                // Calculate scaling factors in case canvas resolution differs from CSS size
                const scaleX = canvas.width / rect.width;
                const scaleY = canvas.height / rect.height;

                mouse.x = (e.clientX - rect.left) * scaleX;
                mouse.y = (e.clientY - rect.top) * scaleY;
            } else {
                mouse.x = null;
                mouse.y = null;
            }
        });

        window.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });

        function animateParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Loop particles
            particles.forEach((p, index) => {
                p.update();
                p.draw();

                // Connect to mouse
                if (mouse.x != null) {
                    const dx = p.x - mouse.x;
                    const dy = p.y - mouse.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 300) { // Increased connection distance
                        ctx.strokeStyle = `rgba(139, 92, 246, ${1 - distance / 300})`;
                        ctx.lineWidth = 2; // Stronger lines
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(mouse.x, mouse.y);
                        ctx.stroke();

                        // Push slightly away from mouse
                        if (distance < 150) {
                            p.vx -= dx / distance * 0.1;
                            p.vy -= dy / distance * 0.1;
                        }
                    }
                }

                // Connect to other particles
                for (let j = index; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < 120) {
                        const opacity = 1 - distance / 120;
                        ctx.strokeStyle = `rgba(139, 92, 246, ${opacity * 0.5})`; // Visible connections
                        ctx.lineWidth = 0.8;
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                }
            });

            animationId = requestAnimationFrame(animateParticles);
        }

        animateParticles();
    }

}
