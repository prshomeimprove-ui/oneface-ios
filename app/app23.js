/* One Face v4.4: Business booking. Customers request an appointment, the business confirms or declines. Uses oneface15.sql. */
(function(){
const CSS=`
.bk h3{margin:0 0 6px}.bk .btns{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}.bk .btns .btn{flex:1 1 40%;min-width:0;white-space:nowrap}
.bkr{padding:12px 0;border-top:1px solid var(--line)}.bkr:first-of-type{border-top:0}
.bkr .h{display:flex;gap:10px;align-items:center}.bkr .h .grow{min-width:0}.bkr .h b{display:block}
.bkr .m{color:var(--mut);font-size:13.5px;margin:6px 0}.bkr .b{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}.bkr .b .btn{flex:1 1 28%;min-width:0;white-space:nowrap;padding:10px 6px}
.bks{display:inline-block;border-radius:12px;padding:2px 10px;font-size:12.5px;font-weight:700;background:var(--soft);color:var(--ink)}
.bks.pending{background:#fde68a;color:#78350f}.bks.confirmed{background:#bbf7d0;color:#14532d}.bks.declined,.bks.cancelled{background:#fecaca;color:#7f1d1d}.bks.done{background:#e5e7eb;color:#374151}
.bkt{display:flex;gap:8px}.bkt>*{flex:1;min-width:0}
`;
const st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);
const when=t=>new Date(t).toLocaleString([], {weekday:'short',month:'short',day:'numeric',hour:'numeric',minute:'2-digit'});
const LBL={pending:'Waiting for reply',confirmed:'Confirmed',declined:'Declined',cancelled:'Cancelled',done:'Done'};
const pad=n=>String(n).padStart(2,'0');
const today=()=>{const d=new Date();return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())};
const tomorrow=()=>{const d=new Date(Date.now()+86400000);return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())};

async function dm(to,text){try{const{data:cid}=await SB.rpc('get_or_create_dm',{p_other:to});if(cid)await SB.from('messages').insert({conversation_id:cid,sender_id:S.user.id,body:text})}catch(e){console.warn('booking message failed',e)}}

function bookForm(pg,done){
 SB.from('page_products').select('name').eq('page_id',pg.id).eq('active',true).limit(40).then(({data})=>{
  const names=(data||[]).map(x=>x.name);
  const d=sheet('<p class="sh-t">Book with '+esc(pg.name)+'</p><div class="stack">'
   +'<label class="fl"><span>Service</span>'+(names.length?'<select id="bsv" class="sel">'+names.map(n=>'<option>'+esc(n)+'</option>').join('')+'<option value="">Something else</option></select>':'<input id="bsv" maxlength="120" placeholder="What do you need?">')+'</label>'
   +'<div class="bkt"><label class="fl"><span>Day</span><input type="date" id="bdt" class="dtin" min="'+today()+'" value="'+tomorrow()+'"></label><label class="fl"><span>Time</span><input type="time" id="btm" class="dtin" value="10:00"></label></div>'
   +'<label class="fl"><span>Note (optional)</span><textarea id="bnt" class="dtin" rows="2" maxlength="500" placeholder="Anything they should know"></textarea></label>'
   +'<p class="fnote">This is a request. The business will confirm or decline it, and you will get a message.</p><p class="err" id="ber"></p><button class="btn pri big" id="bgo">Send request</button></div>');
  const $d=s=>d.querySelector(s);
  $d('#bgo').onclick=async()=>{const dt=$d('#bdt').value,tm=$d('#btm').value;if(!dt||!tm)return $d('#ber').textContent='Choose a day and time.';
   const at=new Date(dt+'T'+tm);if(isNaN(at)||at<new Date(Date.now()+60000))return $d('#ber').textContent='Choose a time in the future.';
   let svc=($d('#bsv').value||'').trim();
   $d('#bgo').disabled=true;
   const{error}=await SB.from('bookings').insert({page_id:pg.id,customer:S.user.id,service:svc,starts_at:at.toISOString(),note:$d('#bnt').value.trim()});
   if(error){$d('#bgo').disabled=false;return $d('#ber').textContent=(error.message||'Could not send.').replace(/^.*exception: /,'')}
   await dm(pg.owner,'📅 Booking request for '+pg.name+': '+(svc||'appointment')+' on '+when(at)+'. Please confirm in Bookings.');
   closeSheet();toast('Request sent ✓');if(done)done()}})}

