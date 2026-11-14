/* One Face 3.1: share to social media, public share page, install prompt, invite friends */
(function(){
const st=document.createElement('style');
st.textContent='.soc{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;padding:6px 0 4px}.soc a,.soc button{display:flex;flex-direction:column;align-items:center;gap:4px;padding:12px 4px;border:1px solid var(--line);border-radius:14px;background:var(--card);color:var(--ink);font-size:13px;font-weight:600;text-decoration:none}.soc span{font-size:26px}.pubp{max-width:600px;margin:0 auto;padding:16px}.pubp .cta{display:flex;gap:10px;flex-wrap:wrap;margin-top:14px}.pubp .cta .btn{flex:1;min-width:140px;text-align:center}.instb{display:flex;align-items:center;gap:10px;margin:8px 12px;padding:12px;border-radius:14px;background:var(--soft);border:1px solid var(--line)}.instb .grow{flex:1;min-width:0}.instb small{display:block;color:var(--mut)}';
document.head.appendChild(st);
const E=encodeURIComponent,esc2=s=>esc(String(s==null?'':s));
let deferred=null;addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferred=e});addEventListener('appinstalled',()=>{deferred=null;try{localStorage.setItem('of_inst','done')}catch(x){}});
const standalone=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone;
const isIOS=()=>/iphone|ipad|ipod/i.test(navigator.userAgent);
/* ---- social share sheet ---- */
window.OF_social=function(url,text,needLogin){const t=text+' ',N=[
 ['💬','WhatsApp','https://wa.me/?text='+E(t+url)],['📘','Facebook','https://www.facebook.com/sharer/sharer.php?u='+E(url)],['✖️','X','https://twitter.com/intent/tweet?text='+E(text)+'&url='+E(url)],
 ['✈️','Telegram','https://t.me/share/url?url='+E(url)+'&text='+E(text)],['✉️','Email','mailto:?subject='+E('One Face')+'&body='+E(t+url)],['📱','Text message','sms:?&body='+E(t+url)]];
 const d=sheet('<p class="sh-t">Share to</p>'+(needLogin?'<p class="muted" style="margin:0 0 6px">This post is not public, so people need to be your friends on One Face to see it.</p>':'')+'<div class="soc">'+N.map(n=>'<a href="'+esc2(n[2])+'" target="_blank" rel="noopener">'+'<span>'+n[0]+'</span>'+n[1]+'</a>').join('')+(navigator.share?'<button id="nsh"><span>📤</span>More…</button>':'')+'<button id="cpl"><span>🔗</span>Copy link</button></div>');
 const c=d.querySelector('#cpl');c.onclick=async()=>{try{await navigator.clipboard.writeText(url);toast('Link copied')}catch(e){}closeSheet()};
 const n=d.querySelector('#nsh');if(n)n.onclick=async()=>{try{await navigator.share({title:'One Face',text,url})}catch(e){}closeSheet()}};
/* ---- install / invite ---- */
async function install(){if(deferred){deferred.prompt();try{await deferred.userChoice}catch(e){}deferred=null;return}
 if(standalone()){toast('Already installed');return}
 if(isIOS())sheet('<p class="sh-t">Install One Face</p><ol style="line-height:1.7;padding-left:20px"><li>Open this page in <b>Safari</b>.</li><li>Tap the <b>Share</b> button (square with an arrow).</li><li>Tap <b>Add to Home Screen</b>.</li><li>Tap <b>Add</b>.</li></ol><button class="btn pri" onclick="closeSheet()">Got it</button>');
 else sheet('<p class="sh-t">Install One Face</p><ol style="line-height:1.7;padding-left:20px"><li>Open the browser menu (⋮).</li><li>Tap <b>Install app</b> or <b>Add to Home screen</b>.</li></ol><button class="btn pri" onclick="closeSheet()">Got it</button>')}
function invite(){window.OF_social(location.origin+location.pathname,'Join me on One Face',false)}
window.OF_install=install;window.OF_invite=invite;
function extras(){const m=document.getElementById('main');if(!m||!S.route)return;
 if(S.route.name=='menu'&&!m.querySelector('#v31')){const a=m.querySelector('a.li[href="#/groups"]');if(a){const li=(id,i,t,s)=>'<a class="li" href="#" id="'+id+'"><span class="mi2">'+i+'</span><div class="grow"><b>'+t+'</b><small>'+s+'</small></div></a>';a.insertAdjacentHTML('beforebegin','<span id="v31" hidden></span>'+li('invf','📣','Invite friends','Share a link to One Face')+(standalone()?'':li('insa','📲','Install app','Add One Face to your home screen')));const i1=m.querySelector('#invf'),i2=m.querySelector('#insa');i1.onclick=e=>{e.preventDefault();invite()};if(i2)i2.onclick=e=>{e.preventDefault();install()}}}
 if(false&&S.route.name=='home'&&!m.querySelector('.instb')&&!standalone()){let d=null;try{d=localStorage.getItem('of_inst')}catch(e){}if(d&&(d=='done'||Date.now()-(+d)<7*864e5))return;const f=m.querySelector('.pad0');if(!f)return;f.insertAdjacentHTML('afterbegin','<div class="instb"><span style="font-size:26px">📲</span><div class="grow"><b>Install One Face</b><small>Get it on your home screen</small></div><button class="btn sm pri" id="ib1">Install</button><button class="ib" id="ib2" aria-label="Dismiss">'+ic('x',18)+'</button></div>');
  m.querySelector('#ib1').onclick=install;m.querySelector('#ib2').onclick=()=>{try{localStorage.setItem('of_inst',String(Date.now()))}catch(e){}m.querySelector('.instb').remove()}}}
