/* One Face SAMPLE MODE, part 3 (v3.0): share, pin, hide, message reactions/replies/mute, reviews, group rules. */
(function(){
const D=window.OF_DEMO,T=D.T,X=D.EXT,H=D.H,{uid,ago,grad}=H,ME=D.ME;
['hidden_posts','message_reactions','page_reviews'].forEach(t=>T[t]=[]);
T.profiles.forEach(p=>{p.relationship=p.relationship||'';p.pinned_post=p.pinned_post||null});
T.posts.forEach(p=>{p.shared_post=p.shared_post||null});
T.groups.forEach(g=>{g.rules=g.rules||'';g.pinned_post=g.pinned_post||null});
T.messages.forEach(m=>{m.reply_to=m.reply_to||null});
T.conversation_members.forEach(m=>{m.muted=!!m.muted});
const pr=id=>T.profiles.find(p=>p.id==id);
pr('u-1').relationship='married';pr('u-2').relationship='single';pr(ME).relationship='in_a_relationship';
const g1=T.groups.find(g=>g.name=='Atlanta Runners');
if(g1)g1.rules='1. Be kind.\n2. No spam.\n3. Post runs, routes and race tips only.';
/* memories: my posts from 1 and 2 years ago today */
[1,2].forEach(y=>{const d=new Date();d.setFullYear(d.getFullYear()-y);T.posts.push({id:uid(),author:ME,body:y==1?'One year ago: first sunrise shoot with the new lens. 📷':'Two years ago today I moved to Atlanta. Wow.',media:y==1?[{path:'demo:'+grad('#fb923c','#fbbf24','Sunrise'),type:'image'}]:[],visibility:'public',hidden:false,like_count:0,comment_count:0,created_at:d.toISOString(),edited_at:null,group_id:null,page_id:null,tags:[],feeling:null,place:null,link:null,poll:null,shared_post:null})});
const pg=T.pages[0];
if(pg)T.page_reviews.push({page_id:pg.id,user_id:'u-2',rating:5,body:'Best brunch in Miami. The staff is lovely.',created_at:ago(3000)},{page_id:pg.id,user_id:'u-3',rating:4,body:'Great food, a bit busy on Sundays.',created_at:ago(2000)});
const gc=T.conversations.find(c=>c.is_group);
if(gc){const m=T.messages.filter(x=>x.conversation_id==gc.id);if(m[1])T.message_reactions.push({message_id:m[1].id,user_id:ME,emoji:'👍',created_at:ago(50)})}
D.rpc.public_post=a=>{const p=T.posts.find(x=>x.id==a.p_id&&x.visibility=='public'&&!x.group_id&&!x.hidden);if(!p)return{data:null};const u=T.profiles.find(x=>x.id==p.author);return{data:{id:p.id,body:p.body,media:p.media,created_at:p.created_at,author_name:u.full_name,author_avatar:u.avatar_path}}};
const vis0=X.visible;
X.visible=(t,r,u)=>{
 if(t=='hidden_posts')return r.user_id==u;
 if(t=='message_reactions'){const m=T.messages.find(x=>x.id==r.message_id);return !!m&&T.conversation_members.some(c=>c.conversation_id==m.conversation_id&&c.user_id==u)}
 if(t=='page_reviews')return true;
 return vis0?vis0(t,r,u):undefined};
const bi0=X.beforeInsert;
const uniq={hidden_posts:['user_id','post_id'],message_reactions:['message_id','user_id'],page_reviews:['page_id','user_id']};
X.beforeInsert=(t,r,u)=>{
 if(uniq[t]){const ex=T[t].find(x=>uniq[t].every(k=>x[k]==r[k]));if(ex){Object.assign(ex,r);return{skip:true}}r.created_at=r.created_at||new Date().toISOString();
  if(t=='page_reviews'){const p=T.pages.find(x=>x.id==r.page_id);if(p&&p.owner==u)return{error:{message:'You cannot review your own page.'}}}return}
 const out=bi0?bi0(t,r,u):undefined;
 if(t=='posts'){r.shared_post=r.shared_post||null}
 if(t=='messages'){r.reply_to=r.reply_to||null}
 return out};
})();
