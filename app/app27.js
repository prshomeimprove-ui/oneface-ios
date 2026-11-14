/* One Face v4.8: reactions on stories (all 6 reactions) + list of who reacted. Uses oneface20.sql. */
(function(){
const CSS=`.rxbar{display:flex;justify-content:space-between;gap:4px;padding:8px 14px 0;z-index:3}.rxbar button{flex:1;max-width:56px;aspect-ratio:1;background:#ffffff1c;border:2px solid transparent;border-radius:50%;font-size:26px;line-height:1;cursor:pointer;color:#fff;padding:0;transition:transform .12s}.rxbar button:active{transform:scale(.9)}.rxbar button.on{border-color:var(--gold3,#d6a654);background:#ffffff40;transform:scale(1.12)}.rxfly{position:fixed;font-size:64px;z-index:95;pointer-events:none;animation:rxup 1s ease-out forwards}@keyframes rxup{0%{opacity:1;transform:translateY(0) scale(.8)}100%{opacity:0;transform:translateY(-280px) scale(1.7)}}#sv:has(.rxbar) .scap{bottom:150px}.rxlist .li{display:flex;align-items:center;gap:10px}.rxlist .li .rxe{margin-left:auto;font-size:24px}`;
const st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);
try{Object.assign(NT2,{story_reaction:a=>a+' reacted to your story'})}catch(e){console.warn('story alert text',e)}

const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const uidOfHash=()=>{const m=location.hash.match(/^#\/story\/([^/?]+)/);return m?m[1]:null};
async function storiesOf(uid){const{data}=await SB.from('stories').select('id,author').eq('author',uid).gt('expires_at',new Date().toISOString()).order('created_at',{ascending:true});return data||[]}
async function currentStory(d){const uid=uidOfHash();if(!uid)return null;const list=await storiesOf(uid);const idx=[...d.querySelectorAll('.bars i')].findIndex(i=>i.classList.contains('a'));return list[idx]||null}
async function rxOf(storyId){const{data}=await SB.from('story_reactions').select('user_id,type,created_at').eq('story_id',storyId).order('created_at',{ascending:false});return data||[]}

function fly(btn,emoji){const r=btn.getBoundingClientRect(),s=document.createElement('span');s.className='rxfly';s.textContent=emoji;s.style.left=(r.left+r.width/2-32)+'px';s.style.top=(r.top-20)+'px';document.body.appendChild(s);setTimeout(()=>s.remove(),1100)}

async function viewer(d,s){
 const form=d.querySelector('#sr');if(!form||d.querySelector('.rxbar'))return;
 const bar=document.createElement('div');bar.className='rxbar';
 bar.innerHTML=Object.keys(REACT).map(k=>'<button type="button" data-k="'+k+'" aria-label="'+REACTN[k]+'">'+REACT[k]+'</button>').join('');
 form.parentNode.insertBefore(bar,form);
 let mine=null;
 const paint=()=>bar.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b.dataset.k===mine));
 try{const{data}=await SB.from('story_reactions').select('type').eq('story_id',s.id).eq('user_id',S.user.id).maybeSingle();mine=data?data.type:null;paint()}catch(e){}
 bar.onclick=async e=>{const b=e.target.closest('button');if(!b)return;const k=b.dataset.k;
  if(mine===k){const{error}=await SB.from('story_reactions').delete().eq('story_id',s.id).eq('user_id',S.user.id);if(error)return toast('Could not remove.');mine=null;paint();toast('Reaction removed');return}
  const{error}=await SB.from('story_reactions').upsert({story_id:s.id,user_id:S.user.id,type:k},{onConflict:'story_id,user_id'});
  if(error)return toast('Could not react.');mine=k;paint();fly(b,REACT[k]);toast('You reacted '+REACT[k])}}

function summary(rows){const c={};rows.forEach(r=>c[r.type]=(c[r.type]||0)+1);return Object.keys(REACT).filter(k=>c[k]).map(k=>REACT[k]+' '+c[k]).join('  ')}
async function owner(d,s){
 const sv=d.querySelector('#svw');if(!sv||sv.dataset.rx)return;sv.dataset.rx='1';
 const orig=sv.onclick;
 try{const rows=await rxOf(s.id);if(rows.length)sv.textContent='👁 Views  ·  '+summary(rows)}catch(e){}
 sv.onclick=async function(){
  if(orig)orig.apply(this,arguments);
  try{const rows=await rxOf(s.id);await need(rows.map(r=>r.user_id));
   for(let k=0;k<40;k++){const sh=document.querySelector('#sheet .sh');const t=sh&&[...sh.querySelectorAll('.sh-t')].find(x=>/^Viewed by/.test(x.textContent));
    if(t){if(!sh.querySelector('.rxlist'))t.insertAdjacentHTML('beforebegin','<div class="rxlist"><p class="sh-t">Reactions · '+rows.length+'</p>'+(rows.map(r=>'<div class="li">'+av(P(r.user_id),36)+'<b>'+esc(P(r.user_id).full_name)+'</b><span class="rxe">'+REACT[r.type]+'</span></div>').join('')||'<p class="muted center">No reactions yet.</p>')+'</div>');break}
    await sleep(100)}}catch(e){console.warn('story reactions list',e)}}}

async function decorate(d){
 if(d._busy){d._again=true;return}d._busy=true;
 try{do{d._again=false;const s=await currentStory(d);if(!s||!d.isConnected)continue;if(d.querySelector('#svw'))await owner(d,s);else await viewer(d,s)}while(d._again)}
 catch(e){console.warn('story reactions',e)}finally{d._busy=false}}

let watching=null;
new MutationObserver(()=>{const d=document.getElementById('sv');if(!d||d===watching)return;watching=d;
 new MutationObserver(()=>decorate(d)).observe(d,{childList:true});decorate(d)}).observe(document.body,{childList:true});
})();
