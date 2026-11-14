/* One Face v4.7: auto-delete chat messages after 24 hours, 7, 30 or 90 days. Uses oneface18.sql. */
(function(){
const CSS=`.adn{display:flex;align-items:center;gap:6px;justify-content:center;padding:6px 12px;font-size:12.5px;color:var(--mut);background:var(--soft)}.adn b{color:var(--ink)}`;
const st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);
const OPTS=[[null,'Off','Messages stay until someone deletes them'],[1,'24 hours','Messages disappear a day after they are sent'],[7,'7 days','Messages disappear a week after they are sent'],[30,'30 days','Messages disappear a month after they are sent'],[90,'90 days','Messages disappear after about 3 months']];
const lab=d=>d?(d==1?'24 hours':d+' days'):'Off';
let lastPurge=0,flag=null;

async function cleanup(force){
 if(!S||!S.user)return;const now=Date.now();if(!force&&now-lastPurge<60000)return;lastPurge=now;
 try{await SB.rpc('purge_my_expired')}catch(e){}
 try{const{data}=await SB.from('chat_media_trash').select('path').limit(100);if(data&&data.length){const ps=data.map(x=>x.path);const{error}=await SB.storage.from('chat').remove(ps);if(!error)await SB.from('chat_media_trash').delete().in('path',ps)}}catch(e){}}

function pickSheet(cid,cur,isGroup,onDone){
 const d=sheet('<p class="sh-t">Delete messages automatically</p><p class="muted sm" style="margin:0 0 6px">'+(isGroup?'Applies to everyone in this group.':'Applies to both of you.')+' Photos and voice messages are deleted too.</p>'+OPTS.map((o,i)=>'<button class="sh-i" data-i="'+i+'"><span style="white-space:nowrap">'+o[1]+(cur==o[0]?' ✓':'')+'</span><small class="muted" style="margin-left:auto">'+o[2]+'</small></button>').join(''));
 d.querySelectorAll('[data-i]').forEach(b=>b.onclick=async()=>{const o=OPTS[+b.dataset.i];if(o[0]==cur){closeSheet();return}closeSheet();
  if(o[0]&&!await confirmBox('Delete messages older than '+lab(o[0])+' for everyone in this chat, now and from now on? This cannot be undone.','Turn on',true))return;
  const{error}=await SB.rpc('set_chat_auto_delete',{p_cid:cid,p_days:o[0]});
  if(error){toast((error.message||'Could not change this.').replace(/^.*exception: /,''));return}
  try{await SB.from('messages').insert({conversation_id:cid,sender_id:S.user.id,body:o[0]?'⏳ Messages in this chat now delete after '+lab(o[0])+'.':'⏳ Auto-delete is now off in this chat.'})}catch(e){}
  toast(o[0]?'Auto-delete: '+lab(o[0]):'Auto-delete is off');onDone&&onDone(o[0])})}

/* add the choice to the chat's ⋯ menu */
const ms0=menuSheet;
menuSheet=function(items){if(flag){const f=flag;flag=null;items=items.concat([{t:'Delete messages after… ('+lab(f.days)+')',ic:'comment',f:()=>pickSheet(f.cid,f.days,f.group,d=>{f.days=d;banner(d)})}])}return ms0.apply(this,arguments.length>1?[items].concat([].slice.call(arguments,1)):[items])};
function banner(days){const m=document.getElementById('msgs');if(!m)return;let b=document.getElementById('adn');if(b)b.remove();if(!days)return;m.insertAdjacentHTML('beforebegin','<div class="adn" id="adn">⏳ Messages delete after <b>'+lab(days)+'</b></div>')}


/* press a message: Delete for me / Delete for everyone */
let lastRow=null;
const track=e=>{const r=e.target&&e.target.closest&&e.target.closest('#msgs .msg');if(r)lastRow={id:r.dataset.id,mine:r.dataset.mine=='1',t:Date.now()}};
['pointerdown','touchstart','click','contextmenu'].forEach(ev=>document.addEventListener(ev,track,true));
const ms1=menuSheet;
menuSheet=function(items){
 if(lastRow&&Date.now()-lastRow.t<15000&&items.some(i=>/^(Copy text|Unsend|Report message)$/.test(i.t))){const row=lastRow;
  items=items.filter(i=>i.t!='Unsend');
  items=items.concat([{t:'Delete for me',ic:'x',danger:1,f:async()=>{const{error}=await SB.from('message_hidden').insert({user_id:S.user.id,message_id:row.id});if(error&&!/duplicate/i.test(error.message||'')){toast('Could not delete.');return}const el=document.querySelector('#msgs .msg[data-id="'+row.id+'"]');if(el)el.remove();toast('Deleted for you')}}]);
  if(row.mine)items=items.concat([{t:'Delete for everyone',ic:'x',danger:1,f:async()=>{if(!await confirmBox('Delete this message for everyone?','Delete',true))return;const mm=window.V3&&V3.msgs&&V3.msgs.get(row.id);try{if(mm&&mm.media_path)await SB.storage.from('chat').remove([mm.media_path])}catch(x){}const{error}=await SB.rpc('unsend_message',{p_id:row.id});if(error){toast('Could not delete: '+String(error.message||'try again').slice(0,80));return}try{chatUpd(Object.assign({},mm||{id:row.id,sender_id:S.user.id,conversation_id:CH&&CH.id,created_at:new Date().toISOString()},{body:'',media_path:null,deleted_at:new Date().toISOString()}))}catch(x){}toast('Deleted for everyone')}}])
 }
 return ms1.apply(this,arguments.length>1?[items].concat([].slice.call(arguments,1)):[items])};
async function hideMine(){try{const{data}=await SB.from('message_hidden').select('message_id').eq('user_id',S.user.id).limit(2000);if(!data||!data.length)return;const s=new Set(data.map(x=>x.message_id));document.querySelectorAll('#msgs .msg').forEach(el=>{if(s.has(el.dataset.id))el.remove()})}catch(e){}}

/* wrap the chat and the messages list */
const chat0=R.chat;
R.chat=async function(arg){if(arg&&!String(arg).startsWith('new/'))await cleanup(true);const r=await chat0.apply(this,arguments);hideMine();
 try{const cid=arg;if(cid&&!String(cid).startsWith('new/')){const{data:cv}=await SB.from('conversations').select('auto_delete_days,is_group').eq('id',cid).maybeSingle();if(cv){const st={cid,days:cv.auto_delete_days||null,group:!!cv.is_group};banner(st.days);const cm=document.getElementById('cm');if(cm){const old=cm.onclick;cm.onclick=function(e){flag=st;try{return old.call(this,e)}finally{setTimeout(()=>{flag=null},0)}}}}}}catch(e){console.warn('auto-delete',e)}
 return r};
const msgs0=R.messages;
R.messages=async function(){cleanup(false);return msgs0.apply(this,arguments)};
setTimeout(()=>cleanup(false),4000);
})();
