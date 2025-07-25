// SEO and Performance Optimizations

// Critical Web Vitals monitoring
function measureWebVitals() {
    // Largest Contentful Paint (LCP)
    new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
            console.log('LCP:', entry.startTime);
            // Send to analytics if needed
        }
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay (FID)
    new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
            console.log('FID:', entry.processingStart - entry.startTime);
            // Send to analytics if needed
        }
    }).observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift (CLS)
    let clsValue = 0;
    new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
            if (!entry.hadRecentInput) {
                clsValue += entry.value;
            }
        }
        console.log('CLS:', clsValue);
    }).observe({ entryTypes: ['layout-shift'] });
}

// Lazy loading for images
function initLazyLoading() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    img.classList.add('loaded');
                    imageObserver.unobserve(img);
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
}

// Preload critical resources
function preloadCriticalResources() {
    const criticalResources = [
        '/static/css/seo-optimizations.css',
        '/static/js/seo-performance.js',
        '/static/images/profile.jpg'
    ];

    criticalResources.forEach(resource => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = resource;
        link.as = resource.endsWith('.css') ? 'style' : 'image';
        document.head.appendChild(link);
    });
}

// Service Worker registration for caching
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/static/js/sw.js')
                .then(registration => {
                    console.log('SW registered: ', registration);
                })
                .catch(registrationError => {
                    console.log('SW registration failed: ', registrationError);
                });
        });
    }
}

// Optimize font loading
function optimizeFontLoading() {
    // Use font-display: swap for better performance
    const fontLink = document.createElement('link');
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap';
    fontLink.rel = 'stylesheet';
    document.head.appendChild(fontLink);
}

// Reduce layout shifts
function preventLayoutShifts() {
    // Set explicit dimensions for images
    document.querySelectorAll('img').forEach(img => {
        if (!img.width && !img.height) {
            img.style.aspectRatio = '16/9';
        }
    });

    // Reserve space for dynamic content
    document.querySelectorAll('.dynamic-content').forEach(element => {
        element.style.minHeight = '200px';
    });
}

// Optimize scroll performance
function optimizeScrollPerformance() {
    let ticking = false;

    function updateScrollPosition() {
        // Throttle scroll events
        if (!ticking) {
            requestAnimationFrame(() => {
                // Handle scroll-based animations here
                ticking = false;
            });
            ticking = true;
        }
    }

    window.addEventListener('scroll', updateScrollPosition, { passive: true });
}

// Prefetch next page resources
function prefetchNextPage() {
    const links = document.querySelectorAll('a[href^="/"]');
    
    links.forEach(link => {
        link.addEventListener('mouseenter', () => {
            const prefetchLink = document.createElement('link');
            prefetchLink.rel = 'prefetch';
            prefetchLink.href = link.href;
            document.head.appendChild(prefetchLink);
        }, { once: true });
    });
}

// Optimize third-party scripts
function optimizeThirdPartyScripts() {
    // Initialize Facebook Pixel stub to prevent errors
    window.fbq = window.fbq || function() {
        (window.fbq.q = window.fbq.q || []).push(arguments);
    };
    window._fbq = window._fbq || window.fbq;
    window.fbq.push = window.fbq;
    window.fbq.loaded = true;
    window.fbq.version = '2.0';
    window.fbq.queue = [];

    // Delay non-critical scripts
    const delayedScripts = [
        'https://www.googletagmanager.com/gtag/js',
        'https://connect.facebook.net/en_US/fbevents.js'
    ];

    // Load after user interaction or page load
    const loadDelayedScripts = () => {
        delayedScripts.forEach(src => {
            const script = document.createElement('script');
            script.src = src;
            script.async = true;
            document.head.appendChild(script);
        });
    };

    // Load on first user interaction
    ['mousedown', 'touchstart', 'keydown', 'scroll'].forEach(event => {
        window.addEventListener(event, loadDelayedScripts, { once: true, passive: true });
    });

    // Fallback: load after 5 seconds
    setTimeout(loadDelayedScripts, 5000);
}

// Resource hints for better performance
function addResourceHints() {
    const hints = [
        { rel: 'dns-prefetch', href: '//fonts.googleapis.com' },
        { rel: 'dns-prefetch', href: '//cdn.jsdelivr.net' },
        { rel: 'dns-prefetch', href: '//cdnjs.cloudflare.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: true }
    ];

    hints.forEach(hint => {
        const link = document.createElement('link');
        Object.assign(link, hint);
        document.head.appendChild(link);
    });
}

// Monitor and report performance metrics
function reportPerformanceMetrics() {
    window.addEventListener('load', () => {
        setTimeout(() => {
            const perfData = performance.getEntriesByType('navigation')[0];
            const metrics = {
                dns: perfData.domainLookupEnd - perfData.domainLookupStart,
                tcp: perfData.connectEnd - perfData.connectStart,
                ttfb: perfData.responseStart - perfData.requestStart,
                download: perfData.responseEnd - perfData.responseStart,
                dom: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
                load: perfData.loadEventEnd - perfData.loadEventStart
            };

            console.log('Performance Metrics:', metrics);
            // Send to analytics service if needed
        }, 0);
    });
}

// Initialize all optimizations
function initSEOOptimizations() {
    // Check if browser supports modern features
    if ('IntersectionObserver' in window && 'requestAnimationFrame' in window) {
        measureWebVitals();
        initLazyLoading();
        preloadCriticalResources();
        optimizeFontLoading();
        preventLayoutShifts();
        optimizeScrollPerformance();
        prefetchNextPage();
        optimizeThirdPartyScripts();
        addResourceHints();
        reportPerformanceMetrics();
        
        // Register service worker only in production
        if (location.protocol === 'https:') {
            registerServiceWorker();
        }
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSEOOptimizations);
} else {
    initSEOOptimizations();
}

// Export for use in other scripts
window.SEOOptimizations = {
    measureWebVitals,
    initLazyLoading,
    preloadCriticalResources,
    optimizeFontLoading,
    preventLayoutShifts,
    optimizeScrollPerformance,
    prefetchNextPage,
    optimizeThirdPartyScripts,
    addResourceHints,
    reportPerformanceMetrics
};