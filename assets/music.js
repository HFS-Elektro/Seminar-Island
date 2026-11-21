/* Hintergrundmusik und Soundkulisse – komplett im Browser erzeugt (Web Audio), keine Audiodateien.
   Nutzung: LLMusic.setTheme("harbor"|"tavern"|"night"|"swamp"|"noir"); LLMusic.toggle(); */
(function(){
"use strict";
const PREF="lp-audio";
let pref={music:true,vol:0.55};try{Object.assign(pref,JSON.parse(localStorage.getItem(PREF))||{})}catch(e){}
const M={ctx:null,master:null,bus:null,amb:null,on:false,theme:null,want:null,timer:null,step:0,next:0,phrase:{},ambNodes:[],fx:null};
const mtof=n=>440*Math.pow(2,(n-69)/12);
const CH={M:[0,4,7],m:[0,3,7],m7:[0,3,7,10],M7:[0,4,7,11],"7":[0,4,7,10]};
const TH={
 harbor:{bpm:104,prog:[[62,"M"],[59,"m"],[55,"M"],[57,"M"]],scale:[0,2,4,7,9],key:62,rh:["x.x.x..x","x..xx.x.","x.x.x.x.","x...x..."],bass:"r...f...",stab:"..x...x.",lead:"triangle",lv:.055,amb:"waves",gulls:true},
 tavern:{bpm:138,prog:[[55,"M"],[60,"M"],[62,"M"],[55,"M"]],scale:[0,2,4,7,9],key:55,rh:["xxx.x.x.","x.xxx...","xxx.x.x.","x.x.x..."],bass:"r.f.r.f.",stab:".x.x.x.x",lead:"accordion",lv:.03,amb:"murmur"},
 night:{bpm:68,prog:[[57,"m"],[53,"M"],[60,"M"],[55,"M"]],scale:[0,3,5,7,10],key:57,rh:["x...x...","..x.....","x.....x.","x......."],bass:"r.......",pad:true,lead:"bell",lv:.05,amb:"waves"},
 swamp:{bpm:84,prog:[[50,"m"],[50,"m"],[48,"M"],[50,"m"]],scale:[0,3,5,7,10],key:50,rh:["x..x..x.","....x...","x..x....","..x..x.."],bass:"r..r..r.",lead:"triangle",lv:.045,amb:"swamp"},
 noir:{bpm:76,prog:[[48,"m7"],[53,"m7"],[55,"7"],[48,"m7"]],scale:[0,3,5,6,7,10],key:60,rh:["x..x....","...x.x..","x.......","..x..x.x"],walk:true,hat:true,pad:true,lead:"sax",lv:.04,amb:"rain"}};

function ctx(){if(!M.ctx){const C=window.AudioContext||window.webkitAudioContext;if(!C)return null;M.ctx=new C();
  M.master=M.ctx.createGain();M.master.gain.value=pref.vol;M.master.connect(M.ctx.destination);
  M.bus=M.ctx.createGain();M.bus.gain.value=0;M.bus.connect(M.master);
  M.amb=M.ctx.createGain();M.amb.gain.value=0;M.amb.connect(M.master);
  /* kleiner Hall */
  const d=M.ctx.createDelay(1);d.delayTime.value=.23;const fb=M.ctx.createGain();fb.gain.value=.28;const lp=M.ctx.createBiquadFilter();lp.type="lowpass";lp.frequency.value=2200;
  M.fx=M.ctx.createGain();M.fx.gain.value=.35;M.fx.connect(d);d.connect(lp);lp.connect(fb);fb.connect(d);lp.connect(M.master)}
 if(M.ctx.state==="suspended")M.ctx.resume();return M.ctx}
let NB=null;function noiseBuf(){if(NB)return NB;const c=M.ctx,b=c.createBuffer(1,c.sampleRate*2,c.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;return NB=b}
function env(g,t,a,v,d){g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(v,0.0002),t+a);g.gain.exponentialRampToValueAtTime(0.0001,t+d)}
function tone(n,t,d,type,v,opts){const c=M.ctx;opts=opts||{};const g=c.createGain();env(g,t,opts.a||.015,v,d);let out=g;
 if(opts.lp){const f=c.createBiquadFilter();f.type="lowpass";f.frequency.value=opts.lp;f.Q.value=opts.q||.7;g.connect(f);out=f}
 out.connect(M.bus);if(opts.wet)out.connect(M.fx);
 const oscs=(opts.detune||[0]).map(dt=>{const o=c.createOscillator();o.type=type;o.frequency.value=mtof(n);o.detune.value=dt;o.connect(g);o.start(t);o.stop(t+d+.05);return o});
 if(opts.vib){const l=c.createOscillator(),lg=c.createGain();l.frequency.value=5;lg.gain.value=opts.vib;l.connect(lg);oscs.forEach(o=>lg.connect(o.frequency));l.start(t+.15);l.stop(t+d)}}
function hat(t,v){const c=M.ctx,s=c.createBufferSource();s.buffer=noiseBuf();const f=c.createBiquadFilter();f.type="highpass";f.frequency.value=7000;const g=c.createGain();env(g,t,.003,v,.06);s.connect(f).connect(g).connect(M.bus);s.start(t,Math.random());s.stop(t+.08)}
function lead(th,n,t,d){const v=th.lv;switch(th.lead){
 case "accordion":tone(n,t,d,"sawtooth",v,{lp:1800,detune:[-8,8],a:.02});break;
 case "bell":tone(n,t,d*2.5,"sine",v,{wet:1,a:.005});tone(n+12,t,d,"sine",v*.25,{wet:1,a:.005});break;
 case "sax":tone(n,t,d,"sawtooth",v,{lp:1300,q:2,vib:6,a:.06,wet:1});break;
 default:tone(n,t,d,th.lead,v,{wet:1})}}
/* Melodie pro Thema einmal würfeln (wiederholt sich, variiert leicht) */
function phrase(name,th){if(M.phrase[name])return M.phrase[name];let seed=name.length*97+13;const rnd=()=>(seed=(seed*1103515245+12345)%2147483648)/2147483648;
 const sc=[];for(const o of [12,24])th.scale.forEach(s=>sc.push(th.key+o-12+s));let idx=Math.floor(sc.length/2);const bars=[];
 for(let b=0;b<4;b++){const bar=[];for(let s=0;s<8;s++){if(th.rh[b][s]!=="x"){bar.push(null);continue}idx=Math.max(0,Math.min(sc.length-1,idx+Math.round((rnd()-.5)*4)));bar.push(sc[idx])}bars.push(bar)}
 return M.phrase[name]=bars}
function schedule(){const c=M.ctx,th=TH[M.theme];if(!th)return;const sp=60/th.bpm/2;
 while(M.next<c.currentTime+.15){const t=M.next,bar=Math.floor(M.step/8)%4,s=M.step%8,cycle=Math.floor(M.step/32);const[root,q]=th.prog[bar];const chord=CH[q];
  if(th.walk){if(s%2===0){const beat=s/2;const nxt=th.prog[(bar+1)%4][0];const ln=[root,root+chord[1],root+7,nxt-1][beat];tone(ln-12,t,sp*1.8,"triangle",.09,{lp:900,a:.005})}}
  else if(th.bass[s]!=="."){const n=th.bass[s]==="f"?root+7:root;tone(n-12,t,sp*1.6,"triangle",.09,{a:.005})}
  if(th.stab&&th.stab[s]==="x")chord.forEach(iv=>tone(root+iv,t,sp*.7,"square",.012,{lp:2000}));
  if(th.pad&&s===0)chord.forEach(iv=>tone(root+iv+12,t,sp*7.5,"sine",.018,{a:.4,wet:1}));
  if(th.hat&&(s===2||s===6))hat(t,.02);if(th.hat&&s===7&&Math.random()<.3)hat(t,.012);
  const mel=phrase(M.theme,th)[bar][s];if(mel&&!(cycle%2===1&&bar===3&&s>3)){const n=cycle%3===2&&mel<th.key+24?mel+(Math.random()<.5?0:2):mel;lead(th,n,t,sp*(th.lead==="sax"?1.8:1.2))}
  M.next+=sp;M.step++}
 if(th.gulls&&Math.random()<.004)gull(c.currentTime+.05);
 if(M.theme==="swamp"&&Math.random()<.006)frog(c.currentTime+.05)}
function gull(t){const c=M.ctx,o=c.createOscillator(),g=c.createGain();o.type="sine";o.frequency.setValueAtTime(1900,t);o.frequency.exponentialRampToValueAtTime(1100,t+.25);o.frequency.setValueAtTime(1800,t+.3);o.frequency.exponentialRampToValueAtTime(1000,t+.6);env(g,t,.02,.025,.65);o.connect(g).connect(M.amb);o.start(t);o.stop(t+.7)}
function frog(t){const c=M.ctx;for(let i=0;i<2;i++){const o=c.createOscillator(),g=c.createGain(),f=c.createBiquadFilter();o.type="square";o.frequency.value=95-i*12;f.type="lowpass";f.frequency.value=500;env(g,t+i*.18,.01,.05,.14);o.connect(f).connect(g).connect(M.amb);o.start(t+i*.18);o.stop(t+i*.18+.16)}}
function setAmbient(kind){M.ambNodes.forEach(n=>{try{n.stop()}catch(e){}});M.ambNodes=[];if(!kind||!M.ctx)return;const c=M.ctx;
 const src=c.createBufferSource();src.buffer=noiseBuf();src.loop=true;const f=c.createBiquadFilter(),g=c.createGain();
 if(kind==="waves"){f.type="lowpass";f.frequency.value=520;g.gain.value=.05;const l=c.createOscillator(),lg=c.createGain();l.frequency.value=.09;lg.gain.value=.04;l.connect(lg).connect(g.gain);l.start();M.ambNodes.push(l)}
 else if(kind==="rain"){f.type="bandpass";f.frequency.value=2600;f.Q.value=.4;g.gain.value=.045}
 else if(kind==="swamp"){f.type="lowpass";f.frequency.value=260;g.gain.value=.06}
 else if(kind==="murmur"){f.type="bandpass";f.frequency.value=420;f.Q.value=1.2;g.gain.value=.035;const l=c.createOscillator(),lg=c.createGain();l.frequency.value=.7;lg.gain.value=.015;l.connect(lg).connect(g.gain);l.start();M.ambNodes.push(l)}
 src.connect(f).connect(g).connect(M.amb);src.start();M.ambNodes.push(src)}
function fade(node,to,dur){const t=M.ctx.currentTime;node.gain.cancelScheduledValues(t);node.gain.setValueAtTime(node.gain.value,t);node.gain.linearRampToValueAtTime(to,t+dur)}
function start(){if(!ctx())return;M.on=true;if(!M.timer)M.timer=setInterval(schedule,30);M.next=M.ctx.currentTime+.08;if(M.want)apply(M.want,true);fade(M.bus,.9,1.2);fade(M.amb,1,1.5);emit()}
function stop(){M.on=false;if(!M.ctx)return;fade(M.bus,0,.6);fade(M.amb,0,.6);setTimeout(()=>{if(!M.on){clearInterval(M.timer);M.timer=null;setAmbient(null)}},700);emit()}
function apply(name,force){if(!M.ctx||(!force&&name===M.theme))return;const th=TH[name];if(!th)return;M.theme=name;M.step=0;M.next=M.ctx.currentTime+.1;setAmbient(th.amb)}
function setTheme(name){M.want=name;if(M.on)apply(name)}
const subs=[];function emit(){subs.forEach(f=>{try{f(M.on)}catch(e){}})}
function toggle(){pref.music=!M.on;try{localStorage.setItem(PREF,JSON.stringify(pref))}catch(e){}M.on?stop():start()}
/* Musik startet erst nach der ersten Nutzeraktion (Browser-Regel) */
function arm(){const go=e=>{if(e&&e.target&&e.target.closest&&e.target.closest("[data-music]"))return;removeEventListener("pointerdown",go,true);removeEventListener("keydown",go,true);if(pref.music&&!M.on)start()};addEventListener("pointerdown",go,true);addEventListener("keydown",go,true)}
document.addEventListener("visibilitychange",()=>{if(!M.ctx)return;if(document.hidden)M.ctx.suspend();else if(M.on)M.ctx.resume()});
window.LLMusic={setTheme,start,stop,toggle,isOn:()=>M.on,wanted:()=>pref.music,onChange:f=>subs.push(f),arm};
})();
