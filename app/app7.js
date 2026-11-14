/* One Face: background colours + languages (auto from phone) */
(function(){
const X=window.OF_X||{rows:{},names:{},ag:{},pt:{}},LK=['en','es','fr','pt','ht'].concat(Object.keys(X.rows).filter(c=>!['en','es','fr','pt','ht'].includes(c))),NAMES=Object.assign({},window.OF_LANGS||{en:'English'},X.names||{});
const BGS={cream:['Cream','#FCF6EF'],white:['White','#FFFFFF'],gray:['Gray','#EEF0F2'],blush:['Blush','#FBEAEA'],sky:['Sky','#E8F2FB'],mint:['Mint','#E7F5EC'],black:['Black','#000000']};
const st=document.createElement('style');
st.textContent=
'html:root[data-bg=cream]{--bg:#FCF6EF;--soft:#f6ead6;--line:#eadfce;--mut:#7a6a5a}html:root[data-bg=white]{--bg:#fff}html:root[data-bg=gray]{--bg:#eef0f2}html:root[data-bg=blush]{--bg:#fbeaea}html:root[data-bg=sky]{--bg:#e8f2fb}html:root[data-bg=mint]{--bg:#e7f5ec}'+
'html:root[data-bg=black]{--bg:#000;--card:#111113;--ink:#f2f2f3;--mut:#a4a4ab;--line:#2a2a2e;--soft:#1b1b1e;--danger:#ff7b6b;--ok:#6fcf97}'+
'.sw8{display:flex;flex-wrap:wrap;gap:10px;margin-top:10px}.sw8 button{width:44px;height:44px;border-radius:50%;border:2px solid var(--line);padding:0;cursor:pointer}.sw8 button.on{border-color:var(--gold2);box-shadow:0 0 0 2px var(--gold3)}.sw8 .au{background:linear-gradient(135deg,#fff 50%,#15100a 50%)}'+
'.langsel{width:100%;margin-top:10px;font-size:16px;padding:12px;border-radius:12px;border:1px solid var(--line);background:var(--card);color:var(--ink)}';
document.head.appendChild(st);
const g=k=>{try{return localStorage.getItem(k)}catch(e){return null}},s=(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}};
function detect(){const l=(navigator.languages&&navigator.languages.length?navigator.languages:[navigator.language||'en']);for(const x of l){const c=String(x).toLowerCase().slice(0,2);if(LK.includes(c))return c}return 'en'}
function cur(){const v=g('of_lang')||'auto';return v=='auto'?detect():(LK.includes(v)?v:'en')}
function applyBg(){const b=g('of_bg')||'auto',r=document.documentElement;if(b=='auto'||!BGS[b])r.removeAttribute('data-bg');else r.setAttribute('data-bg',b);const m=document.querySelector('meta[name=theme-color]');if(m&&BGS[b])m.content=BGS[b][1]}
window.applyBg=applyBg;
/* dictionary */
const EX=LK.map(()=>({}));
(window.OF_ROWS||[]).forEach(r=>{for(let i=1;i<5;i++){if(r[i]&&!(r[0] in EX[i]))EX[i][r[0]]=r[i]}});
Object.keys(X.rows).forEach(c=>{const i=LK.indexOf(c);if(i>0)for(const k in X.rows[c]){if(!(k in EX[i]))EX[i][k]=X.rows[c][k]}});
const AG=Object.assign({es:{now:'ahora',d:'d'},fr:{now:'maint.',d:'j'},pt:{now:'agora',d:'d'},ht:{now:'kounye a',d:'j'}},X.ag||{});
/* [regex, es, fr, pt, ht] ; $1 $2 */
const PT=[
[/^(\d+) comments?$/,'$1 comentarios','$1 commentaires','$1 comentários','$1 kòmantè'],
[/^(\d+) members?$/,'$1 miembros','$1 membres','$1 membros','$1 manm'],
[/^(\d+) followers?$/,'$1 seguidores','$1 abonnés','$1 seguidores','$1 swivè'],
[/^(\d+) friends?$/,'$1 amigos','$1 amis','$1 amigos','$1 zanmi'],
[/^(\d+) mutual friends?$/,'$1 amigos en común','$1 amis en commun','$1 amigos em comum','$1 zanmi an komen'],
[/^(\d+) votes?$/,'$1 votos','$1 votes','$1 votos','$1 vòt'],
[/^Replying to (.+)$/,'Respondiendo a $1','Réponse à $1','Respondendo a $1','Ap reponn $1'],
[/^(.+) has a birthday today\.?$/,'Hoy es el cumpleaños de $1','C’est l’anniversaire de $1 aujourd’hui','Hoje é aniversário de $1','Jodi a se fèt $1'],
[/^What is on your mind, (.+)\?$/,'¿Qué piensas, $1?','À quoi penses-tu, $1 ?','No que você está pensando, $1?','Kisa w ap panse, $1?'],
[/^Signed in as (.+)$/,'Sesión iniciada como $1','Connecté(e) en tant que $1','Conectado como $1','Konekte kòm $1'],
[/^Remove (.+) from your friends\?$/,'¿Quitar a $1 de tus amigos?','Retirer $1 de tes amis ?','Remover $1 dos seus amigos?','Retire $1 nan zanmi ou yo?'],
[/^Block (.+)\?$/,'¿Bloquear a $1?','Bloquer $1 ?','Bloquear $1?','Bloke $1?'],
[/^Block (.+)$/,'Bloquear a $1','Bloquer $1','Bloquear $1','Bloke $1'],
[/^Report (.+)$/,'Denunciar a $1','Signaler $1','Denunciar $1','Rapòte $1'],
[/^Message (.+)$/,'Escribir a $1','Écrire à $1','Mensagem para $1','Voye $1 yon mesaj'],
[/^(.+)'s albums$/,'Álbumes de $1','Albums de $1','Álbuns de $1','Albòm $1'],
[/^(.+)'s photos$/,'Fotos de $1','Photos de $1','Fotos de $1','Foto $1'],
[/^Seen by (\d+)$/,'Visto por $1','Vu par $1','Visto por $1','Wè pa $1'],
[/^Viewed by (\d+)$/,'Visto por $1','Vu par $1','Visto por $1','Vwa pa $1'],
[/^(\d+) views?$/,'$1 vistas','$1 vues','$1 visualizações','$1 vizyon'],
[/^(\d+) new$/,'$1 nuevos','$1 nouveaux','$1 novos','$1 nouvo'],
[/^(\d+) requests?$/,'$1 solicitudes','$1 demandes','$1 solicitações','$1 demann'],
[/^View all (\d+) comments$/,'Ver los $1 comentarios','Voir les $1 commentaires','Ver os $1 comentários','Wè tout $1 kòmantè yo'],
[/^(.+) and (\d+) others?$/,'$1 y $2 más','$1 et $2 autres','$1 e mais $2','$1 ak $2 lòt'],
[/^Add (.+)$/,'Añadir a $1','Ajouter $1','Adicionar $1','Ajoute $1'],
[/^(\d+) years? ago$/,'hace $1 años','il y a $1 ans','há $1 anos','$1 an de sa'],
[/^(\d+) reviews?$/,'$1 reseñas','$1 avis','$1 avaliações','$1 revi'],
[/^(\d+)m$/,'$1 min','$1 min','$1 min','$1 min']
];
const SKIP='.body,.bub,.mb,.bio,.lp,.po,.scap,[data-ugc],script,style,textarea,input,code';
function tr(txt,L){const i=LK.indexOf(L);if(i<1)return null;const t=txt.trim();if(!t)return null;
 if(EX[i][t])return EX[i][t];
 if(t=='now')return AG[L].now;
 let m=t.match(/^(\d+)([hd])$/);if(m)return m[1]+(m[2]=='d'?AG[L].d:(AG[L].h||'h'));
 if(t.includes(' · ')){const ps=t.split(' · '),o=ps.map(x=>tr(x,L)||x);if(o.join()!=ps.join())return o.join(' · ')}
 m=t.match(/^is (feeling \w+|celebrating|eating|traveling|working out)(?: (\S+))?$/);if(m&&EX[i][m[1]]){const v=EX[i][m[1]];return v+(m[2]?' '+m[2]:'')}
 for(let pi=0;pi<PT.length;pi++){const p=PT[pi];m=t.match(p[0]);if(m){const tp=i<5?p[i]:(X.pt&&X.pt[L]&&X.pt[L][pi]);if(!tp)continue;return tp.replace(/\$(\d)/g,(_,n)=>{const v=m[n];return EX[i][v]||v})}}
 return null}
const ATT=['placeholder','aria-label','title','alt'];
let L='en',busy=false;
function doText(n){const p=n.parentNode;if(!p||p.closest&&p.closest(SKIP))return;
 if(n.__t!==undefined&&n.data===n.__t){/* ours */ if(L=='en'){n.data=n.__o;n.__t=undefined}else{const r=tr(n.__o,L);const out=r?n.__o.replace(n.__o.trim(),r):n.__o;if(out!==n.data){n.data=out}n.__t=n.data}return}
 const o=n.data;if(L=='en')return;const r=tr(o,L);if(r){n.__o=o;n.data=o.replace(o.trim(),r);n.__t=n.data}}
function doEl(e){if(!e.getAttribute)return;if(e.closest&&e.closest(SKIP)){if(!(e.matches&&e.matches('input,textarea')&&!e.closest('.body,.bub,.mb,.bio,.lp,.po,.scap,[data-ugc]')))return}
 for(const a of ATT){const v=e.getAttribute(a);if(v==null)continue;const k='_o_'+a,tk='_t_'+a;
  if(e[tk]!==undefined&&v===e[tk]){if(L=='en'){e.setAttribute(a,e[k]);e[tk]=undefined}else{const r=tr(e[k],L)||e[k];e.setAttribute(a,r);e[tk]=r}}
  else if(L!='en'){const r=tr(v,L);if(r){e[k]=v;e.setAttribute(a,r);e[tk]=r}}}}
function walk(root){if(!root)return;if(root.nodeType==3){doText(root);return}if(root.nodeType!=1)return;doEl(root);
 const w=document.createTreeWalker(root,NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT);let n;while(n=w.nextNode()){n.nodeType==3?doText(n):doEl(n)}}
const mo=new MutationObserver(ms=>{if(busy)return;busy=true;try{for(const m of ms){if(m.type=='childList')m.addedNodes.forEach(walk);else if(m.type=='characterData')doText(m.target);else if(m.type=='attributes')doEl(m.target)}}finally{busy=false;mo.takeRecords()}});
function setLang(v){s('of_lang',v);start();syncPrefs()}
function start(){L=cur();document.documentElement.lang=L;busy=true;try{walk(document.body)}finally{busy=false;mo.takeRecords()}}
/* dates in chosen language */
['toLocaleDateString','toLocaleTimeString'].forEach(f=>{const o=Date.prototype[f];Date.prototype[f]=function(l,op){return o.call(this,l===undefined?(cur()=='en'?undefined:cur()):l,op)}});
function syncPrefs(){try{if(window.DEMO||!window.SB||!window.S||!S.user||!S.me)return;const n={...(S.me.prefs||{}),lang:g('of_lang')||'auto',bg:g('of_bg')||'auto'};S.me.prefs=n;SB.from('profiles').update({prefs:n}).eq('id',S.user.id)}catch(e){}}
function fromProfile(){try{const p=(S.me&&S.me.prefs)||{};let ch=false;if(p.lang&&!g('of_lang')){s('of_lang',p.lang);ch=true}if(p.bg&&!g('of_bg')){s('of_bg',p.bg);applyBg()}if(ch)start()}catch(e){}}
if(typeof window.loadMe=='function'){const o=window.loadMe;window.loadMe=async function(){const r=await o.apply(this,arguments);fromProfile();return r}}
/* settings UI */
function inject(){const main=document.getElementById('main');if(!main||main.querySelector('#bgsw'))return;const seg=main.querySelector('[data-th]');if(!seg)return;const card=seg.closest('.card');if(!card)return;
 const b=g('of_bg')||'auto',l=g('of_lang')||'auto';
 const h='<div style="margin-top:14px"><b>Background</b><div class="sw8" id="bgsw"><button class="au'+(b=='auto'?' on':'')+'" data-bg="auto" aria-label="Auto"></button>'+Object.keys(BGS).map(k=>'<button data-bg="'+k+'" aria-label="'+BGS[k][0]+'" style="background:'+BGS[k][1]+'"'+(b==k?' class="on"':'')+'></button>').join('')+'</div></div>'+
 '<div style="margin-top:14px"><b>Language</b><select class="langsel" id="lgsel"><option value="auto">Phone setting (automatic)</option>'+LK.map(k=>'<option value="'+k+'"'+(l==k?' selected':'')+'>'+NAMES[k]+'</option>').join('')+'</select></div>';
 card.insertAdjacentHTML('beforeend',h);
 const sel=card.querySelector('#lgsel');sel.value=l;
 sel.onchange=()=>setLang(sel.value);
 card.querySelector('#bgsw').onclick=e=>{const x=e.target.closest('[data-bg]');if(!x)return;s('of_bg',x.dataset.bg);applyBg();card.querySelectorAll('#bgsw button').forEach(y=>y.classList.toggle('on',y==x));syncPrefs()}}
function injectAuth(){const a=document.querySelector('.auth');if(!a||a.querySelector('#alg'))return;const l=g('of_lang')||'auto';
 const d=document.createElement('div');d.className='langrow';d.style.cssText='display:flex;justify-content:center;align-items:center;gap:8px;margin-top:4px;flex:none';
 d.innerHTML='<span aria-hidden="true">🌐</span><select id="alg" class="langsel" aria-label="Language" style="width:auto;margin:0;max-width:220px;min-height:40px;padding:8px 12px"><option value="auto">Auto</option>'+LK.map(k=>'<option value="'+k+'">'+NAMES[k]+'</option>').join('')+'</select>';
 a.appendChild(d);const sel=d.querySelector('#alg');sel.value=l;sel.onchange=()=>setLang(sel.value)}
const o2=new MutationObserver(()=>{inject();injectAuth()});
function init(){applyBg();start();mo.observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:ATT});const m=document.getElementById('main');o2.observe(document.body,{childList:true,subtree:true});injectAuth();setInterval(()=>{try{injectAuth()}catch(e){}},700)}
if(document.readyState=='loading')document.addEventListener('DOMContentLoaded',init);else init();
window.OF_setLang=setLang;
})();
