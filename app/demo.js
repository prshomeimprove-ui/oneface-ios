/* One Face SAMPLE MODE: a tiny in-memory copy of the backend, so every function can be tried without setup. Nothing is saved. */
(function(){
const uid=()=>([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,c=>(c^crypto.getRandomValues(new Uint8Array(1))[0]&15>>c/4).toString(16));
const ago=m=>new Date(Date.now()-m*60000).toISOString();
const grad=(a,b,t)=>'data:image/svg+xml;utf8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="'+a+'"/><stop offset="1" stop-color="'+b+'"/></linearGradient></defs><rect width="800" height="600" fill="url(#g)"/><circle cx="620" cy="150" r="70" fill="#fff" opacity=".35"/><path d="M0 460 L200 300 L360 420 L540 260 L800 440 V600 H0Z" fill="#000" opacity=".18"/><text x="40" y="560" font-size="34" font-family="Georgia" fill="#fff" opacity=".85">'+(t||'')+'</text></svg>');
const AV=(a,b)=>'data:image/svg+xml;utf8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="'+a+'"/><stop offset="1" stop-color="'+b+'"/></linearGradient></defs><rect width="100" height="100" fill="url(#g)"/><circle cx="50" cy="38" r="18" fill="#fff" opacity=".85"/><path d="M14 100 C14 66 86 66 86 100Z" fill="#fff" opacity=".85"/></svg>');
const ME='u-me',T={},EXT={};
const P=(id,name,user,c1,c2,extra)=>Object.assign({id,username:user,full_name:name,avatar_path:'demo:'+AV(c1,c2),cover_path:'demo:'+grad(c1,c2,''),bio:'',city:'',work:'',school:'',birthday:'1994-03-12',profile_visibility:'public',role:'user',banned:false,created_at:ago(60*24*40)},extra||{});
T.profiles=[
 P(ME,'Amara Cole','amara.cole','#D6A654','#AB7529',{bio:'Coffee, travel and good light. Welcome to my One Face!',city:'Atlanta, GA',work:'Photographer',school:'Georgia State University',role:'admin'}),
 P('u-1','Jordan Reyes','jordanr','#1f6bff','#19d3ff',{bio:'Chef. Always hungry.',city:'Miami, FL',work:'Head chef at Casa Verde'}),
 P('u-2','Priya Nair','priyan','#a78bfa','#f472b6',{bio:'Designer and plant mom.',city:'Austin, TX',work:'UX designer'}),
 P('u-3','Marcus Bell','marcusb','#059669','#34d399',{bio:'Runner. Dad. Music.',city:'Chicago, IL'}),
 P('u-4','Sofia Lima','sofialima','#e11d48','#fb923c',{bio:'Olá! Brazilian in New York.',city:'New York, NY',work:'Nurse'}),
 P('u-5','Liam Carter','liamc','#0ea5e9','#6366f1',{bio:'Photography and hiking.',city:'Denver, CO'}),
 P('u-6','Nia Okafor','niao','#d97706','#fbbf24',{bio:'Entrepreneur. Building something new.',city:'Houston, TX',work:'Founder'}),
 P('u-7','Ethan Park','ethanp','#7c3aed','#ec4899',{bio:'Gamer and coder.',city:'Seattle, WA'}),
 P('u-8','Zoe Martin','zoem','#14b8a6','#a78bfa',{bio:'Yoga and tea.',city:'Portland, OR'})];
T.friendships=[];['u-1','u-2','u-3','u-4'].forEach((u,i)=>T.friendships.push({id:uid(),requester:i%2?ME:u,addressee:i%2?u:ME,status:'accepted',created_at:ago(60*24*(20-i))}));
T.friendships.push({id:uid(),requester:'u-5',addressee:ME,status:'pending',created_at:ago(90)},{id:uid(),requester:'u-6',addressee:ME,status:'pending',created_at:ago(300)},{id:uid(),requester:ME,addressee:'u-7',status:'pending',created_at:ago(500)});
T.blocks=[];T.saves=[];T.reports=[];T.reactions=[];T.comments=[];T.notifications=[];T.conversations=[];T.conversation_members=[];T.messages=[];
const mkPost=(a,body,min,vis,imgs,l,c)=>({id:uid(),author:a,body,media:(imgs||[]).map(i=>({path:'demo:'+i,type:'image'})),visibility:vis||'public',hidden:false,like_count:0,comment_count:0,created_at:ago(min),edited_at:null});
T.posts=[
 mkPost('u-1','Sunday brunch special at the restaurant today! Who is coming? 🍳🥞',25,'public',[grad('#fbd489','#d6a654','Brunch')]),
 mkPost('u-2','Finished my new app design. Sharing a sneak peek with friends first ✨',140,'friends',[grad('#a78bfa','#f472b6','Sneak peek'),grad('#19d3ff','#1f6bff','Dark mode')]),
 mkPost('u-3','Morning 10K done. Nothing beats the quiet before the city wakes up.',300,'public',[grad('#34d399','#059669','10K')]),
 mkPost(ME,'Golden hour in Atlanta never gets old. Welcome to One Face, everyone!',620,'public',[grad('#fb923c','#fbbf24','Golden hour')]),
 mkPost('u-4','Grateful for my night shift team. We got this! 💙',900,'public'),
 mkPost('u-5','Trail views from this weekend. Highly recommend.',1500,'public',[grad('#0ea5e9','#6366f1','Trail'),grad('#14b8a6','#a78bfa','Summit'),grad('#fbbf24','#fb923c','Sunrise')]),
 mkPost('u-8','Does anyone know a good yoga studio in Atlanta?',2100,'public'),
 mkPost(ME,'Only I can see this one (draft idea for a photo book).',2600,'only_me')];
const rx=(p,u,t)=>{const post=T.posts.find(x=>x.body.startsWith(p));if(post){T.reactions.push({post_id:post.id,user_id:u,type:t||'like',created_at:ago(5)});post.like_count++}};
rx('Sunday brunch',ME,'love');rx('Sunday brunch','u-2');rx('Sunday brunch','u-3','wow');rx('Golden hour','u-1','love');rx('Golden hour','u-2');rx('Golden hour','u-3');rx('Morning 10K','u-1');rx('Grateful','u-2','love');
const cm=(p,u,b,m)=>{const post=T.posts.find(x=>x.body.startsWith(p));if(post){T.comments.push({id:uid(),post_id:post.id,author:u,parent_id:null,body:b,created_at:ago(m)});post.comment_count++}};
cm('Sunday brunch','u-2','Save me a table! 😍',20);cm('Sunday brunch','u-3','Those pancakes look unreal.',12);cm('Golden hour','u-1','Stunning light. Great shot!',500);cm('Golden hour','u-4','Welcome to One Face 🎉',480);
const note=(t,a,p,m)=>T.notifications.push({id:uid(),user_id:ME,actor_id:a,type:t,post_id:p?T.posts.find(x=>x.body.startsWith(p)).id:null,created_at:ago(m),read_at:null});
note('friend_request','u-5',null,90);note('reaction','u-1','Golden hour',200);note('comment','u-4','Golden hour',480);
const dm=(u,msgs)=>{const c={id:uid(),created_at:ago(900),last_message_at:null,last_message:null,last_sender:null};T.conversations.push(c);T.conversation_members.push({conversation_id:c.id,user_id:ME,last_read_at:ago(1000)},{conversation_id:c.id,user_id:u,last_read_at:ago(1000)});msgs.forEach(([s,b,m])=>{const x={id:uid(),conversation_id:c.id,sender_id:s?u:ME,body:b,media_path:null,created_at:ago(m)};T.messages.push(x);c.last_message_at=x.created_at;c.last_message=b;c.last_sender=x.sender_id});return c};
dm('u-1',[[1,'Hey! Are you coming to brunch on Sunday?',60],[0,'Yes! Save me the corner table.',55],[1,'Done. See you there 😊',40]]);
const c2=dm('u-3',[[0,'Great run this morning!',200],[1,'Thanks! Join me next weekend?',30]]);T.conversation_members.find(m=>m.conversation_id==c2.id&&m.user_id==ME).last_read_at=ago(500);
/* ---------- tiny query engine ---------- */
let sess=null;const subs=[];
const cur=()=>sess&&sess.user.id;
const friends=(a,b)=>T.friendships.some(f=>f.status=='accepted'&&((f.requester==a&&f.addressee==b)||(f.requester==b&&f.addressee==a)));
const blocked=(a,b)=>T.blocks.some(x=>(x.blocker==a&&x.blocked==b)||(x.blocker==b&&x.blocked==a));
const me=()=>T.profiles.find(p=>p.id==cur());
const isAdmin=()=>{const m=me();return !!m&&m.role=='admin'&&!m.banned};
function visible(t,r){const u=cur();{const x=EXT.visible&&EXT.visible(t,r,u);if(x!==undefined)return x}if(t=='posts'){if(isAdmin()||r.author==u)return true;return !r.hidden&&!blocked(r.author,u)&&(r.visibility=='public'||(r.visibility=='friends'&&friends(r.author,u)))}
 if(t=='profiles')return r.id==u||isAdmin()||(!r.banned&&!blocked(r.id,u));
 if(t=='friendships')return r.requester==u||r.addressee==u||isAdmin();
 if(t=='blocks'||t=='saves')return (r.blocker||r.user_id)==u;
 if(t=='notifications')return r.user_id==u;
 if(t=='reports')return isAdmin();
 if(t=='conversations')return T.conversation_members.some(m=>m.conversation_id==r.id&&m.user_id==u);
 if(t=='conversation_members')return T.conversation_members.some(m=>m.conversation_id==r.conversation_id&&m.user_id==u);
 if(t=='messages')return T.conversation_members.some(m=>m.conversation_id==r.conversation_id&&m.user_id==u);
 if(t=='reactions'||t=='comments')return T.posts.some(p=>p.id==r.post_id&&visible('posts',p));
 return true}
const fire=(table,ev,row)=>subs.forEach(s=>{if(s.table==table&&(s.event=='*'||s.event==ev))try{s.cb({new:row,eventType:ev})}catch(e){}});
function notify(user,actor,type,post){if(user==actor)return;const n={id:uid(),user_id:user,actor_id:actor,type,post_id:post||null,created_at:new Date().toISOString(),read_at:null};T.notifications.push(n);fire('notifications','INSERT',n)}
const trig={
 reactions:{ins:r=>{const p=T.posts.find(x=>x.id==r.post_id);if(p){p.like_count++;notify(p.author,r.user_id,'reaction',p.id)}},del:r=>{const p=T.posts.find(x=>x.id==r.post_id);if(p)p.like_count=Math.max(0,p.like_count-1)}},
 comments:{ins:r=>{const p=T.posts.find(x=>x.id==r.post_id);if(p){p.comment_count++;notify(p.author,r.author,'comment',p.id)}},del:r=>{const p=T.posts.find(x=>x.id==r.post_id);if(p)p.comment_count=Math.max(0,p.comment_count-1)}},
 friendships:{ins:r=>notify(r.addressee,r.requester,'friend_request'),upd:(o,n)=>{if(o.status=='pending'&&n.status=='accepted')notify(n.requester,n.addressee,'friend_accept')}},
 messages:{ins:r=>{const c=T.conversations.find(x=>x.id==r.conversation_id);if(c){c.last_message_at=r.created_at;c.last_message=r.body||'Sent a photo';c.last_sender=r.sender_id}const m=T.conversation_members.find(x=>x.conversation_id==r.conversation_id&&x.user_id==r.sender_id);if(m)m.last_read_at=r.created_at;setTimeout(()=>botReply(r),1800)}}};
function botReply(r){if(r.sender_id!=ME)return;const o=T.conversation_members.find(x=>x.conversation_id==r.conversation_id&&x.user_id!=ME);if(!o)return;const lines=['Sounds great!','Haha, love that 😄','Let me check and get back to you.','Perfect, see you soon!','Thanks for the message!'];const x={id:uid(),conversation_id:r.conversation_id,sender_id:o.user_id,body:lines[Math.floor(Math.random()*lines.length)],media_path:null,created_at:new Date().toISOString()};T.messages.push(x);const c=T.conversations.find(c=>c.id==r.conversation_id);c.last_message_at=x.created_at;c.last_message=x.body;c.last_sender=x.sender_id;fire('messages','INSERT',x)}
const ci=(a,b)=>String(a).toLowerCase().includes(String(b).toLowerCase());
function cond(row,f){const[k,op,v]=f;const x=row[k];switch(op){case'eq':return x==v;case'neq':return x!=v;case'in':return v.includes(x);case'is':return v===null?x==null:x===v;case'lt':return x<v;case'gt':return x>v;case'gte':return x>=v;case'ilike':return ci(x||'',String(v).replace(/%/g,''));case'not_is':return !(v===null?x==null:x===v)}return true}
function orMatch(row,s){const one=p=>{const a=/^and\((.*)\)$/.exec(p);if(a)return a[1].split(',').every(one);const m=/^([a-z_]+)\.([a-z]+)\.(.*)$/.exec(p);if(!m)return false;return cond(row,[m[1],m[2],m[3]])};return s.split(/,(?![^()]*\))/).some(one)}
class Q{constructor(t){this.t=t;this.f=[];this.ors=[];this.ord=null;this.lim=null;this.op='select';this.pay=null;this.one=null;this.head=false;this.cnt=false;this.ret=false;this.conf=null}
 select(c,o){if(this.op=='select'){this.head=!!(o&&o.head);this.cnt=!!(o&&o.count)}else this.ret=true;return this}
 insert(r){this.op='insert';this.pay=r;return this}upsert(r,o){this.op='upsert';this.pay=r;this.conf=o&&o.onConflict;return this}update(r){this.op='update';this.pay=r;return this}delete(){this.op='delete';return this}
 eq(k,v){this.f.push([k,'eq',v]);return this}neq(k,v){this.f.push([k,'neq',v]);return this}in(k,v){this.f.push([k,'in',v]);return this}is(k,v){this.f.push([k,'is',v]);return this}lt(k,v){this.f.push([k,'lt',v]);return this}gt(k,v){this.f.push([k,'gt',v]);return this}gte(k,v){this.f.push([k,'gte',v]);return this}ilike(k,v){this.f.push([k,'ilike',v]);return this}not(k,op,v){this.f.push([k,'not_'+op,v]);return this}or(s){this.ors.push(s);return this}
 order(k,o){this.ord=[k,!(o&&o.ascending===false)];return this}limit(n){this.lim=n;return this}single(){this.one='single';return this}maybeSingle(){this.one='maybe';return this}
 match(r){return this.f.every(x=>cond(r,x))&&this.ors.every(s=>orMatch(r,s))}
 run(){const t=this.t,tb=T[t];if(!tb)return{data:null,error:{message:'Unknown table '+t}};const u=cur();
  if(!u)return{data:null,error:{message:'Not signed in'}};
  if(this.op=='select'){let rows=tb.filter(r=>visible(t,r)&&this.match(r));if(this.ord)rows=rows.slice().sort((a,b)=>(a[this.ord[0]]>b[this.ord[0]]?1:-1)*(this.ord[1]?1:-1));if(this.lim)rows=rows.slice(0,this.lim);rows=rows.map(r=>({...r}));
   if(this.head)return{data:null,count:rows.length,error:null};
   if(this.one){if(rows.length>1&&this.one=='single')rows=rows.slice(0,1);if(!rows.length)return this.one=='single'?{data:null,error:{message:'No rows found'}}:{data:null,error:null};return{data:rows[0],error:null}}
   return{data:rows,error:null,count:rows.length}}
  const arr=Array.isArray(this.pay)?this.pay:[this.pay];
  if(this.op=='insert'||this.op=='upsert'){const out=[];for(const p of arr){const r={...p};{const he=EXT.beforeInsert&&EXT.beforeInsert(t,r,u);if(he&&he.error)return{data:null,error:he.error};if(he&&he.skip){out.push(r);continue}}
    if(t=='posts'){r.id=r.id||uid();Object.assign(r,{hidden:false,like_count:0,comment_count:0,created_at:new Date().toISOString(),edited_at:null,media:r.media||[],visibility:r.visibility||'public'});if(r.author!=u)return{data:null,error:{message:'Not allowed'}};if(!r.body&&!(r.media||[]).length)return{data:null,error:{message:'Write something or add a photo.'}}}
    else if(t=='comments'){r.id=uid();r.created_at=new Date().toISOString();r.parent_id=r.parent_id||null}
    else if(t=='messages'){r.id=uid();r.created_at=new Date().toISOString();r.body=r.body||''}
    else if(t=='reports'){r.id=uid();r.status='open';r.created_at=new Date().toISOString()}
    else if(t=='friendships'){r.id=uid();r.status='pending';r.created_at=new Date().toISOString();if(blocked(r.requester,r.addressee))return{data:null,error:{message:'Not allowed'}};if(T.friendships.some(f=>(f.requester==r.requester&&f.addressee==r.addressee)||(f.requester==r.addressee&&f.addressee==r.requester)))return{data:null,error:{message:'Already requested'}}}
    else if(t=='blocks'){r.created_at=new Date().toISOString();if(T.blocks.some(b=>b.blocker==r.blocker&&b.blocked==r.blocked)){out.push(r);continue}}
    else if(t=='saves'){if(T.saves.some(s=>s.user_id==r.user_id&&s.post_id==r.post_id)){out.push(r);continue}r.created_at=new Date().toISOString()}
    else if(t=='reactions'){const ex=T.reactions.find(x=>x.post_id==r.post_id&&x.user_id==r.user_id);if(ex){ex.type=r.type;out.push(ex);continue}r.created_at=new Date().toISOString()}
    tb.push(r);out.push(r);const tg=trig[t];if(tg&&tg.ins)tg.ins(r);if(t=='posts'||t=='messages'||t=='comments')fire(t,'INSERT',r)}
   const d=out.map(x=>({...x}));return{data:this.one?d[0]:(this.ret?d:null),error:null}}
  if(this.op=='update'){const rows=tb.filter(r=>visible(t,r)&&this.match(r));rows.forEach(r=>{const o={...r};const pay={...this.pay};if(t=='profiles'&&!isAdmin()){delete pay.role;delete pay.banned;delete pay.birthday}Object.assign(r,pay);if(t=='posts'&&pay.body!==undefined)r.edited_at=new Date().toISOString();const tg=trig[t];if(tg&&tg.upd)tg.upd(o,r)});const d=rows.map(x=>({...x}));return{data:this.one?d[0]:(this.ret?d:null),error:null}}
  if(this.op=='delete'){const rows=tb.filter(r=>visible(t,r)&&this.match(r));rows.forEach(r=>{tb.splice(tb.indexOf(r),1);const tg=trig[t];if(tg&&tg.del)tg.del(r);if(t=='posts'){T.comments=T.comments.filter(c=>c.post_id!=r.id);T.reactions=T.reactions.filter(c=>c.post_id!=r.id);T.saves=T.saves.filter(c=>c.post_id!=r.id)}});return{data:null,error:null}}
  return{data:null,error:null}}
 then(ok,no){return new Promise(res=>setTimeout(()=>res(this.run()),60)).then(ok,no)}}
