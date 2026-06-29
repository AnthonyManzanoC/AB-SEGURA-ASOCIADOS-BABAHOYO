// sw.js - Service Worker para PWA
const CACHE_NAME = 'segura-cache-v1';

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
    // Siempre intenta ir a la red primero para traer datos frescos de la API
    event.respondWith(
        fetch(event.request).catch(() => caches.match(event.request))
    );
});