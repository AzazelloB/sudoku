(function(){"use strict";const w={easy:38,normal:30,hard:23,expert:17},M=n=>{for(let t=n.length-1;t>0;t--){const e=Math.floor(Math.random()*(t+1)),o=n[t];n[t]=n[e],n[e]=o}},s=9,p=9,d=(n,t,e)=>{const o=e%s,r=Math.floor(e/s);for(let a=0;a<s;a++){const c=r*s+a,i=o+a*s;if(c!==e&&n[c]===t||i!==e&&n[i]===t)return!1}const l=Math.floor(r/3)*3,f=Math.floor(o/3)*3,u=l+3,h=f+3;for(let a=l;a<u;a++)for(let c=f;c<h;c++){const i=a*s+c;if(i!==e&&n[i]===t)return!1}return!0},m=(n,t=0)=>{if(t===n.length)return!0;const e=[1,2,3,4,5,6,7,8,9];for(;e.length;){const[o]=e.splice(Math.floor(Math.random()*e.length),1);if(d(n,o,t)&&(n[t]=o,m(n,t+1)))return!0}return n[t]=null,!1},v=n=>{for(let t=0;t<n.length;t++)if(n[t]===null)return t;return null},I=()=>{let n=0;return function t(e,o=0){if(n++,n>1e5)throw new Error("enough");if(o>1)return o;const r=v(e);if(r!==null)for(let l=1;l<=9;l++)d(e,l,r)&&(e[r]=l,o=t(e,o),e[r]=null);else o++;return o}},g=(n,t)=>{try{const e=I(),o=n.slice(),r=[...o.keys()];M(r);const l=o.length-1-w[t];for(let f=0;f<=l;){const u=r.pop(),h=o[u];o[u]=null,e(o.slice())===1?f++:(o[u]=h,r.unshift(u))}return o}catch{return g(n,t)}},C=({data:{difficulty:n}})=>{const t=new Array(s*p).fill(null);m(t);const e=g(t,n),o=[];for(let r=0;r<t.length;r+=1)o.push({value:null,answer:t[r],revealed:e[r]!==null,corner:[],middle:[],col:r%s,row:Math.floor(r/s),colors:[]});return o};onmessage=({data:{difficulty:n}})=>{const t=C({data:{difficulty:n}});postMessage(t)}})();
