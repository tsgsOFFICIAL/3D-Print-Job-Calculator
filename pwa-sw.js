const version = '0.1.0';
const cacheName = '3d-print-cost-calculator-cache';
const assets = [
    './',
    './manifest.json',
    './assets/img/icon-close-min.png',
    './assets/img/icon-close.png',
    './assets/img/logo-min.png',
    './assets/img/logo.png',
    './assets/pwa/icons/128x128.png',
    './assets/pwa/icons/144x144.png',
    './assets/pwa/icons/152x152.png',
    './assets/pwa/icons/192x192.png',
    './assets/pwa/icons/384x384.png',
    './assets/pwa/icons/512x512.png',
    './assets/pwa/icons/72x72.png',
    './assets/pwa/icons/96x96.png',
    './assets/pwa/screenshots/screenshot 1.png',
    './assets/pwa/screenshots/screenshot 2.png',
    './css/animations.css',
    './css/blur-load.css',
    './css/main.css',
    './css/pwa.css',
    './css/toast.css',
    './css/variables.css',
    './js/cookie.js',
    './js/img-loader.js',
    './js/main.js',
    './js/notifications.js',
    'https://unpkg.com/vue@3/dist/vue.global.prod.js',
];

// Cache all the files to make a PWA
self.addEventListener('install', installEvent => {
    installEvent.waitUntil(
        caches.open(cacheName).then(cache => {
            return Promise.all(
                assets.map(async url => {
                    try {
                        const response = await fetch(url);

                        if (!response.ok) {
                            throw new Error(`Failed to fetch "${url}", status: ${response.status}`);
                        }

                        return await cache.put(url, response);
                    } catch (error) {
                        return console.error(`Failed to cache "${url}": ${error.message}`);
                    }
                })
            );
        }).catch(error => console.error('Cache open failed:', error))
    );
});

// Implement network-first strategy
self.addEventListener("fetch", fetchEvent => {
    fetchEvent.respondWith(
        fetch(fetchEvent.request).then(networkResponse => {
            // If we got a response from the network, update the cache
            if (networkResponse && networkResponse.status === 200) {
                const responseClone = networkResponse.clone();
                caches.open(cacheName).then(cache => {
                    try {
                        cache.put(fetchEvent.request, responseClone);
                    } catch (error) { }
                });
            }
            return networkResponse;
        }).catch(async () => {
            // If the network is unavailable, use the cache
            const cacheResponse = await caches.match(fetchEvent.request);
            return cacheResponse || caches.match('./error/404');
        })
    );
});