async function pagesOf(ids){ids=[...new Set(ids)];if(!ids.length)return{};const{data}=await SB.from('pages').select('id,name,owner').in('id',ids);const m={};(data||[]).forEach(p=>m[p.id]=p);return m}

R.mybookings=async()=>{
 tbar({title:'My bookings'});
 const{data}=await SB.from('bookings').select('*').eq('customer',S.user.id).order('starts_at',{ascending:false}).limit(60);const rows=data||[];
 const pm=await pagesOf(rows.map(r=>r.page_id));
 view('<div class="pad0">'+(rows.length?'<div class="card pad">'+rows.map(r=>'<div class="bkr" data-id="'+r.id+'"><div class="h"><div class="grow"><b><a href="#/page/'+r.page_id+'">'+esc((pm[r.page_id]||{}).name||'Business')+'</a></b><span class="muted sm">'+esc(r.service||'Appointment')+'</span></div><span class="bks '+r.status+'">'+LBL[r.status]+'</span></div><div class="m">📅 '+when(r.starts_at)+(r.note?'<br>“'+esc(r.note)+'”':'')+'</div>'+((r.status=='pending'||r.status=='confirmed')?'<div class="b"><button class="btn" data-a="cancel">Cancel booking</button></div>':'')+'</div>').join('')+'</div>':'<div class="card pad center"><p><b>No bookings yet</b></p><p class="muted">Open a business page and tap Book an appointment.</p></div>')+'</div>');
 document.querySelectorAll('#main [data-a=cancel]').forEach(b=>b.onclick=async()=>{const row=b.closest('.bkr'),r=rows.find(x=>x.id==row.dataset.id);if(!await confirmBox('Cancel this booking?','Cancel booking',true))return;
  const{error}=await SB.rpc('set_booking_status',{p_id:r.id,p_status:'cancelled'});if(error){toast((error.message||'Could not cancel.').replace(/^.*exception: /,''));return}
  const p=pm[r.page_id];if(p)await dm(p.owner,'❌ Booking cancelled: '+(r.service||'appointment')+' on '+when(r.starts_at)+'.');toast('Cancelled');R.mybookings()})};

R.bookings=async(pageId)=>{
 tbar({title:'Bookings'});
 const pm=await pagesOf([pageId]);const pg=pm[pageId];
 if(!pg||pg.owner!=S.user.id){view('<div class="pad0"><div class="card pad center"><p><b>Only the page owner can see this.</b></p></div></div>');return}
 const{data}=await SB.from('bookings').select('*').eq('page_id',pageId).order('starts_at',{ascending:true}).limit(100);const rows=data||[];
 await need(rows.map(r=>r.customer));
 const now=Date.now();const up=rows.filter(r=>(r.status=='pending'||r.status=='confirmed')&&new Date(r.starts_at)>=now-86400000),past=rows.filter(r=>!up.includes(r)).reverse();
 const one=r=>{const c=P(r.customer);return '<div class="bkr" data-id="'+r.id+'"><div class="h">'+av(c,40)+'<div class="grow"><b><a href="#/profile/'+r.customer+'">'+esc(c.full_name)+'</a></b><span class="muted sm">'+esc(r.service||'Appointment')+'</span></div><span class="bks '+r.status+'">'+LBL[r.status]+'</span></div><div class="m">📅 '+when(r.starts_at)+(r.note?'<br>“'+esc(r.note)+'”':'')+'</div>'
  +(r.status=='pending'?'<div class="b"><button class="btn pri" data-a="confirmed">Confirm</button><button class="btn" data-a="declined">Decline</button><a class="btn" href="#/chat/new/'+r.customer+'">Message</a></div>':r.status=='confirmed'?'<div class="b"><button class="btn" data-a="done">Mark done</button><button class="btn" data-a="declined">Cancel</button><a class="btn" href="#/chat/new/'+r.customer+'">Message</a></div>':'')+'</div>'};
 view('<div class="pad0"><div class="card pad"><b>'+esc(pg.name)+'</b><p class="muted sm" style="margin:2px 0 0">'+rows.filter(r=>r.status=='pending').length+' waiting for your reply</p></div>'
  +'<div class="card pad"><h3 style="margin:0 0 4px">Upcoming</h3>'+(up.length?up.map(one).join(''):'<p class="muted">Nothing coming up.</p>')+'</div>'
  +(past.length?'<div class="card pad"><h3 style="margin:0 0 4px">Past and closed</h3>'+past.map(one).join('')+'</div>':'')+'</div>');
 document.querySelectorAll('#main [data-a]').forEach(b=>b.onclick=async()=>{const row=b.closest('.bkr'),r=rows.find(x=>x.id==row.dataset.id),a=b.dataset.a;
  if(a=='declined'&&!await confirmBox((r.status=='confirmed'?'Cancel':'Decline')+' this booking?',r.status=='confirmed'?'Cancel booking':'Decline',true))return;
  const{error}=await SB.rpc('set_booking_status',{p_id:r.id,p_status:a});if(error){toast((error.message||'Could not update.').replace(/^.*exception: /,''));return}
  const msg={confirmed:'✅ Your booking at '+pg.name+' is confirmed: ',declined:'❌ Sorry, '+pg.name+' cannot do this booking: ',done:'Thanks for visiting '+pg.name+'! '}[a];
  await dm(r.customer,msg+(r.service||'appointment')+' on '+when(r.starts_at)+'.');toast(a=='confirmed'?'Confirmed':a=='declined'?'Declined':'Marked done');R.bookings(pageId)})};

