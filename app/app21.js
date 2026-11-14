/* One Face v4.2: Marketplace. Buy and sell near you. Uses oneface13.sql. Existing layout and colors are kept. */
(function(){
const CSS=`
.mk-top{display:flex;gap:8px;align-items:center;padding:0 0 10px}.mk-top input{flex:1;padding:11px 14px;border-radius:22px;border:1px solid var(--line);background:var(--card);color:var(--ink);font:inherit}
.mk-chips{display:flex;gap:8px;overflow-x:auto;padding:0 0 10px;scrollbar-width:none}.mk-chips::-webkit-scrollbar{display:none}
.mk-chip{flex:none;border:1px solid var(--line);background:var(--card);color:var(--ink);border-radius:20px;padding:7px 14px;font-weight:600;font-size:14px;cursor:pointer}.mk-chip.on{background:var(--pri,#AB7529);border-color:var(--pri,#AB7529);color:#fff}
.mk-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
@media(min-width:700px){.mk-grid{grid-template-columns:repeat(3,1fr)}}
.mk-it{display:block;background:var(--card);border-radius:14px;overflow:hidden;border:1px solid var(--line);text-decoration:none;color:inherit}
.mk-it .ph{aspect-ratio:1/1;background:var(--soft) center/cover no-repeat;position:relative}
.mk-it .ph.sold:after{content:"SOLD";position:absolute;inset:0;display:grid;place-items:center;background:rgba(0,0,0,.5);color:#fff;font-weight:800;letter-spacing:2px}
.mk-it .in{padding:8px 10px 10px}.mk-it .pr{font-weight:800;font-size:16px}.mk-it .tt{font-size:14px;line-height:1.25;max-height:2.5em;overflow:hidden}.mk-it .lc{font-size:12px;color:var(--mut);margin-top:2px}
.mk-tabs{display:flex;gap:8px;padding:0 0 10px}.mk-tabs button{flex:1;padding:9px 4px;border-radius:12px;border:1px solid var(--line);background:var(--card);color:var(--ink);font-weight:700;cursor:pointer}.mk-tabs button.on{background:var(--ink);color:var(--card);border-color:var(--ink)}
.mk-car{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;background:var(--soft)}.mk-car::-webkit-scrollbar{display:none}
.mk-car .s{flex:none;width:100%;aspect-ratio:1/1;max-height:520px;scroll-snap-align:center;background:center/contain no-repeat;cursor:pointer}
.mk-dots{text-align:center;color:var(--mut);font-size:12px;padding:6px 0 0}
.mk-d h2{margin:0;font-size:24px}.mk-d .ttl{font-size:19px;margin:2px 0 6px;font-weight:700}
.mk-d .meta{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0}.mk-d .meta span{background:var(--soft);border-radius:14px;padding:4px 10px;font-size:13px}
.mk-d .desc{white-space:pre-wrap;word-break:break-word;margin:10px 0}
.mk-sell{display:flex;align-items:center;gap:12px;padding:10px 0;border-top:1px solid var(--line);margin-top:10px;text-decoration:none;color:inherit}
.mk-act{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}.mk-act .btn{flex:1 1 42%;min-width:0;white-space:nowrap;padding:12px 6px}
.mk-ph{display:flex;gap:8px;flex-wrap:wrap}.mk-ph .t{width:64px;height:64px;border-radius:10px;background:var(--soft) center/cover no-repeat;position:relative}
.mk-ph .t b{position:absolute;top:-6px;right:-6px;width:22px;height:22px;border-radius:50%;background:#000;color:#fff;font-size:14px;line-height:22px;text-align:center;cursor:pointer}
`;
const st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);
const CATS_M=['Vehicles','Property','Electronics','Home & garden','Clothing','Baby & kids','Sports','Hobbies','Free','Other'];
const CONDS=['New','Like new','Used','For parts'];
const money=c=>c==null?'Ask price':(c==0?'Free':'$'+(c/100).toLocaleString(undefined,{minimumFractionDigits:c%100?2:0,maximumFractionDigits:2}));
const ph0=it=>url('posts',(it.photos||[])[0]);
const MK=S._mk=S._mk||{cat:'All',q:'',tab:'browse'};

function tile(it){return '<a class="mk-it" href="#/marketitem/'+it.id+'"><div class="ph'+(it.status=='sold'?' sold':'')+'" style="background-image:url(\''+esc(ph0(it))+'\')"></div><div class="in"><div class="pr">'+money(it.price_cents)+'</div><div class="tt">'+esc(it.title)+'</div><div class="lc">'+esc(it.city||'')+'</div></div></a>'}

R.market=async()=>{
 tbar({title:'Marketplace',right:'<button class="btn sm pri" id="mksell">+ Sell</button>'});
 const draw=async()=>{
  let rows=[];
  if(MK.tab=='browse'){let q=SB.from('market_items').select('*').eq('status','active').order('created_at',{ascending:false}).limit(60);if(MK.cat!='All')q=q.eq('category',MK.cat);if(MK.q)q=q.ilike('title','%'+MK.q.replace(/[%,]/g,'')+'%');const{data}=await q;rows=data||[]}
  else if(MK.tab=='mine'){const{data}=await SB.from('market_items').select('*').eq('seller',S.user.id).order('created_at',{ascending:false});rows=data||[]}
  else{const{data:sv}=await SB.from('market_saves').select('item_id').eq('user_id',S.user.id);const ids=(sv||[]).map(x=>x.item_id);if(ids.length){const{data}=await SB.from('market_items').select('*').in('id',ids);rows=(data||[]).filter(x=>x.status!='hidden')}}
  const g=document.getElementById('mkgrid');if(!g)return;
  g.innerHTML=rows.length?'<div class="mk-grid">'+rows.map(tile).join('')+'</div>':'<div class="card pad center"><p><b>'+(MK.tab=='mine'?'You have not listed anything yet':MK.tab=='saved'?'Nothing saved yet':'Nothing here yet')+'</b></p><p class="muted">'+(MK.tab=='browse'?'Be the first: tap + Sell.':MK.tab=='mine'?'Tap + Sell to list your first item.':'Tap Save on an item to keep it here.')+'</p></div>'};
 view('<div class="pad0"><div class="mk-tabs"><button data-t="browse">Browse</button><button data-t="mine">My listings</button><button data-t="saved">Saved</button></div>'
  +'<div id="mkfilters"><div class="mk-top"><input id="mkq" type="search" placeholder="Search Marketplace" value="'+esc(MK.q)+'"></div><div class="mk-chips">'+['All'].concat(CATS_M).map(c=>'<button class="mk-chip'+(MK.cat==c?' on':'')+'" data-c="'+esc(c)+'">'+esc(c)+'</button>').join('')+'</div></div><div id="mkgrid"><div class="card pad center muted">Loading…</div></div></div>');
 const tabs=()=>{document.querySelectorAll('.mk-tabs button').forEach(b=>b.classList.toggle('on',b.dataset.t==MK.tab));document.getElementById('mkfilters').style.display=MK.tab=='browse'?'':'none'};
 tabs();
 document.querySelectorAll('.mk-tabs button').forEach(b=>b.onclick=()=>{MK.tab=b.dataset.t;tabs();draw()});
 document.querySelectorAll('.mk-chip').forEach(b=>b.onclick=()=>{MK.cat=b.dataset.c;document.querySelectorAll('.mk-chip').forEach(x=>x.classList.toggle('on',x==b));draw()});
 let tm;document.getElementById('mkq').oninput=e=>{clearTimeout(tm);tm=setTimeout(()=>{MK.q=e.target.value.trim();draw()},300)};
 document.getElementById('mksell').onclick=()=>sellForm();
 await draw()};

function sellForm(it){
 const photos=(it&&it.photos?it.photos.slice():[]);
 const d=sheet('<p class="sh-t">'+(it?'Edit listing':'Sell something')+'</p><div class="stack">'
  +'<div class="mk-ph" id="mkph"></div><label class="btn sm" id="mkpl">Add photos (up to 6)<input type="file" id="mkpi" accept="image/*" multiple hidden></label><span id="mkps" class="muted sm"></span>'
  +field('mt','Title','text','','maxlength="100" value="'+esc(it?it.title:'')+'"')
  +field('mp','Price in dollars (0 = free, empty = ask)','text','','inputmode="decimal" value="'+(it&&it.price_cents!=null?(it.price_cents/100):'')+'"')
  +'<label class="fl"><span>Category</span><select id="mc" class="sel">'+CATS_M.map(c=>'<option'+(it&&it.category==c?' selected':'')+'>'+c+'</option>').join('')+'</select></label>'
  +'<label class="fl"><span>Condition</span><select id="mcn" class="sel">'+CONDS.map(c=>'<option'+((it?it.condition:'Used')==c?' selected':'')+'>'+c+'</option>').join('')+'</select></label>'
  +field('mcity','City','text','','maxlength="80" value="'+esc(it?it.city:(S.me&&S.me.city)||'')+'"')
  +'<label class="fl"><span>Description</span><textarea id="md" maxlength="2000" rows="4" class="dtin" placeholder="Tell buyers about it">'+esc(it?it.description:'')+'</textarea></label>'
  +'<p class="fnote">Meet in a public place and never send money before you see the item.</p><p class="err" id="me"></p><button class="btn pri big" id="msv">'+(it?'Save':'Post listing')+'</button></div>');
 const $d=s=>d.querySelector(s);
 const paint=()=>{$d('#mkph').innerHTML=photos.map((p,i)=>'<div class="t" style="background-image:url(\''+esc(url('posts',p))+'\')"><b data-i="'+i+'">×</b></div>').join('');$d('#mkph').querySelectorAll('b').forEach(b=>b.onclick=()=>{photos.splice(+b.dataset.i,1);paint()});$d('#mkpl').style.display=photos.length>=6?'none':''};
 paint();
 $d('#mkpi').onchange=async e=>{const fs=[...e.target.files].slice(0,6-photos.length);for(let i=0;i<fs.length;i++){$d('#mkps').textContent='Uploading '+(i+1)+' of '+fs.length+'…';try{photos.push(await upload('posts',fs[i]))}catch(x){$d('#me').textContent='Photo failed: '+(x.message||x)}}$d('#mkps').textContent='';paint();e.target.value=''};
 $d('#msv').onclick=async()=>{
  const title=$d('#mt').value.trim(),ps=$d('#mp').value.trim().replace(/[$,\s]/g,'');
  if(title.length<2)return $d('#me').textContent='Please add a title.';
  let price=null;if(ps!==''){const n=Number(ps);if(isNaN(n)||n<0||n>1000000)return $d('#me').textContent='Price must be a number.';price=Math.round(n*100)}
  if(!photos.length)return $d('#me').textContent='Please add at least one photo.';
  const row={title,description:$d('#md').value.trim(),price_cents:price,category:$d('#mc').value,condition:$d('#mcn').value,city:$d('#mcity').value.trim(),photos};
  $d('#msv').disabled=true;
  const r=it?await SB.from('market_items').update(row).eq('id',it.id):await SB.from('market_items').insert({...row,seller:S.user.id,status:'active'}).select().single();
  if(r.error){$d('#msv').disabled=false;return $d('#me').textContent=(r.error.message||'Could not save.').replace(/^.*exception: /,'')}
  closeSheet();toast(it?'Saved':'Listed ✓');if(it)R.marketitem(it.id);else{MK.tab='mine';location.hash='#/market';if(S.route&&S.route.name=='market')R.market()}}}

R.marketitem=async id=>{
 tbar({title:'Item'});
 const{data:it}=await SB.from('market_items').select('*').eq('id',id).maybeSingle();
 if(!it){view('<div class="pad0"><div class="card pad center"><p><b>This item is not available.</b></p><a class="btn" href="#/market">Back to Marketplace</a></div></div>');return}
 await need([it.seller]);const sl=P(it.seller),mine=it.seller==S.user.id,adm=S.me&&S.me.role=='admin';
 const{data:sv}=await SB.from('market_saves').select('item_id').eq('user_id',S.user.id).eq('item_id',id);let saved=!!(sv&&sv.length);
 const ph=(it.photos||[]);
 view('<div class="pad0"><div class="card mk-d" style="overflow:hidden"><div class="mk-car" id="mkc">'+ph.map(p=>'<div class="s" data-lb="'+esc(url('posts',p))+'" style="background-image:url(\''+esc(url('posts',p))+'\')"></div>').join('')+'</div>'+(ph.length>1?'<div class="mk-dots" id="mkd">1 / '+ph.length+'</div>':'')
  +'<div class="pad"><h2>'+money(it.price_cents)+(it.status=='sold'?' <small class="muted">· Sold</small>':'')+'</h2><div class="ttl">'+esc(it.title)+'</div><div class="meta"><span>'+esc(it.condition)+'</span><span>'+esc(it.category)+'</span>'+(it.city?'<span>📍 '+esc(it.city)+'</span>':'')+'</div><div class="muted sm">Listed '+new Date(it.created_at).toLocaleDateString([], {month:'short',day:'numeric'})+'</div>'
  +(it.description?'<div class="desc">'+esc(it.description)+'</div>':'')
  +'<a class="mk-sell" href="#/profile/'+it.seller+'">'+av(sl,44)+'<div class="grow"><b>'+esc(sl.full_name)+'</b>'+(sl.verified?'<span class="vf">✓</span>':'')+'<br><small class="muted">Seller</small></div></a>'
  +'<div class="mk-act">'+(mine?'<button class="btn" id="mke">Edit</button><button class="btn" id="mks">'+(it.status=='sold'?'Relist':'Mark as sold')+'</button><button class="btn" id="mkx">Delete</button>':'<button class="btn pri" id="mkm">Message seller</button><button class="btn" id="mkv">'+(saved?'Saved ✓':'Save')+'</button>')+(adm&&!mine?'<button class="btn" id="mkx">Remove</button>':'')+(!mine?'<button class="btn" id="mkr">Report</button>':'')+'</div></div></div></div>');
 const c=document.getElementById('mkc');if(c&&ph.length>1)c.onscroll=()=>{document.getElementById('mkd').textContent=(Math.round(c.scrollLeft/c.clientWidth)+1)+' / '+ph.length};
 c&&c.querySelectorAll('[data-lb]').forEach(s=>s.onclick=()=>lightbox(s.dataset.lb));
 const $=s=>document.querySelector(s);
 if($('#mkm'))$('#mkm').onclick=async()=>{const b=$('#mkm');b.disabled=true;const{data:cid,error}=await SB.rpc('get_or_create_dm',{p_other:it.seller});if(error||!cid){b.disabled=false;toast(error&&/block|cannot/i.test(error.message||'')?'You cannot message this person.':'Could not open chat.');return}
  const{error:e2}=await SB.from('messages').insert({conversation_id:cid,sender_id:S.user.id,body:'Hi, is "'+it.title+'" still available? '+location.origin+location.pathname+'#/marketitem/'+it.id});if(e2){b.disabled=false;toast('Could not send.');return}location.hash='#/chat/'+cid};
 if($('#mkv'))$('#mkv').onclick=async()=>{if(saved){await SB.from('market_saves').delete().eq('user_id',S.user.id).eq('item_id',id);saved=false}else{await SB.from('market_saves').insert({user_id:S.user.id,item_id:id});saved=true}$('#mkv').textContent=saved?'Saved ✓':'Save';toast(saved?'Saved':'Removed from saved')};
 if($('#mkr'))$('#mkr').onclick=()=>reportSheet('listing',id);
 if($('#mke'))$('#mke').onclick=()=>sellForm(it);
 if($('#mks'))$('#mks').onclick=async()=>{const ns=it.status=='sold'?'active':'sold';const{error}=await SB.from('market_items').update({status:ns}).eq('id',id);if(error){toast((error.message||'Could not update.').replace(/^.*exception: /,''));return}toast(ns=='sold'?'Marked as sold':'Listed again');R.marketitem(id)};
 if($('#mkx'))$('#mkx').onclick=async()=>{if(!await confirmBox('Delete this listing?','Delete',true))return;const{error}=await SB.from('market_items').delete().eq('id',id);if(error){toast('Could not delete.');return}toast('Deleted');location.hash='#/market'}};

/* menu link */
function menuLink(){if(!S||!S.route||S.route.name!='menu')return;const main=document.getElementById('main');if(!main||main.querySelector('[data-s21m]'))return;const l=main.querySelector('.card.list');if(!l)return;
 l.insertAdjacentHTML('afterbegin','<a class="li" data-s21m="1" href="#/market"><span class="mi2">🛍️</span><div class="grow"><b>Marketplace</b><small>Buy and sell near you</small></div>'+ic('back',16).replace('class="ic"','class="ic fwd"')+'</a>')}
let t=null;new MutationObserver(()=>{if(t)return;t=setTimeout(()=>{t=null;try{menuLink()}catch(e){}},300)}).observe(document.body,{childList:true,subtree:true});
})();
