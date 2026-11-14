/* One Face v4.9: new Marketplace listings also show in the main feed as "For sale" cards. No database change needed. */
(function(){
const CSS=`.fsale{overflow:hidden}.fsale header{display:flex;align-items:center;gap:10px;padding:12px 8px 8px 12px}.fsale header .who{flex:1;min-width:0}.fsale header small{display:block;color:var(--mut);font-size:12.5px}
.fsale .fs-ph{display:block;position:relative;aspect-ratio:16/10;background:var(--soft) center/cover no-repeat;text-decoration:none}.fsale .fs-ph i{position:absolute;left:10px;top:10px;background:rgba(0,0,0,.62);color:#fff;border-radius:14px;padding:4px 10px;font-style:normal;font-size:13px;font-weight:700}
.fsale .fs-ph.none{display:grid;place-items:center;font-size:56px}
.fsale .fs-in{display:flex;align-items:center;gap:12px;padding:12px 14px 14px}.fsale .fs-in .t{flex:1;min-width:0;text-decoration:none;color:inherit}.fsale .fs-in .pr{font-weight:800;font-size:19px}.fsale .fs-in .tt{font-size:15px;line-height:1.25;max-height:2.5em;overflow:hidden}.fsale .fs-in .btn{flex:none;padding:10px 16px;white-space:nowrap}`;
const st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);
const money=c=>c==null?'Ask price':(c==0?'Free':'$'+(c/100).toLocaleString(undefined,{minimumFractionDigits:c%100?2:0,maximumFractionDigits:2}));
const HK='of_fsale_hide';
const hidden=()=>{try{return new Set(JSON.parse(localStorage.getItem(HK)||'[]'))}catch(e){return new Set()}};
const hide=id=>{try{const s=hidden();s.add(id);localStorage.setItem(HK,JSON.stringify([...s].slice(-200)))}catch(e){}};
let cache={t:0,rows:[]};

async function listings(){
 if(Date.now()-cache.t<60000)return cache.rows;
 const since=new Date(Date.now()-14*864e5).toISOString();
 const{data}=await SB.from('market_items').select('*').eq('status','active').gte('created_at',since).order('created_at',{ascending:false}).limit(40);
 const seen=new Set(),out=[];for(const r of data||[]){if(seen.has(r.seller))continue;seen.add(r.seller);out.push(r);if(out.length>=8)break}
 await need(out.map(r=>r.seller));cache={t:Date.now(),rows:out};return out}

function card(it,k){
 const p=P(it.seller),ph=(it.photos||[])[0],img=ph?url('posts',ph):'';
 const a=document.createElement('article');a.className='card fsale';a.dataset.k=k;a.dataset.id=it.id;
 a.innerHTML='<header><a href="#/profile/'+it.seller+'">'+av(p,42)+'</a><div class="who"><a href="#/profile/'+it.seller+'"><b>'+esc(p.full_name)+'</b></a><small>listed an item for sale · '+ago(it.created_at)+(it.city?' · '+esc(it.city):'')+'</small></div><button class="ib" data-x="1" aria-label="Hide">'+ic('x',18)+'</button></header>'
  +'<a class="fs-ph'+(img?'':' none')+'" href="#/marketitem/'+it.id+'"'+(img?' style="background-image:url(\''+esc(img)+'\')"':'')+'><i>🛍️ For sale</i>'+(img?'':'🛍️')+'</a>'
  +'<div class="fs-in"><a class="t" href="#/marketitem/'+it.id+'"><div class="pr">'+money(it.price_cents)+'</div><div class="tt">'+esc(it.title)+'</div></a><a class="btn pri" href="#/marketitem/'+it.id+'">View item</a></div>';
 a.querySelector('[data-x]').onclick=()=>{hide(it.id);a.remove()};
 return a}

let busy=false;
async function place(box){
 if(busy||!box.isConnected||S.feedTab=='friends')return;busy=true;
 try{
  const posts=[...box.children].filter(n=>n.matches&&n.matches('article.post'));
  const want=posts.length>=2?1+Math.floor((posts.length-2)/5):0;if(!want)return;
  const hid=hidden();const rows=(await listings()).filter(r=>!hid.has(r.id));if(!rows.length)return;
  const shown=new Set([...box.querySelectorAll('.fsale')].map(n=>n.dataset.id));
  const pool=rows.filter(r=>!shown.has(r.id));
  for(let k=0;k<want;k++){
   if(box.querySelector('.fsale[data-k="'+k+'"]'))continue;
   const it=pool.shift();if(!it)break;
   const after=posts[1+5*k];if(!after||!after.isConnected)break;after.insertAdjacentElement('afterend',card(it,k))}
 }catch(e){console.warn('feed for-sale cards',e)}finally{busy=false}}

const attached=new WeakSet();let timer=null;
function attach(box){if(attached.has(box))return;attached.add(box);
 new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(()=>place(box),150)}).observe(box,{childList:true});
 place(box)}
new MutationObserver(()=>{const b=document.getElementById('feed');if(b)attach(b)}).observe(document.body,{childList:true,subtree:true});
})();
