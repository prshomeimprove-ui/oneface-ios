/* ===== One Face 3.3: draggable call preview, add people to a call, live updates everywhere ===== */
(function(){
const me=()=>S.user.id;
const SIGNED=()=>typeof S!='undefined'&&S.user&&typeof DEMO!='undefined'&&!DEMO;
const st=document.createElement('style');
st.textContent='#lv{touch-action:none;cursor:grab}#invp{position:absolute;left:0;right:0;bottom:0;max-height:60%;overflow:auto;background:var(--card,#fff);color:var(--ink,#111);border-radius:18px 18px 0 0;padding:14px;z-index:5}#invp .li{display:flex;align-items:center;gap:10px;width:100%;padding:10px;border:0;background:none;color:inherit;font-size:16px;text-align:left;border-bottom:1px solid var(--line,#eee)}'+
'#newp{position:fixed;top:calc(var(--topbar,54px) + 10px);left:50%;transform:translateX(-50%);z-index:40;background:var(--gold2,#AB7529);color:#fff;border:0;border-radius:22px;padding:10px 18px;font-size:15px;font-weight:600;box-shadow:0 4px 14px #0004}';
document.head.appendChild(st);

/* --- drag the small preview --- */
let drag=null;
document.addEventListener('pointerdown',e=>{const t=e.target&&e.target.closest&&e.target.closest('#lv');if(!t)return;const r=t.getBoundingClientRect();drag={t,dx:e.clientX-r.left,dy:e.clientY-r.top};t.style.right='auto';t.style.left=r.left+'px';t.style.top=r.top+'px';try{t.setPointerCapture(e.pointerId)}catch(x){}e.preventDefault()},true);
document.addEventListener('pointermove',e=>{if(!drag)return;const t=drag.t,w=t.offsetWidth,h=t.offsetHeight;t.style.left=Math.max(4,Math.min(innerWidth-w-4,e.clientX-drag.dx))+'px';t.style.top=Math.max(4,Math.min(innerHeight-h-4,e.clientY-drag.dy))+'px'},true);
['pointerup','pointercancel'].forEach(ev=>document.addEventListener(ev,()=>{drag=null},true));

/* --- add a person to the running call --- */
async function invitePanel(){const call=document.getElementById('call');if(!call||document.getElementById('invp')||!CALL)return;
 const p=document.createElement('div');p.id='invp';p.innerHTML='<b>Add someone to this call</b><p class="muted sm">Loading friends…</p>';call.appendChild(p);
 let ids=[];try{ids=await friendIds();await need(ids)}catch(e){}
 const inCall=new Set([me(),...(CALL&&CALL.peers?[...CALL.peers.keys()]:[])]);ids=ids.filter(i=>!inCall.has(i));
 p.innerHTML='<div class="row" style="justify-content:space-between"><b>Add someone to this call</b><button class="lnk" id="invx" style="background:none;border:0;color:inherit;font-size:18px">✕</button></div>'+(ids.length?ids.map(i=>'<button class="li" data-i="'+i+'">'+av(P(i),36)+'<span>'+esc(P(i).full_name)+'</span></button>').join(''):'<p class="muted sm">No friends to add yet.</p>');
 p.querySelector('#invx').onclick=()=>p.remove();
 p.onclick=e=>{const b=e.target.closest('[data-i]');if(!b||!CALL)return;const u=b.dataset.i;
  if(CALL.peers.size>=11){toast('A call can have up to 12 people.');return}
  const title=CALL.group?(CALL.title||'Group call'):'Group call';CALL.group=true;
  const r=SB.channel('user:'+u);r.subscribe(s=>{if(s=='SUBSCRIBED'){r.send({type:'broadcast',event:'ring',payload:{cid:CALL.cid,from:me(),video:!!CALL.video,group:true,title}});setTimeout(()=>{try{SB.removeChannel(r)}catch(e){}},4000)}});
  toast('Calling '+P(u).full_name+'…');b.remove();if(!p.querySelector('[data-i]'))p.remove()}}
new MutationObserver(()=>{const cb=document.querySelector('#call .cb2');if(cb&&!document.getElementById('inv')&&document.getElementById('mu')&&CALL&&CALL.cid&&CALL.cid!='demo'){const b=document.createElement('button');b.className='cbt';b.id='inv';b.setAttribute('aria-label','Add person');b.textContent='👤+';b.style.fontSize='20px';b.onclick=invitePanel;cb.insertBefore(b,document.getElementById('en'))}}).observe(document.body,{childList:true,subtree:true});

/* --- live updates: new posts, comments, reactions, friend requests --- */
let busy=false,tmr=null;
function typing(){const a=document.activeElement;return a&&/INPUT|TEXTAREA|SELECT/.test(a.tagName)}
function soft(){clearTimeout(tmr);tmr=setTimeout(async()=>{if(busy||document.hidden||typing()||document.querySelector('#sheet,#lb,#call'))return;busy=true;const y=scrollY,m=document.getElementById('main'),mt=m?m.scrollTop:0;try{await route()}catch(e){}try{scrollTo(0,y);if(m)m.scrollTop=mt}catch(e){}busy=false},700)}
function pill(){if(document.getElementById('newp'))return;const b=document.createElement('button');b.id='newp';b.textContent='↑ New posts';b.onclick=()=>{b.remove();try{route()}catch(e){}scrollTo(0,0)};document.body.appendChild(b)}
addEventListener('hashchange',()=>{const b=document.getElementById('newp');if(b)b.remove();sig={}});
let sig={};
function liveAll(){try{if(!SIGNED())return;const ch=SB.channel('of-all');
 ch.on('postgres_changes',{event:'INSERT',schema:'public',table:'posts'},({new:p})=>{if(p&&p.author!=me()&&S.route&&S.route.name=='home')pill()})
  .on('postgres_changes',{event:'*',schema:'public',table:'comments'},({new:n,old:o})=>{const id=(n&&n.post_id)||(o&&o.post_id);if(S.route&&S.route.name=='post'&&S.route.arg==id)soft()})
  .on('postgres_changes',{event:'*',schema:'public',table:'reactions'},({new:n,old:o})=>{const id=(n&&n.post_id)||(o&&o.post_id);if(S.route&&S.route.name=='post'&&S.route.arg==id&&(!n||n.user_id!=me()))soft()})
  .on('postgres_changes',{event:'*',schema:'public',table:'friendships'},()=>{try{badges()}catch(e){}if(S.route&&S.route.name=='friends')soft()})
  .subscribe();S.chans.push(ch)}catch(e){console.error(e)}}
if(typeof live=='function'){const ol=live;live=function(){const r=ol.apply(this,arguments);liveAll();return r}}
/* backup check every 6 s if the live feed is not delivering */
async function check(){if(!SIGNED()||document.hidden||busy||!S.route)return;const n=S.route.name;
 try{if(n=='home'){const{data}=await SB.from('posts').select('id,author').order('created_at',{ascending:false}).limit(1);const t=data&&data[0];if(!t)return;if(sig.home===undefined){sig.home=t.id;return}if(sig.home!==t.id){sig.home=t.id;if(t.author!=me())pill()}}
  else if(n=='post'){const id=S.route.arg;const[c,r]=await Promise.all([SB.from('comments').select('id',{count:'exact',head:true}).eq('post_id',id),SB.from('reactions').select('post_id',{count:'exact',head:true}).eq('post_id',id)]);const k=(c.count||0)+':'+(r.count||0);if(sig.post===undefined){sig.post=k;return}if(sig.post!==k){sig.post=k;soft()}}
  else if(n=='friends'){const{count}=await SB.from('friendships').select('id',{count:'exact',head:true}).or('requester.eq.'+me()+',addressee.eq.'+me());if(sig.fr===undefined){sig.fr=count;return}if(sig.fr!==count){sig.fr=count;soft()}}}catch(e){}}
setInterval(check,6000);
})();
