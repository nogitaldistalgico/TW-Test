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
        const savedTheme = localStorage.getItem('tw-theme') || 'w1.css';
        if (savedTheme) {
            themeStylesheet.setAttribute('href', savedTheme);
            designSelect.value = savedTheme;
        }

        // Helper to update control visibility
        const updateControls = (theme) => {
            const w2Controls = document.getElementById('w2-controls');
            const w3Controls = document.getElementById('w3-controls');

            if (w2Controls) w2Controls.style.display = (theme === 'w2.css') ? 'flex' : 'none';
            if (w3Controls) w3Controls.style.display = (theme === 'w3.css') ? 'flex' : 'none';

            // W2 Background Logic: Reset or restore?
            // For now, keep it simple.
        };

        // Initial update
        updateControls(savedTheme);

        // Listen for changes
        designSelect.addEventListener('change', (e) => {
            const newTheme = e.target.value;
            themeStylesheet.setAttribute('href', newTheme);
            localStorage.setItem('tw-theme', newTheme);

            updateControls(newTheme);

            // Auto-scroll to top
            window.scrollTo({ top: 0, behavior: 'instant' });

            // Trigger resize to fix Canvas dimensions if switching to W5
            setTimeout(() => {
                window.dispatchEvent(new Event('resize'));
            }, 100);
        });

        // W2/W3 Header Controls Logic
        const w2BgToggle = document.getElementById('w2-bg-toggle');
        const w2DarkMode = document.getElementById('w2-dark-mode');
        const w3LightMode = document.getElementById('w3-light-mode');

        // W2 Background Toggle
        if (w2BgToggle) {
            const bgClasses = ['', 'hero-bg-art', 'hero-bg-photo', 'hero-bg-cafe', 'hero-bg-craft', 'hero-bg-salon'];
            let currentBgIndex = 0;
            w2BgToggle.addEventListener('click', () => {
                const hero = document.querySelector('.hero');
                if (hero) {
                    // Remove existing
                    hero.classList.remove('hero-bg-art', 'hero-bg-photo', 'hero-bg-cafe', 'hero-bg-craft', 'hero-bg-salon');

                    // Cycle
                    currentBgIndex = (currentBgIndex + 1) % bgClasses.length;
                    const newClass = bgClasses[currentBgIndex];

                    if (newClass) hero.classList.add(newClass);
                }
            });
        }

        // W2 -> W3 (Fake Dark Mode)
        if (w2DarkMode) {
            w2DarkMode.addEventListener('click', () => {
                themeStylesheet.setAttribute('href', 'w3.css');
                designSelect.value = 'w3.css'; // This option technically doesn't exist in dropdown now, but value setting still works? No, if option missing, value won't stick in UI.
                // We should select 'w2.css' visually or just nothing?
                // Actually, if we remove W3 from dropdown, we can't select it there.
                // But the stylesheet switches.
                localStorage.setItem('tw-theme', 'w3.css');
                updateControls('w3.css');
            });
        }

        // W3 -> W2 (Fake Light Mode)
        if (w3LightMode) {
            w3LightMode.addEventListener('click', () => {
                themeStylesheet.setAttribute('href', 'w2.css');
                designSelect.value = 'w2.css';
                localStorage.setItem('tw-theme', 'w2.css');
                updateControls('w2.css');
            });
        }
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
    // --- W2 Scroll Animation Logic ---

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
        // Check if device supports hover/fine pointer
        const isTouchDevice = window.matchMedia("(hover: none) and (pointer: coarse)").matches;

        const cards = document.querySelectorAll('.tilt-card');
        cards.forEach(card => {
            // Skip mouse interaction on touch devices to save performance and avoid conflicts
            if (isTouchDevice) return;

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
            const particleCount = 25; // Much fewer particles
            let animationId;

            let mouse = { x: null, y: null, radius: 150 };
            let isTouching = false;
            let touchIntensity = 0; // 0.0 to 1.0

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
                    this.vx = (Math.random() - 0.5) * 0.2; // Slow ambient movement
                    this.vy = (Math.random() - 0.5) * 0.2;
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

            // Touch Interaction
            // Touch Events with Smooth Fade
            window.addEventListener('touchstart', (e) => {
                const rect = canvas.getBoundingClientRect();
                const touch = e.touches[0];
                if (touch.clientX >= rect.left && touch.clientX <= rect.right &&
                    touch.clientY >= rect.top && touch.clientY <= rect.bottom) {

                    const scaleX = canvas.width / rect.width;
                    const scaleY = canvas.height / rect.height;

                    mouse.x = (touch.clientX - rect.left) * scaleX;
                    mouse.y = (touch.clientY - rect.top) * scaleY;
                    isTouching = true;
                }
            }, { passive: true });

            window.addEventListener('touchmove', (e) => {
                const rect = canvas.getBoundingClientRect();
                const touch = e.touches[0];
                if (touch.clientX >= rect.left && touch.clientX <= rect.right &&
                    touch.clientY >= rect.top && touch.clientY <= rect.bottom) {

                    const scaleX = canvas.width / rect.width;
                    const scaleY = canvas.height / rect.height;

                    mouse.x = (touch.clientX - rect.left) * scaleX;
                    mouse.y = (touch.clientY - rect.top) * scaleY;
                    isTouching = true;
                } else {
                    // Don't clear immediately, let loop handle fade out
                    isTouching = false;
                }
            }, { passive: true });

            window.addEventListener('touchend', () => {
                // Don't clear immediately, let loop handle fade out
                isTouching = false;
            });

            function animateParticles() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                // Loop particles
                particles.forEach((p, index) => {
                    p.update();
                    p.draw();

                    // Connect to mouse (with smooth fade on touch)
                    if (mouse.x != null) {
                        const dx = p.x - mouse.x;
                        const dy = p.y - mouse.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);

                        if (distance < 300) {
                            // Smoothly interpolate touch intensity
                            if (isTouching) {
                                touchIntensity += 0.05;
                                if (touchIntensity > 1) touchIntensity = 1;
                            } else {
                                touchIntensity -= 0.02; // Fade out slower
                                if (touchIntensity < 0) {
                                    touchIntensity = 0;
                                    // Only reset position once fully faded to avoid jumps
                                    // But keeping position allows re-fading at same spot if touched quickly
                                    // For now, we just stop drawing.
                                }
                            }

                            if (touchIntensity > 0) {
                                const opacity = (1 - distance / 300) * touchIntensity;
                                ctx.strokeStyle = `rgba(139, 92, 246, ${opacity})`;
                                ctx.lineWidth = 2 * touchIntensity;
                                ctx.beginPath();
                                ctx.moveTo(p.x, p.y);
                                ctx.lineTo(mouse.x, mouse.y);
                                ctx.stroke();
                            }

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

        // --- Mobile Menu Logic ---
        const burgerBtns = document.querySelectorAll('.burger-btn');
        const mobileMenuOverlay = document.querySelector('.mobile-menu-overlay');
        const mobileLinks = document.querySelectorAll('.mobile-link');

        if (burgerBtns.length > 0 && mobileMenuOverlay) {
            burgerBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent immediate close
                    const isActive = mobileMenuOverlay.classList.contains('active');

                    if (isActive) {
                        mobileMenuOverlay.classList.remove('active');
                        btn.classList.remove('active');
                        document.body.style.overflow = '';
                    } else {
                        mobileMenuOverlay.classList.add('active');
                        btn.classList.add('active');
                        document.body.style.overflow = 'hidden';
                    }
                });
            });

            // Close when clicking a link
            mobileLinks.forEach(link => {
                link.addEventListener('click', () => {
                    mobileMenuOverlay.classList.remove('active');
                    burgerBtns.forEach(btn => btn.classList.remove('active'));
                    document.body.style.overflow = '';
                });
            });

            // Close when clicking outside (optional, but good for overlays)
            mobileMenuOverlay.addEventListener('click', (e) => {
                if (e.target === mobileMenuOverlay) {
                    mobileMenuOverlay.classList.remove('active');
                    burgerBtns.forEach(btn => btn.classList.remove('active'));
                    document.body.style.overflow = '';
                }
            });
        }

        // --- Mobile Controls Logic ---
        const mobileBgToggle = document.getElementById('mobile-bg-toggle');
        const mobileModeToggle = document.getElementById('mobile-mode-toggle');

        if (mobileBgToggle) {
            mobileBgToggle.addEventListener('click', () => {
                // W2 Background Logic (Cycling classes)
                // Assuming classes are w2-bg-1, w2-bg-2, w2-bg-3 (based on previous context)
                // Or simply trigger the desktop button click if it exists!
                const desktopBtn = document.getElementById('w2-background-toggle');
                if (desktopBtn) desktopBtn.click();
            });
        }

        if (mobileModeToggle) {
            mobileModeToggle.addEventListener('click', () => {
                // Trigger W2/W3 switch logic from desktop button
                // This swaps between W2 (Light) and W3 (Dark)
                const w2DarkBtn = document.getElementById('w2-dark-mode');
                const w3LightBtn = document.getElementById('w3-light-mode');

                // Check which is currently visible or active
                if (document.body.classList.contains('theme-w2') && w2DarkBtn) {
                    w2DarkBtn.click();
                } else if (document.body.classList.contains('theme-w3') && w3LightBtn) {
                    w3LightBtn.click();
                }
            });
        }

        // Ensure visibility of these buttons based on theme
        function updateMobileControlsVisibility() {
            const isW2 = document.body.classList.contains('theme-w2');
            const isW3 = document.body.classList.contains('theme-w3');

            // Force visibility if match
            if (mobileBgToggle) {
                mobileBgToggle.style.display = isW2 ? 'block' : 'none';
                if (isW2) mobileBgToggle.style.setProperty('display', 'block', 'important');
            }
            if (mobileModeToggle) {
                mobileModeToggle.style.display = (isW2 || isW3) ? 'block' : 'none';
                if (isW2 || isW3) mobileModeToggle.style.setProperty('display', 'block', 'important');
            }
        }

        // Hook into existing theme switch observers or just interval check?
        // Better: Override/extend the designSelect change listener if possible.
        // For now, let's run it on click of any nav link or design select
        const designSelect = document.getElementById('design-select');
        if (designSelect) {
            designSelect.addEventListener('change', () => setTimeout(updateMobileControlsVisibility, 100));
        }
        // Also run on init
        updateMobileControlsVisibility();

        // Also hook into desktop buttons to sync state if needed
        const desktopModeBtns = document.querySelectorAll('#w2-dark-mode, #w3-light-mode');
        desktopModeBtns.forEach(btn => {
            btn.addEventListener('click', () => setTimeout(updateMobileControlsVisibility, 100));
        });

        // --- W2 Hero Button Logic (Phase 14) ---
        const w2HeroBgBtn = document.getElementById('w2-hero-bg-trigger');
        const w2HeroThemeBtn = document.getElementById('w2-hero-theme-trigger');

        if (w2HeroBgBtn) {
            w2HeroBgBtn.addEventListener('click', (e) => {
                e.preventDefault();
                // Trigger the background switch logic
                const bgToggle = document.getElementById('w2-bg-toggle');
                if (bgToggle) bgToggle.click();
            });
        }

        if (w2HeroThemeBtn) {
            w2HeroThemeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                // Switch to W3 (Dark Mode)
                const darkModeBtn = document.getElementById('w2-dark-mode');
                if (darkModeBtn) darkModeBtn.click();
            });
        }

    }
});
