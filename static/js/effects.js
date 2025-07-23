// Advanced Sophisticated Effects for Django Portfolio
// Compatible with Tailwind CSS and DaisyUI
// Enhanced with cutting-edge visual effects

// 1. Smooth Scrolling for Internal Links
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// 2. Fade-in Animation with Intersection Observer
function initFadeInAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('animate-fade-in');
                    entry.target.classList.remove('opacity-0');
                }, index * 100); // Staggered delay
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe elements with fade-in class
    document.querySelectorAll('.fade-in-element').forEach(el => {
        el.classList.add('opacity-0');
        observer.observe(el);
    });
}

// 3. Parallax Effect for Backgrounds
function initParallaxEffect() {
    const parallaxElements = document.querySelectorAll('.parallax-bg');
    
    function updateParallax() {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        
        parallaxElements.forEach(element => {
            element.style.transform = `translateY(${rate}px)`;
        });
    }
    
    // Throttle scroll events for performance
    let ticking = false;
    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(updateParallax);
            ticking = true;
            setTimeout(() => { ticking = false; }, 16);
        }
    }
    
    window.addEventListener('scroll', requestTick);
}

// 4. Enhanced Interactive Background Particles (tsParticles)
function initParticles() {
    // Check if tsParticles is loaded
    if (typeof tsParticles !== 'undefined') {
        tsParticles.load("particles-js", {
            particles: {
                number: {
                    value: 80,
                    density: {
                        enable: true,
                        value_area: 800
                    }
                },
                color: {
                    value: ["#00ff00", "#ff0000", "#cfe3e3", "#ffffff"]
                },
                shape: {
                    type: ["circle", "triangle", "polygon"],
                    polygon: {
                        nb_sides: 6
                    }
                },
                opacity: {
                    value: 0.4,
                    random: true,
                    anim: {
                        enable: true,
                        speed: 1,
                        opacity_min: 0.1,
                        sync: false
                    }
                },
                size: {
                    value: 4,
                    random: true,
                    anim: {
                        enable: true,
                        speed: 2,
                        size_min: 0.5,
                        sync: false
                    }
                },
                line_linked: {
                    enable: true,
                    distance: 200,
                    color: "#00ff00",
                    opacity: 0.3,
                    width: 1.5
                },
                move: {
                    enable: true,
                    speed: 3,
                    direction: "none",
                    random: true,
                    straight: false,
                    out_mode: "bounce",
                    bounce: true,
                    attract: {
                        enable: true,
                        rotateX: 600,
                        rotateY: 1200
                    }
                }
            },
            interactivity: {
                detect_on: "canvas",
                events: {
                    onhover: {
                        enable: true,
                        mode: ["repulse", "bubble"]
                    },
                    onclick: {
                        enable: true,
                        mode: ["push", "remove"]
                    },
                    resize: true
                },
                modes: {
                    repulse: {
                        distance: 150,
                        duration: 0.4
                    },
                    bubble: {
                        distance: 200,
                        size: 8,
                        duration: 2,
                        opacity: 0.8,
                        speed: 3
                    },
                    push: {
                        particles_nb: 6
                    },
                    remove: {
                        particles_nb: 2
                    }
                }
            },
            retina_detect: true
        });
    }
}

// 5. Enhanced Vanilla Tilt Effect for Cards
function initTiltEffect() {
    // Check if VanillaTilt is loaded
    if (typeof VanillaTilt !== 'undefined') {
        VanillaTilt.init(document.querySelectorAll(".tilt-card"), {
            max: 25,
            speed: 300,
            glare: true,
            "max-glare": 0.4,
            scale: 1.08,
            perspective: 1000,
            transition: true,
            "glare-prerender": false,
            "full-page-listening": false,
            "mouse-event-element": null,
            reset: true,
            "reset-to-start": true,
            easing: "cubic-bezier(.03,.98,.52,.99)"
        });
    }
}

// 6. Animated Gradients
function initAnimatedGradients() {
    const gradientElements = document.querySelectorAll('.animated-gradient');
    
    gradientElements.forEach(element => {
        element.addEventListener('mouseenter', function() {
            this.style.backgroundSize = '200% 200%';
            this.style.animation = 'gradientShift 3s ease infinite';
        });
        
        element.addEventListener('mouseleave', function() {
            this.style.animation = 'none';
            this.style.backgroundSize = '100% 100%';
        });
    });
}

// 7. Typing Animation Effect
function initTypingAnimation() {
    const typingElements = document.querySelectorAll('.typing-effect');
    
    typingElements.forEach(element => {
        const text = element.textContent;
        element.textContent = '';
        element.style.borderRight = '2px solid';
        element.style.animation = 'blink 1s infinite';
        
        let i = 0;
        const typeWriter = () => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 100);
            } else {
                element.style.borderRight = 'none';
            }
        };
        
        // Start typing when element comes into view
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setTimeout(typeWriter, 500);
                    observer.unobserve(entry.target);
                }
            });
        });
        
        observer.observe(element);
    });
}

