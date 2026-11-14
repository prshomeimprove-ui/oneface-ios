/* One Face SAMPLE MODE, part 4 (v3.9): live video sample data and a pretend video connection. Real mode never uses this. */
(function(){
const D=window.OF_DEMO;if(!D)return;
const T=D.T,X=D.EXT,H=D.H,rpc=D.rpc,SB=D.SB,{cur,fire,isAdmin,blocked}=H;
const now=()=>new Date().toISOString();
T.lives=[{likes:128,id:'live-demo1',host:'u-1',title:'Cooking dinner for 20 🍝',status:'live',started_at:now(),beat_at:now(),ended_at:null,ended_by:null}];
T.live_comments=[{id:'lc1',live_id:'live-demo1',user_id:'u-2',body:'That looks so good! 😍',created_at:now()},{id:'lc2',live_id:'live-demo1',user_id:'u-1',body:'Thanks everyone, dessert is next',created_at:now()}];
setInterval(()=>{T.lives.forEach(l=>{if(l.id=='live-demo1'&&l.status=='live')l.beat_at=now()})},10000);
const vis0=X.visible;
X.visible=(t,r,u)=>{if(t=='lives')return !blocked(r.host,u);if(t=='live_comments')return true;return vis0?vis0(t,r,u):undefined};
const bi0=X.beforeInsert;
X.beforeInsert=(t,r,u)=>{if(t=='live_comments'){const l=T.lives.find(x=>x.id==r.live_id);if(!l||l.status!='live')return{error:{message:'row-level security policy'}};r.id=r.id||'lc'+Math.random().toString(36).slice(2,9);r.created_at=r.created_at||now();return}return bi0?bi0(t,r,u):undefined};
rpc.start_live=a=>{T.lives.forEach(l=>{if(l.host==cur()&&l.status=='live')l.status='ended'});const l={id:'live-'+Math.random().toString(36).slice(2,8),host:cur(),title:(a&&a.p_title)||'',status:'live',started_at:now(),beat_at:now(),ended_at:null,ended_by:null};T.lives.push(l);return{data:l.id}};
rpc.end_live=a=>{const l=T.lives.find(x=>x.id==a.p_id);if(l&&l.status=='live'&&(l.host==cur()||isAdmin())){l.status='ended';l.ended_at=now();l.ended_by=l.host==cur()?'host':'admin';fire('lives','UPDATE',l)}return{data:null}};
rpc.admin_live_notice=a=>{if(!isAdmin())return{error:{message:'Admins only.'}};const row={id:'lc'+Math.random().toString(36).slice(2,8),live_id:a.p_id,user_id:cur(),body:a.p_text,is_admin:true,created_at:now()};T.live_comments.push(row);fire('live_comments','INSERT',row);return{data:null}};
rpc.admin_end_live=a=>{if(!isAdmin())return{error:{message:'Admins only.'}};const l=T.lives.find(x=>x.id==a.p_id);if(l&&l.status=='live'){l.status='ended';l.ended_at=now();l.ended_by='admin';l.end_note=a.p_note||null;fire('lives','UPDATE',l)}return{data:null}};
rpc.live_like=a=>{const l=T.lives.find(x=>x.id==a.p_id);if(l&&l.status=='live'){l.likes=(l.likes||0)+(a.p_n||1);fire('lives','UPDATE',l)}return{data:null}};
rpc.live_beat=a=>{const l=T.lives.find(x=>x.id==a.p_id);if(l)l.beat_at=now();return{data:null}};
const inv0=SB.functions&&SB.functions.invoke;
SB.functions={invoke:async(n,o)=>{if(n=='live-token'){const l=T.lives.find(x=>x.id==((o&&o.body)||{}).live_id);if(!l||l.status!='live')return{data:null,error:{message:'ended',context:{json:async()=>({error:'This live video has ended.'})}}};return{data:{token:l.host==cur()?'demo-host':'demo-viewer',url:'demo',host:l.host==cur()},error:null}}return inv0?inv0(n,o):{data:null,error:null}}};

/* pretend video connection (sample mode only; the app picks it when DEMO is on) */
window.__OF_FAKE_LK=(()=>{
 const RoomEvent={TrackSubscribed:'ts',TrackUnsubscribed:'tu',ParticipantConnected:'pc',ParticipantDisconnected:'pd',Disconnected:'d',AudioPlaybackStatusChanged:'ap'};
 const Track={Source:{Camera:'camera'}};
 function vid(label,c1,c2){const c=document.createElement('canvas');c.width=360;c.height=640;c.style.cssText='width:100%;height:100%;object-fit:contain';let t=0;const g=c.getContext('2d');
  const iv=setInterval(()=>{if(t>6&&!c.isConnected){clearInterval(iv);return}t++;const gr=g.createLinearGradient(0,0,360,640);gr.addColorStop(0,c1);gr.addColorStop(1,c2);g.fillStyle=gr;g.fillRect(0,0,360,640);g.fillStyle='rgba(255,255,255,.92)';g.font='bold 26px sans-serif';g.textAlign='center';g.fillText(label,180,290);g.font='16px sans-serif';g.fillText('(sample video)',180,324);g.beginPath();g.arc(180+Math.sin(t/8)*90,430,16,0,7);g.fill()},120);return c}
 class Room{constructor(){this.h={};this.remoteParticipants=new Map();this.canPlaybackAudio=true;
  this.localParticipant={setCameraEnabled:async()=>{},setMicrophoneEnabled:async()=>{},getTrackPublication:()=>({track:{kind:'video',attach:()=>vid('Your camera','#1F160D','#AB7529'),restartTrack:async()=>{}}})}}
  on(e,f){(this.h[e]=this.h[e]||[]).push(f);return this}
  emit(e,...a){(this.h[e]||[]).forEach(f=>f(...a))}
  async connect(url,token){await new Promise(r=>setTimeout(r,250));const add=id=>this.remoteParticipants.set(id,{identity:id,trackPublications:new Map()});
   if(token=='demo-viewer'){add('u-1');add('u-2');const hp=this.remoteParticipants.get('u-1');
    const v={kind:'video',attach:()=>vid('Jordan is live','#1f6bff','#19d3ff'),detach:()=>[]},a={kind:'audio',attach:()=>document.createElement('audio'),detach:()=>[]};
    setTimeout(()=>{this.emit(RoomEvent.TrackSubscribed,v,{},hp);this.emit(RoomEvent.TrackSubscribed,a,{},hp)},200)}
   else{add('u-1');add('u-2');add('u-3')}}
  async startAudio(){}
  disconnect(){this.remoteParticipants.clear()}}
 return{Room,RoomEvent,Track}})();
})();
