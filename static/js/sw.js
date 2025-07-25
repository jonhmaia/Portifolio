// Service Worker for Portfolio SEO Optimization

const CACHE_NAME = 'portfolio-v1';
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';

// Files to cache immediately
const STATIC_FILES = [
    '/',
    '/static/css/custom.css',
    '/static/css/seo-optimizations.css',
    '/static/js/seo-performance.js',
    '/static/images/profile.jpg',
    '/portfolio/',
    '/blog/',
    '/curriculum/',
    'https://cdn.tailwindcss.com/3.3.0',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Install event - cache static files
self.addEventListener('install', event => {
    console.log('Service Worker installing...');
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('Caching static files');
                return cache.addAll(STATIC_FILES);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('Service Worker activating...');
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            console.log('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => self.clients.claim())
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Skip admin and API requests
    if (url.pathname.startsWith('/admin/') || url.pathname.startsWith('/api/')) {
        return;
    }

    event.respondWith(
        caches.match(request)
            .then(cachedResponse => {
                if (cachedResponse) {
                    // Serve from cache
                    return cachedResponse;
                }

                // Network first for HTML pages
                if (request.headers.get('accept').includes('text/html')) {
                    return fetch(request)
                        .then(response => {
                            // Cache successful responses
                            if (response.status === 200) {
                                const responseClone = response.clone();
                                caches.open(DYNAMIC_CACHE)
                                    .then(cache => {
                                        cache.put(request, responseClone);
                                    });
                            }
                            return response;
                        })
                        .catch(() => {
                            // Fallback to offline page if available
                            return caches.match('/offline/');
                        });
                }

                // Cache first for static assets
                return caches.open(DYNAMIC_CACHE)
                    .then(cache => {
                        return fetch(request)
                            .then(response => {
                                // Cache successful responses
                                if (response.status === 200) {
                                    cache.put(request, response.clone());
                                }
                                return response;
                            });
                    })
                    .catch(() => {
                        // Return placeholder for failed image requests
                        if (request.destination === 'image') {
                            return new Response(
                                '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#f0f0f0"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#999">Image unavailable</text></svg>',
                                { headers: { 'Content-Type': 'image/svg+xml' } }
                            );
                        }
                    });
            })
    );
});

// Background sync for form submissions
self.addEventListener('sync', event => {
    if (event.tag === 'contact-form') {
        event.waitUntil(
            // Handle offline form submissions
            handleOfflineFormSubmission()
        );
    }
});

// Push notifications (if needed in the future)
self.addEventListener('push', event => {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: '/static/images/icon-192x192.png',
            badge: '/static/images/badge-72x72.png',
            vibrate: [100, 50, 100],
            data: {
                dateOfArrival: Date.now(),
                primaryKey: data.primaryKey
            },
            actions: [
                {
                    action: 'explore',
                    title: 'Ver mais',
                    icon: '/static/images/checkmark.png'
                },
                {
                    action: 'close',
                    title: 'Fechar',
                    icon: '/static/images/xmark.png'
                }
            ]
        };

        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

// Notification click handler
self.addEventListener('notificationclick', event => {
    event.notification.close();

    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Helper function for offline form submissions
function handleOfflineFormSubmission() {
    return new Promise((resolve) => {
        // Implementation for handling offline form submissions
        // This would typically involve IndexedDB to store form data
        // and retry submission when online
        resolve();
    });
}

// Periodic background sync for cache updates
self.addEventListener('periodicsync', event => {
    if (event.tag === 'cache-update') {
        event.waitUntil(
            updateCriticalResources()
        );
    }
});

// Helper function to update critical resources
function updateCriticalResources() {
    return caches.open(STATIC_CACHE)
        .then(cache => {
            return Promise.all(
                STATIC_FILES.map(url => {
                    return fetch(url)
                        .then(response => {
                            if (response.status === 200) {
                                return cache.put(url, response);
                            }
                        })
                        .catch(err => {
                            console.log('Failed to update:', url, err);
                        });
                })
            );
        });
}

// Message handler for communication with main thread
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: CACHE_NAME });
    }
});