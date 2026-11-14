/* ===== One Face 3.2: loud message alert, flashing, ringtone, badge ===== */
(function(){
const g=k=>{try{return localStorage.getItem(k)}catch(e){return null}},s=(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}};
const on=()=>g('of_loud')!=='0';
let ctx=null;
function unlock(){try{if(!ctx){const A=window.AudioContext||window.webkitAudioContext;if(!A)return;ctx=new A()}if(ctx.state=='suspended')ctx.resume()}catch(e){}}
['touchstart','click','keydown'].forEach(e=>addEventListener(e,unlock,{passive:true}));
function beep(t,f,d,v){const o=ctx.createOscillator(),gn=ctx.createGain();o.type='square';o.frequency.value=f;gn.gain.setValueAtTime(0.0001,t);gn.gain.exponentialRampToValueAtTime(v,t+0.01);gn.gain.setValueAtTime(v,t+d-0.03);gn.gain.exponentialRampToValueAtTime(0.0001,t+d);o.connect(gn);gn.connect(ctx.destination);o.start(t);o.stop(t+d+0.02)}
function sound(n){try{unlock();if(!ctx)return;const t=ctx.currentTime+0.02;for(let i=0;i<n;i++){beep(t+i*0.42,1320,0.16,0.9);beep(t+i*0.42+0.2,990,0.16,0.9)}}catch(e){}}
const st=document.createElement('style');
st.textContent='#flash{position:fixed;inset:0;z-index:99;pointer-events:none;background:#fff;opacity:0}#flash.go{animation:ofl .22s steps(1) 6}@keyframes ofl{0%{opacity:.9;background:#fff}50%{opacity:.9;background:#D6A654}100%{opacity:0}}';
document.head.appendChild(st);
function flash(){try{let f=document.getElementById('flash');if(!f){f=document.createElement('div');f.id='flash';document.body.appendChild(f)}f.className='';void f.offsetWidth;f.className='go';setTimeout(()=>f.className='',1500)}catch(e){}}
let tt=null,orig=document.title;
function titleFlash(m){if(!document.hidden)return;clearInterval(tt);let k=0;tt=setInterval(()=>{document.title=(k++%2)?orig:'💬 '+m;if(!document.hidden){clearInterval(tt);document.title=orig}},800)}
addEventListener('visibilitychange',()=>{if(!document.hidden){clearInterval(tt);document.title=orig;clearBadge()}});
function clearBadge(){try{navigator.clearAppBadge&&navigator.clearAppBadge()}catch(e){}try{navigator.serviceWorker&&navigator.serviceWorker.getRegistration().then(r=>{try{r&&typeof r.getNotifications=='function'&&r.getNotifications().then(l=>l.forEach(n=>n.close())).catch(()=>{})}catch(e){}})}catch(e){}}
clearBadge();
window.OF_alert=function(m){if(!on())return;sound(3);flash();try{navigator.vibrate&&navigator.vibrate([400,150,400,150,400,150,800])}catch(e){}titleFlash(m||'New message')};
window.OF_ding=function(){if(!on())return;sound(1);try{navigator.vibrate&&navigator.vibrate([200,100,200])}catch(e){}};
if(typeof chatAdd=='function'){const oc=chatAdd;chatAdd=function(m){try{if(m&&!document.querySelector('.msg[data-id="'+m.id+'"]')&&typeof S!='undefined'&&S.user&&m.sender_id!=S.user.id)OF_ding()}catch(e){}return oc.apply(this,arguments)}}
/* message toast -> alert */
const ot=window.toast;window.toast=function(m){try{if(typeof m=='string'&&m.indexOf('💬 ')==0)OF_alert(m.slice(3,40))}catch(e){}return ot.apply(this,arguments)};
/* ringtone for incoming calls */
let ring=null;
function ringStart(){if(ring||!on())return;const go=()=>{sound(2);try{navigator.vibrate&&navigator.vibrate([600,300,600])}catch(e){}};go();ring=setInterval(go,2200)}
function ringStop(){clearInterval(ring);ring=null;try{navigator.vibrate&&navigator.vibrate(0)}catch(e){}}
window.OF_ring={start:ringStart,stop:ringStop};
if(typeof showIncoming=='function'){const o=showIncoming;showIncoming=async function(r){const busy=!!window.CALL||(typeof CALL!='undefined'&&CALL);const x=o.apply(this,arguments);if(!busy)ringStart();return x}}
if(typeof endCallUI=='function'){const o=endCallUI;endCallUI=function(){ringStop();return o.apply(this,arguments)}}

/* ===== keep live: backup refresh, reconnect on resume, stay awake, badge number ===== */
let lastAl=0;const oa=window.OF_alert;window.OF_alert=function(m){if(Date.now()-lastAl<4000)return;lastAl=Date.now();return oa(m)};
const SIGNED=()=>typeof S!='undefined'&&S.user&&typeof DEMO!='undefined'&&!DEMO;
/* badge number + alert when poll sees a new unread chat */
if(typeof badges=='function'){const ob=badges;let first=true;badges=async function(){const pm=S.nM||0;let r;try{r=await ob.apply(this,arguments)}catch(e){console.error(e)}
  try{if(!first&&(S.nM||0)>pm&&!(S.route&&S.route.name=='chat'))OF_alert('New message');first=false;const n=(S.nM||0)+(S.nN||0);if(document.hidden===false){if(n&&navigator.setAppBadge)navigator.setAppBadge(n);else if(!n&&navigator.clearAppBadge)navigator.clearAppBadge();try{navigator.serviceWorker.controller&&navigator.serviceWorker.controller.postMessage({t:'badge',n:n})}catch(e){}}}catch(e){}return r}}
/* backup refresh: every 4 s while open */
let busy=false;
async function pollChat(){if(busy||!SIGNED()||document.hidden)return;busy=true;try{
  if(S.route&&S.route.name=='chat'&&typeof CH!='undefined'&&CH&&CH.id){const{data}=await SB.from('messages').select('*').eq('conversation_id',CH.id).order('created_at',{ascending:false}).limit(30);
   (data||[]).reverse().forEach(m=>{const row=document.querySelector('.msg[data-id="'+m.id+'"]');if(!row)chatAdd(m);else if(m.deleted_at&&row.dataset.del!='1'&&window.chatUpd)chatUpd(m)})}
  }catch(e){}busy=false}
let tick=0;setInterval(()=>{if(!SIGNED()||document.hidden)return;pollChat();if(++tick%2==0){badges();try{if(S.route&&S.route.name=='messages'&&!document.querySelector('#sheet')&&!(document.activeElement&&/INPUT|TEXTAREA/.test(document.activeElement.tagName)))R.messages()}catch(e){}}},4000);
/* resume: phones freeze connections in the background */
let hiddenAt=0;
addEventListener('visibilitychange',()=>{if(document.hidden){hiddenAt=Date.now();return}if(!SIGNED())return;if(Date.now()-hiddenAt>15000){try{live()}catch(e){}}badges();pollChat();wake()});
addEventListener('online',()=>{if(SIGNED()){try{live()}catch(e){}badges()}});
/* stay awake while the app is open */
let wl=null;
async function wake(){try{if(g('of_awake')==='0'||!navigator.wakeLock||document.hidden||!SIGNED()||wl)return;wl=await navigator.wakeLock.request('screen');wl.addEventListener('release',()=>{wl=null})}catch(e){wl=null}}
setInterval(wake,20000);setTimeout(wake,3000);addEventListener('pointerup',wake,{passive:true});
window.OF_wake=()=>{if(g('of_awake')==='0'){try{wl&&wl.release()}catch(e){}wl=null}else wake()};

/* setting switch in Notifications */
if(typeof R!='undefined'&&R.notifsettings){const o=R.notifsettings;R.notifsettings=async function(){const r=await o.apply(this,arguments);try{const m=document.getElementById('main');if(m&&!m.querySelector('#loud')){const d=document.createElement('div');d.className='card pad';d.innerHTML='<label class="sw"><div class="grow"><b>Loud beep and flashing</b><small class="muted" style="display:block">When a message or call arrives while the app is open</small></div><input type="checkbox" id="loud"'+(on()?' checked':'')+'></label><button class="btn" id="ltest" style="margin-top:10px">Test the alert</button><label class="sw" style="margin-top:12px"><div class="grow"><b>Keep screen on</b><small class="muted" style="display:block">Stops the phone sleeping while One Face is open</small></div><input type="checkbox" id="awk"'+(g('of_awake')!=='0'?' checked':'')+'></label>';m.prepend(d);d.querySelector('#awk').onchange=e=>{s('of_awake',e.target.checked?'1':'0');OF_wake()};d.querySelector('#loud').onchange=e=>s('of_loud',e.target.checked?'1':'0');d.querySelector('#ltest').onclick=()=>{const w=g('of_loud');s('of_loud','1');OF_alert('Test');if(w!==null)s('of_loud',w)}}}catch(e){}return r}}

/* ===== connection check: Menu > Settings > Notifications > Connection check, or #/diag ===== */
(function(){
const R_=window.R||R;
R_.diag=async()=>{tbar({title:'Connection check'});view('<div class="pad"><pre id="dg" style="white-space:pre-wrap;font:14px/1.5 ui-monospace,monospace;word-break:break-word">Running…</pre><button class="btn pri big" id="dgr">Run again</button></div>');
 const out=[];const L=t=>{out.push(t);const e=document.getElementById('dg');if(e)e.textContent=out.join('\n')};
 const run=async()=>{out.length=0;L('App version: '+window.OF_BUILD);L('App check '+new Date().toLocaleTimeString());
  L('Logged in: '+(S.user?'yes':'NO'));
  try{const{data:g,error:ge}=await SB.auth.getSession();L('Login pass: '+(g&&g.session?'valid until '+new Date(g.session.expires_at*1000).toLocaleTimeString():'NONE'+(ge?' - '+ge.message:'')));
   const rr=await SB.auth.refreshSession();L('Renew login pass: '+(rr&&rr.data&&rr.data.session?'OK':'FAILED - '+((rr&&rr.error&&rr.error.message)||'unknown')));
   const t0=Date.now();const q=await SB.from('profiles').select('id').limit(1);L('Database read: '+(q.error?'FAILED - '+q.error.message:'OK ('+(Date.now()-t0)+' ms)'));
   const mq=await SB.from('messages').select('id').limit(1);L('Messages read: '+(mq.error?'FAILED - '+mq.error.message:'OK'))}catch(e){L('Login/database test error: '+String(e&&e.message||e))}L('Secure page: '+(window.isSecureContext?'yes':'NO'));
  try{const r=SB.realtime;L('Live socket connected: '+(r&&r.isConnected&&r.isConnected()?'yes':'no'))}catch(e){}
  const mk=(name,cfg,extra)=>new Promise(res=>{let done=false;const ch=SB.channel(name,cfg);if(extra)extra(ch);ch.subscribe((st,err)=>{if(done)return;if(st=='SUBSCRIBED'){done=true;res({ch,st})}else if(st=='CHANNEL_ERROR'||st=='TIMED_OUT'||st=='CLOSED'){done=true;res({ch,st,err:err&&err.message})}});setTimeout(()=>{if(!done){done=true;res({ch,st:'NO ANSWER (10s)'})}},10000)});
  let got=false;const a=await mk('diag-a-'+Math.random().toString(36).slice(2),{config:{broadcast:{self:true}}},c=>c.on('broadcast',{event:'t'},()=>{got=true}));
  L('Live channel (calls/typing): '+a.st+(a.err?' - '+a.err:''));
  if(a.st=='SUBSCRIBED'){a.ch.send({type:'broadcast',event:'t',payload:{}});await new Promise(r=>setTimeout(r,1500));L('Live message round trip: '+(got?'OK':'FAILED'))}
  const b=await mk('diag-b-'+Math.random().toString(36).slice(2),{},c=>c.on('postgres_changes',{event:'INSERT',schema:'public',table:'messages'},()=>{}));
  L('Live chat feed (messages): '+b.st+(b.err?' - '+b.err:''));
  try{SB.removeChannel(a.ch);SB.removeChannel(b.ch)}catch(e){}
  try{(S.chans||[]).forEach((c,i)=>L('  channel '+(i+1)+': '+(c.state||'?')))}catch(e){}
  try{const m=await navigator.permissions.query({name:'microphone'});L('Microphone permission: '+m.state)}catch(e){L('Microphone permission: cannot read')}
  L('Calls supported: '+(window.RTCPeerConnection?'yes':'NO'));
  if(window.RTCPeerConnection){const t=new Set();await new Promise(res=>{const pc=new RTCPeerConnection(ICE());pc.createDataChannel('x');pc.onicecandidate=e=>{if(e.candidate)t.add(e.candidate.type)};pc.createOffer().then(o=>pc.setLocalDescription(o));setTimeout(()=>{pc.close();res()},4500)});
   L('Call route types found: '+([...t].join(', ')||'NONE')+(t.has('relay')?'':'  (no relay: calls over mobile data may fail)'))}
  L('Done.')};
 document.getElementById('dgr').onclick=run;run()};
const o=R_.notifsettings;if(o){R_.notifsettings=async function(){const r=await o.apply(this,arguments);try{const m=document.getElementById('main');if(m&&!m.querySelector('#dgb')){const b=document.createElement('a');b.id='dgb';b.className='btn';b.href='#/diag';b.style.cssText='display:block;margin:12px;text-align:center';b.textContent='Connection check';m.appendChild(b)}}catch(e){}return r}}
})();

/* ===== Create post: writing area fills the screen, small tool buttons sit at the very bottom ===== */
(function(){const st=document.createElement('style');st.textContent=
'.pad:has(#tx){display:flex;flex-direction:column;min-height:calc(100vh - var(--topbar) - 16px);min-height:calc(100dvh - var(--topbar) - 16px);padding-bottom:0}'+
'.pad:has(#tx) #tx{order:1;flex:1 1 auto;min-height:30vh;border:0!important;box-shadow:none!important;outline:0;background:transparent!important;font-size:20px;line-height:1.35;resize:none;padding:10px 2px}'+
'.pad:has(#tx) #sug{order:2}.pad:has(#tx) #ext{order:3}.pad:has(#tx) #pv{order:4}'+
'.pad:has(#tx) #hint{order:5;text-align:center;margin:6px 0}.pad:has(#tx) #er{order:6}'+
'.pad:has(#tx) .tools{order:7;position:sticky;bottom:0;margin:0 -14px;padding:10px 14px max(12px,env(safe-area-inset-bottom));background:var(--bg);border-top:1px solid var(--line);flex-wrap:wrap;gap:8px}';
document.head.appendChild(st)})();

/* ===== login guard + version label ===== */
window.OF_BUILD='5.0 build 1114-1453';
(function(){
const bad=m=>/refresh token|invalid|expired|jwt|not found|revoked/i.test(m||'')&&!/fetch|network|load failed|timeout/i.test(m||'');
let checking=false;
async function authGuard(){if(checking||!SIGNED()||document.hidden)return;checking=true;try{
  const{data,error}=await SB.auth.getSession();
  if(!data||!data.session){let ok=false,msg=error&&error.message||'';try{const r=await SB.auth.refreshSession();ok=!!(r&&r.data&&r.data.session);if(!ok)msg=(r&&r.error&&r.error.message)||msg}catch(e){msg=String(e&&e.message||e)}
   if(!ok&&bad(msg)){toast('Your login expired. Please log in again.');try{await SB.auth.signOut()}catch(e){}location.hash='#/login'}}
 }catch(e){}checking=false}
setInterval(authGuard,45000);addEventListener('visibilitychange',()=>{if(!document.hidden)setTimeout(authGuard,1500)});
if(typeof R!='undefined'&&R.menu){const om=R.menu;R.menu=async function(){const r=await om.apply(this,arguments);try{const m=document.getElementById('main');if(m&&!m.querySelector('#bld')){const p=document.createElement('p');p.id='bld';p.className='muted center sm';p.style.margin='16px 0 24px';p.textContent='One Face '+window.OF_BUILD;m.appendChild(p)}}catch(e){}return r}}
})();
})();
