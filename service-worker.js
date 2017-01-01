'use strict';

const PREFIX = 'erivelton';
const HASH = '424c85f60'; // Calculated when running `gulp`.
const OFFLINE_CACHE = `${ PREFIX }-${ HASH }`;
const OFFLINE_URL = '/';

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(OFFLINE_CACHE).then(function(cache) {
      return cache.addAll([
        '/fonts/proximanova-bold-webfont.eot',
        '/fonts/proximanova-bold-webfont.ttf',
        '/fonts/proximanova-bold-webfont.woff',
        '/fonts/proximanova-light-webfont.eot',
        '/fonts/proximanova-light-webfont.ttf',
        '/fonts/proximanova-light-webfont.woff',
        '/fonts/proximanova-regular-webfont.eot',
        '/fonts/proximanova-regular-webfont.ttf',
        '/fonts/proximanova-regular-webfont.woff',
        '/img/facebook-icon.png'
      ]);
    })
  );
});

self.addEventListener('activate', function(event) {
  // Delete old asset caches.
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.map(function(key) {
          if (key != OFFLINE_CACHE) {
            return caches.delete(key);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', function(event) {
  if (event.request.mode == 'navigate') {
    console.log(`Handling fetch event for ${ event.request.url }`);
    event.respondWith(
      fetch(event.request).catch(function(exception) {
        // The `catch` is only triggered if `fetch()` throws an exception,
        // which most likely happens due to the server being unreachable.
        console.error(
          'Fetch failed; returning offline page instead.',
          exception
        );
        return caches.open(OFFLINE_CACHE).then(function(cache) {
          return cache.match(OFFLINE_URL);
        });
      })
    );
  } else {
    // It’s not a request for an HTML document, but rather for a CSS or SVG
    // file or whatever…
    event.respondWith(
      caches.match(event.request).then(function(response) {
        return response || fetch(event.request);
      })
    );
  }

});