/* One Face SAMPLE MODE, part 5: business pages, shop, reviews and ads sample data. Real mode never uses this. */
(function(){
const D=window.OF_DEMO;if(!D)return;
const T=D.T,X=D.EXT,H=D.H,rpc=D.rpc,{cur,isAdmin,blocked,uid,ago}=H;
const iso=m=>new Date(Date.now()+m*60000).toISOString();
['page_products','ads'].forEach(t=>{if(!T[t])T[t]=[]});
const cv=T.pages.find(p=>/Casa Verde/.test(p.name));
if(cv)Object.assign(cv,{is_business:true,verified:true,phone:'+1 305 555 0142',address:'1200 Brickell Ave, Miami, FL',website:'https://casaverde.example',hours:'Mon-Fri 9am-9pm · Sat-Sun 8am-10pm'});
const mine={id:'pg-bakery',name:"Amara's Bakery",about:'Fresh bread, cakes and pastries baked every morning.',category:'Shop',avatar_path:'demo:'+H.AV('#d97706','#fbbf24'),cover_path:'demo:'+H.grad('#fde68a','#d97706',''),owner:D.ME,created_at:ago(60*24*5),is_business:true,verified:false,phone:'+1 404 555 0199',address:'45 Peachtree St, Atlanta, GA',website:'',hours:'Tue-Sun 7am-4pm'};
T.pages.push(mine);
const bp={id:'bp-1',author:D.ME,body:'Fresh strawberry cakes are here! Order today and pick up tomorrow. 🍰',visibility:'public',page_id:'pg-bakery',created_at:ago(300),media:[{path:'demo:'+H.grad('#fda4af','#f59e0b','Strawberry cake'),type:'image'}]};
if(T.posts)T.posts.push(bp);
T.page_products.push(
 {id:'pr1',page_id:cv&&cv.id,name:'Brunch for two',description:'Eggs, avocado toast, fruit and coffee.',price_cents:2400,image_path:'demo:'+H.grad('#34d399','#fbbf24','Brunch'),active:true,created_at:ago(900)},
 {id:'pr2',page_id:cv&&cv.id,name:'Catering tray (10 people)',description:'Chef selection. 48 hours notice.',price_cents:18000,image_path:'demo:'+H.grad('#f97316','#fde68a','Tray'),active:true,created_at:ago(800)},
 {id:'pr3',page_id:'pg-bakery',name:'Strawberry cake',description:'8 inch, fresh cream.',price_cents:3200,image_path:'demo:'+H.grad('#fda4af','#f59e0b','Cake'),active:true,created_at:ago(500)});
const post1=T.posts.find(p=>p.page_id==(cv&&cv.id)),post2=T.posts.find(p=>p.author=='u-2'&&p.visibility=='public');
if(post1)T.ads.push({id:'ad1',owner:'u-1',post_id:post1.id,page_id:cv.id,title:'Sunday brunch special',cta:'Learn more',days:7,audience_city:'',daily_budget_cents:0,status:'active',reject_reason:'',starts_at:iso(-1440),ends_at:iso(1440*6),views:340,clicks:21,created_at:ago(1500)});
if(post2)T.ads.push({id:'ad2',owner:'u-2',post_id:post2.id,page_id:null,title:'Come visit us',cta:'Message',days:3,audience_city:'',daily_budget_cents:0,status:'pending',reject_reason:'',starts_at:null,ends_at:null,views:0,clicks:0,created_at:ago(60)});
const vis0=X.visible;
X.visible=(t,r,u)=>{if(t=='ads')return r.owner==u||isAdmin();if(t=='page_products')return true;return vis0?vis0(t,r,u):undefined};
const bi0=X.beforeInsert;
X.beforeInsert=(t,r,u)=>{
 if(t=='page_products'){if(!T.pages.some(p=>p.id==r.page_id&&p.owner==u))return{error:{message:'row-level security policy'}};r.id=r.id||uid();if(r.active===undefined)r.active=true;r.created_at=r.created_at||new Date().toISOString();return}
 return bi0?bi0(t,r,u):undefined};
const act=a=>a.status=='active'&&new Date(a.starts_at)<=new Date()&&new Date(a.ends_at)>new Date();
rpc.boost_post=a=>{const p=T.posts.find(x=>x.id==a.p_post);if(!p||p.author!=cur())return{error:{message:'You can only boost your own post.'}};if(p.visibility!='public')return{error:{message:'Only public posts can be boosted.'}};
 if(T.ads.filter(x=>x.owner==cur()&&x.status=='pending').length>=5)return{error:{message:'You have 5 ads waiting for review. Please wait for them.'}};
 const ad={id:'ad-'+Math.random().toString(36).slice(2,8),owner:cur(),post_id:p.id,page_id:p.page_id||null,title:String(a.p_title||'').slice(0,80),cta:a.p_cta||'Learn more',days:Math.max(1,Math.min(30,a.p_days||7)),audience_city:a.p_city||'',daily_budget_cents:0,status:'pending',reject_reason:'',starts_at:null,ends_at:null,views:0,clicks:0,created_at:new Date().toISOString()};T.ads.push(ad);return{data:ad.id}};
rpc.ad_set_status=a=>{const x=T.ads.find(v=>v.id==a.p_ad&&v.owner==cur());if(x&&(x.status=='active'||x.status=='paused'))x.status=a.p_status;return{data:null}};
rpc.admin_ad_review=a=>{if(!isAdmin())return{error:{message:'Admins only'}};const x=T.ads.find(v=>v.id==a.p_ad);if(x){if(a.p_ok){x.status='active';x.starts_at=iso(0);x.ends_at=iso(1440*x.days);x.reject_reason=''}else{x.status='rejected';x.reject_reason=a.p_reason||''}}return{data:null}};
rpc.admin_ad_set=a=>{if(!isAdmin())return{error:{message:'Admins only'}};const x=T.ads.find(v=>v.id==a.p_ad);if(x)x.status=a.p_status;return{data:null}};
rpc.feed_ads=a=>{const u=cur(),me=H.me&&H.me();const rows=T.ads.filter(x=>act(x)&&x.owner!=u&&!blocked(x.owner,u)).slice(0,(a&&a.p_limit)||5);return{data:rows.map(x=>({id:x.id,post_id:x.post_id,page_id:x.page_id,owner:x.owner,title:x.title,cta:x.cta}))}};
rpc.ad_view=a=>{const x=T.ads.find(v=>v.id==a.p_ad);if(x&&x.status=='active')x.views++;return{data:null}};
rpc.ad_click=a=>{const x=T.ads.find(v=>v.id==a.p_ad);if(x&&x.status=='active')x.clicks++;return{data:null}};
})();
/* ---- part 5b: social pack sample data ---- */
(function(){
const D=window.OF_DEMO;if(!D)return;
const T=D.T,X=D.EXT,H=D.H,rpc=D.rpc,{cur,isAdmin,blocked,uid,ago}=H;
['scheduled_posts','close_friends','follows'].forEach(t=>{if(!T[t])T[t]=[]});
const u1=T.profiles.find(p=>p.id=='u-1');if(u1){u1.verified=true}
const me=T.profiles.find(p=>p.id==D.ME);if(me){me.featured=[]}
T.follows.push({follower:'u-3',followee:'u-1',created_at:ago(500)},{follower:'u-2',followee:'u-1',created_at:ago(400)});
T.scheduled_posts.push({id:'sp1',owner:D.ME,payload:{body:'Grand opening this Saturday! 🎉',visibility:'public',media:[]},publish_at:new Date(Date.now()+86400000).toISOString(),status:'scheduled',post_id:null,error:'',created_at:ago(30)},
 {id:'sp2',owner:D.ME,payload:{body:'Draft: new recipe idea…',visibility:'friends',media:[]},publish_at:null,status:'draft',post_id:null,error:'',created_at:ago(60)});
const vis1=X.visible;
X.visible=(t,r,u)=>{
 if(t=='scheduled_posts')return r.owner==u;
 if(t=='close_friends')return r.owner==u;
 if(t=='follows')return true;
 if(t=='posts'&&r.visibility=='close'){if(isAdmin()||r.author==u)return true;return !r.hidden&&!blocked(r.author,u)&&T.close_friends.some(c=>c.owner==r.author&&c.friend==u)}
 return vis1?vis1(t,r,u):undefined};
const bi1=X.beforeInsert;
X.beforeInsert=(t,r,u)=>{
 if(t=='scheduled_posts'){r.id=r.id||uid();r.owner=u;r.created_at=r.created_at||new Date().toISOString();r.error='';return}
 if(t=='close_friends'){if(!H.friends(r.friend,u))return{error:{message:'row-level security policy'}};r.created_at=new Date().toISOString();return}
 if(t=='follows'){if(r.follower!=u)return{error:{message:'row-level security policy'}};r.created_at=new Date().toISOString();return}
 return bi1?bi1(t,r,u):undefined};
const pubDue=()=>{let n=0;T.scheduled_posts.filter(s=>s.status=='scheduled'&&new Date(s.publish_at)<=new Date()).forEach(s=>{const p=s.payload;const id=uid();T.posts.push({id,author:s.owner,body:p.body||'',media:p.media||[],tags:p.tags||[],feeling:p.feeling||null,place:p.place||null,link:p.link||null,poll:p.poll||null,visibility:p.visibility||'public',group_id:p.group_id||null,page_id:p.page_id||null,created_at:new Date().toISOString()});s.status='published';s.post_id=id;n++});return n};
rpc.publish_due=()=>({data:pubDue()});
rpc.publish_now=a=>{const s=T.scheduled_posts.find(x=>x.id==a.p_id&&x.owner==cur());if(s&&(s.status=='draft'||s.status=='scheduled')){s.status='scheduled';s.publish_at=new Date().toISOString();pubDue()}return{data:s&&s.post_id||null}};
rpc.touch_seen=()=>({data:null});
let showA=true;rpc.my_show_active=()=>({data:showA});rpc.set_show_active=a=>{showA=!!a.p_show;return{data:null}};
rpc.seen_many=a=>({data:showA?(a.p_users||[]).filter(i=>i!=cur()).map((i,k)=>({user_id:i,last_seen_at:new Date(Date.now()-(k%2?25*60000:30000)).toISOString()})):[]});
})();
/* ---- part 6: marketplace sample data ---- */
(function(){
const D=window.OF_DEMO;if(!D)return;
const T=D.T,X=D.EXT,H=D.H,{cur,isAdmin,blocked,uid,ago}=H;
['market_items','market_saves'].forEach(t=>{if(!T[t])T[t]=[]});
const g=(a,b,t)=>'demo:'+H.grad(a,b,t);
T.market_items.push(
 {id:'mk1',seller:'u-2',title:'Mountain bike, 21 speed',description:'Great condition, new tires. Pick up in Miami.',price_cents:18000,category:'Sports',condition:'Used',city:'Miami',photos:[g('#34d399','#065f46','Bike'),g('#6ee7b7','#047857','Side')],status:'active',created_at:ago(200)},
 {id:'mk2',seller:'u-1',title:'Leather sofa',description:'3 seater, brown. Smoke free home.',price_cents:35000,category:'Home & garden',condition:'Like new',city:'Miami',photos:[g('#d97706','#78350f','Sofa')],status:'active',created_at:ago(400)},
 {id:'mk3',seller:'u-2',title:'iPhone charger bundle',description:'',price_cents:0,category:'Free',condition:'New',city:'Orlando',photos:[g('#60a5fa','#1e3a8a','Free')],status:'active',created_at:ago(600)},
 {id:'mk4',seller:D.ME,title:'Baby stroller',description:'Folds easily.',price_cents:6000,category:'Baby & kids',condition:'Used',city:'Miami',photos:[g('#f9a8d4','#be185d','Stroller')],status:'active',created_at:ago(800)});
const v0=X.visible;
X.visible=(t,r,u)=>{if(t=='market_items')return r.seller==u||isAdmin()||(r.status!='hidden'&&!blocked(r.seller,u));if(t=='market_saves')return r.user_id==u;return v0?v0(t,r,u):undefined};
const b0=X.beforeInsert;
X.beforeInsert=(t,r,u)=>{
 if(t=='market_items'){if(r.seller!=u)return{error:{message:'row-level security policy'}};if(T.market_items.filter(x=>x.seller==u&&x.status=='active').length>=30)return{error:{message:'You can have up to 30 active listings.'}};r.id=r.id||uid();r.status=r.status||'active';r.description=r.description||'';r.created_at=new Date().toISOString();return}
 return b0?b0(t,r,u):undefined};
})();
/* ---- part 7: reels sample data ---- */
(function(){
const D=window.OF_DEMO;if(!D)return;
const T=D.T,X=D.EXT,H=D.H,{cur,isAdmin,blocked,uid,ago}=H;
['reels','reel_reactions','reel_comments'].forEach(t=>{if(!T[t])T[t]=[]});
const V='demo:demo-reel.mp4';
T.reels.push({id:'rl1',author:'u-2',video_path:V,caption:'Sunset walk on the beach 🌅',like_count:1,comment_count:1,created_at:ago(100)},
 {id:'rl2',author:'u-1',video_path:V,caption:'Behind the scenes at the restaurant 🍳',like_count:0,comment_count:0,created_at:ago(300)},
 {id:'rl3',author:D.ME,video_path:V,caption:'My first reel!',like_count:0,comment_count:0,created_at:ago(500)});
T.reel_reactions.push({reel_id:'rl1',user_id:'u-1',type:'love',created_at:ago(50)});
T.reel_comments.push({id:'rc1',reel_id:'rl1',author:'u-1',body:'Beautiful! 😍',created_at:ago(40)});
const v0=X.visible;
X.visible=(t,r,u)=>{if(t=='reels')return r.author==u||isAdmin()||!blocked(r.author,u);if(t=='reel_reactions'||t=='reel_comments')return true;return v0?v0(t,r,u):undefined};
const b0=X.beforeInsert;const bump=(id,k,d)=>{const r=T.reels.find(x=>x.id==id);if(r)r[k]=Math.max(0,(r[k]||0)+d)};
X.beforeInsert=(t,r,u)=>{
 if(t=='reels'){if(r.author!=u)return{error:{message:'row-level security policy'}};r.id=r.id||uid();r.like_count=0;r.comment_count=0;r.caption=r.caption||'';r.created_at=new Date().toISOString();if(!/^demo:/.test(r.video_path))r.video_path='demo:demo-reel.mp4';return}
 if(t=='reel_reactions'){bump(r.reel_id,'like_count',1);return}
 if(t=='reel_comments'){r.id=r.id||uid();r.created_at=new Date().toISOString();bump(r.reel_id,'comment_count',1);return}
 return b0?b0(t,r,u):undefined};
})();
/* ---- part 8: booking sample data ---- */
(function(){
const D=window.OF_DEMO;if(!D)return;
const T=D.T,X=D.EXT,H=D.H,rpc=D.rpc,{cur,isAdmin,blocked,uid,ago}=H;
if(!T.bookings)T.bookings=[];
const iso=m=>new Date(Date.now()+m*60000).toISOString();
const cv=T.pages.find(p=>/Casa Verde/.test(p.name)),bk=T.pages.find(p=>p.id=='pg-bakery');
if(cv)cv.accepts_bookings=true;if(bk)bk.accepts_bookings=true;
T.bookings.push({id:'bk1',page_id:'pg-bakery',customer:'u-2',service:'Strawberry cake',starts_at:iso(2880),note:'Pick up at noon please',status:'pending',created_at:ago(60)},
 {id:'bk2',page_id:'pg-bakery',customer:'u-3',service:'Croissant',starts_at:iso(4320),note:'',status:'confirmed',created_at:ago(300)});
if(cv)T.bookings.push({id:'bk3',page_id:cv.id,customer:D.ME,service:'Brunch for two',starts_at:iso(5760),note:'',status:'confirmed',created_at:ago(400)});
const v0=X.visible;
X.visible=(t,r,u)=>{if(t=='bookings'){const p=T.pages.find(x=>x.id==r.page_id);return r.customer==u||isAdmin()||(p&&p.owner==u)}return v0?v0(t,r,u):undefined};
const b0=X.beforeInsert;
X.beforeInsert=(t,r,u)=>{
 if(t=='bookings'){const p=T.pages.find(x=>x.id==r.page_id);if(!p||!p.accepts_bookings||p.owner==u||r.customer!=u)return{error:{message:'row-level security policy'}};if(new Date(r.starts_at)<new Date())return{error:{message:'Choose a time in the future.'}};r.id=r.id||uid();r.status='pending';r.note=r.note||'';r.created_at=new Date().toISOString();return}
 return b0?b0(t,r,u):undefined};
rpc.set_booking_status=a=>{const b=T.bookings.find(x=>x.id==a.p_id);if(!b)return{error:{message:'Booking not found.'}};const p=T.pages.find(x=>x.id==b.page_id),u=cur();
 if(p&&p.owner==u){if(!['confirmed','declined','done'].includes(a.p_status))return{error:{message:'Not allowed.'}}}else if(b.customer==u){if(a.p_status!='cancelled')return{error:{message:'Not allowed.'}}}else return{error:{message:'Not allowed.'}};
 b.status=a.p_status;return{data:null}};
})();
/* ---- part 9: payment sample data ---- */
(function(){
const D=window.OF_DEMO;if(!D)return;
const T=D.T,X=D.EXT,H=D.H,SB=D.SB,{cur,isAdmin,uid,ago}=H;
['orders','page_stripe'].forEach(t=>{if(!T[t])T[t]=[]});
const cv=T.pages.find(p=>/Casa Verde/.test(p.name)),bk=T.pages.find(p=>p.id=='pg-bakery');
if(cv)cv.pay_ready=true;
if(bk){bk.pay_ready=false}
const pr3=T.page_products.find(p=>p.id=='pr3');
if(bk&&pr3)T.orders.push({id:'od1',page_id:'pg-bakery',product_id:'pr3',buyer:'u-2',product_name:'Strawberry cake',amount_cents:3200,fee_cents:0,currency:'usd',status:'paid',created_at:ago(500),paid_at:ago(499)});
const v0=X.visible;
X.visible=(t,r,u)=>{if(t=='orders'){const p=T.pages.find(x=>x.id==r.page_id);return r.buyer==u||isAdmin()||(p&&p.owner==u)}if(t=='page_stripe')return r.owner==u;return v0?v0(t,r,u):undefined};
const inv0=SB.functions.invoke;
SB.functions={invoke:async(n,o)=>{if(n!='stripe')return inv0(n,o);await new Promise(r=>setTimeout(r,300));const b=(o&&o.body)||{},u=cur();
 const pg=T.pages.find(p=>p.id==b.page_id);
 if(b.action=='onboard'){if(!pg||pg.owner!=u)return{data:{error:'Only the page owner can do this.'},error:null};if(!T.page_stripe.some(x=>x.page_id==pg.id))T.page_stripe.push({page_id:pg.id,owner:u,account_id:'acct_demo'});return{data:{url:'demo:#/page/'+pg.id+'?demo_stripe=1'},error:null}}
 if(b.action=='status'){if(!pg)return{data:{error:'Not found'},error:null};const done=!!window._demoStripeDone;if(done)pg.pay_ready=true;return{data:{ready:done,charges_enabled:done,details_submitted:done},error:null}}
 if(b.action=='dashboard')return{data:{url:'demo:#/sales/'+b.page_id},error:null};
 if(b.action=='checkout'){const p=T.page_products.find(x=>x.id==b.product_id);if(!p)return{data:{error:'This item is not available.'},error:null};const g=T.pages.find(x=>x.id==p.page_id);if(!g.pay_ready)return{data:{error:'This business cannot take online payments yet.'},error:null};
  const o={id:uid(),page_id:g.id,product_id:p.id,buyer:u,product_name:p.name,amount_cents:p.price_cents,fee_cents:0,currency:'usd',status:'paid',created_at:new Date().toISOString(),paid_at:new Date().toISOString()};T.orders.push(o);return{data:{url:'demo:#/orders?paid=1'},error:null}}
 return{data:{error:'Unknown action'},error:null}}};
})();
/* ---- part 10: sample alerts for the newer features ---- */
(function(){
const D=window.OF_DEMO;if(!D)return;const T=D.T,{ago}=D.H;
if(!T.notifications)return;
const n=(id,actor,type,extra,min)=>T.notifications.unshift(Object.assign({id,user_id:D.ME,actor_id:actor,type,created_at:ago(min),read_at:null},extra));
n('nx1','u-2','reel_reaction',{reel_id:'rl3'},5);n('nx2','u-1','follow',{},12);n('nx3','u-2','booking',{page_id:'pg-bakery'},20);n('nx4','u-3','order',{page_id:'pg-bakery'},30);
})();
/* ---- part 11: auto-delete messages ---- */
(function(){
const D=window.OF_DEMO;if(!D)return;
const T=D.T,H=D.H,rpc=D.rpc,{cur,uid,ago}=H;
if(!T.chat_media_trash)T.chat_media_trash=[];
const purge=cid=>{const c=T.conversations.find(x=>x.id==cid);if(!c||!c.auto_delete_days)return 0;const lim=Date.now()-c.auto_delete_days*86400000;let n=0;for(let i=T.messages.length-1;i>=0;i--){const m=T.messages[i];if(m.conversation_id==cid&&new Date(m.created_at).getTime()<lim){T.messages.splice(i,1);n++}}return n};
rpc.set_chat_auto_delete=a=>{const c=T.conversations.find(x=>x.id==a.p_cid);const u=cur();if(!c||!T.conversation_members.some(m=>m.conversation_id==c.id&&m.user_id==u))return{error:{message:'This chat is not available.'}};if(a.p_days!=null&&![1,7,30,90].includes(a.p_days))return{error:{message:'Choose 24 hours, 7, 30 or 90 days.'}};
 if(c.is_group&&c.created_by!=u&&!T.conversation_members.some(m=>m.conversation_id==c.id&&m.user_id==u&&m.role=='admin'))return{error:{message:'Only group admins can change this.'}};
 c.auto_delete_days=a.p_days;purge(c.id);return{data:null}};
rpc.purge_my_expired=()=>{let n=0;T.conversations.forEach(c=>{if(T.conversation_members.some(m=>m.conversation_id==c.id&&m.user_id==cur()))n+=purge(c.id)});return{data:n}};
})();
(function(){const D=window.OF_DEMO;if(!D)return;if(!D.T.message_hidden)D.T.message_hidden=[]})();

