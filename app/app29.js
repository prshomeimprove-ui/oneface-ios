/* One Face v5.0: the main feed updates by itself (new posts, likes, comments) without tapping or refreshing. */
(function(){
const me=()=>S.user&&S.user.id;
const typing=()=>{const a=document.activeElement;return a&&/INPUT|TEXTAREA|SELECT/.test(a.tagName)};
const blocked=()=>document.hidden||typing()||document.querySelector('#sheet,#lb,#call,#sv');
const onHome=()=>S.route&&S.route.name=='home'&&document.getElementById('feed');
let busy=false,tmr=null,lastRun=0;
function refresh(needTop){
 clearTimeout(tmr);
 tmr=setTimeout(async()=>{
  if(busy||!onHome()||blocked())return;
  if(needTop&&scrollY>300){                                // reading further down: do not jump, show the "New posts" button
   if(!document.getElementById('newp')){const b=document.createElement('button');b.id='newp';b.textContent='↑ New posts';b.onclick=()=>{b.remove();try{S.cursor=null;route()}catch(e){}scrollTo(0,0)};document.body.appendChild(b)}
   return}
  if(Date.now()-lastRun<2500){refresh(needTop);return}
  busy=true;lastRun=Date.now();const y=scrollY,m=document.getElementById('main'),mt=m?m.scrollTop:0;
  try{S.cursor=null;await route()}catch(e){}
  try{scrollTo(0,y);if(m)m.scrollTop=mt}catch(e){}
  const p=document.getElementById('newp');if(p)p.remove();
  busy=false},500)}
const inFeed=id=>!!(id&&document.querySelector('#feed article.post[data-id="'+id+'"]'));

function wire(){
 try{if(!SB||!SB.channel||!me())return;
  const ch=SB.channel('of-feed')
   .on('postgres_changes',{event:'INSERT',schema:'public',table:'posts'},({new:p})=>{if(p&&p.author!=me()&&onHome())refresh(true)})
   .on('postgres_changes',{event:'*',schema:'public',table:'reactions'},({new:n,old:o})=>{const id=(n&&n.post_id)||(o&&o.post_id);const by=(n&&n.user_id)||(o&&o.user_id);if(by!=me()&&onHome()&&inFeed(id))refresh(false)})
   .on('postgres_changes',{event:'*',schema:'public',table:'comments'},({new:n,old:o})=>{const id=(n&&n.post_id)||(o&&o.post_id);const by=(n&&n.author)||(o&&o.author);if(by!=me()&&onHome()&&inFeed(id))refresh(false)})
   .subscribe();
  S.chans.push(ch)}catch(e){console.warn('feed live',e)}}
if(typeof live=='function'){const ol=live;live=function(){const r=ol.apply(this,arguments);wire();return r}}

/* backup: look every 4 seconds, and right away when the app comes back to the screen */
let last=null;
async function look(){
 try{if(!me()||!onHome()||document.hidden)return;
  const{data}=await SB.from('posts').select('id,author').order('created_at',{ascending:false}).limit(1);const t=data&&data[0];if(!t)return;
  if(last===null){last=t.id;return}
  if(t.id!==last){last=t.id;if(t.author!=me())refresh(true)}}catch(e){}}
setInterval(look,4000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)look()});
addEventListener('hashchange',()=>{last=null});
})();
