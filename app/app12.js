/* ===== One Face 3.3: move and zoom a profile photo before saving ===== */
(function(){
const V=300,OUT=512;
const st=document.createElement('style');
st.textContent='#crp{position:fixed;inset:0;z-index:99;background:#000d;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;padding:20px;color:#fff;text-align:center}#crp .cbx{width:'+V+'px;height:'+V+'px;border-radius:50%;overflow:hidden;position:relative;background:#222;touch-action:none;border:3px solid #fff;box-shadow:0 0 0 2000px rgba(0,0,0,.35)}#crp img{position:absolute;left:0;top:0;max-width:none;user-select:none;-webkit-user-drag:none;transform-origin:0 0;pointer-events:none}#crp input[type=range]{width:'+V+'px}#crp .row2{display:flex;gap:12px;width:'+V+'px}#crp .row2 .btn{flex:1}';
document.head.appendChild(st);
function cropper(file){return new Promise(res=>{
 const url=URL.createObjectURL(file),im=new Image();
 im.onerror=()=>{URL.revokeObjectURL(url);res(file)};
 im.onload=()=>{
  const w=im.naturalWidth,h=im.naturalHeight,s0=Math.max(V/w,V/h);let zoom=1,ox=0,oy=Math.round(Math.max(0,(h*s0-V)/2)*0.3);
  const ov=document.createElement('div');ov.id='crp';
  ov.innerHTML='<b style="font-size:18px">Move and zoom your photo</b><div class="cbx" id="cbx"></div><input type="range" id="cz" min="1" max="4" step="0.01" value="1" aria-label="Zoom"><div class="row2"><button class="btn big" id="cc">Cancel</button><button class="btn pri big" id="cd">Use photo</button></div>';
  document.body.appendChild(ov);const box=ov.querySelector('#cbx');box.appendChild(im);
  const clamp=()=>{const sc=s0*zoom,dw=w*sc,dh=h*sc,mx=(dw-V)/2,my=(dh-V)/2;ox=Math.max(-mx,Math.min(mx,ox));oy=Math.max(-my,Math.min(my,oy))};
  const draw=()=>{clamp();const sc=s0*zoom,dw=w*sc,dh=h*sc;im.style.transform='translate('+(V/2-dw/2+ox)+'px,'+(V/2-dh/2+oy)+'px) scale('+sc+')'};draw();
  const ptr=new Map();let d0=0,z0=1;
  box.addEventListener('pointerdown',e=>{box.setPointerCapture(e.pointerId);ptr.set(e.pointerId,{x:e.clientX,y:e.clientY});if(ptr.size==2){const a=[...ptr.values()];d0=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);z0=zoom}});
  box.addEventListener('pointermove',e=>{if(!ptr.has(e.pointerId))return;const p=ptr.get(e.pointerId);
   if(ptr.size==1){ox+=e.clientX-p.x;oy+=e.clientY-p.y}
   ptr.set(e.pointerId,{x:e.clientX,y:e.clientY});
   if(ptr.size==2){const a=[...ptr.values()];const d=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);if(d0){zoom=Math.max(1,Math.min(4,z0*d/d0));ov.querySelector('#cz').value=zoom}}draw()});
  const up=e=>{ptr.delete(e.pointerId)};box.addEventListener('pointerup',up);box.addEventListener('pointercancel',up);
  box.addEventListener('wheel',e=>{e.preventDefault();zoom=Math.max(1,Math.min(4,zoom*(e.deltaY<0?1.08:.93)));ov.querySelector('#cz').value=zoom;draw()},{passive:false});
  ov.querySelector('#cz').oninput=e=>{zoom=+e.target.value;draw()};
  const done=v=>{ov.remove();URL.revokeObjectURL(url);res(v)};
  ov.querySelector('#cc').onclick=()=>done(null);
  ov.querySelector('#cd').onclick=()=>{clamp();const sc=s0*zoom,dw=w*sc,dh=h*sc,f=OUT/V;const c=document.createElement('canvas');c.width=c.height=OUT;const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,OUT,OUT);x.drawImage(im,(V/2-dw/2+ox)*f,(V/2-dh/2+oy)*f,dw*f,dh*f);
   c.toBlob(b=>done(b?new File([b],'avatar.jpg',{type:'image/jpeg'}):file),'image/jpeg',0.9)}};
 im.src=url})}
document.addEventListener('change',async e=>{const t=e.target;
 if(!t||t.id!=='ph'||t.type!=='file')return;
 if(t.dataset.cropped){delete t.dataset.cropped;return}
 const f=t.files&&t.files[0];if(!f||!/^image\//.test(f.type))return;
 e.stopImmediatePropagation();
 const out=await cropper(f);
 if(!out){t.value='';return}
 try{const dt=new DataTransfer();dt.items.add(out);t.files=dt.files}catch(x){return}
 t.dataset.cropped='1';t.dispatchEvent(new Event('change',{bubbles:true}))},true);
})();