const rpc={
 get_or_create_dm:a=>{const u=cur(),o=a.p_other;if(blocked(u,o))return{error:{message:'You cannot message this person.'}};let c=T.conversations.find(c=>!c.is_group&&T.conversation_members.some(m=>m.conversation_id==c.id&&m.user_id==u)&&T.conversation_members.some(m=>m.conversation_id==c.id&&m.user_id==o));if(!c){c={id:uid(),created_at:new Date().toISOString(),last_message_at:null,last_message:null,last_sender:null};T.conversations.push(c);T.conversation_members.push({conversation_id:c.id,user_id:u,last_read_at:new Date().toISOString()},{conversation_id:c.id,user_id:o,last_read_at:new Date().toISOString()})}return{data:c.id}},
 suggest_people2:(a)=>{const u=cur();T._hid=T._hid||{};const rel=p=>T.friendships.some(f=>(f.requester==p&&f.addressee==u)||(f.addressee==p&&f.requester==u));const all=T.profiles.filter(p=>p.id!=u&&!p.banned&&!blocked(p.id,u)&&!rel(p.id)&&!T._hid[p.id]).map((x,i)=>({id:x.id,full_name:x.full_name,username:x.username,avatar_path:x.avatar_path,city:x.city,mutual:(i*3+2)%7}));all.sort((x,y)=>y.mutual-x.mutual);const off=(a&&a.p_offset)||0,lim=(a&&a.p_limit)||20;return{data:all.slice(off,off+lim)}},
  hide_suggestion:(a)=>{T._hid=T._hid||{};T._hid[a.p_id]=1;return{data:null}},
  suggest_people:()=>{const u=cur();const rel=p=>T.friendships.some(f=>(f.requester==p&&f.addressee==u)||(f.addressee==p&&f.requester==u));return{data:T.profiles.filter(p=>p.id!=u&&!p.banned&&!blocked(p.id,u)&&!rel(p.id)).slice(0,20).map(x=>({...x}))}},
 delete_my_account:()=>{const u=cur();T.profiles=T.profiles.filter(p=>p.id!=u);sess=null;return{data:null}},
 admin_stats:a=>{if(!isAdmin())return{error:{message:'Admins only'}};const days=a.p_days||30,d0=new Date();d0.setHours(0,0,0,0);const keys=[];for(let i=days-1;i>=0;i--)keys.push(new Date(d0.getTime()-i*864e5).toISOString().slice(0,10));const cnt=(rows,k)=>keys.map(d=>({d,n:rows.filter(r=>String(r.created_at).slice(0,10)==d).length}));
   const bump=arr=>arr.map((x,i)=>({d:x.d,n:x.n+Math.round(2+4*Math.abs(Math.sin(i*1.3))+i/6)}));
   const rt={};T.reactions.forEach(r=>rt[r.type]=(rt[r.type]||0)+1);Object.assign(rt,{like:(rt.like||0)+31,love:(rt.love||0)+18,haha:9,wow:6,sad:2,angry:1});
   return{data:{users:T.profiles.length+240,new_users:T.profiles.length+60,banned:T.profiles.filter(p=>p.banned).length,posts:T.posts.length+1180,new_posts:T.posts.length+310,comments:T.comments.length+420,reactions:T.reactions.length+1290,messages:T.messages.length+2100,friendships:T.friendships.filter(f=>f.status=='accepted').length+860,reports_open:T.reports.filter(r=>r.status=='open').length,hidden_posts:T.posts.filter(p=>p.hidden).length,signups:bump(cnt(T.profiles,'created_at')),posts_by_day:bump(cnt(T.posts,'created_at')),reaction_types:rt}}}};
