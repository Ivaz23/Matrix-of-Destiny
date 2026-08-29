// Catharsis Matrix PWA Service Worker & Advanced Offline Audio Cache Strategy
const CACHE_VERSION = 'v2.2.0';
const STATIC_CACHE_NAME = `catharsis-static-${CACHE_VERSION}`;
const DATA_CACHE_NAME = `catharsis-data-${CACHE_VERSION}`;
const IMAGE_CACHE_NAME = `catharsis-images-${CACHE_VERSION}`;
const AUDIO_CACHE_NAME = `catharsis-audio-${CACHE_VERSION}`;

// Core App Shell Static Assets to pre-cache on install
const PRECACHE_STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg',
  '/icon-192.png',
  '/icon-512.png',
  '/favicon-32x32.png',
  '/apple-touch-icon.png',
  '/index.css'
];

// External CDN dependencies to cache on discovery (fonts, tailwind, etc.)
const CDN_ORIGINS = [
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'cdn.tailwindcss.com',
  'aistudiocdn.com'
];

// Helper to handle Range Requests for cached audio (Required for iOS Safari & Android Chrome)
async function createRangeResponse(cachedResponse, rangeHeader) {
  const arrayBuffer = await cachedResponse.arrayBuffer();
  const totalSize = arrayBuffer.byteLength;
  
  if (!rangeHeader) {
    return new Response(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': cachedResponse.headers.get('Content-Type') || 'audio/wav',
        'Content-Length': totalSize.toString(),
        'Accept-Ranges': 'bytes'
      }
    });
  }

  const matches = rangeHeader.match(/bytes=(\d+)-(\d+)?/);
  if (!matches) {
    return new Response(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': cachedResponse.headers.get('Content-Type') || 'audio/wav',
        'Content-Length': totalSize.toString(),
        'Accept-Ranges': 'bytes'
      }
    });
  }

  const start = parseInt(matches[1], 10);
  const end = matches[2] ? parseInt(matches[2], 10) : totalSize - 1;
  const chunk = arrayBuffer.slice(start, end + 1);

  return new Response(chunk, {
    status: 206,
    statusText: 'Partial Content',
    headers: {
      'Content-Type': cachedResponse.headers.get('Content-Type') || 'audio/wav',
      'Content-Range': `bytes ${start}-${end}/${totalSize}`,
      'Content-Length': chunk.byteLength.toString(),
      'Accept-Ranges': 'bytes'
    }
  });
}

// 1. Service Worker Installation: Pre-cache App Shell & Audio Cache storage initialization
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE_NAME).then(async (cache) => {
        console.log('[ServiceWorker] Pre-caching App Shell assets');
        const cachePromises = PRECACHE_STATIC_ASSETS.map((url) => {
          return fetch(url, { cache: 'no-cache' })
            .then((response) => {
              if (response.status === 200) {
                return cache.put(url, response);
              }
            })
            .catch((err) => {
              console.warn(`[ServiceWorker] Optional precache skipped for ${url}:`, err);
            });
        });
        await Promise.all(cachePromises);
      }),
      caches.open(AUDIO_CACHE_NAME)
    ])
  );
  self.skipWaiting();
});

