

const CACHE = "cafe-mobile-v1";

const ARQUIVOS = [
  "./",
  "./index.html",
  "./css/style.css",
  "./js/dados.js",
  "./js/app.js",
  "./js/camera.js",
  "./js/pwa.js",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", function (evento) {
  evento.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return cache.addAll(ARQUIVOS);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function (evento) {
  evento.waitUntil(
    caches.keys().then(function (nomes) {
      return Promise.all(
        nomes
          .filter(function (nome) { return nome !== CACHE; })
          .map(function (nome) { return caches.delete(nome); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", function (evento) {
  if (evento.request.method !== "GET") {
    return;
  }

  evento.respondWith(
    fetch(evento.request)
      .then(function (resposta) {

        const copia = resposta.clone();
        caches.open(CACHE).then(function (cache) {
          cache.put(evento.request, copia);
        });
        return resposta;
      })
      .catch(function () {

        return caches.match(evento.request, { ignoreSearch: true });
      })
  );
});
