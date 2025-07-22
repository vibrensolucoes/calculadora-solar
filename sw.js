self.addEventListener(install, (event) => {
    event.waitUntil(
        caches.open(solar-calculator-cache).then((cache) => {
            return cache.addAll([
                /calculadora-solar/,
                /calculadora-solar/index.html,
                /calculadora-solar/style.css,
                /calculadora-solar/script.js,
                /calculadora-solar/manifest.json,
                /calculadora-solar/icon-512x512.png
            ]);
        })
    );
});

self.addEventListener(fetch, (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