// 8. Floating Elements Animation
function initFloatingElements() {
    const floatingElements = document.querySelectorAll('.floating-element');
    
    floatingElements.forEach((element, index) => {
        const delay = index * 0.5;
        const duration = 3 + Math.random() * 2;
        const amplitude = 10 + Math.random() * 20;
        
        element.style.animation = `float ${duration}s ease-in-out ${delay}s infinite`;
        element.style.setProperty('--float-amplitude', `${amplitude}px`);
    });
}

// 9. Magnetic Cursor Effect
function initMagneticCursor() {
    const magneticElements = document.querySelectorAll('.magnetic');
    
    magneticElements.forEach(element => {
        element.addEventListener('mousemove', (e) => {
            const rect = element.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            const strength = 0.3;
            const translateX = x * strength;
            const translateY = y * strength;
            
            element.style.transform = `translate(${translateX}px, ${translateY}px) scale(1.05)`;
        });
        
        element.addEventListener('mouseleave', () => {
            element.style.transform = 'translate(0px, 0px) scale(1)';
        });
    });
}

// 10. Scroll-Triggered Animations
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.scroll-animate');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const animationType = entry.target.dataset.animation || 'fadeInUp';
                entry.target.classList.add(`animate-${animationType}`);
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    animatedElements.forEach(el => {
        el.classList.add('opacity-0');
        observer.observe(el);
    });
}

// 11. Morphing Shapes
function initMorphingShapes() {
    const morphElements = document.querySelectorAll('.morph-shape');
    
    morphElements.forEach(element => {
        let morphState = 0;
        const morphStates = [
            'polygon(50% 0%, 0% 100%, 100% 100%)',
            'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
            'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
            'polygon(50% 0%, 0% 100%, 100% 100%)'
        ];
        
        setInterval(() => {
            morphState = (morphState + 1) % morphStates.length;
            element.style.clipPath = morphStates[morphState];
        }, 3000);
    });
}

// 12. Performance Monitor
function performanceTest() {
    const startTime = performance.now();
    
    // Test animation performance
    let frameCount = 0;
    function countFrames() {
        frameCount++;
        if (frameCount < 60) {
            requestAnimationFrame(countFrames);
        } else {
            const endTime = performance.now();
            const fps = 1000 / ((endTime - startTime) / 60);
            console.log(`Animation Performance: ${fps.toFixed(2)} FPS`);
            
            if (fps < 30) {
                console.warn('Low FPS detected. Consider reducing effects.');
                // Optionally disable heavy effects
                document.body.classList.add('reduced-motion');
            }
        }
    }
    requestAnimationFrame(countFrames);
}

// 13. Water Ripple Effect with Canvas
function initWaterRippleEffect() {
    const canvas = document.getElementById('water-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const ripples = [];
    
    // Set canvas size
    function resizeCanvas() {
        const container = canvas.parentElement;
        canvas.width = container.offsetWidth;
        canvas.height = container.offsetHeight;
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Ripple class
    class Ripple {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.radius = 0;
            this.maxRadius = 150;
            this.opacity = 1;
            this.speed = 2;
        }
        
        update() {
            this.radius += this.speed;
            this.opacity = 1 - (this.radius / this.maxRadius);
            
            if (this.radius >= this.maxRadius) {
                return false; // Remove ripple
            }
            return true; // Keep ripple
        }
        
        draw() {
            ctx.save();
            ctx.globalAlpha = this.opacity * 0.3;
            ctx.strokeStyle = 'rgba(146, 164, 166, 0.8)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.stroke();
            
            // Inner ripple
            ctx.globalAlpha = this.opacity * 0.1;
            ctx.fillStyle = 'rgba(146, 164, 166, 0.3)';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius * 0.7, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }
    
    // Add ripple on mouse move
    const aboutSection = document.getElementById('about');
    if (aboutSection) {
        aboutSection.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Throttle ripple creation
            if (ripples.length < 5) {
                ripples.push(new Ripple(x, y));
            }
        });
    }
    
    // Animation loop
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Update and draw ripples
        for (let i = ripples.length - 1; i >= 0; i--) {
            const ripple = ripples[i];
            if (!ripple.update()) {
                ripples.splice(i, 1);
            } else {
                ripple.draw();
            }
        }
        
        requestAnimationFrame(animate);
    }
    
    animate();
}

// Initialize all effects when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (!prefersReducedMotion) {
        initSmoothScrolling();
        initFadeInAnimations();
        initParallaxEffect();
        initAnimatedGradients();
        
        // Initialize new advanced effects
        initTypingAnimation();
        initFloatingElements();
        initMagneticCursor();
        initScrollAnimations();
        initMorphingShapes();
        initWaterRippleEffect();
        
        // Initialize external libraries after a short delay
        setTimeout(() => {
            initParticles();
            initTiltEffect();
        }, 100);
        
        // Run performance test
        setTimeout(performanceTest, 1000);
    } else {
        // Fallback for users who prefer reduced motion
        initSmoothScrolling();
        console.log('Reduced motion mode: Heavy animations disabled');
    }
});

// Export functions for manual initialization if needed
window.PortfolioEffects = {
    initSmoothScrolling,
    initFadeInAnimations,
    initParallaxEffect,
    initParticles,
    initTiltEffect,
    initAnimatedGradients,
    initTypingAnimation,
    initFloatingElements,
    initMagneticCursor,
    initScrollAnimations,
    initMorphingShapes,
    initWaterRippleEffect,
    performanceTest
};