// 緩存名稱和版本
const CACHE_NAME = 'emptySkyBuddhism-v1';

// 需要緩存的資源列表
const urlsToCache = [
  '/',
  '/index.html',
  '/diamond-sutra.html',
  '/group-meditation.html',
  '/offline.html',
  '/manifest.json',
  '/images/icons/icon-192x192.png',
  '/images/icons/icon-512x512.png'
];

// 安裝 Service Worker 並緩存資源
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('緩存已開啟');
        return cache.addAll(urlsToCache);
      })
  );
});

// 攔截請求並從緩存中提供資源
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 如果請求的資源在緩存中找到，則返回緩存的版本
        if (response) {
          return response;
        }
        
        // 否則嘗試從網絡獲取
        return fetch(event.request)
          .then(response => {
            // 檢查是否獲取成功
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // 成功獲取後，將資源加入緩存
            let responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
              
            return response;
          })
          .catch(() => {
            // 如果網絡請求失敗，嘗試返回離線頁面
            if (event.request.mode === 'navigate') {
              return caches.match('/offline.html');
            }
          });
      })
  );
});

// 當新的 Service Worker 激活時，清除舊的緩存
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          return cacheName !== CACHE_NAME;
        }).map(cacheName => {
          return caches.delete(cacheName);
        })
      );
    })
  );
}); 