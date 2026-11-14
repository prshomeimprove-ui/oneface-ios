/* One Face v4.5: Payments (Stripe). Businesses get paid for shop items; buyers pay on Stripe's secure page. One Face takes no fee. Uses oneface16.sql and the "stripe" function. */
(function(){
const CSS=`
.pay h3{margin:0 0 6px}.pay .btns{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}.pay .btns .btn{flex:1 1 40%;min-width:0;white-space:nowrap}
.pay .ok{color:#1f9d55;font-weight:700}
.prod .pa{flex-wrap:wrap}.prod .pa .buy{background:#1f9d55;border-color:#1f9d55;color:#fff;flex:1 1 100%;white-space:nowrap}
.ord{padding:12px 0;border-top:1px solid var(--line)}.ord:first-of-type{border-top:0}.ord .h{display:flex;gap:10px;align-items:center;justify-content:space-between}.ord .m{color:var(--mut);font-size:13.5px;margin-top:4px}
.ords{display:inline-block;border-radius:12px;padding:2px 10px;font-size:12.5px;font-weight:700;background:var(--soft)}.ords.paid{background:#bbf7d0;color:#14532d}.ords.pending{background:#fde68a;color:#78350f}.ords.failed,.ords.refunded{background:#fecaca;color:#7f1d1d}
.sum{display:flex;gap:10px}.sum>div{flex:1;background:var(--soft);border-radius:12px;padding:10px;text-align:center}.sum b{display:block;font-size:20px}
`;
const st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);
const money=c=>'$'+(c/100).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});
const when=t=>new Date(t).toLocaleString([], {month:'short',day:'numeric',hour:'numeric',minute:'2-digit'});
const LBL={pending:'Not finished',paid:'Paid',failed:'Not paid',refunded:'Refunded'};

async function fn(body){
 const r=await SB.functions.invoke('stripe',{body});
 if(r.error){let m='Something went wrong. Please try again.';try{const j=r.error.context&&r.error.context.json&&await r.error.context.json();if(j&&j.error)m=j.error}catch(e){}throw new Error(m)}
 if(r.data&&r.data.error)throw new Error(r.data.error);return r.data}
