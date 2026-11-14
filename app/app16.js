/* One Face v3.9: LIVE VIDEO (host streams, everyone can watch and comment). Uses LiveKit; loaded only when someone opens a live. */
(function(){
const LV=window.LV={room:null,id:null,host:false,hostId:null,timers:[],ch:null,ov:null,seen:new Set(),lastT:null,ended:false,closing:false,face:'user'};
const CSS=`.gl-pv{position:relative;width:100%;height:42vh;max-height:340px;border-radius:16px;overflow:hidden;background:#111;display:flex;align-items:center;justify-content:center}.gl-pv video{display:none;width:100%;height:100%;object-fit:cover;transform:scaleX(-1)}.gl-ph{color:#bbb;font-size:14px}
.gl-chk{display:flex;flex-direction:column;gap:8px}.gl-r{display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid var(--line);border-radius:12px;background:var(--card);flex-wrap:wrap}.gl-r small{flex-basis:100%;margin-left:22px;color:var(--mut)}
.gl-d{width:12px;height:12px;border-radius:50%;background:#9aa0a6;flex:none}.gl-r.ok .gl-d{background:#2e9e5b;box-shadow:0 0 0 4px rgba(46,158,91,.18)}.gl-r.bad .gl-d{background:#d32f2f;box-shadow:0 0 0 4px rgba(211,47,47,.18)}.gl-r.ok small{color:#2e9e5b}.gl-r.bad small{color:#d32f2f}
.gl-info{border-radius:12px;background:var(--soft);padding:12px 14px;font-size:14px}.gl-info ul{margin:6px 0 0;padding-left:18px}.gl-info li{margin:3px 0}
.gl-cd{position:fixed;inset:0;z-index:80;background:rgba(0,0,0,.82);color:#fff;display:flex;align-items:center;justify-content:center;text-align:center}.gl-cd .gl-n{font-size:96px;font-weight:800;line-height:1.1;margin:6px 0 16px}
.lv-adm{background:rgba(214,40,40,.85)!important;color:#fff!important;border-radius:10px;padding:6px 10px!important}.lv-adm b{display:block;font-size:11px;letter-spacing:.04em;text-transform:uppercase;margin-bottom:2px;color:#fff!important}.lv-side{position:absolute;right:8px;bottom:14px;z-index:3;display:flex;flex-direction:column;align-items:center;gap:14px}.lv-side button{border:0;background:none;color:#fff;display:flex;flex-direction:column;align-items:center;gap:2px;font-size:12px;font-weight:600;cursor:pointer;text-shadow:0 1px 3px rgba(0,0,0,.8);padding:0}.lv-side button span{font-size:28px;line-height:1;filter:drop-shadow(0 1px 3px rgba(0,0,0,.7))}.lv-side button.on span{filter:drop-shadow(0 0 6px #ff4d6d)}
.lv-fly{position:absolute;right:18px;bottom:90px;font-size:28px;pointer-events:none;z-index:4;animation:lvfly 1.4s ease-out forwards}@keyframes lvfly{to{transform:translate(var(--dx,0),-220px) scale(1.4);opacity:0}}
#liveov .lv-cm{right:64px}.lv-fr{border:1px solid rgba(255,255,255,.55);background:rgba(0,0,0,.25);color:#fff;border-radius:8px;padding:3px 10px;font-size:13px;font-weight:600;cursor:pointer;margin-left:6px}
#liveov{position:fixed;inset:0;z-index:60;background:linear-gradient(160deg,#1F160D,#3a2a14);color:#fff;display:flex;flex-direction:column}
#liveov .lv-top{position:absolute;top:0;left:0;right:0;z-index:5;display:flex;align-items:center;gap:10px;padding:10px 12px 22px;padding-top:max(10px,env(safe-area-inset-top));background:linear-gradient(rgba(0,0,0,.65),transparent);text-shadow:0 1px 3px rgba(0,0,0,.6)}
#liveov .lv-who{flex:1;min-width:0;display:flex;flex-direction:column;line-height:1.2}#liveov .lv-who b{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#liveov .lv-who small{opacity:.8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.lv-badge.ok{background:#2e9e5b}.lv-badge{background:#d32f2f;color:#fff;font-weight:700;font-size:12px;padding:3px 8px;border-radius:8px;letter-spacing:.5px}
.lv-eye{font-size:13px;opacity:.9;white-space:nowrap}
#liveov .lv-stage{flex:1;position:relative;min-height:0;background:#000;display:flex;align-items:center;justify-content:center;overflow:hidden}
#liveov .lv-stage video{width:100%;height:100%;object-fit:cover;background:#000}#liveov .lv-stage video.lv-land{object-fit:contain}#liveov .lv-stage video.lv-mir{transform:scaleX(-1)}
#liveov .lv-wait{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;text-align:center;padding:24px;opacity:.9;pointer-events:none}
#liveov .lv-snd{position:absolute;top:78px;left:50%;transform:translateX(-50%);z-index:2}
#liveov .lv-cm{position:absolute;left:0;right:0;bottom:0;max-height:40%;overflow-y:auto;padding:24px 12px 8px;display:flex;flex-direction:column;gap:5px;background:linear-gradient(transparent,rgba(0,0,0,.6))}
#liveov .lv-cm div{font-size:14px;line-height:1.3;text-shadow:0 1px 2px rgba(0,0,0,.7);word-break:break-word}#liveov .lv-cm b{font-weight:700;margin-right:6px;color:#FBD489}
#liveov .lv-bar{display:flex;gap:8px;align-items:center;padding:8px 12px;padding-bottom:max(8px,env(safe-area-inset-bottom));background:#1F160D}
#liveov .lv-bar input{flex:1;min-width:0;border-radius:22px;border:1px solid rgba(255,255,255,.25);background:rgba(255,255,255,.1);color:#fff;padding:11px 14px;font-size:15px}
#liveov .lv-bar input::placeholder{color:rgba(255,255,255,.6)}
#liveov button.lv-b{border:0;border-radius:50%;width:42px;height:42px;flex:none;background:linear-gradient(135deg,#D6A654,#AB7529);color:#fff;font-size:18px;cursor:pointer}
#liveov button.lv-ib{border:0;border-radius:50%;width:40px;height:40px;flex:none;background:rgba(255,255,255,.14);color:#fff;font-size:17px;cursor:pointer}
#liveov button.lv-end{border:0;border-radius:20px;padding:9px 16px;background:#c62828;color:#fff;font-weight:700;cursor:pointer}
.lv-strip b.lv-h{display:block;margin-bottom:6px}.lv-row{display:flex;align-items:center;gap:10px;padding:6px 0;color:var(--ink)}.lv-row .grow{flex:1;min-width:0}.lv-row small{display:block;color:var(--mut);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.lv-dot{color:#d32f2f;font-weight:700}`;
function css(){if(document.getElementById('livecss'))return;const s=document.createElement('style');s.id='livecss';s.textContent=CSS;document.head.appendChild(s)}
css();
const iso=ms=>new Date(Date.now()-ms).toISOString();
const FRESH=3*60*1000,MAXLIVE=24*3600*1000;
const isFresh=l=>l&&l.status=='live'&&Date.now()-new Date(l.beat_at||l.started_at)<FRESH&&Date.now()-new Date(l.started_at)<MAXLIVE;

function loadLK(){if(typeof DEMO!='undefined'&&DEMO&&window.__OF_FAKE_LK)return Promise.resolve(window.__OF_FAKE_LK);if(window.LivekitClient)return Promise.resolve(window.LivekitClient);if(LV._p)return LV._p;
 const urls=['livekit-client.umd.js','https://cdn.jsdelivr.net/npm/livekit-client@2/dist/livekit-client.umd.js'];
 LV._p=(async()=>{for(const u of urls){try{await new Promise((ok,no)=>{const s=document.createElement('script');s.src=u;s.onload=ok;s.onerror=()=>{s.remove();no()};document.head.appendChild(s)});if(window.LivekitClient)return window.LivekitClient}catch(e){}}
  LV._p=null;throw new Error('Could not load the live video tool. Check your connection and try again.')})();return LV._p}

async function getPass(id){const r=await SB.functions.invoke('live-token',{body:{live_id:id}});
 if(r.error){let m='';try{const j=await r.error.context.json();m=j.error||''}catch(e){}throw new Error(m||'Could not join the live video.')}
 if(r.data&&r.data.error)throw new Error(r.data.error);return r.data}

/* ---------- home: Live now strip + Go live shortcut ---------- */
async function liveStrip(){
 const{data}=await SB.from('lives').select('*').eq('status','live').gt('beat_at',iso(FRESH)).order('started_at',{ascending:false}).limit(8);
 const ls=(data||[]).filter(isFresh);if(!ls.length)return'';await need(ls.map(l=>l.host));
 return '<div class="card pad lv-strip"><b class="lv-h"><span class="lv-dot">●</span> Live now</b>'+ls.map(l=>'<a class="lv-row" href="#/live/'+l.id+'">'+av(P(l.host),40)+'<div class="grow"><b>'+esc(P(l.host).full_name)+'</b><small>'+esc(l.title||'is live')+' · '+ago(l.started_at)+'</small></div><span class="btn sm pri">'+(l.host==S.user.id?'Open':'Watch')+'</span></a>').join('')+'</div>'}
if(typeof homeExtras=='function'){const he=homeExtras;homeExtras=async function(){let h='';try{h=await liveStrip()}catch(e){console.error(e)}return h+await he.apply(this,arguments)}}
/* keep the Live now strip fresh on Home without reloading */
(function(){let busy=false;async function fresh(){if(busy)return;const ex=document.querySelector('#ex');if(!ex||document.hidden)return;busy=true;try{const h=await liveStrip();const e2=document.querySelector('#ex');if(!e2)return;const old=e2.querySelector('.lv-strip');if(h){if(old){const sg=x=>(x.match(/#\/live\/[\w-]+/g)||[]).join();if(sg(old.outerHTML)!==sg(h))old.outerHTML=h}else e2.insertAdjacentHTML('afterbegin',h)}else if(old)old.remove()}catch(e){}finally{busy=false}}
 setInterval(fresh,5000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)fresh()});window.addEventListener('focus',fresh);
 try{if(!DEMO&&SB&&SB.channel)SB.channel('lives-home').on('postgres_changes',{event:'*',schema:'public',table:'lives'},()=>fresh()).subscribe()}catch(e){}})();
if(typeof R!='undefined'&&R.home){const h0=R.home;R.home=async function(){const r=await h0.apply(this,arguments);const q=document.querySelector('.quick');if(q&&!q.querySelector('[href="#/golive"]'))q.insertAdjacentHTML('beforeend','<a href="#/golive">🔴 Live</a>');return r}}

/* ---------- start a live ---------- */
R.golive=async()=>{tbar({title:'Get ready'});css();
 const CK=[['cam','Camera'],['mic','Microphone'],['net','Internet'],['svc','Live video service']];
 view('<div class="pad"><div class="card pad stack gl"><h2>Get ready to go live</h2>'
  +'<div class="gl-pv" id="glpv"><video id="glv" autoplay muted playsinline></video><div class="gl-ph" id="glph">Camera preview</div></div>'
  +'<div class="gl-chk">'+CK.map(c=>'<div class="gl-r" id="gl-'+c[0]+'"><i class="gl-d"></i><b>'+c[1]+'</b><small id="gls-'+c[0]+'">Checking…</small></div>').join('')+'</div>'
  +field('lvt','Title (optional)','text','What is this live about?','maxlength="100"')
  +'<div class="gl-info"><b>Before you go live, please know:</b><ul><li>Everyone on One Face can watch and comment, except people who blocked you.</li><li>Your friends get a notification when you start.</li><li>One Face does not save this video, but anyone watching could record their screen.</li><li>Reported or abusive lives can be ended by our team.</li><li>Nothing starts until you tap the button below.</li></ul></div>'
  +'<p class="err" id="er"></p><button class="btn pri big" id="lvgo" disabled>Checking…</button><button class="btn big" id="lvre" style="display:none">Check again</button></div></div>');
 const set=(k,st,msg)=>{const r=$('#gl-'+k);if(!r)return;r.className='gl-r '+st;$('#gls-'+k).textContent=msg};
 let stream=null,okAll=false,gone=false;
 const stop=()=>{if(stream){stream.getTracks().forEach(t=>t.stop());stream=null}};
 const upd=()=>{const bad=CK.some(c=>!$('#gl-'+c[0])||!$('#gl-'+c[0]).classList.contains('ok'));okAll=!bad;const g=$('#lvgo');if(!g)return;g.disabled=!okAll;g.textContent=okAll?"Okay, I'm ready":'Fix the red items first';const re=$('#lvre');if(re)re.style.display=(okAll||CK.some(c=>$('#gl-'+c[0])&&$('#gl-'+c[0]).classList.contains('wait')))?'none':'';};
 const run=async()=>{CK.forEach(c=>set(c[0],'wait','Checking…'));upd();
  /* internet */
  set('net',navigator.onLine===false?'bad':'ok',navigator.onLine===false?'No internet. Connect to Wi-Fi or mobile data.':'Connected');
  /* camera + microphone */
  if(DEMO){set('cam','ok','Working (sample)');set('mic','ok','Working (sample)');set('svc','ok','Ready (sample)');upd();return}
  if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){set('cam','bad','This browser cannot use the camera. Try Chrome or Safari.');set('mic','bad','Not available');}
  else{stop();let got=false;
   try{stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user'},audio:true});got=true}
   catch(e){try{stream=await navigator.mediaDevices.getUserMedia({video:true});set('mic','bad','Allow the microphone, then tap Check again.')}catch(e2){set('cam','bad','Allow the camera in your browser, then tap Check again.');if(!$('#gl-mic').classList.contains('bad'))set('mic','bad','Allow the microphone, then tap Check again.')}}
   if(stream){const v=$('#glv');if(v){v.srcObject=stream;v.style.display='block';const ph=$('#glph');if(ph)ph.style.display='none'}
    set('cam',stream.getVideoTracks().length?'ok':'bad',stream.getVideoTracks().length?'Working':'No camera found');
    if(got)set('mic',stream.getAudioTracks().length?'ok':'bad',stream.getAudioTracks().length?'Working':'No microphone found')}}
  /* live video service */
  try{const r=await SB.functions.invoke('live-token',{body:{}});const st=r&&r.error&&r.error.context&&r.error.context.status;
   if(!r.error||[400,401,403,410].includes(st))set('svc','ok','Ready');else if(st==503)set('svc','bad','Live video is not set up yet. Tell the One Face team.');else if(st==404)set('svc','bad','Live video is not installed yet. Tell the One Face team.');else set('svc','bad','Cannot reach the live service. Try again.')}
  catch(e){set('svc','bad','Cannot reach the live service. Try again.')}
  upd()};
 $('#lvre').onclick=run;
 const leave=()=>{gone=true;stop()};window.addEventListener('hashchange',leave,{once:true});
 /* countdown, then start (so nothing ever starts by surprise) */
 const countdown=()=>new Promise(res=>{const d=document.createElement('div');d.className='gl-cd';d.innerHTML='<div><small>Going live in</small><div class="gl-n" id="gln">3</div><button class="btn" id="glcx">Cancel</button></div>';document.body.appendChild(d);let n=3,cancelled=false;
  const t=setInterval(()=>{n--;if(n<=0){clearInterval(t);d.remove();res(true)}else $('#gln').textContent=n},1000);
  $('#glcx').onclick=()=>{cancelled=true;clearInterval(t);d.remove();res(false)}});
 $('#lvgo').onclick=async()=>{if(!okAll)return;const b=$('#lvgo');$('#er').textContent='';
  if(!await countdown())return;
  busy(b,1,'Starting…');
  try{stop();
   const{data,error}=await SB.rpc('start_live',{p_title:($('#lvt').value||'').trim()});if(error)throw new Error(error.message);
   location.hash='#/live/'+data}
  catch(e){busy(b,0);b.textContent="Okay, I'm ready";$('#er').textContent=e.message;upd()}};
 await run()};

/* ---------- watch / host screen ---------- */
R.live=async(id)=>{tbar({title:'Live'});view('<div class="pad"><div class="card pad skel">Joining the live video…</div></div>');await openLive(id)};
addEventListener('hashchange',()=>{if(!/^#\/live\//.test(location.hash))closeLive()});

function endedUI(msg){if(LV.ended||!LV.ov)return;LV.ended=true;{const e=LV.ov.querySelector('#lvbd');if(e){e.classList.remove('ok');e.textContent='ENDED'}}const w=LV.ov.querySelector('.lv-wait');w.style.display='flex';w.innerHTML='<div><b>'+esc(msg||'This live video has ended.')+'</b><br><small>Going back…</small></div>';LV.ov.querySelector('.lv-stage video')&&(LV.ov.querySelector('.lv-stage video').style.display='none');setTimeout(()=>{if(/^#\/live\//.test(location.hash))location.replace('#/home');closeLive()},2500)}

function closeLive(){if(LV.closing)return;LV.closing=true;try{LV.timers.forEach(clearInterval);LV.timers=[];if(LV.ch){SB.removeChannel(LV.ch);LV.ch=null}if(LV.room){try{LV.room.disconnect()}catch(e){}LV.room=null}if(LV.ov){LV.ov.remove();LV.ov=null}}catch(e){}
 LV.id=null;LV.closing=false}

async function openLive(id){
 closeLive();css();LV.ready=false;LV.ended=false;LV.seen=new Set();LV.lastT=null;
 const{data:live}=await SB.from('lives').select('*').eq('id',id).maybeSingle();
 if(!isFresh(live)){toast('This live video has ended.');location.replace('#/home');return}
 LV.id=id;LV.hostId=live.host;LV.host=live.host==S.user.id;await need([live.host]);const hp=P(live.host);
 const amAdmin=S.me&&S.me.role=='admin';
 const ov=document.createElement('div');ov.id='liveov';ov.setAttribute('role','dialog');ov.setAttribute('aria-label','Live video');
 ov.innerHTML='<div class="lv-top"><button class="lv-ib" id="lvx" aria-label="Close">✕</button>'+av(hp,36)+'<div class="lv-who"><b>'+esc(hp.full_name)+(LV.host?'':'<button class="lv-fr" id="lvfr" hidden>Add friend</button>')+'</b><small>'+esc(live.title||'Live video')+'</small></div><span class="lv-badge" id="lvbd">CONNECTING</span><span class="lv-eye" id="lvn">👁 0</span><button class="lv-ib" id="lvm" aria-label="More">⋯</button></div>'
  +'<div class="lv-stage" id="lvs"><div class="lv-wait" id="lvw">'+(LV.host?'Starting your camera…':'Waiting for the host…')+'</div><button class="btn sm pri lv-snd" id="lvsnd" hidden>Tap to turn sound on</button><div class="lv-cm" id="lvc"></div><div class="lv-side"><button id="lvlike" aria-label="Like"><span>👍</span><i id="lvlk">0</i></button><button id="lvcm" aria-label="Comments"><span>💬</span><i id="lvcn">0</i></button><button id="lvsh" aria-label="Share"><span>↗</span>Share</button></div></div>'
  +'<div class="lv-bar">'+(LV.host?'<button class="lv-ib" id="lvmic" aria-label="Mute microphone">🎤</button><button class="lv-ib" id="lvflip" aria-label="Flip camera">🔄</button>':'')+'<input id="lvi" placeholder="Say something…" maxlength="300" autocomplete="off" enterkeyhint="send"><button class="lv-b" id="lvsend" aria-label="Send">➤</button>'+(LV.host?'<button class="lv-end" id="lvend">End</button>':'')+'</div>';
 document.body.appendChild(ov);LV.ov=ov;const $o=s=>ov.querySelector(s);

 /* leave / end */
 $o('#lvx').onclick=async()=>{if(LV.host){$o('#lvend').click();return}closeLive();location.replace('#/home')};
 if(LV.host)$o('#lvend').onclick=async()=>{if(!await confirmBox('End your live video?','End live',1))return;await SB.rpc('end_live',{p_id:id});LV.ended=true;{const e=$o('#lvbd');if(e){e.classList.remove('ok');e.textContent='ENDED'}}await new Promise(r=>setTimeout(r,1200));closeLive();toast('Live ended');location.replace('#/home')};
 $o('#lvm').onclick=()=>{const it=[];
  if(LV.host)it.push({t:'End live video',ic:'x',danger:1,f:()=>$o('#lvend').click()});
  else{it.push({t:'Report live video',ic:'comment',danger:1,f:()=>reportSheet('live',id)});
   it.push({t:'Block '+hp.full_name,ic:'lock',danger:1,f:async()=>{await blockUser(live.host);const{data:still}=await SB.from('lives').select('id').eq('id',id).maybeSingle();if(!still){closeLive();location.replace('#/home')}}});
   if(amAdmin){it.push({t:'Message everyone (admin)',ic:'chat',f:async()=>{const t=prompt('Message to everyone watching this live:');if(t&&t.trim()){const{error}=await SB.rpc('admin_live_notice',{p_id:id,p_text:t});toast(error?'Not sent':'Sent to everyone')}}});it.push({t:'End live (admin)',ic:'x',danger:1,f:async()=>{const n=prompt('Reason everyone will see (optional):','');if(n===null)return;await SB.rpc('admin_end_live',{p_id:id,p_note:n||''});toast('Live ended')}})}}
  menuSheet(it)};

 /* comments */
 const box=$o('#lvc');
 const bd=(ok,t)=>{const e=$o('#lvbd');if(!e)return;e.classList.toggle('ok',!!ok);e.textContent=t||(ok?'LIVE':'CONNECTING')};
 /* side buttons: like, comments, share, add friend */
 LV.likes=live.likes||0;LV.cn=0;LV.pend=0;LV.mine=false;
 const lk=()=>{const e=$o('#lvlk');if(e)e.textContent=LV.likes>999?(LV.likes/1000).toFixed(1)+'K':LV.likes};
 const cn=()=>{const e=$o('#lvcn');if(e)e.textContent=LV.cn};
 lk();
 try{SB.from('live_comments').select('id',{count:'exact',head:true}).eq('live_id',id).then(r=>{if(r&&typeof r.count=='number'){LV.cn=r.count;cn()}})}catch(e){}
 LV.cnUp=()=>{LV.cn++;cn()};LV.lkUp=n=>{if(n>LV.likes){LV.likes=n;lk()}};
 $o('#lvlike').onclick=()=>{LV.likes++;LV.pend++;LV.mine=true;$o('#lvlike').classList.add('on');lk();const f=document.createElement('div');f.className='lv-fly';f.textContent=['👍','❤️','🔥','😍'][Math.floor(Math.random()*4)];f.style.setProperty('--dx',(Math.random()*50-25)+'px');$o('#lvs').appendChild(f);setTimeout(()=>f.remove(),1500)};
 LV.timers.push(setInterval(()=>{if(LV.pend>0){const n=LV.pend;LV.pend=0;SB.rpc('live_like',{p_id:id,p_n:n})}},2000));
 $o('#lvcm').onclick=()=>{box.style.display=box.style.display=='none'?'':'none'};
 $o('#lvsh').onclick=()=>{const u=location.origin+location.pathname+'#/live/'+id;if(window.OF_social)OF_social(u,(LV.host?'I am live on One Face':hp.full_name+' is live on One Face'),false);else if(navigator.share)navigator.share({title:'One Face',url:u}).catch(()=>{});else{navigator.clipboard&&navigator.clipboard.writeText(u);toast('Link copied')}};
 if(!LV.host){rel(live.host).then(r=>{const b=$o('#lvfr');if(!b)return;if(!r){b.hidden=false;b.onclick=async()=>{b.disabled=true;const{error}=await SB.from('friendships').insert({requester:S.user.id,addressee:live.host});b.textContent=error?'Try again':'Request sent';if(error)b.disabled=false}}else if(r.status=='pending'&&r.requester==S.user.id){b.hidden=false;b.textContent='Request sent';b.disabled=true}}).catch(()=>{})}

 async function addC(c){if(!c||c.live_id!=LV.id||LV.seen.has(c.id))return;LV.seen.add(c.id);if(LV.cnUp&&LV.ready)LV.cnUp();if(!LV.lastT||c.created_at>LV.lastT)LV.lastT=c.created_at;await need([c.user_id]);if(!LV.ov)return;
  const d=document.createElement('div');d.dataset.id=c.id;d.dataset.u=c.user_id;if(c.is_admin){d.className='lv-adm';d.innerHTML='<b>One Face team</b>'+esc(c.body)}else d.innerHTML='<b>'+esc((P(c.user_id).full_name||'Someone').split(' ')[0])+'</b>'+esc(c.body);box.appendChild(d);box.scrollTop=box.scrollHeight;while(box.children.length>80)box.firstChild.remove()}
 box.onclick=e=>{const d=e.target.closest('div[data-id]');if(!d)return;const mine=d.dataset.u==S.user.id;
  const it=[];const uid=d.dataset.u;
  if(mine||LV.host||amAdmin)it.push({t:'Delete comment',ic:'x',danger:1,f:async()=>{const{error}=await SB.from('live_comments').delete().eq('id',d.dataset.id);if(!error)d.remove()}});
  if(LV.host&&!mine&&!d.classList.contains('lv-adm'))it.push({t:'Block '+(P(uid).full_name||'this person'),ic:'lock',danger:1,f:async()=>{await blockUser(uid);const{data:bk}=await SB.from('blocks').select('blocked').eq('blocker',S.user.id).eq('blocked',uid).maybeSingle();if(bk){box.querySelectorAll('div[data-u="'+uid+'"]').forEach(x=>x.remove());toast('Blocked. They are removed from your live.')}}});
  if(it.length)menuSheet(it)};
 const first=await SB.from('live_comments').select('*').eq('live_id',id).order('created_at',{ascending:false}).limit(40);
 for(const c of (first.data||[]).reverse())await addC(c);LV.ready=true;
 const send=async()=>{const i=$o('#lvi'),t=i.value.trim();if(!t)return;i.value='';const{data,error}=await SB.from('live_comments').insert({live_id:id,user_id:S.user.id,body:t}).select().maybeSingle();if(error){toast(/row-level|policy/i.test(error.message)?'You cannot comment here.':'Not sent');i.value=t;return}if(data)addC(data)};
 $o('#lvsend').onclick=send;$o('#lvi').onkeydown=e=>{if(e.key=='Enter'){e.preventDefault();send()}};
 LV.ch=SB.channel('live-'+id).on('postgres_changes',{event:'INSERT',schema:'public',table:'live_comments',filter:'live_id=eq.'+id},({new:c})=>addC(c)).on('postgres_changes',{event:'UPDATE',schema:'public',table:'lives',filter:'id=eq.'+id},({new:l})=>{if(l&&l.id==id&&LV.lkUp)LV.lkUp(l.likes||0);if(l&&l.id==id&&l.status=='ended')endedUI(l.ended_by=='admin'&&l.end_note?'One Face ended this live: '+l.end_note:l.ended_by=='admin'?'One Face ended this live video.':'This live video has ended.')}).subscribe();
 /* backup poll every 4 s: new comments + is it still live? */
 LV.timers.push(setInterval(async()=>{if(!LV.id||LV.ended)return;try{
   const{data:l}=await SB.from('lives').select('*').eq('id',id).maybeSingle();if(l&&LV.lkUp)LV.lkUp(l.likes||0);if(!l&&!LV.host){endedUI('The host removed you from this live.');return}if(!l||l.status!='live'||(!LV.host&&!isFresh(l))){endedUI(l&&l.ended_by=='admin'&&l.end_note?'One Face ended this live: '+l.end_note:l&&l.ended_by=='admin'?'One Face ended this live video.':'This live video has ended.');return}
   let q=SB.from('live_comments').select('*').eq('live_id',id).order('created_at',{ascending:true}).limit(40);if(LV.lastT)q=q.gt('created_at',LV.lastT);const{data}=await q;for(const c of (data||[]))await addC(c)}catch(e){}},LV.host?5000:10000+Math.floor(Math.random()*4000)));
 if(LV.host)LV.timers.push(setInterval(()=>{SB.rpc('live_beat',{p_id:id})},60000));

 /* video */
 try{
  const LK=await loadLK();const ps=await getPass(id);
  const room=LV.room=new LK.Room({adaptiveStream:true,dynacast:true});const stage=$o('#lvs'),wait=$o('#lvw'),cnt=$o('#lvn');
  const count=()=>{cnt.textContent='👁 '+room.remoteParticipants.size};
  const attach=(track)=>{if(track.kind=='video'){stage.querySelectorAll('video,canvas').forEach(v=>v.remove());const el=track.attach();el.playsInline=true;el.setAttribute('playsinline','');const fit=()=>{if(el.videoWidth&&el.videoHeight)el.classList.toggle('lv-land',el.videoWidth>el.videoHeight*1.05)};el.addEventListener('loadedmetadata',fit);el.addEventListener('resize',fit);fit();stage.insertBefore(el,wait);wait.style.display='none';if(!LV.host)bd(true)}else{stage.querySelectorAll('audio').forEach(v=>v.remove());const el=track.attach();el.style.display='none';stage.appendChild(el)}};
  room.on(LK.RoomEvent.TrackSubscribed,t=>attach(t));
  room.on(LK.RoomEvent.TrackUnsubscribed,t=>{try{t.detach().forEach(e=>e.remove())}catch(e){}if(t.kind=='video'){wait.style.display='flex';wait.textContent='The host paused the video…';bd(false,'PAUSED')}});
  room.on(LK.RoomEvent.ParticipantConnected,count);
  room.on(LK.RoomEvent.ParticipantDisconnected,p=>{count();if(!LV.host&&p.identity==LV.hostId)endedUI('The host left the live video.')});
  if(LK.RoomEvent.Reconnecting)room.on(LK.RoomEvent.Reconnecting,()=>bd(false,'RECONNECTING'));
  if(LK.RoomEvent.Reconnected)room.on(LK.RoomEvent.Reconnected,()=>bd(true));
  room.on(LK.RoomEvent.Disconnected,()=>{if(!LV.closing&&LV.id==id&&!LV.ended)endedUI(LV.host?'You were disconnected.':'Connection lost.')});
  room.on(LK.RoomEvent.AudioPlaybackStatusChanged,()=>{$o('#lvsnd').hidden=room.canPlaybackAudio});
  $o('#lvsnd').onclick=()=>{room.startAudio().then(()=>{$o('#lvsnd').hidden=true}).catch(()=>{})};
  await room.connect(ps.url,ps.token);count();
  if(!room.canPlaybackAudio&&!LV.host)$o('#lvsnd').hidden=false;
  room.remoteParticipants.forEach(p=>p.trackPublications.forEach(pub=>{if(pub.isSubscribed&&pub.track)attach(pub.track)}));
  if(LV.host){
   await room.localParticipant.setCameraEnabled(true);await room.localParticipant.setMicrophoneEnabled(true);bd(true);
   const pub=room.localParticipant.getTrackPublication(LK.Track.Source.Camera);if(pub&&pub.track){stage.querySelectorAll('video,canvas').forEach(v=>v.remove());const el=pub.track.attach();el.muted=true;el.playsInline=true;el.setAttribute('playsinline','');el.classList.add('lv-mir');stage.insertBefore(el,wait);wait.style.display='none'}
   let mic=true;$o('#lvmic').onclick=async()=>{mic=!mic;await room.localParticipant.setMicrophoneEnabled(mic);$o('#lvmic').textContent=mic?'🎤':'🔇'};
   $o('#lvflip').onclick=async()=>{try{LV.face=LV.face=='user'?'environment':'user';{const v=$o('#lvs video');if(v)v.classList.toggle('lv-mir',LV.face=='user')}const p=room.localParticipant.getTrackPublication(LK.Track.Source.Camera);await p.track.restartTrack({facingMode:LV.face})}catch(e){toast('Could not flip the camera')}}}
 }catch(e){
  console.error(e);toast(e.message||'Could not start the live video.');
  if(LV.host){try{await SB.rpc('end_live',{p_id:id})}catch(x){}}
  closeLive();location.replace('#/home')}
}
})();
