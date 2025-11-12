const CACHE_NAME = 'pdf-image-extractor-v1';
const urlsToCache = [
  '/',
  './index.html',
  './index.tsx',
  './App.tsx',
  './components/FileUpload.tsx',
  './components/ImageGrid.tsx',
  './components/ImageCard.tsx',
  './components/Spinner.tsx',
  './components/Header.tsx',
  './components/StatusDisplay.tsx',
  './components/icons/DownloadIcon.tsx',
  './components/icons/UploadIcon.tsx',
  './components/icons/ImageIcon.tsx',
  './components/icons/FileIcon.tsx',
  './components/icons/ResetIcon.tsx',
  './icon.svg',
  './manifest.json',
  'https://cdn.tailwindcss.com/',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response; // Cache hit - return response
        }
        return fetch(event.request).then(
          response => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || (response.type !== 'basic' && response.type !== 'cors')) {
              return response;
            }

            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
