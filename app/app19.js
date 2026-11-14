/* One Face v4.0: real business pages (info, shop, reviews, verified), Boost a post, sponsored posts, ads dashboard.
   Uses oneface11.sql. Layout and colors are the existing ones. */
(function(){
const CSS=`
.vf{display:inline-grid;place-items:center;width:18px;height:18px;border-radius:50%;background:#2d7ff9;color:#fff;font-size:12px;vertical-align:middle;margin-left:6px;font-weight:700}
.stars{color:#e2a21b;letter-spacing:1px}.stars i{font-style:normal;color:var(--line)}
.biz .row1{display:flex;gap:10px;align-items:flex-start;padding:5px 0;font-size:14.5px}.biz .row1 .k{width:22px;flex:none;text-align:center}
.biz .btns{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}
.biz h3,.shop h3,.rev h3,.owt h3{margin:0 0 8px;font-size:16px}
.prods{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
.prod{border:1px solid var(--line);border-radius:14px;overflow:hidden;background:var(--card)}
.prod .pi{aspect-ratio:1/1;background:var(--soft) center/cover no-repeat}
.prod .pb{padding:8px 10px}.prod .pb b{display:block;font-size:14px}.prod .pb small{color:var(--mut);display:block}
.prod .pp{font-weight:700;color:var(--gold2);margin-top:2px}
.prod .pa{display:flex;gap:6px;padding:0 10px 10px}.prod .pa .btn{flex:1;min-width:0;white-space:nowrap;padding:8px 2px;font-size:12.5px;text-align:center}
.rv{padding:10px 0;border-top:1px solid var(--line)}.rv:first-of-type{border-top:0}
.rv .rh{display:flex;gap:10px;align-items:center}.rv p{margin:6px 0 0;white-space:pre-wrap;word-break:break-word}
.starpick{display:flex;gap:6px;font-size:30px;margin:6px 0}.starpick button{background:none;border:0;font-size:30px;color:var(--line);cursor:pointer;padding:0}.starpick button.on{color:#e2a21b}
.spons{position:relative}.spons .sptag{display:flex;align-items:center;gap:8px;padding:8px 14px 0;font-size:12.5px;color:var(--mut);font-weight:600}
.spons .sptag b{color:var(--ink);font-size:13.5px}.spons .adcta{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 14px;border-top:1px solid var(--line);background:var(--soft)}
.spons .adcta b{font-size:14px;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.adrow{display:block}.adrow .top{display:flex;justify-content:space-between;gap:10px;align-items:center}
.chip{display:inline-block;padding:2px 10px;border-radius:12px;font-size:12px;font-weight:700;background:var(--soft);color:var(--mut)}
.chip.active{background:#e3f4ea;color:#1f7a45}.chip.pending{background:#fff3d6;color:#9a6a00}.chip.rejected{background:#fde4e1;color:#b3261e}.chip.paused{background:#e8eaf0;color:#46506b}
.adstats{display:flex;gap:18px;margin:10px 0 6px}.adstats div{text-align:center}.adstats b{display:block;font-size:20px}.adstats small{color:var(--mut)}
.kpis{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.kpis div{background:var(--soft);border-radius:12px;padding:10px;text-align:center}.kpis b{display:block;font-size:20px}.kpis small{color:var(--mut)}
.sel{width:100%;padding:12px;border-radius:12px;border:1px solid var(--line);background:var(--card);color:var(--ink);font:inherit}
.fnote{font-size:13px;color:var(--mut);margin:6px 0}
`;
const st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);
const money=c=>c==null?'':'$'+(c/100).toFixed(2).replace(/\.00$/,'');
const stars=n=>{n=Math.round(n);return '<span class="stars">'+'★'.repeat(n)+'<i>'+'★'.repeat(5-n)+'</i></span>'};
const mapUrl=a=>'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(a);
const safeUrl=u=>{u=String(u||'').trim();if(!u)return'';if(!/^https?:\/\//i.test(u))u='https://'+u;try{new URL(u);return u}catch(e){return''}};
const tel=p=>String(p||'').replace(/[^\d+]/g,'');
const pgOf=async id=>{let p=S.pg&&S.pg.get(id);if(p&&p.is_business!==undefined)return p;const{data}=await SB.from('pages').select('*').eq('id',id).maybeSingle();if(data&&S.pg)S.pg.set(id,data);return data};

/* ========== business page: info, shop, reviews, owner tools ========== */
let decoBusy=false;
async function decorate(){
 if(decoBusy||!S.route||S.route.name!='page')return;
 const prof=document.querySelector('#main .card.prof');if(!prof||prof.dataset.biz)return;
 decoBusy=true;
 try{
  const id=S.route.arg;const pg=await pgOf(id);if(!pg){return}
  if(!document.querySelector('#main .card.prof')||document.querySelector('#main .card.prof').dataset.biz)return;
  const pr=document.querySelector('#main .card.prof');pr.dataset.biz='1';
  const own=pg.owner==S.user.id;
  if(pg.verified){const h=pr.querySelector('h1');if(h&&!h.querySelector('.vf'))h.insertAdjacentHTML('beforeend','<span class="vf" title="Verified business">✓</span>')}
  let html='';
  if(!pg.is_business){
   if(own)html='<div class="card pad owt"><h3>Run a business?</h3><p class="muted sm">Add your hours, phone and address, a shop with prices, and get reviews and ads.</p><a class="btn pri" href="#/bizedit/'+id+'">Make this a business page</a></div>';
   if(html)pr.insertAdjacentHTML('afterend',html);return}
  const[{data:prods},{data:revs}]=await Promise.all([SB.from('page_products').select('*').eq('page_id',id).eq('active',true).order('created_at',{ascending:false}).limit(40),SB.from('page_reviews').select('*').eq('page_id',id).order('created_at',{ascending:false}).limit(50)]);
    const avg=(revs||[]).length?(revs.reduce((a,r)=>a+r.rating,0)/revs.length):0;
  const info='<div class="card pad biz"><h3>About this business</h3>'
   +((revs||[]).length?'<div class="row1"><span class="k">⭐</span><span>'+stars(avg)+' <b>'+avg.toFixed(1)+'</b> · '+revs.length+' review'+(revs.length==1?'':'s')+'</span></div>':'<div class="row1"><span class="k">⭐</span><span class="muted">No reviews yet</span></div>')
   +(pg.hours?'<div class="row1"><span class="k">🕒</span><span>'+esc(pg.hours)+'</span></div>':'')
   +(pg.phone?'<div class="row1"><span class="k">📞</span><a href="tel:'+esc(tel(pg.phone))+'">'+esc(pg.phone)+'</a></div>':'')
   +(pg.address?'<div class="row1"><span class="k">📍</span><a href="'+esc(mapUrl(pg.address))+'" target="_blank" rel="noopener">'+esc(pg.address)+'</a></div>':'')
   +(safeUrl(pg.website)?'<div class="row1"><span class="k">🌐</span><a href="'+esc(safeUrl(pg.website))+'" target="_blank" rel="noopener">'+esc(pg.website.replace(/^https?:\/\//,''))+'</a></div>':'')
   +'<div class="btns">'+(own?'':'<a class="btn pri" href="#/chat/new/'+pg.owner+'">💬 Message</a>')+(pg.phone?'<a class="btn" href="tel:'+esc(tel(pg.phone))+'">📞 Call</a>':'')+(pg.address?'<a class="btn" target="_blank" rel="noopener" href="'+esc(mapUrl(pg.address))+'">📍 Directions</a>':'')+'</div></div>';
  const shop=((prods||[]).length||own)?'<div class="card pad shop"><h3>Shop'+(own?' <button class="btn sm pri" id="addprod" style="float:right">+ Add product</button>':'')+'</h3>'+((prods||[]).length?'<div class="prods">'+prods.map(p=>'<div class="prod" data-pid="'+p.id+'"><div class="pi" style="background-image:url(&quot;'+esc(url('avatars',p.image_path))+'&quot;)"></div><div class="pb"><b>'+esc(p.name)+'</b>'+(p.description?'<small>'+esc(p.description)+'</small>':'')+(p.price_cents!=null?'<div class="pp">'+money(p.price_cents)+'</div>':'')+'</div>'+(own?'<div class="pa"><button class="btn sm" data-a="pe">Edit</button><button class="btn sm danger" data-a="pd">Delete</button></div>':'<div class="pa"><a class="btn sm pri" href="#/chat/new/'+pg.owner+'">Ask / order</a></div>')+'</div>').join('')+'</div>':'<p class="muted sm">No products yet. Tap "+ Add product".</p>')+'</div>':'';
  const owt=own?'<div class="card pad owt"><h3>Business tools</h3><div class="btns" style="display:flex;gap:8px;flex-wrap:wrap"><a class="btn" href="#/bizedit/'+id+'">Business info</a><a class="btn pri" href="#/ads">📣 My ads</a></div><p class="fnote">To advertise: open any public post of this page, tap ⋯ then <b>Boost post</b>.</p></div>':'';
  pr.insertAdjacentHTML('afterend',info+shop+owt);
  const main=document.querySelector('#main');
  const rerender=()=>{const p=document.querySelector('#main .card.prof');if(p){['biz','shop','owt'].forEach(c=>document.querySelectorAll('#main .card.'+c).forEach(x=>x.remove()));p.dataset.biz='';decorate()}};
  const ap=main.querySelector('#addprod');if(ap)ap.onclick=()=>prodForm(pg,null,rerender);
  main.querySelectorAll('.prod [data-a]').forEach(b=>b.onclick=async()=>{const pid=b.closest('.prod').dataset.pid,pp=prods.find(x=>x.id==pid);if(b.dataset.a=='pe')prodForm(pg,pp,rerender);else if(await confirmBox('Delete this product?','Delete',1)){await SB.from('page_products').delete().eq('id',pid);rerender()}});
 }catch(e){console.error(e)}finally{decoBusy=false}
}
function prodForm(pg,p,done){
 const d=sheet('<p class="sh-t">'+(p?'Edit product':'Add a product or service')+'</p><div class="stack">'+field('pn','Name','text','','maxlength="80" value="'+esc(p?p.name:'')+'"')+field('pp','Price in dollars (leave empty to ask)','text','','inputmode="decimal" value="'+(p&&p.price_cents!=null?(p.price_cents/100):'')+'"')+field('pd','Short description','text','','maxlength="500" value="'+esc(p?p.description:'')+'"')+'<label class="btn sm">'+(p&&p.image_path?'Change photo':'Add photo')+'<input type="file" id="pi" accept="image/*" hidden></label><span id="pis" class="muted sm"></span><p class="err" id="pe"></p><button class="btn pri big" id="ps">Save</button></div>');
 let img=p?p.image_path:null;
 $('#pi',d).onchange=async e=>{const f=e.target.files[0];if(!f)return;$('#pis',d).textContent='Uploading…';try{img=await upload('avatars',f);$('#pis',d).textContent='Photo added ✓'}catch(x){$('#pis',d).textContent='Upload failed.'}};
 $('#ps',d).onclick=async()=>{const n=$('#pn',d).value.trim();if(!n)return $('#pe',d).textContent='Enter a name.';const pr=$('#pp',d).value.trim();let cents=null;if(pr){const v=parseFloat(pr.replace(/[$,]/g,''));if(isNaN(v)||v<0)return $('#pe',d).textContent='Enter a price like 12.50';cents=Math.round(v*100)}
  const row={name:n,description:$('#pd',d).value.trim(),price_cents:cents,image_path:img};let r;if(p)r=await SB.from('page_products').update(row).eq('id',p.id);else r=await SB.from('page_products').insert({...row,page_id:pg.id});
  if(r.error)return $('#pe',d).textContent='Could not save.';closeSheet();toast('Saved');done()}}

/* ========== business info editor ========== */
R.bizedit=async(id)=>{const{data:p}=await SB.from('pages').select('*').eq('id',id).maybeSingle();if(!p||p.owner!=S.user.id){location.hash='#/pages';return}tbar({title:'Business info'});
 view('<div class="pad"><form id="f" class="stack" novalidate><label class="chk"><input type="checkbox" id="bz"'+(p.is_business?' checked':'')+'> <span><b>This is a business</b><br><small class="muted">Shows hours, phone, address, shop and reviews.</small></span></label>'+field('bph','Phone','tel','+1 555 123 4567','maxlength="30" value="'+esc(p.phone)+'"')+field('bad','Address','text','Street, city, state','maxlength="160" value="'+esc(p.address)+'"')+field('bwb','Website','text','yourbusiness.com','maxlength="160" value="'+esc(p.website)+'"')+'<label class="fl"><span>Opening hours</span><input id="bhr" maxlength="160" placeholder="Mon-Fri 9am-6pm" value="'+esc(p.hours)+'"></label>'+(p.verified?'<p class="fnote">✓ Verified by One Face</p>':'<p class="fnote">Verified badge: ask support at support@onefaceapp.com after your page is complete.</p>')+'<p class="err" id="er"></p><button class="btn pri big" id="go">Save</button></form></div>');
 $('#f').onsubmit=async e=>{e.preventDefault();const w=$('#bwb').value.trim();if(w&&!safeUrl(w))return $('#er').textContent='Website address looks wrong.';const{error}=await SB.from('pages').update({is_business:$('#bz').checked,phone:$('#bph').value.trim(),address:$('#bad').value.trim(),website:w,hours:$('#bhr').value.trim()}).eq('id',id);if(error)return $('#er').textContent='Could not save.';S.pg&&S.pg.delete(id);toast('Saved');location.replace('#/page/'+id)}};

/* ========== Boost a post ========== */
let bp=null;
if(typeof postMenu=='function'){const pm=postMenu;postMenu=async function(id){bp=id;return pm.apply(this,arguments)}}
if(typeof menuSheet=='function'){const ms=menuSheet;menuSheet=function(items){if(bp&&items.some(i=>i.t=='Edit post')){const id=bp;bp=null;items=items.concat([{t:'Boost post (advertise)',ic:'share',f:()=>boostForm(id)}])}return ms(items)}}
async function boostForm(id){
 const{data:p}=await SB.from('posts').select('*').eq('id',id).maybeSingle();
 if(!p)return;if((p.visibility||'public')!='public'){toast('Only public posts can be boosted. Change who can see it first.');return}
 const d=sheet('<p class="sh-t">Boost this post</p><div class="stack"><label class="fl"><span>Headline (optional)</span><input id="bt" maxlength="80" placeholder="Big sale this weekend"></label><label class="fl"><span>Button</span><select id="bc" class="sel"><option>Learn more</option><option>Message</option><option>Call now</option><option>Shop now</option><option>Sign up</option></select></label><label class="fl"><span>For how long</span><select id="bd" class="sel"><option value="1">1 day</option><option value="3">3 days</option><option value="7" selected>7 days</option><option value="14">14 days</option><option value="30">30 days</option></select></label><label class="fl"><span>Only people in this city (optional)</span><input id="bcity" maxlength="80" placeholder="'+esc((S.me&&S.me.city)||'Any city')+'"></label><p class="fnote">✨ Free while we launch. An admin reviews every ad, usually within a day. People see it marked "Sponsored".</p><p class="err" id="be"></p><button class="btn pri big" id="bg">Submit for review</button></div>');
 $('#bg',d).onclick=async()=>{$('#bg',d).disabled=true;const{error}=await SB.rpc('boost_post',{p_post:id,p_days:+$('#bd',d).value,p_title:$('#bt',d).value.trim(),p_cta:$('#bc',d).value,p_city:$('#bcity',d).value.trim()});if(error){$('#bg',d).disabled=false;return $('#be',d).textContent=error.message||'Could not submit.'}closeSheet();toast('Submitted. We will review it soon.');location.hash='#/ads'}}

/* ========== my ads dashboard ========== */
const left=a=>{if(!a.ends_at)return'';const d=Math.ceil((new Date(a.ends_at)-Date.now())/864e5);return d>0?d+' day'+(d==1?'':'s')+' left':'ended'};
R.ads=async()=>{tbar({title:'My ads'});const load=async()=>{
  const{data}=await SB.from('ads').select('*').eq('owner',S.user.id).order('created_at',{ascending:false}).limit(60);const ads=data||[];
  const ids=ads.map(a=>a.post_id);const{data:ps}=ids.length?await SB.from('posts').select('id,body').in('id',ids):{data:[]};const body={};(ps||[]).forEach(p=>body[p.id]=p.body);
  const V=ads.reduce((a,x)=>a+x.views,0),C=ads.reduce((a,x)=>a+x.clicks,0);
  view('<div class="pad0"><div class="card pad"><div class="kpis"><div><b>'+V+'</b><small>Views</small></div><div><b>'+C+'</b><small>Clicks</small></div><div><b>'+(V?(C*100/V).toFixed(1):0)+'%</b><small>Click rate</small></div></div><p class="fnote">✨ Ads are free while we launch. To make a new ad, open one of your public posts, tap ⋯ and choose <b>Boost post</b>.</p></div>'
  +(ads.length?ads.map(a=>'<div class="card pad adrow" data-id="'+a.id+'"><div class="top"><b>'+esc(a.title||'(no headline)')+'</b><span class="chip '+a.status+'">'+(a.status=='pending'?'Waiting for review':a.status)+'</span></div><p class="muted sm" style="margin:4px 0">'+esc((body[a.post_id]||'').slice(0,90))+'</p><small class="muted">'+a.days+' days · button: '+esc(a.cta)+(a.audience_city?' · '+esc(a.audience_city):'')+(a.status=='active'?' · '+left(a):'')+'</small>'+(a.status=='rejected'&&a.reject_reason?'<p class="err" style="margin:6px 0">Not approved: '+esc(a.reject_reason)+'</p>':'')
   +'<div class="adstats"><div><b>'+a.views+'</b><small>Views</small></div><div><b>'+a.clicks+'</b><small>Clicks</small></div></div><div style="display:flex;gap:8px;flex-wrap:wrap">'+(a.status=='active'?'<button class="btn sm" data-a="pause">Pause</button>':'')+(a.status=='paused'&&new Date(a.ends_at)>new Date()?'<button class="btn sm pri" data-a="resume">Resume</button>':'')+'<button class="btn sm danger" data-a="del">Delete</button></div></div>').join(''):'<div class="card pad center muted">No ads yet.</div>')+'</div>');
  document.querySelectorAll('#main .adrow [data-a]').forEach(b=>b.onclick=async()=>{const id=b.closest('.adrow').dataset.id,a=b.dataset.a;if(a=='del'){if(!await confirmBox('Delete this ad?','Delete',1))return;await SB.from('ads').delete().eq('id',id)}else await SB.rpc('ad_set_status',{p_ad:id,p_status:a=='pause'?'paused':'active'});load()})};
 await load()};

/* ========== sponsored posts in the feed ========== */
let adCache={t:0,rows:[]};const seenView=new Set();
async function getAds(){if(Date.now()-adCache.t<60000)return adCache.rows;try{const{data}=await SB.rpc('feed_ads',{p_limit:6});adCache={t:Date.now(),rows:data||[]}}catch(e){adCache={t:Date.now(),rows:[]}}return adCache.rows}
async function adHTML(ad){
 const{data:p}=await SB.from('posts').select('*').eq('id',ad.post_id).maybeSingle();if(!p)return null;
 await need([p.author]);let pg=null;if(p.page_id){pg=await pgOf(p.page_id);if(pg&&S.pg)S.pg.set(pg.id,pg)}
 const ex=await enrich([p]);const name=pg?pg.name:P(p.author).full_name;
 const cta=ad.cta=='Message'?{h:'#/chat/new/'+ad.owner}:ad.cta=='Call now'&&pg&&pg.phone?{h:'tel:'+tel(pg.phone),ext:1}:{h:pg?'#/page/'+pg.id:'#/post/'+p.id};
 const w=document.createElement('div');w.className='spons';w.dataset.ad=ad.id;
 w.innerHTML='<div class="sptag"><span>Sponsored</span>·<b>'+esc(name)+'</b>'+(pg&&pg.verified?'<span class="vf" style="width:15px;height:15px;font-size:10px">✓</span>':'')+'</div>'+card(p,ex)+'<div class="adcta"><b>'+esc(ad.title||name)+'</b><a class="btn sm pri" data-click="1" href="'+esc(cta.h)+'">'+esc(ad.cta)+'</a></div>';
 w.querySelector('[data-click]').addEventListener('click',()=>{try{SB.rpc('ad_click',{p_ad:ad.id})}catch(e){}});
 return w}
const io='IntersectionObserver' in window?new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting&&e.intersectionRatio>=.5){const id=e.target.dataset.ad;if(id&&!seenView.has(id)){seenView.add(id);try{SB.rpc('ad_view',{p_ad:id})}catch(x){}}}}),{threshold:[.5]}):null;
let feedBusy=false;
async function injectAds(){
 if(feedBusy||!S.route||S.route.name!='home')return;const feed=document.querySelector('#feed');if(!feed)return;
 const posts=[...feed.children].filter(c=>c.classList&&c.classList.contains('post'));if(posts.length<3)return;
 feedBusy=true;
 try{const ads=await getAds();if(!ads.length)return;
  const want=Math.floor(posts.length/5)||1;let have=feed.querySelectorAll('.spons').length;
  while(have<want&&have<ads.length){const ad=ads[have];const el=await adHTML(ad);if(!feed.isConnected)return;have++;if(!el)continue;
   const at=posts[Math.min(posts.length-1,have*5-2)];at.insertAdjacentElement('afterend',el);if(io)io.observe(el);if(typeof wirePosts=='function'){try{wirePosts(el,()=>{})}catch(e){}}}
 }catch(e){console.error(e)}finally{feedBusy=false}}
/* right side of the computer layout */
window.OF_ADS_RAIL=async()=>{const ads=await getAds();if(!ads.length)return'';const ad=ads[ads.length-1];const{data:p}=await SB.from('posts').select('*').eq('id',ad.post_id).maybeSingle();if(!p)return'';await need([p.author]);const pg=p.page_id?await pgOf(p.page_id):null;const name=pg?pg.name:P(p.author).full_name;
 return '<div class="card pad spons-rail" data-ad="'+ad.id+'"><small class="muted">Sponsored</small><a class="drow" data-click="1" href="'+esc(pg?'#/page/'+pg.id:'#/post/'+p.id)+'">'+av(pg?PGAV(pg):P(p.author),40)+'<div><b>'+esc(ad.title||name)+'</b><small>'+esc(name)+'</small></div></a></div>'};
document.addEventListener('click',e=>{const a=e.target.closest('.spons-rail [data-click]');if(a){const id=a.closest('.spons-rail').dataset.ad;try{SB.rpc('ad_click',{p_ad:id})}catch(x){}}});
let railSeen=null;setInterval(()=>{const r=document.querySelector('.spons-rail');if(r&&r.dataset.ad!==railSeen){railSeen=r.dataset.ad;if(!seenView.has(r.dataset.ad)){seenView.add(r.dataset.ad);try{SB.rpc('ad_view',{p_ad:r.dataset.ad})}catch(x){}}}},4000);

/* run when the page content changes */
let t=null;const mo=new MutationObserver(()=>{if(t)return;t=setTimeout(()=>{t=null;if(!S||!S.user||!S.route)return;if(S.route.name=='page')decorate();else if(S.route.name=='home')injectAds()},250)});
mo.observe(document.body,{childList:true,subtree:true});
})();
