if(!self.define){let e,i={};const s=(s,n)=>(s=new URL(s+".js",n).href,i[s]||new Promise((i=>{if("document"in self){const e=document.createElement("script");e.src=s,e.onload=i,document.head.appendChild(e)}else e=s,importScripts(s),i()})).then((()=>{let e=i[s];if(!e)throw new Error(`Module ${s} didn’t register its module`);return e})));self.define=(n,r)=>{const a=e||("document"in self?document.currentScript.src:"")||location.href;if(i[a])return;let o={};const c=e=>s(e,a),d={module:{uri:a},exports:o,require:c};i[a]=Promise.all(n.map((e=>d[e]||c(e)))).then((e=>(r(...e),o)))}}define(["./workbox-fa446783"],(function(e){"use strict";self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"apple-touch-icon-180x180.png",revision:"aeec8fb452888bb7494d93245f8a5046"},{url:"assets/boardGenerator-3e2a45ba.js",revision:null},{url:"assets/index-54dbde88.css",revision:null},{url:"assets/index-a0912bb5.js",revision:null},{url:"assets/logo-53f68567.svg",revision:null},{url:"assets/tipper-cc7b40d0.js",revision:null},{url:"assets/workbox-window.prod.es5-a7b12eab.js",revision:null},{url:"favicon.ico",revision:"7af6deb581fae3723d981c36c20a354c"},{url:"favicon.svg",revision:"aac48d7a725c13b5a6621be8d4497d62"},{url:"icon.svg",revision:"479a8ecbda3ecca3e9b3d76ffbde703c"},{url:"index.html",revision:"2e5f6417ee4b03b062a4d23f945ed39c"},{url:"manifest.webmanifest",revision:"3683ba406e4a5691dc5b02aa43081c19"},{url:"maskable-icon-512x512.png",revision:"ece4c65cc606ac202cb466d1bc43827d"},{url:"pwa-192x192.png",revision:"3172844218a023886e655febaf44ead2"},{url:"pwa-512x512.png",revision:"952e75ad73d9dd027bfa7ecb0f78839d"},{url:"pwa-64x64.png",revision:"517bb105dfd00e19d6085509087bceb5"},{url:"favicon.ico",revision:"7af6deb581fae3723d981c36c20a354c"},{url:"pwa-192x192.png",revision:"3172844218a023886e655febaf44ead2"},{url:"pwa-512x512.png",revision:"952e75ad73d9dd027bfa7ecb0f78839d"},{url:"manifest.webmanifest",revision:"3683ba406e4a5691dc5b02aa43081c19"}],{}),e.cleanupOutdatedCaches(),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("index.html")))}));
