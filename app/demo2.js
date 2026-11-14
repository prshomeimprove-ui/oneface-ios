/* One Face SAMPLE MODE, part 2: stories, groups, pages, polls, group chat, tags, albums, appeals, calls, 2-step security. */
(function(){
const D=window.OF_DEMO,T=D.T,X=D.EXT,H=D.H,SB=D.SB,rpc=D.rpc,trig=D.trig,{uid,ago,grad,friends,blocked,cur,isAdmin,fire,subs}=H,ME=D.ME;
['groups','group_members','pages','page_follows','poll_votes','comment_likes','stories','story_views','albums','album_photos','announcements','appeals','push_subscriptions'].forEach(t=>T[t]=[]);
T.profiles.forEach(p=>{p.ban_reason='';p.prefs={}});
const now=()=>new Date().toISOString(),pr=id=>T.profiles.find(p=>p.id==id);
const bd=(days)=>{const d=new Date(Date.now()+days*864e5);return '1992-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
pr('u-1').birthday=bd(0);pr('u-2').birthday=bd(3);pr('u-3').birthday=bd(11);
/* seed */
const gid1=uid(),gid2=uid(),pg1=uid();
T.groups.push({id:gid1,name:'Atlanta Runners',about:'Weekend runs, race tips and good company.',cover_path:'demo:'+grad('#34d399','#059669',''),privacy:'public',created_by:'u-3',created_at:ago(60*24*30)},{id:gid2,name:'Foodies Club',about:'Recipes and restaurant finds. Members only.',cover_path:'demo:'+grad('#fb923c','#fbbf24',''),privacy:'private',created_by:'u-1',created_at:ago(60*24*20)});
[['u-3',gid1,'admin'],[ME,gid1,'member'],['u-5',gid1,'member'],['u-1',gid2,'admin'],['u-2',gid2,'member']].forEach(([u,g,r])=>T.group_members.push({group_id:g,user_id:u,role:r,status:'active',created_at:ago(5000)}));
T.group_members.push({group_id:gid2,user_id:'u-8',role:'member',status:'pending',created_at:ago(100)});
T.pages.push({id:pg1,name:'Casa Verde Restaurant',about:'Fresh Latin kitchen in Miami. Brunch on Sundays.',category:'Restaurant',avatar_path:'demo:'+H.AV('#059669','#34d399'),cover_path:'demo:'+grad('#fbd489','#d6a654',''),owner:'u-1',created_at:ago(60*24*40)});
T.page_follows.push({page_id:pg1,user_id:ME,created_at:ago(900)},{page_id:pg1,user_id:'u-2',created_at:ago(800)});
const mk=(a,body,min,x)=>Object.assign({id:uid(),author:a,body,media:[],visibility:'public',hidden:false,like_count:0,comment_count:0,created_at:ago(min),edited_at:null,group_id:null,page_id:null,tags:[],feeling:null,place:null,link:null,poll:null},x||{});
const sp=[mk('u-3','Saturday long run at Piedmont Park, 7am. All paces welcome! 🏃',45,{visibility:'group',group_id:gid1,place:'Piedmont Park, Atlanta'}),
 mk('u-1','Our new brunch menu is live. Come hungry! 🥑🍳',70,{page_id:pg1,media:[{path:'demo:'+grad('#34d399','#fbbf24','Brunch menu'),type:'image'}]}),
 mk('u-4','What should we cook for the potluck?',200,{poll:{options:['Tacos','Pasta','Curry','Pizza']}}),
 mk('u-5','Best coffee spot I found this week. Link inside.',260,{feeling:'😋 feeling happy',link:{url:'https://example.com/coffee',title:'The 10 best coffee shops in Denver',description:'From tiny roasters to cozy corners, here are the places worth the line.',image:'demo:'+grad('#92400e','#fbbf24','Coffee'),site:'example.com'}}),
 mk('u-2','Beach day with the best people 🌊',380,{tags:[ME,'u-4'],place:'Miami Beach',media:[{path:'demo:'+grad('#19d3ff','#1f6bff','Beach'),type:'image'}]}),
 mk('u-3','Congrats @amara.cole on the new studio! #photography #goals',500)];
T.posts.unshift(...sp);
const pollPost=sp[2];[['u-1',0],['u-2',2],['u-3',0],['u-5',3]].forEach(([u,o])=>T.poll_votes.push({post_id:pollPost.id,user_id:u,option:o}));
T.stories.push(...[['u-1','Prepping Sunday brunch','#fbd489','#d6a654'],['u-2','New design drop soon','#a78bfa','#f472b6'],['u-3','Miles done. Feeling strong','#34d399','#059669'],[ME,'Studio day','#D6A654','#AB7529']].map(([a,c,c1,c2],i)=>({id:uid(),author:a,media_path:'demo:'+grad(c1,c2,c),media_type:'image',caption:c,created_at:ago(60*(i+1)*2),expires_at:new Date(Date.now()+864e5-60*(i+1)*120000).toISOString()})));
const al=uid();T.albums.push({id:al,owner:ME,title:'Atlanta Golden Hours',created_at:ago(5000)});
[['#fb923c','#fbbf24','Sunrise'],['#D6A654','#AB7529','Skyline'],['#a78bfa','#f472b6','Dusk']].forEach(([a,b,t])=>T.album_photos.push({id:uid(),album_id:al,path:'demo:'+grad(a,b,t),caption:t,created_at:ago(5000)}));
T.announcements.push({id:uid(),title:'Welcome to One Face 2.0',body:'Stories, groups, pages, polls, group chats and more are here.',created_by:ME,created_at:ago(30)});
const gc={id:uid(),created_at:ago(300),last_message_at:ago(20),last_message:'See you all Sunday!',last_sender:'u-1',is_group:true,title:'Brunch Crew',created_by:ME};T.conversations.push(gc);
[[ME,'admin'],['u-1','member'],['u-2','member'],['u-4','member']].forEach(([u,r])=>T.conversation_members.push({conversation_id:gc.id,user_id:u,role:r,last_read_at:ago(100)}));
[['u-2','Who is bringing mimosas? 🥂',90],['u-1','I am! Table is booked for 11.',60],[ME,'Perfect. Count me in.',40],['u-1','See you all Sunday!',20]].forEach(([s,b,m])=>T.messages.push({id:uid(),conversation_id:gc.id,sender_id:s,body:b,media_path:null,media_type:'image',deleted_at:null,created_at:ago(m)}));
T.messages.forEach(m=>{m.media_type=m.media_type||'image';m.deleted_at=m.deleted_at||null});
const cm=T.comments[0];if(cm)T.comment_likes.push({comment_id:cm.id,user_id:'u-1'});
/* visibility */
const isMem=(g,u)=>T.group_members.some(m=>m.group_id==g&&m.user_id==u&&m.status=='active');
const gPub=g=>{const x=T.groups.find(y=>y.id==g);return !!x&&x.privacy=='public'};
X.visible=(t,r,u)=>{switch(t){
 case'posts':if(r.visibility=='group'){if(isAdmin()||r.author==u)return true;return !r.hidden&&r.group_id&&(isMem(r.group_id,u)||gPub(r.group_id))}return undefined;
 case'groups':case'pages':case'page_follows':case'announcements':case'comment_likes':return true;
 case'group_members':return r.user_id==u||gPub(r.group_id)||isMem(r.group_id,u);
 case'poll_votes':return true;
 case'stories':return isAdmin()||r.author==u||(new Date(r.expires_at)>new Date()&&friends(r.author,u)&&!blocked(r.author,u));
 case'story_views':return r.viewer_id==u||T.stories.some(s=>s.id==r.story_id&&s.author==u);
 case'albums':return r.owner==u||isAdmin()||(friends(r.owner,u)&&!blocked(r.owner,u));
 case'album_photos':{const a=T.albums.find(x=>x.id==r.album_id);return !!a&&(a.owner==u||isAdmin()||friends(a.owner,u))}
 case'appeals':return r.user_id==u||isAdmin();
 case'push_subscriptions':return r.user_id==u}};
/* inserts */
const uniq={poll_votes:['post_id','user_id'],comment_likes:['comment_id','user_id'],story_views:['story_id','viewer_id'],page_follows:['page_id','user_id'],push_subscriptions:['endpoint'],group_members:['group_id','user_id']};
X.beforeInsert=(t,r,u)=>{
 if(uniq[t]){const ex=T[t].find(x=>uniq[t].every(k=>x[k]==r[k]));if(ex){if(t=='poll_votes')ex.option=r.option;return{skip:true}}}
 if(!['posts','comments','messages','reports','friendships','blocks','saves','reactions'].includes(t)){r.id=r.id||uid();r.created_at=r.created_at||now()}
 if(t=='group_members'){const g=T.groups.find(x=>x.id==r.group_id);r.role='member';r.status=g&&g.privacy=='private'?'pending':'active'}
 if(t=='posts'){if(r.group_id&&!isMem(r.group_id,u))return{error:{message:'Join the group first.'}};if(r.page_id&&!T.pages.some(p=>p.id==r.page_id&&p.owner==u))return{error:{message:'Not your page.'}};Object.assign(r,{tags:r.tags||[],feeling:r.feeling||null,place:r.place||null,link:r.link||null,poll:r.poll||null,group_id:r.group_id||null,page_id:r.page_id||null})}
 if(t=='comments')r.edited_at=null;
 if(t=='appeals')r.status='open';
 if(t=='messages'){r.media_type=r.media_type||'image';r.deleted_at=null}
 if(t=='stories'){r.created_at=now();r.expires_at=new Date(Date.now()+864e5).toISOString()}
 if(t=='pages'&&r.owner!=u)return{error:{message:'Not allowed'}}};
/* notifications with extra ids */
const note=(user,actor,type,x)=>{if(user==actor)return;const n=Object.assign({id:uid(),user_id:user,actor_id:actor,type,post_id:null,group_id:null,page_id:null,created_at:now(),read_at:null},x);T.notifications.push(n);fire('notifications','INSERT',n)};
const unameOf=b=>[...String(b||'').matchAll(/@([a-z0-9_.]{3,30})/g)].map(m=>m[1]);
const mentions=(b,actor,post)=>unameOf(b).forEach(n=>{const p=T.profiles.find(x=>x.username==n);if(p)note(p.id,actor,'mention',{post_id:post})});
const t0=trig.posts&&trig.posts.ins;trig.posts=Object.assign(trig.posts||{},{ins:r=>{t0&&t0(r);mentions(r.body,r.author,r.id);(r.tags||[]).forEach(t=>note(t,r.author,'tag',{post_id:r.id}))}});
const c0=trig.comments.ins;trig.comments.ins=r=>{c0(r);mentions(r.body,r.author,r.post_id)};
trig.group_members={ins:r=>{if(r.status=='pending')T.group_members.filter(m=>m.group_id==r.group_id&&m.role=='admin').forEach(a=>note(a.user_id,r.user_id,'group_request',{group_id:r.group_id}))}};
trig.page_follows={ins:r=>{const p=T.pages.find(x=>x.id==r.page_id);if(p)note(p.owner,r.user_id,'page_follow',{page_id:p.id})}};
const m0=trig.messages.ins;trig.messages.ins=r=>{m0(r);const c=T.conversations.find(x=>x.id==r.conversation_id);if(c)c.last_message=r.body||(r.media_type=='audio'?'Voice message':r.media_type=='video'?'Sent a video':'Sent a photo');
 if(r.sender_id==ME){setTimeout(()=>subs.forEach(s=>{if(s.table=='__bc:chat:'+r.conversation_id&&s.event=='typing')s.cb({payload:{user:T.conversation_members.find(x=>x.conversation_id==r.conversation_id&&x.user_id!=ME).user_id}})}),400);
  setTimeout(()=>T.conversation_members.filter(m=>m.conversation_id==r.conversation_id&&m.user_id!=ME).forEach(m=>{m.last_read_at=now();fire('conversation_members','UPDATE',m)}),1200)}};
const gu=T.group_members;const upd=null;
/* rpc */
rpc.create_group=a=>{const id=uid();T.groups.push({id,name:a.p_name,about:a.p_about||'',cover_path:null,privacy:a.p_privacy=='private'?'private':'public',created_by:cur(),created_at:now()});T.group_members.push({group_id:id,user_id:cur(),role:'admin',status:'active',created_at:now()});return{data:id}};
rpc.create_group_chat=a=>{const ms=a.p_members||[];if(ms.length<2)return{error:{message:'Pick at least 2 people.'}};const c={id:uid(),created_at:now(),last_message_at:null,last_message:null,last_sender:null,is_group:true,title:(a.p_title||'Group chat').slice(0,60),created_by:cur()};T.conversations.push(c);T.conversation_members.push({conversation_id:c.id,user_id:cur(),role:'admin',last_read_at:now()});ms.forEach(u=>{if(u!=cur()&&!blocked(cur(),u))T.conversation_members.push({conversation_id:c.id,user_id:u,role:'member',last_read_at:now()})});return{data:c.id}};
rpc.add_chat_members=a=>{if(!T.conversation_members.some(m=>m.conversation_id==a.p_cid&&m.user_id==cur()&&m.role=='admin'))return{error:{message:'Not allowed'}};(a.p_members||[]).forEach(u=>{if(!T.conversation_members.some(m=>m.conversation_id==a.p_cid&&m.user_id==u))T.conversation_members.push({conversation_id:a.p_cid,user_id:u,role:'member',last_read_at:now()})});return{data:null}};
rpc.leave_chat=a=>{T.conversation_members=T.conversation_members.filter(m=>!(m.conversation_id==a.p_cid&&m.user_id==cur()));return{data:null}};
rpc.rename_chat=a=>{const c=T.conversations.find(x=>x.id==a.p_cid);if(c)c.title=a.p_title;return{data:null}};
rpc.unsend_message=a=>{const m=T.messages.find(x=>x.id==a.p_id&&x.sender_id==cur());if(m){m.body='';m.media_path=null;m.deleted_at=now();fire('messages','UPDATE',m)}return{data:null}};
rpc.trending_tags=()=>{const c={};T.posts.forEach(p=>[...(p.body||'').matchAll(/#([A-Za-z0-9_]{2,40})/g)].forEach(m=>c[m[1].toLowerCase()]=(c[m[1].toLowerCase()]||0)+1));return{data:Object.entries(c).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([tag,n])=>({tag,n}))}};
rpc.admin_ban=a=>{if(!isAdmin())return{error:{message:'Admins only'}};const p=pr(a.p_user);if(p&&p.role!='admin'){p.banned=true;p.ban_reason=a.p_reason||''}return{data:null}};
rpc.admin_resolve_appeal=a=>{if(!isAdmin())return{error:{message:'Admins only'}};const ap=T.appeals.find(x=>x.id==a.p_id);if(ap){ap.status=a.p_accept?'accepted':'rejected';if(a.p_accept){const p=pr(ap.user_id);if(p){p.banned=false;p.ban_reason=''}}}return{data:null}};
rpc.admin_reported_chat=a=>{if(!isAdmin())return{error:{message:'Admins only'}};if(!T.reports.some(r=>r.target_type=='message'&&r.target_id==a.p_message))return{error:{message:'That message was not reported.'}};const m=T.messages.find(x=>x.id==a.p_message);return{data:T.messages.filter(x=>x.conversation_id==m.conversation_id).slice(-40).reverse()}};
const as0=rpc.admin_stats;rpc.admin_stats=a=>{const r=as0(a);if(r.data){r.data.groups=T.groups.length+14;r.data.pages=T.pages.length+6;r.data.stories=T.stories.length+90;r.data.appeals_open=T.appeals.filter(x=>x.status=='open').length}return r};
rpc.set_my_birthday=a=>{const p=pr(cur());if(!p)return{data:false};const y=(Date.now()-new Date(a.p_birthday))/31557600000;if(y<13){T.profiles=T.profiles.filter(x=>x.id!=p.id);return{data:false}}p.birthday=a.p_birthday;return{data:true}};
/* auth: social login, 2-step security */
let mfa=null,aal2=true;
const A=SB.auth,sin=A.signInWithPassword;
A.signInWithPassword=async x=>{const r=await sin(x);if(mfa&&mfa.ok)aal2=false;return r};
A.signInWithOAuth=async({provider})=>{await sin({email:'demo@oneface.app',password:'x'});return{data:{provider},error:null}};
A.mfa={listFactors:async()=>({data:{totp:mfa&&mfa.ok?[{id:'f1',status:'verified',friendly_name:'Authenticator'}]:[],all:[]},error:null}),
 enroll:async()=>{mfa={ok:false};return{data:{id:'f1',totp:{qr_code:'data:image/svg+xml;utf8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#fff"/><path fill="#1F160D" d="M8 8h28v28H8zM64 8h28v28H64zM8 64h28v28H8zM44 44h12v12H44zM64 64h12v12H64zM80 80h12v12H80zM44 8h12v12H44zM8 44h12v12H8zM80 44h12v12H80z"/></svg>'),secret:'ONEF ACE2 DEMO KEY1',uri:'otpauth://totp/OneFace:demo'}},error:null}},
 challenge:async()=>({data:{id:'c1'},error:null}),
 verify:async({code})=>{if(String(code)!='123456')return{data:null,error:{message:'Invalid code'}};if(mfa)mfa.ok=true;aal2=true;return{data:{},error:null}},
 unenroll:async()=>{mfa=null;aal2=true;return{data:{},error:null}},
 getAuthenticatorAssuranceLevel:async()=>({data:{currentLevel:aal2?'aal2':'aal1',nextLevel:mfa&&mfa.ok?'aal2':'aal1'},error:null})};
SB.functions={invoke:async(n,o)=>{await new Promise(r=>setTimeout(r,500));const b=(o&&o.body)||{};if(n=='link-preview'){let h='example.com';try{h=new URL(b.url).hostname.replace(/^www\./,'')}catch(e){return{data:null,error:{message:'Bad link'}}}return{data:{url:b.url,title:'Sample preview for '+h,description:'This is how a link card looks inside a post. On the live site it shows the real page title, text and picture.',image:'demo:'+grad('#D6A654','#AB7529',h),site:h},error:null}}return{data:{sent:1},error:null}}};
/* realtime incl. typing broadcasts */
SB.channel=name=>{const ch={_s:[],_n:name,on(type,f,cb){ch._s.push(type=='broadcast'?{table:'__bc:'+name,event:f.event,cb}:{table:f.table,event:f.event,cb});return ch},subscribe(cb){ch._s.forEach(s=>subs.push(s));cb&&cb('SUBSCRIBED');return ch},send(m){subs.forEach(s=>{if(s.table=='__bc:'+name&&s.event==m.event&&!ch._s.includes(s))s.cb({payload:m.payload})});return Promise.resolve('ok')},unsubscribe(){ch._s.forEach(s=>{const i=subs.indexOf(s);if(i>=0)subs.splice(i,1)})}};return ch};
D.demo2=true;
})();