const SB={
 from:t=>new Q(t),
 rpc:(n,a)=>new Promise(res=>setTimeout(()=>{const f=rpc[n];res(f?(()=>{const r=f(a||{});return{data:r.data===undefined?null:r.data,error:r.error||null}})():{data:null,error:{message:'Unknown function '+n}})},60)),
 auth:{
  getSession:async()=>({data:{session:sess}}),
  onAuthStateChange:cb=>{SB.auth._cb=cb;return{data:{subscription:{unsubscribe(){}}}}},
  signInWithPassword:async({email,password})=>{if(!email||!password)return{data:null,error:{message:'Enter your email and password.'}};let p=T.profiles.find(p=>p.username==String(email).split('@')[0]);if(email=='demo@oneface.app'||email=='admin@oneface.app'||!p)p=T.profiles[0];sess={user:{id:p.id,email}};SB.auth._cb&&SB.auth._cb('SIGNED_IN',sess);return{data:{session:sess},error:null}},
  signUp:async({email,password,options})=>{const d=(options&&options.data)||{};const id=uid();T.profiles.push(P(id,d.full_name||'New member',(d.full_name||'user').toLowerCase().replace(/[^a-z0-9]/g,'')+Math.floor(Math.random()*9000+1000),'#D6A654','#AB7529',{birthday:d.birthday,created_at:new Date().toISOString(),avatar_path:null,cover_path:null}));sess={user:{id,email}};SB.auth._cb&&SB.auth._cb('SIGNED_IN',sess);return{data:{session:sess,user:sess.user},error:null}},
  signOut:async()=>{sess=null;SB.auth._cb&&SB.auth._cb('SIGNED_OUT',null);return{error:null}},
  resetPasswordForEmail:async()=>({data:{},error:null}),updateUser:async()=>({data:{},error:null})},
 storage:{from:b=>({upload:async(path,blob)=>{const url=await new Promise(r=>{const fr=new FileReader();fr.onload=()=>r(fr.result);fr.readAsDataURL(blob)});(SB.storage._m=SB.storage._m||{})[path]=url;return{data:{path},error:null}},getPublicUrl:p=>({data:{publicUrl:(SB.storage._m||{})[p]||p}})})},
 channel:()=>{const ch={_s:[],on(type,f,cb){ch._s.push({table:f.table,event:f.event,cb});return ch},subscribe(){ch._s.forEach(s=>subs.push(s));return ch}};return ch},
 removeChannel:ch=>{if(ch&&ch._s)ch._s.forEach(s=>{const i=subs.indexOf(s);if(i>=0)subs.splice(i,1)})}};
window.OF_DEMO={SB,T,ME,EXT,rpc,trig,H:{uid,ago,grad,AV,friends,blocked,cur,me,isAdmin,notify,fire,subs},startBot:()=>{setTimeout(()=>{if(!cur())return;const n={id:uid(),user_id:ME,actor_id:'u-2',type:'reaction',post_id:T.posts.find(x=>x.author==ME&&x.visibility=='public').id,created_at:new Date().toISOString(),read_at:null};T.notifications.push(n);fire('notifications','INSERT',n)},9000)}};
})();
