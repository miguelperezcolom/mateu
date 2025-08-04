self.addEventListener('install', (event) => {
  console.log('install 1', event);
});

self.addEventListener('activate', function(event) {
  console.log('activate 1');
  return self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  console.log('fetch 1');
  event.respondWith(Response.error());
});
