/* ===== One Face 3.3: voice + video calls for one person AND groups (mesh, up to 12) ===== */
(function(){
const me=()=>S.user.id;
const useDemo=()=>typeof DEMO!='undefined'&&DEMO&&!window.OF_FAKE_RT;
const PREV={start:startCall,incoming:showIncoming,end:endCallUI};
const st=document.createElement('style');
st.textContent='#call .cg{position:absolute;inset:0;display:grid;gap:6px;padding:6px;grid-template-columns:1fr;grid-auto-rows:1fr}#call .cg.m{grid-template-columns:1fr 1fr}#call .cg.m3{grid-template-columns:1fr 1fr 1fr}'+
 '.ct{position:relative;border-radius:14px;overflow:hidden;background:#141008;display:grid;place-items:center;min-height:0}.ct video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}.ct audio{display:none}.ct .tn{position:absolute;left:8px;bottom:6px;z-index:2;color:#fff;font-size:13px;text-shadow:0 1px 3px #000;max-width:90%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#call .cv .cg~.ci{z-index:3}';
document.head.appendChild(st);
const send=(ev,p)=>{try{CALL&&CALL.ch&&CALL.ch.send({type:'broadcast',event:ev,payload:p})}catch(e){}};
const nameOf=u=>{try{return P(u).full_name||'Member'}catch(e){return 'Member'}};
function layout(){const g=document.getElementById('cg');if(!g||!CALL)return;const n=g.children.length;g.className='cg'+(n>=5?' m3':n>=2?' m':'')}
function addTile(u){const g=document.getElementById('cg');if(!g||document.getElementById('t-'+u))return null;const t=document.createElement('div');t.className='ct';t.id='t-'+u;
 t.innerHTML=(CALL.video?'<video autoplay playsinline></video>':'<audio autoplay playsinline></audio>')+'<div class="cav">'+av(P(u),CALL.group?72:120)+'</div><div class="tn">'+esc(nameOf(u))+'</div>';
 g.appendChild(t);layout();return t}
function tick(){const e=document.getElementById('ct');if(!e||!CALL)return;if(!CALL.live){e.textContent=CALL.peers.size?'Connecting…':'Waiting for others…';return}const s=Math.floor((Date.now()-CALL.t0)/1000);e.textContent='Connected · '+Math.floor(s/60)+':'+String(s%60).padStart(2,'0')+(CALL.group?' · '+(CALL.peers.size+1)+' people':'')}
function buildLive(title){if(CALL.liveUI)return;CALL.liveUI=true;
 callUI('<div class="cv"><div id="cg" class="cg"></div>'+(CALL.video?'<video id="lv" autoplay playsinline muted></video>':'')+'<div class="ci"><b>'+esc(title||CALL.title||'Call')+'</b><span id="ct">Connecting…</span></div><div class="cb2"><button class="cbt" id="mu" aria-label="Mute">🎙️</button>'+(CALL.video?'<button class="cbt" id="cam" aria-label="Camera">📷</button>':'')+'<button class="cbt end" id="en" aria-label="End call">📞</button></div></div>');
 if(CALL.video&&CALL.stream){const lv=document.getElementById('lv');if(lv)lv.srcObject=CALL.stream}
 document.getElementById('mu').onclick=e=>{const a=CALL.stream&&CALL.stream.getAudioTracks()[0];if(a){a.enabled=!a.enabled;e.target.style.opacity=a.enabled?1:.4}};
 const cm=document.getElementById('cam');if(cm)cm.onclick=e=>{const v=CALL.stream&&CALL.stream.getVideoTracks()[0];if(v){v.enabled=!v.enabled;e.target.style.opacity=v.enabled?1:.4}};
 document.getElementById('en').onclick=()=>endCallUI();
 clearInterval(CALL.tm);CALL.tm=setInterval(tick,1000);
 CALL.cto=setTimeout(()=>{if(CALL&&!CALL.live&&CALL.peers.size){toast('Could not connect the call. Try Wi-Fi on both phones.');endCallUI()}},25000);
 CALL.peers.forEach((p,u)=>addTile(u))}
function ensurePeer(u){if(CALL.peers.has(u))return CALL.peers.get(u);
 const pc=new RTCPeerConnection(ICE()),p={pc,u,offered:false};CALL.peers.set(u,p);if(CALL.peers.size>=2)CALL.group=true;
 CALL.stream.getTracks().forEach(t=>pc.addTrack(t,CALL.stream));
 try{setTimeout(capQ,300)}catch(e){}
 pc.onicecandidate=e=>{if(e.candidate)send('ice',{from:me(),to:u,c:e.candidate.toJSON?e.candidate.toJSON():e.candidate})};
 pc.ontrack=e=>{p.stream=e.streams[0];const t=document.getElementById('t-'+u)||addTile(u);const el=t&&t.querySelector('video,audio');if(el){el.srcObject=p.stream;const pl=el.play();pl&&pl.catch&&pl.catch(()=>soundBtn(el))}};
 pc.onconnectionstatechange=()=>{clearTimeout(p.dt);const s=pc.connectionState;
  if(s=='connected'&&CALL){if(!CALL.live){CALL.live=true;CALL.t0=Date.now();clearTimeout(CALL.cto);clearTimeout(CALL.to)}tick()}
  else if(s=='failed'||s=='closed'){if(CALL&&CALL.peers.get(u)===p){if(CALL.group){removePeer(u)}else{toast('Call lost. Poor connection.');endCallUI()}}}
  else if(s=='disconnected'){p.dt=setTimeout(()=>{if(CALL&&pc.connectionState=='disconnected'){if(CALL.group)removePeer(u);else{toast('Call lost');endCallUI()}}},10000)}};
 if(CALL.liveUI)addTile(u);return p}
function removePeer(u){if(!CALL)return;const p=CALL.peers.get(u);if(!p)return;try{p.pc.close()}catch(e){}CALL.peers.delete(u);try{capQ()}catch(e){}const t=document.getElementById('t-'+u);if(t)t.remove();layout();tick()}
async function offer(u){const p=ensurePeer(u);if(p.offered)return;p.offered=true;try{const o=await p.pc.createOffer();await p.pc.setLocalDescription(o);send('sdp',{from:me(),to:u,d:{type:p.pc.localDescription.type,sdp:p.pc.localDescription.sdp}})}catch(e){console.error(e)}}
function onHere(pl,isJoin){if(!CALL||!CALL.joined||!pl||!pl.from||pl.from==me())return;if(!isJoin&&pl.to&&pl.to!=me())return;const u=pl.from;
 if(isJoin)send('here',{from:me(),to:u});
 if(CALL.role=='caller')clearTimeout(CALL.to);
 if(!CALL.liveUI)buildLive();
 ensurePeer(u);if(me()<u)offer(u)}
async function onSdp(pl){if(!CALL||!CALL.joined||!pl||pl.to!=me())return;const p=ensurePeer(pl.from),pc=p.pc;if(!CALL.liveUI)buildLive();
 try{if(pl.d.type=='offer'){await pc.setRemoteDescription(pl.d);await flushCand(pc);const a=await pc.createAnswer();await pc.setLocalDescription(a);send('sdp',{from:me(),to:pl.from,d:{type:pc.localDescription.type,sdp:pc.localDescription.sdp}})}else{await pc.setRemoteDescription(pl.d);await flushCand(pc)}}catch(e){console.error(e)}}
function onIce(pl){if(!CALL||!pl||pl.to!=me())return;const p=CALL.peers.get(pl.from)||ensurePeer(pl.from);addCand(p.pc,pl.c)}
function onLeave(pl){if(!CALL||!pl)return;
 if(!CALL.joined){if(pl.from==CALL.from||!pl.from){toast('Missed call');endCallUI()}return}
 removePeer(pl.from);if(!CALL.group){toast('Call ended');endCallUI()}}
function onDecline(pl){if(!CALL||!CALL.joined)return;if(!CALL.group){toast('Call declined');endCallUI()}else toast(nameOf(pl&&pl.from)+' declined')}
function openChannel(announce){return new Promise(res=>{const ch=CALL.ch=SB.channel('call:'+CALL.cid,{config:{broadcast:{self:false}}});
 ch.on('broadcast',{event:'join'},({payload})=>onHere(payload,true)).on('broadcast',{event:'here'},({payload})=>onHere(payload,false))
  .on('broadcast',{event:'sdp'},({payload})=>onSdp(payload)).on('broadcast',{event:'ice'},({payload})=>onIce(payload))
  .on('broadcast',{event:'leave'},({payload})=>onLeave(payload)).on('broadcast',{event:'decline'},({payload})=>onDecline(payload))
  .on('broadcast',{event:'end'},()=>{if(CALL&&!CALL.group){toast('Call ended');endCallUI()}})
  .subscribe(s=>{if(s=='SUBSCRIBED'){if(announce)ch.send({type:'broadcast',event:'join',payload:{from:me()}});res(true)}else if(s=='CHANNEL_ERROR'||s=='TIMED_OUT'){res(false)}})})}
/* many people: lower video quality per link so phones keep up */
function capQ(){try{if(typeof CALL=='undefined'||!CALL||!CALL.peers)return;const n=CALL.peers.size,kbps=n<=2?900:n<=4?500:n<=7?250:140,sc=n<=2?1:n<=4?1.5:n<=7?2.5:4;CALL.peers.forEach(p=>{p.pc.getSenders().forEach(se=>{if(!se.track||se.track.kind!='video'||!se.getParameters)return;const pr=se.getParameters();if(!pr.encodings||!pr.encodings.length)pr.encodings=[{}];pr.encodings[0].maxBitrate=kbps*1000;pr.encodings[0].scaleResolutionDownBy=sc;se.setParameters(pr).catch(()=>{})})})}catch(e){}}
async function media(video){try{return await navigator.mediaDevices.getUserMedia({audio:true,video:!!video})}catch(e){toast(micErr(e));return null}}

startCall=async function(cid,other,video){
 if(useDemo())return PREV.start.apply(this,arguments);
 if(CALL)return;
 let ids=[];try{const{data}=await SB.from('conversation_members').select('user_id').eq('conversation_id',cid);ids=(data||[]).map(x=>x.user_id).filter(x=>x!=me())}catch(e){}
 if(!ids.length&&other)ids=[other];if(!ids.length){toast('No one to call.');return}
 if(ids.length>11){toast('Group calls support up to 12 people.');return}
 await need(ids);let title='',group=ids.length>1;try{const{data}=await SB.from('conversations').select('title,is_group').eq('id',cid).maybeSingle();if(data){group=!!data.is_group||group;title=data.title||''}}catch(e){}
 const first=P(ids[0]);if(!group)title=first.full_name;else title=title||'Group call';
 CALL={cid,video:!!video,group,role:'caller',peers:new Map(),members:ids,title,joined:true,rings:[]};const mine=CALL;
 callUI('<div class="cv"><div class="cav pulse">'+(group?av(null,120):av(first,120))+'</div><div class="ci"><b>'+esc(title)+'</b><span id="cs">'+(group?'Calling '+ids.length+' people…':'Calling…')+'</span></div><div class="cb2"><button class="cbt end" id="en" aria-label="Cancel call">📞</button></div></div>');
 document.getElementById('en').onclick=()=>endCallUI();
 const s=await media(video);if(CALL!==mine)return;if(!s){endCallUI();return}CALL.stream=s;
 if(!window.RTCPeerConnection){toast('Calls are not supported on this browser.');endCallUI();return}
 await openChannel(true);if(CALL!==mine)return;
 ids.forEach(id=>{const r=SB.channel('user:'+id);CALL.rings.push(r);r.subscribe(x=>{if(x=='SUBSCRIBED')r.send({type:'broadcast',event:'ring',payload:{cid,from:me(),video:!!video,group,title:group?title:''}})})});
 CALL.to=setTimeout(()=>{if(CALL===mine&&!CALL.live&&!CALL.peers.size){toast('No answer');endCallUI()}},40000)};

showIncoming=async function(r){
 if(useDemo()||r.cid=='demo')return PREV.incoming.apply(this,arguments);
 if(CALL){return}
 await need([r.from]);if(CALL)return;const p=P(r.from);const title=r.group?(r.title||'Group call'):p.full_name;
 CALL={cid:r.cid,video:!!r.video,group:!!r.group,role:'callee',peers:new Map(),from:r.from,joined:false,title};const mine=CALL;
 callUI('<div class="cv"><div class="cav pulse">'+av(p,120)+'</div><div class="ci"><b>'+esc(title)+'</b><span>'+(r.group?esc(p.full_name)+' is calling · ':'')+'Incoming '+(r.video?'video':'voice')+' call…</span></div><div class="cb2"><button class="cbt end" id="no" aria-label="Decline">📞</button><button class="cbt ok" id="ok" aria-label="Answer">📞</button></div></div>');
 if(window.OF_ring)OF_ring.start();
 CALL.to=setTimeout(()=>{if(CALL===mine&&!CALL.joined)endCallUI()},40000);
 openChannel(false);
 document.getElementById('no').onclick=()=>{send('decline',{from:me()});endCallUI()};
 document.getElementById('ok').onclick=async()=>{if(window.OF_ring)OF_ring.stop();clearTimeout(CALL.to);
  const s=await media(r.video);if(CALL!==mine)return;if(!s){send('decline',{from:me()});endCallUI();return}
  CALL.stream=s;CALL.joined=true;buildLive();send('join',{from:me()})}};

endCallUI=function(){try{if(CALL&&CALL.joined&&CALL.ch)send('leave',{from:me()});if(CALL&&CALL.peers)CALL.peers.forEach(p=>{try{p.pc.close()}catch(e){}});if(CALL&&CALL.rings)CALL.rings.forEach(r=>{try{SB.removeChannel(r)}catch(e){}});if(CALL){clearTimeout(CALL.to);clearTimeout(CALL.cto)}}catch(e){}return PREV.end.apply(this,arguments)};

/* call buttons for group chats */
const oc=R.chat;R.chat=async function(){const r=await oc.apply(this,arguments);try{if(typeof CH!='undefined'&&CH&&CH.group&&!document.getElementById('c1')){const cm=document.getElementById('cm');if(cm){cm.insertAdjacentHTML('beforebegin','<button class="ib" id="c1" aria-label="Voice call">📞</button><button class="ib" id="c2" aria-label="Video call">🎥</button>');document.getElementById('c1').onclick=()=>startCall(CH.id,null,false);document.getElementById('c2').onclick=()=>startCall(CH.id,null,true)}}}catch(e){}return r};
})();