// 2. Service Worker Activation: Clean up stale caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (
            cacheName !== STATIC_CACHE_NAME &&
            cacheName !== DATA_CACHE_NAME &&
            cacheName !== IMAGE_CACHE_NAME &&
            cacheName !== AUDIO_CACHE_NAME
          ) {
            console.log('[ServiceWorker] Evicting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. Network Fetch Interception with tailored caching strategies
self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Skip Vite dev server modules, hot updates, API calls, and Firebase
  if (
    url.pathname.includes('/@vite') ||
    url.pathname.includes('/@fs') ||
    url.pathname.includes('/@id') ||
    url.pathname.endsWith('.tsx') ||
    url.pathname.endsWith('.ts') ||
    url.pathname.includes('node_modules') ||
    url.search.includes('t=') ||
    url.search.includes('v=') ||
    url.pathname.startsWith('/api/') || 
    url.hostname.includes('firebaseio.com') ||
    url.hostname.includes('firestore.googleapis.com') ||
    url.hostname.includes('identitytoolkit.googleapis.com') ||
    url.hostname.includes('securetoken.googleapis.com')
  ) {
    return;
  }

  // Strategy A: Audio Soundscapes & Sound Files -> Dedicated Audio Cache with Range Support
  const isAudio = 
    request.destination === 'audio' ||
    url.pathname.match(/\.(wav|mp3|ogg|aac|m4a|weba|flac)$/i) ||
    url.pathname.startsWith('/soundscapes/') ||
    url.pathname.startsWith('/audio/');

  if (isAudio) {
    event.respondWith(
      (async () => {
        const audioCache = await caches.open(AUDIO_CACHE_NAME);
        const cached = await audioCache.match(request.url, { ignoreSearch: true });

        if (cached) {
          const range = request.headers.get('range');
          return createRangeResponse(cached, range);
        }

        try {
          const networkResponse = await fetch(request);
          if (networkResponse && (networkResponse.status === 200 || networkResponse.status === 206)) {
            // Clone and store full response in audio cache if 200
            if (networkResponse.status === 200) {
              audioCache.put(request.url, networkResponse.clone());
            }
          }
          return networkResponse;
        } catch (networkError) {
          console.warn('[ServiceWorker] Audio offline fetch fallback:', request.url);
          if (cached) {
            return createRangeResponse(cached, request.headers.get('range'));
          }
          return new Response('Audio not available offline', { status: 503, statusText: 'Offline Audio Unavailable' });
        }
      })()
    );
    return;
  }

  // Strategy B: Static CDN Assets & Web Fonts -> Stale-While-Revalidate
  const isCdnAsset = CDN_ORIGINS.some((origin) => url.hostname.includes(origin));
  if (isCdnAsset) {
    event.respondWith(
      caches.open(STATIC_CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(request);
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // Strategy C: Images & Wallpapers -> Cache-First with fallback
  if (request.destination === 'image' || url.pathname.match(/\.(png|jpg|jpeg|svg|webp|gif|ico)$/i)) {
    event.respondWith(
      caches.open(IMAGE_CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
          return cachedResponse;
        }
        try {
          const networkResponse = await fetch(request);
          if (networkResponse && networkResponse.status === 200) {
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        } catch (error) {
          return cachedResponse || new Response('', { status: 408, statusText: 'Image unavailable offline' });
        }
      })
    );
    return;
  }

  // Strategy D: HTML Navigation & Core App Shell -> Network-First with Cache Fallback
  if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(STATIC_CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          return caches.match('/index.html');
        })
    );
    return;
  }

  // Strategy E: JS / CSS App bundles & Other static files -> Stale-While-Revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(STATIC_CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});

// 4. Background Sync & Audio Pre-caching Message Handlers
self.addEventListener('message', async (event) => {
  const data = event.data;
  if (!data) return;

  if (data.type === 'SKIP_WAITING') {
    self.skipWaiting();
    return;
  }

  // Handle client request to pre-cache synthesized soundscape audio tracks
  if (data.type === 'PRECACHE_AUDIO_SOUNDSCAPES' && Array.isArray(data.items)) {
    try {
      const audioCache = await caches.open(AUDIO_CACHE_NAME);
      const results = [];

      for (const item of data.items) {
        if (item.url && item.base64) {
          // Convert base64 to binary Response
          const binaryString = atob(item.base64);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }

          const response = new Response(bytes.buffer, {
            status: 200,
            headers: {
              'Content-Type': item.mimeType || 'audio/wav',
              'Content-Length': bytes.length.toString(),
              'Accept-Ranges': 'bytes',
              'Cache-Control': 'public, max-age=31536000'
            }
          });

          await audioCache.put(item.url, response);
          results.push(item.id || item.url);
        }
      }

      // Notify clients of completion
      event.source?.postMessage({
        type: 'AUDIO_PRECACHED_SUCCESS',
        cachedCount: results.length,
        items: results
      });
    } catch (err) {
      console.error('[ServiceWorker] Failed to precache audio soundscapes:', err);
      event.source?.postMessage({
        type: 'AUDIO_PRECACHED_ERROR',
        error: String(err)
      });
    }
  }

  // Check audio cache status
  if (data.type === 'CHECK_AUDIO_OFFLINE_STATUS') {
    try {
      const audioCache = await caches.open(AUDIO_CACHE_NAME);
      const keys = await audioCache.keys();
      event.source?.postMessage({
        type: 'AUDIO_OFFLINE_STATUS_REPORT',
        cachedCount: keys.length,
        cachedUrls: keys.map(k => k.url)
      });
    } catch (err) {
      event.source?.postMessage({
        type: 'AUDIO_OFFLINE_STATUS_REPORT',
        cachedCount: 0,
        cachedUrls: []
      });
    }
  }

  // Handle immediate local notification triggering via Service Worker
  if (data.type === 'SHOW_LOCAL_NOTIFICATION' && data.payload) {
    const payload = data.payload;
    const options = {
      body: payload.body || 'Новое напоминание от Старца Чубука',
      icon: payload.icon || '/icon-192.png',
      badge: payload.badge || '/favicon-32x32.png',
      tag: payload.tag || 'chubuk-notification',
      renotify: true,
      vibrate: payload.vibrate || [120, 60, 120],
      data: {
        url: payload.url || '/?tab=daily',
        tab: payload.tab || 'daily',
        timestamp: Date.now()
      },
      actions: payload.actions || [
        { action: 'open_tab', title: '✨ Открыть' },
        { action: 'dismiss', title: 'Позже' }
      ]
    };
    self.registration.showNotification(payload.title || 'Матрица Судьбы — Прогноз', options);
  }
});

// 5. Push Notifications Listener (Web Push API)
self.addEventListener('push', (event) => {
  let data = {
    title: '🔮 Старец Чубук — Прогноз Дня',
    body: 'Ваш сакральный прогноз и благоприятные даты на сегодня готовы!',
    url: '/?tab=daily',
    tab: 'daily'
  };

  if (event.data) {
    try {
      const json = event.data.json();
      data = { ...data, ...json };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/icon-192.png',
    badge: data.badge || '/favicon-32x32.png',
    tag: data.tag || 'chubuk-daily-push',
    renotify: true,
    vibrate: [150, 80, 150, 80, 200],
    data: {
      url: data.url || '/?tab=daily',
      tab: data.tab || 'daily',
      date: new Date().toISOString()
    },
    actions: data.actions || [
      { action: 'open_forecast', title: '🔮 Прогноз' },
      { action: 'open_calendar', title: '📅 Даты Силы' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Матрица Судьбы', options)
  );
});

// 6. Notification Click & Deep-Linking Action Handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  let targetTab = event.notification.data?.tab || 'daily';
  let targetUrl = event.notification.data?.url || `/?tab=${targetTab}`;

  if (event.action === 'open_calendar') {
    targetTab = 'elective';
    targetUrl = '/?tab=elective';
  } else if (event.action === 'open_forecast') {
    targetTab = 'daily';
    targetUrl = '/?tab=daily';
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a window is already open, focus it and notify tab switch
      for (const client of clientList) {
        if ('focus' in client) {
          client.postMessage({
            type: 'NAVIGATE_TAB',
            tab: targetTab
          });
          return client.focus();
        }
      }
      // If no window is open, open a new one with the target tab
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