/* business page card */
let busy=false;
async function decorate(){
 if(busy||!S||!S.user||!S.route||S.route.name!='page')return;
 const biz=document.querySelector('#main .card.biz');if(!biz||document.querySelector('#main .card.bk'))return;
 busy=true;
 try{
  const id=S.route.arg;const{data:pg}=await SB.from('pages').select('id,name,owner,is_business,accepts_bookings').eq('id',id).maybeSingle();
  if(!pg||!pg.is_business||document.querySelector('#main .card.bk'))return;
  const own=pg.owner==S.user.id;
  if(!own&&!pg.accepts_bookings)return;
  const c=document.createElement('div');c.className='card pad bk';
  if(own){const{data:pend}=await SB.from('bookings').select('id').eq('page_id',id).eq('status','pending');
   c.innerHTML='<h3>📅 Bookings</h3><label class="chk"><input type="checkbox" id="bkon"'+(pg.accepts_bookings?' checked':'')+'> <span><b>Accept booking requests</b><br><small class="muted">Customers can request a day and time. You confirm or decline.</small></span></label><div class="btns"><a class="btn pri" href="#/bookings/'+id+'">View bookings'+((pend||[]).length?' ('+pend.length+' new)':'')+'</a></div>';
   biz.insertAdjacentElement('afterend',c);
   c.querySelector('#bkon').onchange=async e=>{const{error}=await SB.from('pages').update({accepts_bookings:e.target.checked}).eq('id',id);if(error){toast('Could not save.');e.target.checked=!e.target.checked;return}toast(e.target.checked?'Bookings on':'Bookings off')}}
  else{c.innerHTML='<h3>📅 Book an appointment</h3><p class="muted sm" style="margin:0">Pick a service, day and time. '+esc(pg.name)+' will confirm.</p><div class="btns"><button class="btn pri" id="bkgo">Book now</button><a class="btn" href="#/mybookings">My bookings</a></div>';
   biz.insertAdjacentElement('afterend',c);c.querySelector('#bkgo').onclick=()=>bookForm(pg)}
 }catch(e){console.error(e)}finally{busy=false}}

function menuLink(){if(!S||!S.route||S.route.name!='menu')return;const main=document.getElementById('main');if(!main||main.querySelector('[data-s23m]'))return;const l=main.querySelector('.card.list');if(!l)return;
 l.insertAdjacentHTML('beforeend','<a class="li" data-s23m="1" href="#/mybookings"><span class="mi2">📅</span><div class="grow"><b>My bookings</b><small>Appointments with businesses</small></div>'+ic('back',16).replace('class="ic"','class="ic fwd"')+'</a>')}
let t=null;new MutationObserver(()=>{if(t)return;t=setTimeout(()=>{t=null;try{menuLink();decorate()}catch(e){}},300)}).observe(document.body,{childList:true,subtree:true});
})();
