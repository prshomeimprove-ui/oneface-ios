/* ===== One Face 3.4: record sign-ins (country, device) for the admin board ===== */
(function(){
const ua=navigator.userAgent||'';
const os=/Android/i.test(ua)?'Android':/iPhone|iPad|iPod/i.test(ua)?'iOS':/Windows/i.test(ua)?'Windows':/Mac OS X/i.test(ua)?'Mac':/CrOS/i.test(ua)?'ChromeOS':/Linux/i.test(ua)?'Linux':'Other';
const browser=/Edg\//i.test(ua)?'Edge':/OPR\/|Opera/i.test(ua)?'Opera':/SamsungBrowser/i.test(ua)?'Samsung':/Firefox|FxiOS/i.test(ua)?'Firefox':/CriOS|Chrome/i.test(ua)?'Chrome':/Safari/i.test(ua)?'Safari':'Other';
const device=/iPad|Tablet/i.test(ua)||(/Android/i.test(ua)&&!/Mobile/i.test(ua))?'Tablet':/Mobi|iPhone|Android/i.test(ua)?'Phone':'Computer';
const installed=!!((window.matchMedia&&matchMedia('(display-mode: standalone)').matches)||navigator.standalone);
let tz='';try{tz=Intl.DateTimeFormat().resolvedOptions().timeZone||''}catch(e){}
let loc=null;
function getLoc(){if(loc!==null)return Promise.resolve(loc);return new Promise(ok=>{const done=v=>{loc=v;ok(v)};const t=setTimeout(()=>done({}),3500);
 const trace=()=>fetch('/cdn-cgi/trace',{cache:'no-store'}).then(r=>r.text()).then(x=>{const m=/^loc=([A-Z]{2})$/m.exec(x);return m?{c:m[1]}:{}}).catch(()=>({}));
 try{fetch('/api/geo',{cache:'no-store'}).then(r=>r.ok&&/json/.test(r.headers.get('content-type')||'')?r.json():Promise.reject()).then(j=>{clearTimeout(t);done({c:(j.country||'').toUpperCase().slice(0,2),city:j.city||'',region:j.region||'',lat:j.lat!==''&&j.lat!=null?+j.lat:null,lon:j.lon!==''&&j.lon!=null?+j.lon:null})}).catch(()=>trace().then(v=>{clearTimeout(t);done(v)}))}catch(e){clearTimeout(t);done({})}})}
async function log(kind,email){try{if(typeof SB=='undefined'||!SB)return;const g=await getLoc();await SB.rpc('log_login',{p_kind:kind,p_email:email||null,p_country:g.c||null,p_city:g.city||null,p_region:g.region||null,p_lat:g.lat==null||isNaN(g.lat)?null:g.lat,p_lon:g.lon==null||isNaN(g.lon)?null:g.lon,p_ua:ua.slice(0,300),p_os:os,p_browser:browser,p_device:device,p_installed:installed,p_tz:tz||null})}catch(e){}}
window.OF_logLogin=log;
let wired=false,seen='';
const fromRedirect=/access_token=|[?&]code=/.test(location.hash+location.search);
function wire(){if(wired||typeof SB=='undefined'||!SB||!SB.auth)return;wired=true;
 const si=SB.auth.signInWithPassword.bind(SB.auth);
 SB.auth.signInWithPassword=async function(a){const r=await si(a);try{if(r&&r.error)log('failed',a&&a.email);else{seen='login';log('login',a&&a.email);try{sessionStorage.setItem('of_lg',(r.data&&r.data.user&&r.data.user.id)||'1')}catch(e){}}}catch(e){}return r};
 const su=SB.auth.signUp.bind(SB.auth);
 SB.auth.signUp=async function(a){const r=await su(a);try{if(r&&!r.error&&r.data&&r.data.session){try{sessionStorage.setItem('of_lg',r.data.user.id)}catch(e){}log('signup',a&&a.email)}}catch(e){}return r}}
function check(){wire();try{if(typeof S=='undefined'||!S||!S.user||(typeof DEMO!='undefined'&&DEMO))return;const id=S.user.id;if(seen==id)return;let done='';try{done=sessionStorage.getItem('of_lg')||''}catch(e){}
 seen=id;if(done){try{sessionStorage.removeItem('of_lg');sessionStorage.setItem('of_open',id)}catch(e){}return}
 try{if(sessionStorage.getItem('of_open')==id)return;sessionStorage.setItem('of_open',id)}catch(e){}
 log(fromRedirect?'login':'open',S.user.email||'')}catch(e){}}
setInterval(check,1500);
})();
