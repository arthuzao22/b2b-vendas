// Self-unregistering service worker
// Resolves phantom 404 requests for /sw.js
self.addEventListener('install', function() {
  self.skipWaiting();
});

self.addEventListener('activate', function() {
  self.registration.unregister().then(function() {
    return self.clients.matchAll();
  }).then(function(clients) {
    clients.forEach(function(client) {
      client.navigate(client.url);
    });
  });
});
