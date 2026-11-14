/* One Face v4.1: Social pack. Scheduled posts + drafts, close friends, follow, active status, verified people, featured photos.
   Uses oneface12.sql. Layout and colors are the existing ones. */
(function(){
const CSS=`
.vf{display:inline-grid;place-items:center;width:16px;height:16px;border-radius:50%;background:#2d7ff9;color:#fff;font-size:11px;vertical-align:middle;margin-left:5px;font-weight:700}
h1 .vf{width:20px;height:20px;font-size:13px}
.seen{display:block;font-size:11.5px;font-weight:500;color:var(--mut);line-height:1.2}
.seen.on{color:#1f9d55}.seen.on:before{content:"";display:inline-block;width:8px;height:8px;border-radius:50%;background:#1f9d55;margin-right:5px}
.gdot{width:11px;height:11px;border-radius:50%;background:#1f9d55;border:2px solid var(--card);position:absolute;margin:26px 0 0 -14px}
.feat h3,.sch h3{margin:0 0 8px;font-size:16px}
.fgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}.fgrid .fi{aspect-ratio:1/1;border-radius:12px;background:var(--soft) center/cover no-repeat;border:0;padding:0;cursor:pointer;position:relative}
.fgrid .fi button{position:absolute;top:4px;right:4px;width:26px;height:26px;border-radius:50%;border:0;background:rgba(0,0,0,.6);color:#fff;font-size:16px;cursor:pointer}
.schr{padding:12px 0;border-top:1px solid var(--line)}.schr:first-of-type{border-top:0}
.schr .t{white-space:pre-wrap;word-break:break-word;max-height:4.5em;overflow:hidden}
.schr .m{color:var(--mut);font-size:13px;margin:4px 0 8px}
.schr .b{display:flex;gap:8px;flex-wrap:wrap}
.cfr{display:flex;align-items:center;gap:12px;padding:10px 14px}.cfr .grow b{display:block}
.starbtn{border:1px solid var(--line);background:var(--card);border-radius:20px;padding:6px 14px;font-weight:700;cursor:pointer;color:var(--mut)}.starbtn.on{background:#1f9d55;border-color:#1f9d55;color:#fff}
.dtin{width:100%;padding:12px;border-radius:12px;border:1px solid var(--line);background:var(--card);color:var(--ink);font:inherit}
`;
const st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);
const toLocalInput=d=>{const z=new Date(d.getTime()-d.getTimezoneOffset()*60000);return z.toISOString().slice(0,16)};
const fmtWhen=t=>new Date(t).toLocaleString([], {weekday:'short',month:'short',day:'numeric',hour:'numeric',minute:'2-digit'});
const live=()=>!!(S&&S.user);
/* close friends option when posting */
try{if(typeof VIS=='object'&&!VIS.close)VIS.close=['users','Close friends']}catch(e){}

/* ===== heartbeat: active status + publish due scheduled posts ===== */
async function beat(){if(!live()||document.hidden)return;try{await SB.rpc('touch_seen')}catch(e){}}
async function pub(){if(!live()||document.hidden)return;try{await SB.rpc('publish_due')}catch(e){}}
setInterval(beat,90000);setInterval(pub,120000);document.addEventListener('visibilitychange',()=>{if(!document.hidden){beat();pub()}});
setTimeout(()=>{beat();pub()},4000);

/* ===== helpers for "active" text ===== */
const seenCache=new Map();
async function seenOf(ids){ids=ids.filter(Boolean);const miss=ids.filter(i=>!seenCache.has(i)||Date.now()-seenCache.get(i).t>60000);
 if(miss.length){try{const{data}=await SB.rpc('seen_many',{p_users:miss});miss.forEach(i=>seenCache.set(i,{t:Date.now(),at:null}));(data||[]).forEach(r=>seenCache.set(r.user_id,{t:Date.now(),at:r.last_seen_at}))}catch(e){miss.forEach(i=>seenCache.set(i,{t:Date.now(),at:null}))}}
 const o={};ids.forEach(i=>o[i]=(seenCache.get(i)||{}).at||null);return o}
const seenTxt=at=>{if(!at)return null;const s=(Date.now()-new Date(at))/1000;if(s<240)return{t:'Active now',on:1};if(s<3600)return{t:'Active '+Math.floor(s/60)+'m ago'};if(s<86400)return{t:'Active '+Math.floor(s/3600)+'h ago'};if(s<604800)return{t:'Active '+Math.floor(s/86400)+'d ago'};return null};

/* ===== decorate screens (verified tick, active status, follow, featured) ===== */
let busy=false;
async function decorate(){
 if(busy||!live()||!S.route)return;const name=S.route.name,main=document.getElementById('main');if(!main)return;
 busy=true;
 try{
  /* verified tick on post authors */
  main.querySelectorAll('.post .nm a[href^="#/profile/"] b:not([data-v])').forEach(b=>{b.dataset.v='1';const id=b.parentElement.getAttribute('href').split('/').pop();const p=S.cache.get(id);if(p&&p.verified)b.insertAdjacentHTML('afterend','<span class="vf" title="Verified">✓</span>')});
  if(name=='profile')await profile(main);
  else if(name=='chat')await chatHead();
  else if(name=='settings')settings(main);
  else if(name=='compose')composeTools(main);
  else if(name=='menu')menuLinks(main);
  rail();
 }catch(e){console.error(e)}finally{busy=false}}

async function profile(main){
 const prof=main.querySelector('.card.prof');if(!prof||prof.dataset.s20)return;const id=S.route.arg||S.user.id;
 prof.dataset.s20='1';await need([id]);const p=S.cache.get(id)||{};const own=id==S.user.id;
 const h=prof.querySelector('h1');if(h&&p.verified&&!h.querySelector('.vf'))h.insertAdjacentHTML('beforeend','<span class="vf" title="Verified">✓</span>');
 /* active status */
 if(!own){const s=seenTxt((await seenOf([id]))[id]);const sub=prof.querySelector('p.muted.center');if(s&&sub&&!prof.querySelector('.seen'))sub.insertAdjacentHTML('afterend','<p class="center seen'+(s.on?' on':'')+'" style="margin:2px 0 6px">'+s.t+'</p>')}
 /* follow */
 const btns=prof.querySelector('.btns.c');
 let fc=0,isF=false;
 try{const[{count},{data:me}]=await Promise.all([SB.from('follows').select('follower',{count:'exact',head:true}).eq('followee',id),own?{data:null}:SB.from('follows').select('followee').eq('follower',S.user.id).eq('followee',id).maybeSingle()]);fc=count||0;isF=!!me}catch(e){}
 const sub2=prof.querySelector('p.muted.center');if(sub2&&!sub2.dataset.fc){sub2.dataset.fc='1';sub2.insertAdjacentHTML('beforeend',' · '+fc+' follower'+(fc==1?'':'s'))}
 if(!own&&btns&&!btns.querySelector('[data-fw]')){const b=document.createElement('button');b.className='btn'+(isF?'':' ');b.dataset.fw='1';b.textContent=isF?'Following ✓':'Follow';
  b.onclick=async()=>{b.disabled=true;if(isF){await SB.from('follows').delete().eq('follower',S.user.id).eq('followee',id);isF=false}else{const{error}=await SB.from('follows').insert({follower:S.user.id,followee:id});if(error){toast('Could not follow.');b.disabled=false;return}isF=true}b.textContent=isF?'Following ✓':'Follow';b.disabled=false;toast(isF?'You follow '+(p.full_name||'them'):'Unfollowed')};
  btns.appendChild(b)}
 /* featured photos */
 const ft=Array.isArray(p.featured)?p.featured:[];
 if((ft.length||own)&&!main.querySelector('.card.feat')){
  const c=document.createElement('div');c.className='card pad feat';
  const draw=list=>{c.innerHTML='<h3>Featured'+(own?' <button class="btn sm" id="ef" style="float:right">'+(list.length?'Edit':'+ Add photos')+'</button>':'')+'</h3>'+(list.length?'<div class="fgrid">'+list.map(x=>'<button class="fi" data-p="'+esc(x)+'" style="background-image:url(&quot;'+esc(url('avatars',x))+'&quot;)" aria-label="Open photo"></button>').join('')+'</div>':'<p class="muted sm">Pick up to 6 photos to show at the top of your profile.</p>');
   c.querySelectorAll('.fi').forEach(b=>b.onclick=()=>lightbox(url('avatars',b.dataset.p)));const e=c.querySelector('#ef');if(e)e.onclick=()=>editFeat(list,l=>{p.featured=l;if(S.me&&S.me.id==id)S.me.featured=l;draw(l)})};
  draw(ft);prof.insertAdjacentElement('afterend',c)}
}
function editFeat(list,done){
 let cur=list.slice();
 const d=sheet('<p class="sh-t">Featured photos</p><div id="fe"></div><label class="btn sm">+ Add photo<input type="file" id="ff" accept="image/*" hidden></label> <span id="fs" class="muted sm"></span><button class="btn pri wide" id="fd" style="margin-top:10px">Save</button>','tall');
 const draw=()=>{$('#fe',d).innerHTML='<div class="fgrid">'+cur.map((x,i)=>'<div class="fi" style="background-image:url(&quot;'+esc(url('avatars',x))+'&quot;)"><button data-i="'+i+'" aria-label="Remove">×</button></div>').join('')+'</div>';$('#fe',d).querySelectorAll('button').forEach(b=>b.onclick=()=>{cur.splice(+b.dataset.i,1);draw()})};draw();
 $('#ff',d).onchange=async e=>{const f=e.target.files[0];if(!f)return;if(cur.length>=6){toast('Up to 6 photos.');return}$('#fs',d).textContent='Uploading…';try{cur.push(await upload('avatars',f));$('#fs',d).textContent='';draw()}catch(x){$('#fs',d).textContent='Upload failed.'}e.target.value=''};
 $('#fd',d).onclick=async()=>{const{error}=await SB.from('profiles').update({featured:cur}).eq('id',S.user.id);if(error){toast('Could not save.');return}closeSheet();toast('Saved');done(cur)}}

async function chatHead(){
 const a=document.querySelector('#top .ttl a[href^="#/profile/"]');if(!a)return;const id=a.getAttribute('href').split('/').pop();if(a.dataset.s20==id)return;a.dataset.s20=id;
 await need([id]);const p=S.cache.get(id)||{};const sp=a.querySelector('span:not(.av)');if(!sp)return;
 if(p.verified&&!sp.querySelector('.vf'))sp.insertAdjacentHTML('beforeend','<span class="vf">✓</span>');
 const s=seenTxt((await seenOf([id]))[id]);if(s&&!sp.querySelector('.seen'))sp.insertAdjacentHTML('beforeend','<span class="seen'+(s.on?' on':'')+'">'+s.t+'</span>')}

/* right side of the computer layout: green dot for friends who are active */
async function rail(){
 const r=document.getElementById('dr');if(!r||r.hidden)return;const rows=[...r.querySelectorAll('a.drow[href^="#/profile/"]:not([data-s20])')];if(!rows.length)return;
 const ids=rows.map(a=>a.getAttribute('href').split('/').pop());const m=await seenOf(ids);
 rows.forEach((a,i)=>{a.dataset.s20='1';const s=seenTxt(m[ids[i]]);if(s&&s.on)a.insertAdjacentHTML('afterbegin','<span class="gdot" title="Active now"></span>')})}

/* ===== settings: show when I am active ===== */
function settings(main){
 if(main.querySelector('#sa20'))return;const anchor=main.querySelector('.card.list')||main.querySelector('.card');if(!anchor)return;
 const c=document.createElement('div');c.className='card pad';c.innerHTML='<label class="chk"><input type="checkbox" id="sa20" checked> <span><b>Show when I am active</b><br><small class="muted">If you turn this off you will not see when others are active either.</small></span></label>';
 anchor.insertAdjacentElement('beforebegin',c);
 SB.rpc('my_show_active').then(({data})=>{if(data===false)c.querySelector('#sa20').checked=false}).catch(()=>{});
 c.querySelector('#sa20').onchange=async e=>{const{error}=await SB.rpc('set_show_active',{p_show:e.target.checked});toast(error?'Could not save.':e.target.checked?'Active status on':'Active status off')}}

/* ===== menu links ===== */
function menuLinks(main){
 if(main.querySelector('[data-s20m]'))return;const lists=main.querySelectorAll('.card.list');if(!lists[0])return;
 const li=(h,i,t,sub)=>'<a class="li" data-s20m="1" href="'+h+'"><span class="mi2">'+i+'</span><div class="grow"><b>'+t+'</b><small>'+sub+'</small></div>'+ic('back',16).replace('class="ic"','class="ic fwd"')+'</a>';
 lists[0].insertAdjacentHTML('beforeend',li('#/scheduled',ic('check',22),'Scheduled & drafts','Posts waiting to go out')+li('#/closefriends',ic('users',22),'Close friends','Share with a smaller circle')+li('#/following',ic('friends',22),'Following','Posts from people you follow'))}

/* ===== compose: Schedule + Save draft ===== */
let sched=null;
function composeTools(main){
 const tools=main.querySelector('.tools'),pbE=document.getElementById('pb');if(!tools||tools.dataset.s20||!pbE||/Save/i.test(pbE.textContent))return;tools.dataset.s20='1';
 tools.insertAdjacentHTML('beforeend','<button class="btn sm" id="bsch" type="button">🕒 Schedule</button><button class="btn sm" id="bdr" type="button">💾 Save draft</button>');
 const go=(status,at)=>{sched={status,at};const pb=document.getElementById('pb');if(pb)pb.click();sched=null};
 document.getElementById('bdr').onclick=()=>go('draft',null);
 document.getElementById('bsch').onclick=()=>{const min=new Date(Date.now()+5*60000);const d=sheet('<p class="sh-t">Schedule this post</p><label class="fl"><span>Post it on</span><input class="dtin" type="datetime-local" id="sdt" min="'+toLocalInput(min)+'" value="'+toLocalInput(new Date(Date.now()+3600000))+'"></label><p class="fnote" style="font-size:13px;color:var(--mut)">It will be posted for you at that time. Your photo or video is saved with it.</p><p class="err" id="ser"></p><button class="btn pri wide" id="sgo">Schedule</button>');
  document.getElementById('sgo').onclick=()=>{const v=document.getElementById('sdt').value;const t=new Date(v);if(!v||isNaN(t))return document.getElementById('ser').textContent='Choose a date and time.';if(t<new Date(Date.now()+60000))return document.getElementById('ser').textContent='Choose a time in the future.';closeSheet();go('scheduled',t.toISOString())}}}
/* when compose sends a new post while a schedule/draft is chosen, save it to scheduled_posts instead */
function hookSB(){if(typeof SB=='undefined'||!SB||SB._h20)return;SB._h20=1;const from0=SB.from.bind(SB);SB.from=function(t){const q=from0(t);if(t=='posts'&&sched){const s=sched;const ins=q.insert.bind(q);q.insert=function(row){sched=null;const pl={...row};delete pl.author;S._schedMsg=s.status=='draft'?'Draft saved':'Scheduled for '+fmtWhen(s.at);S._schedGo='#/scheduled';return from0('scheduled_posts').insert({owner:S.user.id,payload:pl,publish_at:s.at,status:s.status})};return q}return q}}
hookSB();const hk=setInterval(()=>{hookSB();if(typeof SB!='undefined'&&SB&&SB._h20)clearInterval(hk)},300);

/* ===== scheduled & drafts page ===== */
R.scheduled=async()=>{tbar({title:'Scheduled & drafts'});let tab=S._schedTab||'scheduled';
 const load=async()=>{const{data}=await SB.from('scheduled_posts').select('*').in('status',['scheduled','draft','failed']).order('publish_at',{ascending:true}).limit(100);const all=data||[];
  const list=all.filter(r=>tab=='draft'?r.status=='draft':r.status!='draft');
  view('<div class="pad0"><div class="seg" id="sg"><button data-t="scheduled" class="'+(tab=='scheduled'?'on':'')+'">Scheduled ('+all.filter(r=>r.status!='draft').length+')</button><button data-t="draft" class="'+(tab=='draft'?'on':'')+'">Drafts ('+all.filter(r=>r.status=='draft').length+')</button></div><div class="card pad sch">'+(list.length?list.map(r=>{const pl=r.payload||{};const n=(pl.media||[]).length;return '<div class="schr" data-id="'+r.id+'"><div class="t">'+esc(pl.body||(n?'(photo / video)':'(empty)'))+'</div><div class="m">'+(r.status=='draft'?'Draft':r.status=='failed'?'<span style="color:var(--danger)">Could not post: '+esc(r.error||'error')+'</span>':'🕒 '+fmtWhen(r.publish_at))+(n?' · '+n+' photo/video'+(n==1?'':'s'):'')+' · '+esc((VIS[pl.visibility]||['', 'Public'])[1])+'</div><div class="b"><button class="btn sm pri" data-a="now">Post now</button><button class="btn sm" data-a="edit">'+(r.status=='draft'?'Edit / schedule':'Edit')+'</button><button class="btn sm danger" data-a="del">Delete</button></div></div>'}).join(''):'<p class="muted center">'+(tab=='draft'?'No drafts.':'Nothing scheduled.')+'<br>When you write a post, tap 🕒 Schedule or 💾 Save draft.</p>')+'</div><div class="center-b"><a class="btn pri" href="#/compose">+ Write a post</a></div></div>');
  document.querySelectorAll('#sg button').forEach(b=>b.onclick=()=>{tab=S._schedTab=b.dataset.t;load()});
  document.querySelectorAll('.schr [data-a]').forEach(b=>b.onclick=async()=>{const row=all.find(x=>x.id==b.closest('.schr').dataset.id),a=b.dataset.a;
   if(a=='del'){if(await confirmBox('Delete this?','Delete',1)){await SB.from('scheduled_posts').delete().eq('id',row.id);load()}}
   else if(a=='now'){const{error}=await SB.rpc('publish_now',{p_id:row.id});toast(error?'Could not post.':'Posted!');load()}
   else editSched(row,load)})};
 await load()};
function editSched(row,done){
 const pl=row.payload||{};
 const d=sheet('<p class="sh-t">'+(row.status=='draft'?'Edit draft':'Edit scheduled post')+'</p><div class="stack"><label class="fl"><span>Text</span><textarea id="et" rows="5" maxlength="5000" style="width:100%;padding:12px;border-radius:12px;border:1px solid var(--line);background:var(--card);color:var(--ink);font:inherit">'+esc(pl.body||'')+'</textarea></label><label class="fl"><span>Post it on (leave empty to keep as draft)</span><input class="dtin" type="datetime-local" id="ed" value="'+(row.publish_at?toLocalInput(new Date(row.publish_at)):'')+'"></label><p class="err" id="ee"></p><button class="btn pri wide" id="es">Save</button></div>','tall');
 document.getElementById('es').onclick=async()=>{const body=document.getElementById('et').value.trim();if(!body&&!(pl.media||[]).length)return document.getElementById('ee').textContent='Write something.';const v=document.getElementById('ed').value;let at=null,status='draft';if(v){const t=new Date(v);if(isNaN(t))return document.getElementById('ee').textContent='Bad date.';if(t<new Date(Date.now()+60000)){document.getElementById('ee').textContent='Choose a time in the future.';return}at=t.toISOString();status='scheduled'}
  const{error}=await SB.from('scheduled_posts').update({payload:{...pl,body},publish_at:at,status,error:''}).eq('id',row.id);if(error)return document.getElementById('ee').textContent='Could not save.';closeSheet();toast('Saved');done()}}

/* ===== close friends editor ===== */
R.closefriends=async()=>{tbar({title:'Close friends'});const fr=await myFriends();const{data}=await SB.from('close_friends').select('friend').eq('owner',S.user.id);const set=new Set((data||[]).map(x=>x.friend));
 view('<div class="pad0"><div class="card pad"><b>Close friends</b><p class="muted sm">Only the people you pick can see posts you share with <b>Close friends</b>. They are not told they are on the list.</p></div><div class="card list" id="cfl">'+(fr.length?fr.map(p=>'<div class="cfr" data-id="'+p.id+'">'+av(p,40)+'<div class="grow"><b>'+esc(p.full_name)+'</b></div><button class="starbtn'+(set.has(p.id)?' on':'')+'">'+(set.has(p.id)?'Added ✓':'Add')+'</button></div>').join(''):'<p class="pad muted center">Add friends first.</p>')+'</div></div>');
 document.querySelectorAll('#cfl .cfr').forEach(r=>{const b=r.querySelector('button'),id=r.dataset.id;b.onclick=async()=>{b.disabled=true;if(set.has(id)){await SB.from('close_friends').delete().eq('owner',S.user.id).eq('friend',id);set.delete(id)}else{const{error}=await SB.from('close_friends').insert({owner:S.user.id,friend:id});if(error){toast('Could not add.');b.disabled=false;return}set.add(id)}b.classList.toggle('on',set.has(id));b.textContent=set.has(id)?'Added ✓':'Add';b.disabled=false}})};

/* ===== posts from people I follow ===== */
R.following=async()=>{tbar({title:'Following'});const{data:fl}=await SB.from('follows').select('followee').eq('follower',S.user.id);const ids=(fl||[]).map(x=>x.followee);
 if(!ids.length){view('<div class="pad0"><div class="card pad center"><p><b>You are not following anyone yet</b></p><p class="muted">Open a profile and tap Follow to see their public posts here, even if you are not friends.</p></div></div>');return}
 await need(ids);const{data}=await SB.from('posts').select('*').in('author',ids).order('created_at',{ascending:false}).limit(40);const ps=(data||[]).filter(p=>!p.group_id&&!p.page_id);const ex=await enrich(ps);
 view('<div class="pad0"><div class="card pad"><b>Following '+ids.length+'</b><p class="muted sm">'+ids.map(i=>esc(P(i).full_name)).slice(0,6).join(', ')+(ids.length>6?' and more':'')+'</p></div>'+(ps.length?ps.map(p=>card(p,ex)).join(''):'<div class="card pad center muted">No posts yet.</div>')+'</div>');wirePosts($('#main'),R.following)};

/* run when the screen changes */
let t=null;const mo=new MutationObserver(()=>{if(t)return;t=setTimeout(()=>{t=null;decorate()},300)});
mo.observe(document.body,{childList:true,subtree:true});
})();
