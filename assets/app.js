/* Gemeinsame Helfer für alle Seiten des Lernlaunchers:
   Geräteerkennung, Vollbild für Spiele, Anzeige-Einstellungen (Schriftgröße, Kontrast, Bewegung). */
(function(){
"use strict";
const d=document.documentElement;
const kind=d.dataset.kind||"page";
const mm=q=>window.matchMedia?matchMedia(q).matches:false;
const ua=navigator.userAgent||"";
const isIOS=/iPad|iPhone|iPod/.test(ua)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1);
const coarse=mm("(pointer: coarse)")||navigator.maxTouchPoints>1&&!mm("(pointer: fine)");
const shortSide=Math.min(screen.width||innerWidth,screen.height||innerHeight);
const dev=coarse?(shortSide<600?"phone":"tablet"):"desktop";
const standalone=mm("(display-mode: standalone)")||mm("(display-mode: fullscreen)")||navigator.standalone===true;
d.classList.add("dev-"+dev);if(coarse)d.classList.add("touch");if(standalone)d.classList.add("standalone");

/* ---------- Anzeige-Einstellungen ---------- */
let A={};try{A=JSON.parse(localStorage.getItem("lp-a11y"))||{}}catch(e){}
if(A.autofs===undefined)A.autofs=true;
const css=`@media print{html{zoom:1!important}}
html.hc{--muted:var(--ink);--dim:var(--ink)}
html.hc .tag,html.hc .lead,html.hc .secl{color:var(--ink)}
html.rm *,html.rm *::before,html.rm *::after{animation-duration:.001ms!important;animation-iteration-count:1!important;transition-duration:.001ms!important;scroll-behavior:auto!important}
.ll-fsbtn{position:fixed;right:12px;bottom:12px;z-index:90;font:700 15px/1 system-ui,sans-serif;background:#000a;color:#fff;border:1px solid #fff6;border-radius:10px;padding:9px 11px;cursor:pointer;backdrop-filter:blur(4px)}
.ll-fsbtn:hover{background:#000d}
html.ll-fs .ll-fsbtn{opacity:.55}
.ll-rotate{position:fixed;inset:0;z-index:95;background:#120c18f2;color:#fff;display:none;flex-direction:column;align-items:center;justify-content:center;gap:16px;text-align:center;padding:24px;font:600 18px/1.4 system-ui,sans-serif}
.ll-rotate .ph{font-size:64px;animation:llrot 1.6s ease-in-out infinite}
@keyframes llrot{0%,30%{transform:rotate(0)}60%,100%{transform:rotate(-90deg)}}
.ll-rotate button{font:inherit;font-size:15px;background:#fff2;color:#fff;border:1px solid #fff6;border-radius:10px;padding:8px 14px;cursor:pointer}
html.ll-portrait.ll-wantland:not(.ll-rotok) .ll-rotate{display:flex}`;
const st=document.createElement("style");st.textContent=css;(document.head||d).appendChild(st);
function applyA11y(){d.classList.toggle("hc",!!A.contrast);d.classList.toggle("rm",!!A.motion);
 if(kind!=="game"){const z=+A.zoom||1;d.style.zoom=z!==1?String(z):""}}
applyA11y();
if(A.motion===undefined&&mm("(prefers-reduced-motion: reduce)"))d.classList.add("rm");

/* ---------- Vollbild ---------- */
const fsEl=()=>document.fullscreenElement||document.webkitFullscreenElement;
const fsOk=!!(d.requestFullscreen||d.webkitRequestFullscreen);
async function enterFs(){try{if(fsEl())return true;if(d.requestFullscreen)await d.requestFullscreen({navigationUI:"hide"});else if(d.webkitRequestFullscreen)d.webkitRequestFullscreen();
  if(d.dataset.landscape==="1"&&dev!=="desktop"&&screen.orientation&&screen.orientation.lock){try{await screen.orientation.lock("landscape")}catch(e){}}return true}catch(e){return false}}
async function exitFs(){try{if(document.exitFullscreen)await document.exitFullscreen();else if(document.webkitExitFullscreen)document.webkitExitFullscreen()}catch(e){}}
function toggleFs(){if(fsEl()){try{sessionStorage.setItem("ll-fs-off","1")}catch(e){}exitFs()}else{try{sessionStorage.removeItem("ll-fs-off")}catch(e){}enterFs()}}

/* ---------- Bühne an den Bildschirm anpassen ---------- */
const fits=[];
function fitAll(){fits.forEach(f=>f())}
function fitStage(stage,opt){opt=opt||{};const ratio=opt.ratio||16/9;
 const f=()=>{if(!stage.isConnected)return;stage.style.width="";const box=stage.parentElement;const cw=box.clientWidth;
  const sh=stage.getBoundingClientRect().height;const docH=document.body.scrollHeight;const chrome=Math.max(0,docH-sh);
  const avail=Math.max(160,innerHeight-chrome-(opt.extra||0));const w=Math.max(Math.min(cw,avail*ratio),Math.min(cw,280));stage.style.width=Math.floor(w)+"px";stage.style.maxWidth="100%"};
 fits.push(f);f();requestAnimationFrame(f);setTimeout(f,350);return f}
let rt=0;function onResize(){clearTimeout(rt);rt=setTimeout(()=>{orient();fitAll()},80)}
addEventListener("resize",onResize);addEventListener("orientationchange",onResize);
document.addEventListener("fullscreenchange",()=>{d.classList.toggle("ll-fs",!!fsEl());updBtn();onResize()});
document.addEventListener("webkitfullscreenchange",()=>{d.classList.toggle("ll-fs",!!fsEl());updBtn();onResize()});
function orient(){d.classList.toggle("ll-portrait",innerHeight>innerWidth&&dev!=="desktop");d.classList.toggle("ll-compact",innerHeight<520&&innerWidth>innerHeight)}
orient();

let btn=null;
function updBtn(){if(btn){btn.textContent=fsEl()?"🗗":"⛶";btn.title=fsEl()?"Vollbild beenden (F)":"Vollbild (F)";btn.setAttribute("aria-label",btn.title)}}
function setupGame(opt){opt=opt||{};
 if(opt.landscape){d.dataset.landscape="1";d.classList.add("ll-wantland")}
 if(opt.stage)fitStage(opt.stage,opt);
 if(fsOk&&!(isIOS&&dev==="phone")){if(opt.button){btn=opt.button;btn.hidden=false}else{btn=document.createElement("button");btn.className="ll-fsbtn";document.body.appendChild(btn)}btn.type="button";btn.onclick=e=>{e.stopPropagation();toggleFs()};updBtn()}else if(opt.button)opt.button.hidden=true;
 if(opt.landscape&&dev!=="desktop"){const r=document.createElement("div");r.className="ll-rotate";r.innerHTML='<div class="ph" aria-hidden="true">📱</div><div>Bitte das Gerät quer halten –<br>dann passt das Spiel auf den ganzen Bildschirm.</div><button type="button">Trotzdem hochkant spielen</button>';r.querySelector("button").onclick=()=>d.classList.add("ll-rotok");document.body.appendChild(r)}
 addEventListener("keydown",e=>{if((e.key==="f"||e.key==="F")&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&!/INPUT|TEXTAREA|SELECT/.test((e.target||{}).tagName||"")){e.preventDefault();toggleFs()}});
 /* Automatisch Vollbild beim ersten Antippen/Klicken (Browser erlauben es nur nach einer Nutzeraktion) */
 let off=false;try{off=sessionStorage.getItem("ll-fs-off")==="1"}catch(e){}
 if(A.autofs&&fsOk&&!off&&!standalone){const go=()=>{removeEventListener("pointerdown",go,true);enterFs()};addEventListener("pointerdown",go,true)}}

window.LL={dev,isIOS,coarse,standalone,a11y:A,saveA11y(n){A=Object.assign(A,n);try{localStorage.setItem("lp-a11y",JSON.stringify(A))}catch(e){}window.LL.a11y=A;applyA11y()},
 setupGame,fitStage,fitAll,toggleFs,enterFs,isFs:()=>!!fsEl(),fsSupported:fsOk};
})();
