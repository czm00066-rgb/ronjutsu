const CACHE='cc-single-v3';
const ASSETS=['./','./index.html','./styles.css','./app.js','./manifest.webmanifest','./data_s1.json','./data_s2.json','./data_s3.json','./data_s4.json'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(self.clients.claim());});
self.addEventListener('fetch',e=>{
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(net=>{
    const copy=net.clone(); caches.open(CACHE).then(c=>c.put(e.request,copy)).catch(()=>{}); return net;
  }).catch(()=>r)));
});
