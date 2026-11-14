/* One Face - desktop layout: left menu + right rail on wide screens only (phones unchanged) */
(function(){
const css=`@media(min-width:1300px){
:root{--rw:340px;--cw:700px}
#app{padding-right:var(--rw)}
body:has(#tabs[hidden]) #app{padding-right:0}
#top{padding-left:max(14px,calc((100vw - var(--sbw) - var(--rw) - var(--cw))/2 + 10px));padding-right:max(14px,calc((100vw - var(--sbw) - var(--rw) - var(--cw))/2 + 10px))}
body:has(#tabs[hidden]) #top{padding-left:max(14px,calc((100vw - var(--cw))/2 + 10px));padding-right:max(14px,calc((100vw - var(--cw))/2 + 10px))}
.cbar,.typ{left:calc(var(--sbw) + (100vw - var(--sbw) - var(--rw))/2)}
body:has(#tabs[hidden]) .cbar,body:has(#tabs[hidden]) .typ{left:50%}
#toast{left:calc(var(--sbw) + (100vw - var(--sbw) - var(--rw))/2)}
#dr{position:fixed;top:0;bottom:0;right:0;width:var(--rw);overflow-y:auto;padding:14px 16px 24px;scrollbar-width:thin;border-left:1px solid var(--line);background:var(--bg);z-index:5}
body:has(#tabs[hidden]) #dr{display:none}
#dr .card{margin:0 0 12px}#dr h4{margin:0 0 8px;font-size:15px}
#dr a.drow{display:flex;align-items:center;gap:10px;padding:6px 0;color:var(--ink)}#dr a.drow small{display:block;color:var(--mut)}
}
@media(max-width:1299px){#dr{display:none!important}}`;
const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
const wide=()=>matchMedia('(min-width:1300px)').matches;
let dr,busy=false,lastR=0;
function mk(){if(dr)return;dr=document.createElement('aside');dr.id='dr';dr.setAttribute('aria-label','Highlights');document.body.appendChild(dr)}
async function right(){
 if(busy||document.hidden)return;busy=true;
 try{let h='';
  try{if(typeof liveStrip=='function')h+=await liveStrip()}catch(e){}
  try{const fr=await myFriends();const t=new Date(),k=(t.getMonth()+1)*100+t.getDate();const b=fr.filter(p=>p.birthday&&((+p.birthday.slice(5,7))*100+(+p.birthday.slice(8,10)))==k);
   if(b.length)h+='<a class="card pad bday" href="#/birthdays"><span class="big">🎂</span><div><b>'+esc(b.map(x=>x.full_name.split(' ')[0]).join(', '))+(b.length>1?' have':' has')+' a birthday today</b><small>Tap to send wishes</small></div></a>';
   if(fr.length)h+='<div class="card pad"><h4>Friends</h4>'+fr.slice(0,10).map(p=>'<a class="drow" href="#/profile/'+p.id+'">'+av(p,34)+'<b>'+esc(p.full_name)+'</b></a>').join('')+(fr.length>10?'<a class="drow" href="#/friends?tab=all"><small>See all friends</small></a>':'')+'</div>'}catch(e){}
  if(window.OF_ADS_RAIL)try{h+=await window.OF_ADS_RAIL()}catch(e){}
  dr.innerHTML=h}catch(e){}finally{busy=false}}
function upd(){
 const on=wide()&&S&&S.user&&!(S.route&&S.route.name&&/^(welcome|login|signup|reset|verify)/.test(S.route.name));
 if(!on){if(dr)dr.hidden=true;return}
 mk();dr.hidden=false;
 if(Date.now()-lastR>8000){lastR=Date.now();right()}}
window.addEventListener('hashchange',()=>setTimeout(upd,200));window.addEventListener('resize',upd);
setInterval(upd,3000);setTimeout(upd,1500);
})();
