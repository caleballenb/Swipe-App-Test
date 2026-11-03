// Tiny Swiper service worker (v2)
// Always fetch the newest app straight from GitHub, skipping every cache on the way,
// so an update shows up the next time the app opens. The saved copy is only used offline.
// YouTube and Google requests are never touched.
const CACHE="tiny-swiper-v2";
const SHELL=["./tiny-swipe.html","./manifest.json","./icon-192.png","./icon-512.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL.map(u=>new Request(u,{cache:"reload"})))));self.skipWaiting()});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(n=>n!==CACHE).map(n=>caches.delete(n)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
  const req=e.request,u=new URL(req.url);
  if(req.method!=="GET"||u.origin!==location.origin)return;
  const page=req.mode==="navigate"||u.pathname.endsWith(".html")||u.pathname.endsWith("manifest.json");
  let net;
  if(page){
    const fresh=new URL(u);fresh.searchParams.set("_",Date.now());   // unique address also skips GitHub's 10-minute server cache
    net=fetch(fresh,{cache:"no-store",credentials:"same-origin"});
  }else{
    net=fetch(req,{cache:"no-cache"});
  }
  e.respondWith(net.then(r=>{
    if(r.ok){const c=r.clone();caches.open(CACHE).then(x=>x.put(page?new Request(u.origin+u.pathname):req,c))}
    return r;
  }).catch(()=>caches.match(page?u.origin+u.pathname:req,{ignoreSearch:true})));
});
