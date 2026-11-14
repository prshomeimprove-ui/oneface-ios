'use strict';
/* ===== One Face: core ===== */
const CFG=window.ONEFACE_CONFIG||{};
const DEMO=/[?&]demo/.test(location.search)||!CFG.SUPABASE_URL;
let SB=null;
const $=(s,r)=>(r||document).querySelector(s),$$=(s,r)=>[...(r||document).querySelectorAll(s)];
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const S={user:null,me:null,cache:new Map(),nN:0,nM:0,feedTab:'all',chans:[],route:null};
const IC={home:'M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z',users:'M16 11a4 4 0 1 0-8 0 4 4 0 0 0 8 0zM3 21c0-4 4-6 9-6s9 2 9 6',plus:'M12 5v14M5 12h14',chat:'M4 5h16v11H9l-5 4z',bell:'M6 17V11a6 6 0 1 1 12 0v6l2 2H4zM10 21h4',menu:'M4 7h16M4 12h16M4 17h16',search:'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM21 21l-5-5',back:'M15 5l-7 7 7 7',like:'M7 11v9H4v-9zM7 11l4-7c1.5 0 2.5 1 2.5 2.5V9h5.2a1.5 1.5 0 0 1 1.5 1.8l-1.4 7.5A2 2 0 0 1 16.8 20H7',comment:'M4 5h16v11H9l-5 4z',share:'M4 12v7h16v-7M12 3v12M7 8l5-5 5 5',save:'M6 3h12v18l-6-4-6 4z',more:'M5 12h.01M12 12h.01M19 12h.01',image:'M4 5h16v14H4zM4 16l5-5 4 4 3-3 4 4M9 9h.01',send:'M3 11l18-8-8 18-2-7z',check:'M5 12l5 5 9-10',x:'M6 6l12 12M18 6L6 18',globe:'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18',lock:'M6 11h12v9H6zM8 11V8a4 4 0 0 1 8 0v3',friends:'M16 11a4 4 0 1 0-8 0 4 4 0 0 0 8 0zM3 21c0-4 4-6 9-6s9 2 9 6'};
const ic=(n,s)=>'<svg class="ic" width="'+(s||22)+'" height="'+(s||22)+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="'+IC[n]+'"/></svg>';
const REACT={like:'👍',love:'❤️',haha:'😂',wow:'😮',sad:'😢',angry:'😡'};
const REACTN={like:'Like',love:'Love',haha:'Haha',wow:'Wow',sad:'Sad',angry:'Angry'};
function ago(t){const s=(Date.now()-new Date(t))/1000;if(s<60)return 'now';if(s<3600)return Math.floor(s/60)+'m';if(s<86400)return Math.floor(s/3600)+'h';if(s<604800)return Math.floor(s/86400)+'d';return new Date(t).toLocaleDateString(undefined,{month:'short',day:'numeric',year:new Date(t).getFullYear()==new Date().getFullYear()?undefined:'numeric'})}
function toast(m){let t=$('#toast');if(!t){t=document.createElement('div');t.id='toast';document.body.appendChild(t)}t.textContent=m;t.className='show';clearTimeout(toast.t);toast.t=setTimeout(()=>t.className='',Math.max(2600,m.length*60))}
function url(b,p){if(!p)return '';if(String(p).startsWith('demo:'))return p.slice(5);return SB.storage.from(b).getPublicUrl(p).data.publicUrl}
const PAL=[['#D6A654','#AB7529'],['#1f6bff','#19d3ff'],['#a78bfa','#f472b6'],['#059669','#34d399'],['#e11d48','#fb923c'],['#7c3aed','#ec4899']];
function av(p,sz){sz=sz||40;const n=(p&&p.full_name)||'?';const i=n.split(/\s+/).map(x=>x[0]).slice(0,2).join('').toUpperCase();let h=0;for(const c of String(p&&p.id||n))h=(h*31+c.charCodeAt(0))>>>0;const g=PAL[h%PAL.length];return '<span class="av" style="--s:'+sz+'px;background:linear-gradient(135deg,'+g[0]+','+g[1]+')">'+(p&&p.avatar_path?'<img src="'+esc(url('avatars',p.avatar_path))+'" alt="" loading="lazy">':esc(i))+'</span>'}
function fmt(s){let h=esc(s);h=h.replace(/(https?:\/\/[^\s<]+)/g,'<a href="$1" target="_blank" rel="noopener nofollow ugc">$1</a>');h=h.replace(/(^|\s)#([\p{L}\p{N}_]{2,40})/gu,'$1<a href="#/search?q=%23$2">#$2</a>');return h.replace(/\n/g,'<br>')}
async function need(ids){const m=ids.filter(i=>i&&!S.cache.has(i));if(!m.length)return;const{data}=await SB.from('profiles').select('*').in('id',[...new Set(m)]);(data||[]).forEach(p=>S.cache.set(p.id,p))}
const P=id=>S.cache.get(id)||{id,full_name:'One Face member'};
async function compress(file,max,q){if(!/^image\/(jpeg|png|webp)/.test(file.type))return file;try{const bm=await createImageBitmap(file);const k=Math.min(1,(max||1600)/Math.max(bm.width,bm.height));const c=document.createElement('canvas');c.width=Math.round(bm.width*k);c.height=Math.round(bm.height*k);c.getContext('2d').drawImage(bm,0,0,c.width,c.height);return await new Promise(r=>c.toBlob(b=>r(b||file),'image/jpeg',q||.82))}catch(e){return file}}
async function upload(bucket,file){const b=await compress(file);const EXTS={'image/gif':'gif','image/png':'png','image/webp':'webp','video/mp4':'mp4','video/webm':'webm','video/quicktime':'mov','audio/webm':'webm','audio/mp4':'m4a','audio/ogg':'ogg','audio/mpeg':'mp3','audio/aac':'aac'};const path=S.user.id+'/'+Date.now()+'-'+Math.random().toString(36).slice(2,8)+'.'+(EXTS[(b.type||'').split(';')[0]]||'jpg');const{error}=await SB.storage.from(bucket).upload(path,b,{contentType:b.type||'image/jpeg',upsert:false});if(error)throw error;return path}
/* sheets and dialogs */
function sheet(html,cls){closeSheet();const d=document.createElement('div');d.id='sheet';d.innerHTML='<div class="sh-bg"></div><div class="sh '+(cls||'')+'" role="dialog" aria-modal="true"><div class="sh-grab"></div>'+html+'</div>';document.body.appendChild(d);$('.sh-bg',d).onclick=closeSheet;document.body.classList.add('lock');return d}
function closeSheet(){const d=$('#sheet');if(d)d.remove();document.body.classList.remove('lock')}
function menuSheet(items){const d=sheet(items.map((x,i)=>'<button class="sh-i'+(x.danger?' danger':'')+'" data-i="'+i+'">'+(x.ic?ic(x.ic,20):'')+'<span>'+esc(x.t)+'</span></button>').join(''));$$('.sh-i',d).forEach(b=>b.onclick=()=>{closeSheet();items[+b.dataset.i].f()})}
function confirmBox(msg,ok,danger){return new Promise(res=>{const d=sheet('<p class="sh-t">'+esc(msg)+'</p><div class="row2"><button class="btn" id="c-no">Cancel</button><button class="btn '+(danger?'danger':'pri')+'" id="c-ok">'+esc(ok||'OK')+'</button></div>');$('#c-no',d).onclick=()=>{closeSheet();res(false)};$('#c-ok',d).onclick=()=>{closeSheet();res(true)}})}
function lightbox(src){const d=document.createElement('div');d.id='lb';d.innerHTML='<button class="lb-x" aria-label="Close">'+ic('x',26)+'</button><img src="'+esc(src)+'" alt="">';d.onclick=()=>d.remove();document.body.appendChild(d)}
async function reportSheet(type,id){const R=['Spam','Harassment or bullying','Nudity or sexual content','Violence or dangerous','Fake account or scam','Something else'];const d=sheet('<p class="sh-t">Report</p><p class="muted sm">Why are you reporting this?</p>'+R.map((r,i)=>'<button class="sh-i" data-r="'+i+'"><span>'+esc(r)+'</span></button>').join(''));$$('[data-r]',d).forEach(b=>b.onclick=async()=>{closeSheet();const{error}=await SB.from('reports').insert({reporter:S.user.id,target_type:type,target_id:id,reason:R[+b.dataset.r]});toast(error?'Could not send the report.':'Thank you. We will review this.')})}
/* ===== top bar, tab bar ===== */
const TABS=[['home','Home','home'],['friends','Friends','users'],['compose','Post','plus'],['messages','Chat','chat'],['notifications','Alerts','bell'],['menu','Menu','menu']];
function drawTabs(active){const el=$('#tabs');if(!active){el.hidden=true;return}el.hidden=false;el.innerHTML=TABS.map(([r,l,i])=>'<a href="#/'+r+'" class="tab'+(r==active?' on':'')+(r=='compose'?' mid':'')+'" aria-label="'+l+'">'+ic(i,r=='compose'?26:22)+'<small>'+l+'</small>'+(r=='messages'&&S.nM?'<b class="bdg">'+(S.nM>9?'9+':S.nM)+'</b>':'')+(r=='notifications'&&S.nN?'<b class="bdg">'+(S.nN>9?'9+':S.nN)+'</b>':'')+'</a>').join('')}
function tbar(o){const el=$('#top');o=o||{};if(o.main){el.innerHTML='<a href="#/home" class="brand"><img src="logo2.jpg" alt="" width="34" height="34"><span>One Face</span></a><span class="sp"></span><a class="ib" href="#/search" aria-label="Search">'+ic('search')+'</a><a class="ib" href="#/messages" aria-label="Messages">'+ic('chat')+(S.nM?'<b class="bdg">'+(S.nM>9?'9+':S.nM)+'</b>':'')+'</a>'}else{el.innerHTML=(o.back===false?'':'<button class="ib" id="tb" aria-label="Back">'+ic('back')+'</button>')+'<b class="ttl">'+esc(o.title||'')+'</b><span class="sp"></span>'+(o.right||'');const b=$('#tb');if(b)b.onclick=()=>o.backTo?(location.hash=o.backTo):history.length>1?history.back():(location.hash='#/home')}el.hidden=false}
function view(html){const m=$('#main');m.innerHTML=html;m.scrollTop=0;window.scrollTo(0,0);return m}
const busy=(b,on,t)=>{if(!b)return;b.disabled=on;if(on){b.dataset.t=b.textContent;b.textContent=t||'Please wait…'}else if(b.dataset.t)b.textContent=b.dataset.t};
/* ===== badges + live ===== */
async function badges(){if(!S.user)return;try{const[n,c]=await Promise.all([SB.from('notifications').select('id',{count:'exact',head:true}).eq('user_id',S.user.id).is('read_at',null),convos()]);S.nN=n.count||0;S.nM=c.filter(x=>x.unread).length;if($('#tabs')&&!$('#tabs').hidden)drawTabs(S.route&&S.route.tab);if(S.route&&S.route.main)tbar({main:1})}catch(e){}}
async function convos(){const me=S.user.id;const{data:mm}=await SB.from('conversation_members').select('*').eq('user_id',me);if(!mm||!mm.length)return[];const ids=mm.map(x=>x.conversation_id);const[{data:cs},{data:os}]=await Promise.all([SB.from('conversations').select('*').in('id',ids),SB.from('conversation_members').select('*').in('conversation_id',ids).neq('user_id',me)]);await need((os||[]).map(o=>o.user_id));return(cs||[]).map(c=>{const mine=mm.find(x=>x.conversation_id==c.id),o=(os||[]).find(x=>x.conversation_id==c.id);return{...c,other:c.is_group?null:o&&o.user_id,members:(os||[]).filter(x=>x.conversation_id==c.id).map(x=>x.user_id),unread:!!(c.last_message_at&&c.last_sender!=me&&new Date(c.last_message_at)>new Date(mine.last_read_at))}}).filter(c=>c.is_group||c.other).sort((a,b)=>new Date(b.last_message_at||b.created_at)-new Date(a.last_message_at||a.created_at))}
function live(){S.chans.forEach(c=>SB.removeChannel(c));S.chans=[];if(!S.user)return;
 S.chans.push(SB.channel('of-n').on('postgres_changes',{event:'INSERT',schema:'public',table:'notifications',filter:'user_id=eq.'+S.user.id},()=>{badges();if(S.route&&S.route.name=='notifications')R.notifications()}).subscribe());
 S.chans.push(SB.channel('of-m').on('postgres_changes',{event:'INSERT',schema:'public',table:'messages'},async({new:m})=>{if(m.sender_id==S.user.id)return;if(S.route&&S.route.name=='chat'&&S.route.arg==m.conversation_id){chatAdd(m);return}await need([m.sender_id]);toast('💬 '+P(m.sender_id).full_name+': '+(m.body||(m.media_type=='audio'?'Voice message':m.media_type=='video'?'Video':'Photo')).slice(0,60));badges();if(S.route&&S.route.name=='messages')R.messages()}).on('postgres_changes',{event:'UPDATE',schema:'public',table:'messages'},({new:m})=>{if(window.chatUpd)chatUpd(m)}).subscribe());S.chans.push(SB.channel('of-cm').on('postgres_changes',{event:'UPDATE',schema:'public',table:'conversation_members'},({new:m})=>{if(window.seenUpd)seenUpd(m)}).subscribe());S.chans.push(SB.channel('of-an').on('postgres_changes',{event:'INSERT',schema:'public',table:'announcements'},({new:a})=>{toast('📣 '+a.title)}).subscribe());window.callListen&&callListen()}
setInterval(()=>{if(S.user&&!document.hidden)badges()},25000);
/* ===== router ===== */
const R={};
function parse(){const h=location.hash.replace(/^#\/?/,'');const[p,q]=h.split('?');const[name,...rest]=(p||'').split('/');return{name:name||'',arg:rest.join('/')||'',q:new URLSearchParams(q||'')}}
const MAIN={home:1,friends:1,messages:1,notifications:1,menu:1};
const PUBLIC={welcome:1,login:1,signup:1,forgot:1};
function nextHash(){let n=null;try{n=sessionStorage.getItem('of_next');sessionStorage.removeItem('of_next')}catch(e){}return n||'#/home'}
async function route(){closeSheet();const r=parse();let name=r.name;if(S.user&&!S.me&&!DEMO){try{await tmo(loadMe(),8000,'loading your profile')}catch(e){console.error(e)}}
 if(name=='p'){if(S.user){location.replace('#/post/'+r.arg);return}if(!PUBLIC.p)PUBLIC.p=1}
 if(!S.user){if(!PUBLIC[name]){location.replace('#/welcome');return}}
 else{if(PUBLIC[name]&&name!='forgot'){location.replace(nextHash());return}if(!name){location.replace('#/home');return}
 if(name=='home'){let n=null;try{n=sessionStorage.getItem('of_next')}catch(e){}if(n){location.replace(nextHash());return}}
}
 if(S.user&&window.needMfa&&!PUBLIC[name]){if(S._gate){await S._gate;return}S._gate=(async()=>(await needMfa())?await mfaGate():true)();const ok=await S._gate;S._gate=null;if(!ok)return}
 if(S.user&&S.me&&S.me.banned&&name!='banned'&&name!='rules'){location.replace('#/banned');return}
 if(S.user&&S.me&&!S.me.birthday&&!S.me.banned&&name!='birthday'&&name!='rules'){location.replace('#/birthday');return}
 if(!name){location.replace('#/welcome');return}
 r.tab=MAIN[name]?name:null;r.main=!!MAIN[name];S.route=r;drawTabs(S.user&&MAIN[name]?name:null);
 const f=R[name]||R.notfound;const tok=S._rt=(S._rt||0)+1;try{await f(r.arg,r.q)}catch(e){if(S._rt!==tok){console.warn('stale screen error ignored',e);return}console.error(e);view('<div class="card pad"><b>Something went wrong.</b><p class="muted">'+esc(e.message||e)+'</p><a class="btn" href="#/home">Go home</a></div>')}}
addEventListener('hashchange',route);
function demoBanner(){if(DEMO&&!$('#demo')){const d=document.createElement('div');d.id='demo';d.innerHTML='SAMPLE MODE: try everything. Nothing is saved.';document.body.prepend(d)}}
/* session storage: localStorage + cookie backup, so login survives refresh even where storage is wiped */
const OFS=(()=>{const B=1800,enc=v=>btoa(unescape(encodeURIComponent(v))),dec=v=>decodeURIComponent(escape(atob(v)));
 const ck=(n,v,age)=>{try{document.cookie=n+'='+v+';path=/;max-age='+age+';SameSite=Lax'+(location.protocol=='https:'?';Secure':'')}catch(e){}};
 const rd=n=>{try{const m=document.cookie.match(new RegExp('(?:^|; )'+n+'=([^;]*)'));return m?m[1]:null}catch(e){return null}};
 const cget=k=>{try{const c=+rd('ofn_'+k.length);if(!c)return null;let s='';for(let i=0;i<c;i++){const p=rd('ofs_'+k.length+'_'+i);if(p==null)return null;s+=p}return dec(s)}catch(e){return null}};
 const cset=(k,v)=>{try{const e=enc(v),n=Math.ceil(e.length/B);for(let i=0;i<n;i++)ck('ofs_'+k.length+'_'+i,e.slice(i*B,(i+1)*B),31536000);ck('ofn_'+k.length,n,31536000)}catch(e){}};
 const cdel=k=>{try{const c=+rd('ofn_'+k.length)||4;for(let i=0;i<c;i++)ck('ofs_'+k.length+'_'+i,'',0);ck('ofn_'+k.length,'',0)}catch(e){}};
 return{getItem:k=>{let v=null;try{v=localStorage.getItem(k)}catch(e){}if(v==null&&/^sb-/.test(k)){v=cget(k);if(v!=null){try{localStorage.setItem(k,v)}catch(e){}}}return v},
  setItem:(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}if(/^sb-/.test(k))cset(k,v)},
  removeItem:k=>{try{localStorage.removeItem(k)}catch(e){}if(/^sb-/.test(k))cdel(k)}}})();
try{navigator.storage&&navigator.storage.persist&&navigator.storage.persist()}catch(e){}
/* show real errors so they can be photographed */
addEventListener('unhandledrejection',e=>{try{const m=String(e.reason&&e.reason.message||e.reason||'').slice(0,140);if(m&&!/AbortError|NotAllowed|lock/i.test(m))toast('⚠ '+m)}catch(x){}});
addEventListener('error',e=>{try{if(e.message&&!/ResizeObserver|Script error/i.test(e.message))toast('⚠ '+String(e.message).slice(0,140))}catch(x){}});
/* ===== boot ===== */
function bootFail(msg){const b=document.getElementById('boot');if(!b)return;b.innerHTML='<div style="text-align:center;padding:24px;max-width:340px"><img src="logo2.jpg" alt="" width="96" height="96" style="border-radius:20px"><h2 style="margin:16px 0 6px">Could not start</h2><p style="color:#888;margin:0 0 16px">'+esc(String(msg||'Something went wrong.').slice(0,160))+'</p><button class="btn pri big" id="bf1" style="width:100%">Try again</button><button class="btn big" id="bf2" style="width:100%;margin-top:10px">Reset and sign in again</button></div>';document.getElementById('bf1').onclick=()=>location.reload();document.getElementById('bf2').onclick=()=>{try{Object.keys(localStorage).filter(k=>/^sb-|^of_/.test(k)).forEach(k=>localStorage.removeItem(k))}catch(e){}try{navigator.serviceWorker&&navigator.serviceWorker.getRegistrations().then(r=>r.forEach(x=>x.unregister()))}catch(e){}location.href=location.pathname}}
let BSTAGE='starting';
const tmo=(p,ms,what)=>Promise.race([p,new Promise((_,no)=>setTimeout(()=>no(new Error('Stuck at: '+what)),ms))]);
function loadLib(u){return new Promise((ok,no)=>{const s=document.createElement('script');s.src=u;s.onload=ok;s.onerror=()=>no(new Error('blocked'));document.head.appendChild(s)})}
async function boot(){const w=setTimeout(()=>bootFail('Stuck at: '+BSTAGE+'. Tap Try again.'),20000);try{await boot1()}catch(e){console.error(e);bootFail(e&&e.message)}finally{clearTimeout(w)}}
async function boot1(){demoBanner();window.applyTheme&&applyTheme();
 if(DEMO){SB=window.OF_DEMO.SB}else{BSTAGE='loading the app library';
  if(!window.supabase){const U=['https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.58.0/dist/umd/supabase.min.js','https://unpkg.com/@supabase/supabase-js@2.58.0/dist/umd/supabase.min.js','https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js'];
   for(const u of U){try{await tmo(loadLib(u),7000,'library');if(window.supabase)break}catch(e){}}}
  if(!window.supabase)throw new Error('Could not load the app library. Check your internet or turn off ad-blockers / data saver, then Try again.');
  BSTAGE='starting login';
  SB=window.supabase.createClient(CFG.SUPABASE_URL,CFG.SUPABASE_ANON_KEY,{auth:{storage:OFS,persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,lock:async(n,t,f)=>await f()}})}
 SB.auth.onAuthStateChange((ev,s)=>{const was=S.user&&S.user.id;S.user=s&&s.user||null;setTimeout(async()=>{try{if(S.user&&was!=S.user.id){await loadMe();live();badges();if(DEMO)window.OF_DEMO.startBot()}if(!S.user){S.me=null;S.cache.clear();live();S.nN=S.nM=0}if(ev=='SIGNED_OUT'||(ev=='SIGNED_IN'&&S.user&&was!=S.user.id))route()}catch(e){console.error(e)}},0)});
 BSTAGE='checking your login';
 const{data}=await tmo(SB.auth.getSession(),9000,'checking your login');S.user=data&&data.session&&data.session.user||null;
 if(S.user){BSTAGE='loading your profile';try{await tmo(loadMe(),9000,'loading your profile');live();badges()}catch(e){console.error(e)}}
 BSTAGE='opening';$('#boot').remove();await route()}
async function loadMe(){const{data}=await SB.from('profiles').select('*').eq('id',S.user.id).maybeSingle();S.me=data;if(data)S.cache.set(data.id,data);return data}
