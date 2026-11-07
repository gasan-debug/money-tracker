const CACHE="money-v16";
const FILES=["./","index.html","manifest.webmanifest","icon-192.png","icon-512.png","icon-maskable-512.png","apple-touch-icon.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
  const r=e.request;
  if(r.method!=="GET"||new URL(r.url).origin!==location.origin)return;
  if(r.mode==="navigate"){
    e.respondWith((async()=>{
      const c=await caches.open(CACHE),hit=await c.match("index.html");
      const net=fetch(r).then(res=>{if(res&&res.ok)c.put("index.html",res.clone());return res});
      if(!hit)return net;
      return Promise.race([net.catch(()=>hit),new Promise(ok=>setTimeout(()=>ok(hit),1500))])})());
    return}
  e.respondWith(caches.match(r,{ignoreSearch:true}).then(hit=>hit||fetch(r).then(res=>{if(res&&res.ok){const c=res.clone();caches.open(CACHE).then(x=>x.put(r,c))}return res})))});
