/* One Face v3.9: full-screen button on every post and chat video */
(function(){
const st=document.createElement('style');
st.textContent='.mi.vid{position:relative}.fsb{position:absolute;top:8px;right:8px;width:36px;height:36px;border:0;border-radius:50%;background:rgba(0,0,0,.55);color:#fff;font-size:18px;line-height:36px;text-align:center;cursor:pointer;z-index:2;padding:0}';
document.head.appendChild(st);
function go(v){try{if(v.requestFullscreen)return v.requestFullscreen();if(v.webkitRequestFullscreen)return v.webkitRequestFullscreen();if(v.webkitEnterFullscreen)return v.webkitEnterFullscreen()}catch(e){}}
function add(){document.querySelectorAll('.mi.vid').forEach(w=>{if(w.querySelector('.fsb'))return;const v=w.querySelector('video');if(!v)return;const b=document.createElement('button');b.type='button';b.className='fsb';b.setAttribute('aria-label','Full screen');b.textContent='⛶';b.onclick=e=>{e.preventDefault();e.stopPropagation();go(v)};w.appendChild(b)})}
new MutationObserver(add).observe(document.documentElement,{childList:true,subtree:true});add();
})();