/* ---- part 12: story reactions sample data ---- */
(function(){
const D=window.OF_DEMO;if(!D)return;
const T=D.T,X=D.EXT,H=D.H,{uid,ago,fire}=H;
if(!T.story_reactions)T.story_reactions=[];
const mine=T.stories.find(s=>s.author==D.ME);
if(mine){T.story_reactions.push({story_id:mine.id,user_id:'u-1',type:'love',created_at:ago(20)},{story_id:mine.id,user_id:'u-2',type:'haha',created_at:ago(10)},{story_id:mine.id,user_id:'u-3',type:'wow',created_at:ago(5)})}
const v0=X.visible;
X.visible=(t,r,u)=>{if(t=='story_reactions'){const s=T.stories.find(x=>x.id==r.story_id);return r.user_id==u||(s&&s.author==u)||H.isAdmin()}return v0?v0(t,r,u):undefined};
const b0=X.beforeInsert;
X.beforeInsert=(t,r,u)=>{
 if(t=='story_reactions'){r.user_id=u;const ex=T.story_reactions.find(x=>x.story_id==r.story_id&&x.user_id==u);if(ex){ex.type=r.type;return{skip:true}}
  r.created_at=new Date().toISOString();const s=T.stories.find(x=>x.id==r.story_id);
  if(s&&s.author!=u&&T.notifications){const n={id:uid(),user_id:s.author,actor_id:u,type:'story_reaction',post_id:null,group_id:null,page_id:null,created_at:r.created_at,read_at:null};T.notifications.push(n);try{fire('notifications','INSERT',n)}catch(e){}}
  return}
 return b0?b0(t,r,u):undefined};
})();