const go=u=>{if(/^https:\/\/([a-z0-9-]+\.)*(stripe\.com|checkout\.stripe\.com)\//.test(u)||/^demo:/.test(u))location.href=u.replace(/^demo:/,'');else toast('Could not open the payment page.')};

/* ---- business page: owner card + Buy buttons ---- */
let busy=false;
async function decorate(){
 if(busy||!S||!S.user||!S.route||S.route.name!='page')return;
 const main=document.getElementById('main');const biz=main&&main.querySelector('.card.biz');if(!biz)return;
 busy=true;
 try{
  const id=S.route.arg;const{data:pg}=await SB.from('pages').select('id,name,owner,is_business,pay_ready').eq('id',id).maybeSingle();if(!pg||!pg.is_business)return;
  const own=pg.owner==S.user.id;
  if(own&&!main.querySelector('.card.pay')){
   const{data:ps}=await SB.from('page_stripe').select('account_id').eq('page_id',id).maybeSingle();
   const c=document.createElement('div');c.className='card pad pay';
   const draw=(ready,linked)=>{c.innerHTML='<h3>💳 Get paid online</h3>'+(ready?'<p class="ok" style="margin:0 0 4px">✓ Payments are on</p><p class="muted sm" style="margin:0">Customers can tap <b>Buy</b> on your shop items. Money goes to your own Stripe account. One Face takes no fee.</p><div class="btns"><a class="btn pri" href="#/sales/'+id+'">Sales</a><button class="btn" id="pdash">Stripe dashboard</button></div>'
     :'<p class="muted sm" style="margin:0">'+(linked?'Your Stripe setup is not finished yet.':'Let customers pay for your shop items by card. You get paid straight into your bank account. One Face takes no fee.')+'</p><div class="btns"><button class="btn pri" id="pset">'+(linked?'Finish setup':'Set up payments')+'</button>'+(linked?'<button class="btn" id="pchk">I finished, check</button>':'')+'</div>');
     const q=s=>c.querySelector(s);
     if(q('#pset'))q('#pset').onclick=async()=>{q('#pset').disabled=true;try{const d=await fn({action:'onboard',page_id:id});go(d.url)}catch(e){toast(e.message);q('#pset').disabled=false}};
     if(q('#pchk'))q('#pchk').onclick=async()=>{try{const d=await fn({action:'status',page_id:id});if(d.ready){toast('Payments are on ✓');draw(true,true);pg.pay_ready=true;main.querySelectorAll('.card.shop').forEach(x=>x.remove());const p=main.querySelector('.card.prof');if(p){p.dataset.biz=''}}else toast('Not finished yet. Tap Finish setup to continue.')}catch(e){toast(e.message)}};
     if(q('#pdash'))q('#pdash').onclick=async()=>{try{const d=await fn({action:'dashboard',page_id:id});go(d.url)}catch(e){toast(e.message)}}};
   draw(!!pg.pay_ready,!!ps);
   biz.insertAdjacentElement('afterend',c);
   if(ps&&!pg.pay_ready){try{const d=await fn({action:'status',page_id:id});if(d.ready){pg.pay_ready=true;draw(true,true)}}catch(e){}}
  }
  if(!own&&pg.pay_ready){
   const cards=[...main.querySelectorAll('.prod')].filter(x=>!x.querySelector('.buy'));
   if(cards.length){const ids=cards.map(x=>x.dataset.pid);const{data:prods}=await SB.from('page_products').select('id,price_cents,name').in('id',ids);const pm={};(prods||[]).forEach(p=>pm[p.id]=p);
    cards.forEach(x=>{const p=pm[x.dataset.pid];const pa=x.querySelector('.pa');if(!p||!pa||!(p.price_cents>=50))return;pa.insertAdjacentHTML('afterbegin','<button class="btn sm buy" data-buy="'+p.id+'">Buy '+money(p.price_cents)+'</button>');
     pa.querySelector('.buy').onclick=async e=>{const b=e.currentTarget;if(!await confirmBox('Buy '+p.name+' for '+money(p.price_cents)+'?','Continue to payment'))return;b.disabled=true;try{const d=await fn({action:'checkout',product_id:p.id});go(d.url)}catch(er){toast(er.message);b.disabled=false}}})}}
 }catch(e){console.error(e)}finally{busy=false}}

/* ---- my orders (buyer) ---- */
R.orders=async(arg,q)=>{
 tbar({title:'My orders'});
 const paid=q&&q.get&&q.get('paid')=='1';
 const load=async()=>{const{data}=await SB.from('orders').select('*').eq('buyer',S.user.id).order('created_at',{ascending:false}).limit(60);return data||[]};
 let rows=await load();
 if(paid){for(let i=0;i<6&&rows.some(r=>r.status=='pending'&&Date.now()-new Date(r.created_at)<3600000);i++){await new Promise(r=>setTimeout(r,1500));rows=await load()}
  for(const r of rows.filter(r=>r.status=='paid'&&Date.now()-new Date(r.paid_at||r.created_at)<7200000)){let k='of_ord_'+r.id,seen=false;try{seen=localStorage.getItem(k);localStorage.setItem(k,'1')}catch(e){}
   if(!seen){try{const{data:pg}=await SB.from('pages').select('owner,name').eq('id',r.page_id).maybeSingle();if(pg){const{data:cid}=await SB.rpc('get_or_create_dm',{p_other:pg.owner});if(cid)await SB.from('messages').insert({conversation_id:cid,sender_id:S.user.id,body:'💳 I just paid '+money(r.amount_cents)+' for '+r.product_name+' ('+pg.name+'). Order #'+r.id.slice(0,8)})}}catch(e){}}}}
 const pgs={};if(rows.length){const{data}=await SB.from('pages').select('id,name').in('id',[...new Set(rows.map(r=>r.page_id))]);(data||[]).forEach(p=>pgs[p.id]=p)}
 view('<div class="pad0">'+(paid&&rows.some(r=>r.status=='paid')?'<div class="card pad" style="background:#bbf7d0;color:#14532d"><b>Thank you! Your payment went through ✓</b></div>':'')+(rows.length?'<div class="card pad">'+rows.map(r=>'<div class="ord"><div class="h"><div><b>'+esc(r.product_name)+'</b><div class="m"><a href="#/page/'+r.page_id+'">'+esc((pgs[r.page_id]||{}).name||'Business')+'</a> · '+when(r.created_at)+'</div></div><div style="text-align:right"><b>'+money(r.amount_cents)+'</b><br><span class="ords '+r.status+'">'+LBL[r.status]+'</span></div></div></div>').join('')+'</div>':'<div class="card pad center"><p><b>No orders yet</b></p><p class="muted">Items you buy from business pages show up here.</p></div>')+'</div>')};

/* ---- sales (page owner) ---- */
R.sales=async(pageId)=>{
 tbar({title:'Sales'});
 const{data:pg}=await SB.from('pages').select('id,name,owner').eq('id',pageId).maybeSingle();
 if(!pg||pg.owner!=S.user.id){view('<div class="pad0"><div class="card pad center"><p><b>Only the page owner can see this.</b></p></div></div>');return}
 const{data}=await SB.from('orders').select('*').eq('page_id',pageId).order('created_at',{ascending:false}).limit(100);const rows=data||[];
 await need(rows.map(r=>r.buyer));
 const ok=rows.filter(r=>r.status=='paid');const tot=ok.reduce((a,r)=>a+r.amount_cents-(r.fee_cents||0),0);
 view('<div class="pad0"><div class="card pad"><b>'+esc(pg.name)+'</b><div class="sum" style="margin-top:8px"><div><b>'+money(tot)+'</b><small class="muted">You earned</small></div><div><b>'+ok.length+'</b><small class="muted">Paid orders</small></div></div><p class="fnote">Money is paid out by Stripe to your bank account. See details in your Stripe dashboard.</p></div>'
  +(rows.length?'<div class="card pad">'+rows.map(r=>'<div class="ord"><div class="h"><div><b>'+esc(r.product_name)+'</b><div class="m"><a href="#/profile/'+r.buyer+'">'+esc(P(r.buyer).full_name)+'</a> · '+when(r.created_at)+'</div></div><div style="text-align:right"><b>'+money(r.amount_cents)+'</b><br><span class="ords '+r.status+'">'+LBL[r.status]+'</span></div></div>'+(r.status=='paid'?'<div class="m"><a href="#/chat/new/'+r.buyer+'">Message buyer</a></div>':'')+'</div>').join('')+'</div>':'<div class="card pad center muted">No sales yet.</div>')+'</div>')};

function menuLink(){if(!S||!S.route||S.route.name!='menu')return;const main=document.getElementById('main');if(!main||main.querySelector('[data-s24m]'))return;const l=main.querySelector('.card.list');if(!l)return;
 l.insertAdjacentHTML('beforeend','<a class="li" data-s24m="1" href="#/orders"><span class="mi2">🧾</span><div class="grow"><b>My orders</b><small>Things you bought</small></div>'+ic('back',16).replace('class="ic"','class="ic fwd"')+'</a>')}
let t=null;new MutationObserver(()=>{if(t)return;t=setTimeout(()=>{t=null;try{menuLink();decorate()}catch(e){}},350)}).observe(document.body,{childList:true,subtree:true});
})();
