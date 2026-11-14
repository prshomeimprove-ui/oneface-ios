/* One Face v4.3: Reels. Short vertical videos with reactions and comments. Uses oneface14.sql. */
(function(){
const CSS=`
#rl{overflow-y:scroll;scroll-snap-type:y mandatory;background:#000;border-radius:0;scrollbar-width:none;margin:-10px -10px 0}#rl::-webkit-scrollbar{display:none}
.rl-i{position:relative;scroll-snap-align:start;scroll-snap-stop:always;background:#000;overflow:hidden;display:flex;align-items:center;justify-content:center}
.rl-i video{width:100%;height:100%;object-fit:contain;background:#000}
.rl-sh{position:absolute;left:0;right:0;bottom:0;height:42%;background:linear-gradient(transparent,rgba(0,0,0,.65));pointer-events:none}
.rl-meta{position:absolute;left:14px;right:84px;bottom:18px;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.6)}
.rl-meta a{display:flex;align-items:center;gap:8px;color:#fff;text-decoration:none;font-weight:700;margin-bottom:6px}.rl-meta p{margin:0;font-size:14.5px;line-height:1.35;white-space:pre-wrap;word-break:break-word;max-height:5.4em;overflow:hidden}
.rl-rail{position:absolute;right:10px;bottom:22px;display:flex;flex-direction:column;gap:16px;align-items:center}
.rl-rail button{border:0;background:rgba(0,0,0,.45);color:#fff;width:50px;height:50px;border-radius:50%;font-size:24px;cursor:pointer;display:grid;place-items:center;line-height:1}
.rl-rail small{display:block;color:#fff;font-size:12px;text-align:center;margin-top:3px;text-shadow:0 1px 3px #000;font-weight:600}.rl-rail .on{background:rgba(255,255,255,.9)}
.rl-mute{position:absolute;top:12px;right:12px;border:0;background:rgba(0,0,0,.5);color:#fff;border-radius:18px;padding:6px 12px;font-size:13px;cursor:pointer}
.rl-play{position:absolute;inset:0;display:none;place-items:center;color:#fff;font-size:64px;pointer-events:none;text-shadow:0 2px 8px #000}.rl-i.paused .rl-play{display:grid}
.rl-empty{color:#fff;text-align:center;padding:40px 24px}
.rcm{max-height:46vh;overflow-y:auto;margin:0 0 10px}.rcm .c{display:flex;gap:10px;padding:8px 0}.rcm .c .grow{min-width:0}.rcm .c b{font-size:14px}.rcm .c p{margin:2px 0 0;word-break:break-word;white-space:pre-wrap}.rcm .c .x{border:0;background:none;color:var(--mut);cursor:pointer;font-size:18px}
.rcf{display:flex;gap:8px}.rcf input{flex:1;padding:11px 14px;border-radius:22px;border:1px solid var(--line);background:var(--card);color:var(--ink);font:inherit}
`;
const st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);
const RL=S._rl=S._rl||{muted:true};
let obs=null;

function itemHTML(r){const a=P(r.author);return '<div class="rl-i" data-id="'+r.id+'"><video playsinline loop preload="metadata" '+(RL.muted?'muted':'')+' src="'+esc(url('posts',r.video_path))+'"></video><div class="rl-play">▶</div><div class="rl-sh"></div>'
 +'<button class="rl-mute">'+(RL.muted?'🔇 Tap for sound':'🔊')+'</button>'
 +'<div class="rl-meta"><a href="#/profile/'+r.author+'">'+av(a,36)+'<span>'+esc(a.full_name)+(a.verified?' <span class="vf">✓</span>':'')+'</span></a>'+(r.caption?'<p>'+esc(r.caption)+'</p>':'')+'</div>'
 +'<div class="rl-rail"><div><button data-act="rx" class="'+(r._my?'on':'')+'" aria-label="React">'+(r._my?REACT[r._my]:'👍')+'</button><small data-n="lk">'+(r.like_count||'')+'</small></div>'
 +'<div><button data-act="cm" aria-label="Comments">💬</button><small data-n="cm">'+(r.comment_count||'')+'</small></div>'
 +'<div><button data-act="more" aria-label="More">⋯</button></div></div></div>'}

R.reels=async(arg)=>{
 tbar({title:'Reels',right:'<button class="btn sm pri" id="rlnew">+ Reel</button>'});
 const{data}=await SB.from('reels').select('*').order('created_at',{ascending:false}).limit(30);let rows=data||[];
 if(arg){const i=rows.findIndex(x=>x.id==arg);if(i>0)rows.unshift(rows.splice(i,1)[0]);else if(i<0){const{data:one}=await SB.from('reels').select('*').eq('id',arg).maybeSingle();if(one)rows.unshift(one)}}
 await need(rows.map(r=>r.author));
 if(rows.length){const{data:my}=await SB.from('reel_reactions').select('reel_id,type').eq('user_id',S.user.id).in('reel_id',rows.map(r=>r.id));const m={};(my||[]).forEach(x=>m[x.reel_id]=x.type);rows.forEach(r=>r._my=m[r.id]||null)}
 const byId={};rows.forEach(r=>byId[r.id]=r);
 view(rows.length?'<div id="rl">'+rows.map(itemHTML).join('')+'</div>':'<div id="rl"><div class="rl-empty"><p style="font-size:44px;margin:0">🎬</p><p><b>No reels yet</b></p><p>Be the first. Tap + Reel to share a short video.</p></div></div>');
 const box=document.getElementById('rl');
 const fit=()=>{const t=document.getElementById('top'),dm=document.getElementById('demo');const h=Math.max(300,innerHeight-(t?t.offsetHeight:0)-(dm&&dm.offsetParent?dm.offsetHeight:0));box.style.height=h+'px';box.querySelectorAll('.rl-i').forEach(i=>i.style.height=h+'px')};
 fit();addEventListener('resize',fit);
 document.getElementById('rlnew').onclick=()=>newReel();
 if(obs)obs.disconnect();
 obs=new IntersectionObserver(es=>es.forEach(e=>{const v=e.target.querySelector('video');if(!v)return;if(e.isIntersecting&&e.intersectionRatio>.6){v.muted=RL.muted;const p=v.play();if(p&&p.catch)p.catch(()=>{});e.target.classList.remove('paused')}else{v.pause();if(e.intersectionRatio<.2)try{v.currentTime=0}catch(x){}}}),{root:box,threshold:[.2,.6]});
 box.querySelectorAll('.rl-i').forEach(i=>obs.observe(i));
 box.onclick=async ev=>{const it=ev.target.closest('.rl-i');if(!it)return;const r=byId[it.dataset.id];const v=it.querySelector('video');
  if(ev.target.closest('.rl-mute')){RL.muted=!RL.muted;box.querySelectorAll('video').forEach(x=>x.muted=RL.muted);box.querySelectorAll('.rl-mute').forEach(b=>b.textContent=RL.muted?'🔇 Tap for sound':'🔊');return}
  const b=ev.target.closest('[data-act]');
  if(b){const a=b.dataset.act;
   if(a=='rx'){if(r._my){await SB.from('reel_reactions').delete().eq('reel_id',r.id).eq('user_id',S.user.id);r._my=null;r.like_count=Math.max(0,(r.like_count||0)-1);upd(it,r)}else pick(r,it);return}
   if(a=='cm'){comments(r,it);return}
   if(a=='more'){more(r,it);return}return}
  if(ev.target.closest('a'))return;
  if(v.paused){v.play();it.classList.remove('paused')}else{v.pause();it.classList.add('paused')}};
 function upd(it,r){const b=it.querySelector('[data-act=rx]');b.className=r._my?'on':'';b.textContent=r._my?REACT[r._my]:'👍';it.querySelector('[data-n=lk]').textContent=r.like_count||''}
 function pick(r,it){const d=sheet('<p class="sh-t">React</p><div class="rpick">'+Object.keys(REACT).map(k=>'<button data-k="'+k+'" aria-label="'+REACTN[k]+'"><span>'+REACT[k]+'</span><small>'+REACTN[k]+'</small></button>').join('')+'</div>');
  d.querySelectorAll('[data-k]').forEach(b=>b.onclick=async()=>{closeSheet();const{error}=await SB.from('reel_reactions').upsert({reel_id:r.id,user_id:S.user.id,type:b.dataset.k},{onConflict:'reel_id,user_id'});if(error){toast('Could not react.');return}if(!r._my)r.like_count=(r.like_count||0)+1;r._my=b.dataset.k;upd(it,r)})}
 async function comments(r,it){
  const d=sheet('<p class="sh-t">Comments</p><div class="rcm" id="rcm"><p class="muted center">Loading…</p></div><form class="rcf" id="rcf"><input id="rci" maxlength="1000" placeholder="Add a comment" autocomplete="off"><button class="btn pri" type="submit">Send</button></form>');
  const load=async()=>{const{data:cs}=await SB.from('reel_comments').select('*').eq('reel_id',r.id).order('created_at',{ascending:true}).limit(100);await need((cs||[]).map(c=>c.author));const adm=S.me&&S.me.role=='admin';
   const el=d.querySelector('#rcm');if(!el)return;el.innerHTML=(cs||[]).length?(cs||[]).map(c=>'<div class="c">'+av(P(c.author),34)+'<div class="grow"><b>'+esc(P(c.author).full_name)+'</b><p>'+esc(c.body)+'</p></div>'+((c.author==S.user.id||r.author==S.user.id||adm)?'<button class="x" data-x="'+c.id+'" aria-label="Delete">×</button>':'')+'</div>').join(''):'<p class="muted center">No comments yet. Say something nice.</p>';
   r.comment_count=(cs||[]).length;it.querySelector('[data-n=cm]').textContent=r.comment_count||'';
   el.querySelectorAll('[data-x]').forEach(b=>b.onclick=async()=>{await SB.from('reel_comments').delete().eq('id',b.dataset.x);load()})};
  await load();
  d.querySelector('#rcf').onsubmit=async e=>{e.preventDefault();const i=d.querySelector('#rci'),v=i.value.trim();if(!v)return;i.value='';const{error}=await SB.from('reel_comments').insert({reel_id:r.id,author:S.user.id,body:v});if(error)toast('Could not comment.');load()}}
 function more(r,it){const mine=r.author==S.user.id,adm=S.me&&S.me.role=='admin';
  const d=sheet('<p class="sh-t">Reel</p><div class="stack"><button class="btn" id="rsh">Copy link</button>'+(mine?'<button class="btn" id="rcp">Edit caption</button>':'<button class="btn" id="rrp">Report reel</button>')+((mine||adm)?'<button class="btn danger" id="rdel">Delete reel</button>':'')+'</div>');
  d.querySelector('#rsh').onclick=async()=>{const u=location.origin+location.pathname+'#/reels/'+r.id;try{await navigator.clipboard.writeText(u);toast('Link copied')}catch(e){toast(u)}closeSheet()};
  const rp=d.querySelector('#rrp');if(rp)rp.onclick=()=>{closeSheet();reportSheet('reel',r.id)};
  const cp=d.querySelector('#rcp');if(cp)cp.onclick=()=>{const d2=sheet('<p class="sh-t">Caption</p><div class="stack"><textarea id="rcap" class="dtin" rows="3" maxlength="300">'+esc(r.caption||'')+'</textarea><button class="btn pri big" id="rcs">Save</button></div>');d2.querySelector('#rcs').onclick=async()=>{const v=d2.querySelector('#rcap').value.trim();const{error}=await SB.from('reels').update({caption:v}).eq('id',r.id);if(error){toast('Could not save.');return}r.caption=v;closeSheet();R.reels(r.id)}};
  const dl=d.querySelector('#rdel');if(dl)dl.onclick=async()=>{if(!await confirmBox('Delete this reel?','Delete',true))return;const{error}=await SB.from('reels').delete().eq('id',r.id);if(error){toast('Could not delete.');return}toast('Deleted');R.reels()}}
};

function newReel(){
 const d=sheet('<p class="sh-t">New reel</p><div class="stack"><video id="rlpv" playsinline muted controls style="width:100%;max-height:40vh;border-radius:12px;background:#000;display:none"></video><label class="btn" id="rlpl">Choose a video<input type="file" id="rlfi" accept="video/*" hidden></label><span id="rls" class="muted sm">Up to 90 seconds and 50 MB. Vertical videos look best.</span><label class="fl"><span>Caption (optional)</span><textarea id="rlc" class="dtin" rows="2" maxlength="300" placeholder="Say something about it"></textarea></label><p class="err" id="rle"></p><button class="btn pri big" id="rlgo" disabled>Share reel</button></div>');
 const $d=s=>d.querySelector(s);let file=null;
 $d('#rlfi').onchange=e=>{const f=e.target.files[0];if(!f)return;$d('#rle').textContent='';
  if(f.size>50*1024*1024){$d('#rle').textContent='That video is bigger than 50 MB.';return}
  const u=URL.createObjectURL(f),v=$d('#rlpv');v.src=u;v.style.display='block';
  v.onloadedmetadata=()=>{if(v.duration>91){$d('#rle').textContent='That video is longer than 90 seconds.';file=null;$d('#rlgo').disabled=true;return}file=f;$d('#rlgo').disabled=false;$d('#rls').textContent=Math.round(v.duration)+' seconds'};
  v.onerror=()=>{file=f;$d('#rlgo').disabled=false;$d('#rls').textContent='Ready'}};
 $d('#rlgo').onclick=async()=>{if(!file)return;const b=$d('#rlgo');b.disabled=true;b.textContent='Uploading…';
  try{const path=await upload('posts',file);const{error}=await SB.from('reels').insert({author:S.user.id,video_path:path,caption:$d('#rlc').value.trim()});if(error)throw error;closeSheet();toast('Reel shared ✓');R.reels()}
  catch(x){b.disabled=false;b.textContent='Share reel';$d('#rle').textContent=(x.message||'Upload failed. Please try again.')}}}

function menuLink(){if(!S||!S.route||S.route.name!='menu')return;const main=document.getElementById('main');if(!main||main.querySelector('[data-s22m]'))return;const l=main.querySelector('.card.list');if(!l)return;
 l.insertAdjacentHTML('afterbegin','<a class="li" data-s22m="1" href="#/reels"><span class="mi2">🎬</span><div class="grow"><b>Reels</b><small>Short videos from people</small></div>'+ic('back',16).replace('class="ic"','class="ic fwd"')+'</a>')}
let t=null;new MutationObserver(()=>{if(t)return;t=setTimeout(()=>{t=null;try{menuLink()}catch(e){}},300)}).observe(document.body,{childList:true,subtree:true});
addEventListener('hashchange',()=>{if(obs&&!(S.route&&S.route.name=='reels')){obs.disconnect();obs=null}});
})();