let t9=null;new MutationObserver(()=>{if(!t9)t9=setTimeout(()=>{t9=null;try{extras()}catch(e){console.error(e)}},80)}).observe(document.body,{childList:true,subtree:true});
/* ---- public page for shared links (no login needed) ---- */
R.p=async id=>{if(S.user){location.replace('#/post/'+id);return}try{sessionStorage.setItem('of_next','#/post/'+id)}catch(e){}
 $('#top').hidden=true;drawTabs(null);view('<div class="pubp"><div class="card pad skel">Loading…</div></div>');
 let p=null;try{const{data}=await SB.rpc('public_post',{p_id:id});p=data}catch(e){}
 const cta='<div class="cta"><a class="btn pri big" href="#/signup">Join One Face</a><a class="btn big" href="#/login">Log in</a></div><div class="cta"><button class="btn" id="pins">📲 Install the app</button></div>';
 const head='<div style="text-align:center;margin-bottom:12px"><img src="logo2.jpg" alt="One Face" width="96" height="96" style="border-radius:20px"></div>';
 view('<div class="pubp">'+head+(p?'<article class="card post"><header>'+av({full_name:p.author_name,avatar_path:p.author_avatar},42)+'<div class="who"><div class="nm"><b>'+esc2(p.author_name)+'</b></div><small>'+ago(p.created_at)+'</small></div></header>'+(p.body?'<div class="body">'+fmt(p.body)+'</div>':'')+mediaGrid(p.media||[])+'</article><p class="center muted" style="margin-top:14px">See more and join the conversation on One Face.</p>':'<div class="card pad center"><b>This post is private or no longer available.</b><p class="muted">Join One Face to connect with friends.</p></div>')+cta+'</div>');
 const b=document.getElementById('pins');if(b)b.onclick=install};

/* ---- install gate: shown on phones that open One Face in a browser ---- */
function gate(){try{
 const C=window.ONEFACE_CONFIG||{};if(!C.SUPABASE_URL||/[?&]demo/.test(location.search))return;
 if(standalone()||!/android|iphone|ipad|ipod/i.test(navigator.userAgent))return;
 let sk=0;try{sk=+localStorage.getItem('of_gate')||0}catch(e){}if(Date.now()-sk<3*864e5)return;
 const g=document.createElement('div');g.id='igate';g.style.cssText='position:fixed;inset:0;z-index:98;background:var(--bg);display:flex;align-items:center;justify-content:center;padding:24px;overflow:auto';
 const ios=isIOS();
 g.innerHTML='<div style="max-width:360px;text-align:center"><img src="logo2.jpg" alt="One Face" width="110" height="110" style="border-radius:24px"><h1 style="margin:18px 0 6px">Get One Face</h1><p class="muted" style="margin:0 0 18px">Install the app on your phone for the best experience: faster, full screen and notifications.</p>'+
  (ios?'<ol style="text-align:left;line-height:1.8;padding-left:22px;margin:0 0 18px"><li>Tap the <b>Share</b> button in Safari (square with an arrow).</li><li>Tap <b>Add to Home Screen</b>.</li><li>Tap <b>Add</b>.</li><li>Open <b>One Face</b> from your home screen.</li></ol>':'<button class="btn pri big" id="ig1" style="width:100%">Install One Face</button><div id="ig3" class="muted" style="margin-top:12px;text-align:left" hidden><ol style="line-height:1.8;padding-left:22px"><li>Tap the browser menu <b>⋮</b>.</li><li>Tap <b>Install app</b> or <b>Add to Home screen</b>.</li></ol></div>')+
  '<button class="lnk" id="ig2" style="margin-top:16px;background:none;border:0;color:var(--mut);text-decoration:underline;font-size:15px">Continue in browser</button></div>';
 document.body.appendChild(g);
 const close=()=>{try{localStorage.setItem('of_gate',String(Date.now()))}catch(e){}g.remove()};
 g.querySelector('#ig2').onclick=close;
 const b=g.querySelector('#ig1');if(b)b.onclick=async()=>{if(deferred){deferred.prompt();try{const r=await deferred.userChoice;if(r&&r.outcome=='accepted'){close();return}}catch(e){}deferred=null}else{g.querySelector('#ig3').hidden=false}};
 addEventListener('appinstalled',()=>g.remove());
}catch(e){console.error(e)}}
/* auto install: the first tap on the page opens the browser's own install dialog (Android Chrome) */
(function(){try{const C=window.ONEFACE_CONFIG||{};if(!C.SUPABASE_URL||/[?&]demo/.test(location.search)||standalone())return;
 let t=0;try{t=+localStorage.getItem('of_auto')||0}catch(e){}if(Date.now()-t<7*864e5)return;
 const go=async()=>{if(!deferred)return;removeEventListener('pointerup',go,true);try{localStorage.setItem('of_auto',String(Date.now()))}catch(e){}try{deferred.prompt();await deferred.userChoice}catch(e){}deferred=null};
 addEventListener('pointerup',go,true)}catch(e){}})();

})();
