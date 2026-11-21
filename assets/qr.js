/* QR-Code-Erzeuger ohne fremde Bibliothek (Byte-Modus, Fehlerkorrektur M, Version 1–40).
   Nach dem Verfahren aus ISO/IEC 18004, angelehnt an die Referenzimplementierung von Project Nayuki (MIT).
   Nutzung: const q=LLQR.encode("https://…"); q.size, q.get(x,y) → true = dunkel;
            LLQR.draw(canvas,text,{scale,margin}) zeichnet schwarz auf weiß. */
(function(){
"use strict";
const ECC=[-1,10,16,26,18,24,16,18,22,22,26,30,22,22,24,24,28,28,26,26,26,26,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28];
const BLK=[-1,1,1,1,2,2,4,4,4,5,5,5,8,9,9,10,10,11,13,14,16,17,17,18,20,21,23,25,26,28,29,31,33,35,37,38,40,43,45,47,49];
const bit=(x,i)=>((x>>>i)&1)!==0;
function rawModules(v){let r=(16*v+128)*v+64;if(v>=2){const n=Math.floor(v/7)+2;r-=(25*n-10)*n-55;if(v>=7)r-=36}return r}
function dataCodewords(v){return Math.floor(rawModules(v)/8)-ECC[v]*BLK[v]}
function mul(x,y){let z=0;for(let i=7;i>=0;i--){z=(z<<1)^((z>>>7)*0x11D);z^=((y>>>i)&1)*x}return z&255}
function divisor(d){const r=new Array(d).fill(0);r[d-1]=1;let root=1;for(let i=0;i<d;i++){for(let j=0;j<d;j++){r[j]=mul(r[j],root);if(j+1<d)r[j]^=r[j+1]}root=mul(root,2)}return r}
function remainder(data,div){const r=div.map(()=>0);for(const b of data){const f=b^r.shift();r.push(0);div.forEach((c,i)=>{r[i]^=mul(c,f)})}return r}
function alignPos(v){if(v===1)return[];const n=Math.floor(v/7)+2,size=v*4+17,step=v===32?26:Math.ceil((v*4+4)/(n*2-2))*2,r=[6];for(let p=size-7;r.length<n;p-=step)r.splice(1,0,p);return r}

function encode(text){
 const bytes=Array.from(new TextEncoder().encode(String(text)));
 let v=1;for(;v<=40;v++){const cc=v<10?8:16;if(bytes.length<(1<<cc)&&4+cc+8*bytes.length<=dataCodewords(v)*8)break}
 if(v>40)throw new Error("Text zu lang für einen QR-Code");
 // Datenbits
 const bb=[],put=(val,len)=>{for(let i=len-1;i>=0;i--)bb.push((val>>>i)&1)};
 put(4,4);put(bytes.length,v<10?8:16);bytes.forEach(b=>put(b,8));
 const cap=dataCodewords(v)*8;put(0,Math.min(4,cap-bb.length));put(0,(8-bb.length%8)%8);
 for(let p=0xEC;bb.length<cap;p^=0xEC^0x11)put(p,8);
 const data=[];for(let i=0;i<bb.length;i+=8){let b=0;for(let j=0;j<8;j++)b=(b<<1)|bb[i+j];data.push(b)}
 // Fehlerkorrektur und Verschränkung
 const nb=BLK[v],ec=ECC[v],raw=Math.floor(rawModules(v)/8),nShort=nb-raw%nb,shortLen=Math.floor(raw/nb),div=divisor(ec),blocks=[];
 for(let i=0,k=0;i<nb;i++){const d=data.slice(k,k+shortLen-ec+(i<nShort?0:1));k+=d.length;const e=remainder(d,div);if(i<nShort)d.push(0);blocks.push(d.concat(e))}
 const cw=[];for(let i=0;i<blocks[0].length;i++)blocks.forEach((b,j)=>{if(i!==shortLen-ec||j>=nShort)cw.push(b[i])});
 // Matrix
 const size=v*4+17,M=[],F=[];for(let y=0;y<size;y++){M.push(new Array(size).fill(false));F.push(new Array(size).fill(false))}
 const setF=(x,y,d)=>{M[y][x]=d;F[y][x]=true};
 for(let i=0;i<size;i++){setF(6,i,i%2===0);setF(i,6,i%2===0)}
 [[3,3],[size-4,3],[3,size-4]].forEach(([x,y])=>{for(let dy=-4;dy<=4;dy++)for(let dx=-4;dx<=4;dx++){const d=Math.max(Math.abs(dx),Math.abs(dy)),xx=x+dx,yy=y+dy;if(xx>=0&&xx<size&&yy>=0&&yy<size)setF(xx,yy,d!==2&&d!==4)}});
 const ap=alignPos(v),na=ap.length;
 for(let i=0;i<na;i++)for(let j=0;j<na;j++){if((i===0&&j===0)||(i===0&&j===na-1)||(i===na-1&&j===0))continue;
  for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++)setF(ap[i]+dx,ap[j]+dy,Math.max(Math.abs(dx),Math.abs(dy))!==1)}
 function format(mask){const d=(0<<3)|mask;let r=d;for(let i=0;i<10;i++)r=(r<<1)^((r>>>9)*0x537);const b=((d<<10)|r)^0x5412;
  for(let i=0;i<=5;i++)setF(8,i,bit(b,i));setF(8,7,bit(b,6));setF(8,8,bit(b,7));setF(7,8,bit(b,8));for(let i=9;i<15;i++)setF(14-i,8,bit(b,i));
  for(let i=0;i<8;i++)setF(size-1-i,8,bit(b,i));for(let i=8;i<15;i++)setF(8,size-15+i,bit(b,i));setF(8,size-8,true)}
 format(0);
 if(v>=7){let r=v;for(let i=0;i<12;i++)r=(r<<1)^((r>>>11)*0x1F25);const b=(v<<12)|r;for(let i=0;i<18;i++){const t=bit(b,i),a=size-11+i%3,c=Math.floor(i/3);setF(a,c,t);setF(c,a,t)}}
 let i=0;for(let right=size-1;right>=1;right-=2){if(right===6)right=5;for(let vert=0;vert<size;vert++)for(let j=0;j<2;j++){const x=right-j,up=((right+1)&2)===0,y=up?size-1-vert:vert;
  if(!F[y][x]&&i<cw.length*8){M[y][x]=bit(cw[i>>>3],7-(i&7));i++}}}
 const MASKS=[(x,y)=>(x+y)%2===0,(x,y)=>y%2===0,(x)=>x%3===0,(x,y)=>(x+y)%3===0,(x,y)=>(Math.floor(x/3)+Math.floor(y/2))%2===0,(x,y)=>x*y%2+x*y%3===0,(x,y)=>(x*y%2+x*y%3)%2===0,(x,y)=>((x+y)%2+x*y%3)%2===0];
 const apply=m=>{for(let y=0;y<size;y++)for(let x=0;x<size;x++)if(!F[y][x]&&MASKS[m](x,y))M[y][x]=!M[y][x]};
 // vereinfachte Bewertung: Läufe, 2x2-Blöcke, Hell/Dunkel-Balance (jede Maske ist gültig, dies wählt nur eine gut lesbare)
 function penalty(){let p=0,dark=0;for(let y=0;y<size;y++){let rx=1,ry=1;for(let x=0;x<size;x++){if(M[y][x])dark++;
   if(x>0){if(M[y][x]===M[y][x-1]){rx++;if(rx===5)p+=3;else if(rx>5)p++}else rx=1;if(M[x][y]===M[x-1][y]){ry++;if(ry===5)p+=3;else if(ry>5)p++}else ry=1}
   if(x>0&&y>0){const c=M[y][x];if(c===M[y][x-1]&&c===M[y-1][x]&&c===M[y-1][x-1])p+=3}}}
  return p+Math.floor(Math.abs(dark*20-size*size*10)/(size*size))*10}
 let best=0,bp=Infinity;for(let m=0;m<8;m++){apply(m);format(m);const p=penalty();if(p<bp){bp=p;best=m}apply(m)}
 apply(best);format(best);
 return {version:v,size,get:(x,y)=>x>=0&&y>=0&&x<size&&y<size&&M[y][x]}}

function draw(canvas,text,o){o=o||{};const q=encode(text),m=o.margin==null?4:o.margin,s=o.scale||6,n=(q.size+2*m)*s;
 canvas.width=n;canvas.height=n;const c=canvas.getContext("2d");c.fillStyle="#fff";c.fillRect(0,0,n,n);c.fillStyle="#000";
 for(let y=0;y<q.size;y++)for(let x=0;x<q.size;x++)if(q.get(x,y))c.fillRect((x+m)*s,(y+m)*s,s,s);return q}
window.LLQR={encode,draw};
})();
