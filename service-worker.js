var cacheName = 'weatherPWA';
var filesToCache = [
	'/',
	'/index.html',
	'scripts/app.js',
	'styles/inline.css',
	'/images/clear.png',
	'/images/cloudy-scattered-showers.png',
	'/images/cloudy.png',
	'/images/fog.png',
	'/images/ic_add_white_24px.svg',
	'/images/ic_refresh_white_24px.svg',
	'/images/partly-cloudy.png',
	'/images/rain.png',
	'/images/scattered-showers.png',
	'/images/sleet.png',
	'/images/snow.png',
	'/images/thunderstorm.png',
	'/images/wind.png'
];

self.addEventListener('install', function (ev) {
	console.log('[service-worker] install');
	ev.waitUntil(
		caches.open(cacheName).then(function (cache) {
			console.log('[ServiceWorker] Caching app shell');
			return cache.addAll(filesToCache);
		})
	);
});

self.addEventListener('activate', function (ev) {
	console.log('[ServiceWorker] Activate');
	ev.waitUntil(
		caches.keys().then(function (keyList) {
			return Promise.all(keyList.map(function (key) {
				if (key !== cacheName) {
					console.log('[ServiceWorker] Removing old cache', key);
					return caches.delete(key);
				}
			}));
		})
	)
	return self.clients.claim();
});

self.addEventListener('fetch', function (ev) {
	console.log('[ServiceWorker] Fetch', ev.request.url);
	ev.respondWith(
		caches.match(ev.request).then(function (response) {
			return response || fetch(ev.request);
		})
	);
});