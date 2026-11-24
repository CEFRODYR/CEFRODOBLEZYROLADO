(function(){
var REPO='CEFRODYR/CEFRODOBLEZYROLADO';
var IMG=/\.(jpe?g|png|webp|gif|avif)$/i, VID=/\.(mp4|webm|mov)$/i;
function human(n){var b=n.replace(/\.[^.]+$/,'').replace(/[-_]+/g,' ').trim();
 if(!b||b.replace(/\D/g,'').length>b.length/2)return '';b=b.replace(/parabolico/gi,'parabólico').replace(/\bmaquina/gi,'máquina');return b.charAt(0).toUpperCase()+b.slice(1);}
function get(folder){
 var k='cefro:'+folder;
 try{var c=JSON.parse(sessionStorage.getItem(k)||'null');if(c&&Date.now()-c.t<300000)return Promise.resolve(c.l);}catch(e){}
 return fetch('https://api.github.com/repos/'+REPO+'/contents/imagenes/'+folder.split('/').map(encodeURIComponent).join('/')+'?ref=main')
  .then(function(r){if(r.status===404)return [];if(!r.ok)throw new Error(r.status);return r.json();})
  .then(function(l){var out=(Array.isArray(l)?l:[]).filter(function(f){return f.type==='file'}).map(function(f){return f.name});
   try{sessionStorage.setItem(k,JSON.stringify({t:Date.now(),l:out}));}catch(e){}return out;});
}
/* Fechas (hora de Lima) para programar publicaciones y la etiqueta NUEVO.
   window.CEFRO_META (en descripciones.js, lo llena el panel): {"carpeta/archivo":{u:"subido",d:"publicar desde",h:"ocultar después de"}} */
function hoyLima(){try{var x=new Date(new Date().toLocaleString('en-US',{timeZone:'America/Lima'}));}catch(e){x=new Date()}return x.getFullYear()+'-'+('0'+(x.getMonth()+1)).slice(-2)+'-'+('0'+x.getDate()).slice(-2)}
var HOY=hoyLima(),NUEVO_DIAS=15;
function meta(k){return (window.CEFRO_META||{})[k]||{}}
function visible(k){var m=meta(k);return !(m.d&&m.d>HOY)&&!(m.h&&m.h<HOY)}
function esNuevo(k){var m=meta(k),f=m.d&&m.d>(m.u||'')?m.d:m.u;if(!f||f>HOY)return false;return (Date.parse(HOY)-Date.parse(f))/864e5<=NUEVO_DIAS}
function esc(t){return t.replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]});}
/* Orden elegido en el panel de administración (window.CEFRO_ORDER, en descripciones.js) */
function rank(k){var O=window.CEFRO_ORDER||{},f=k.split('/')[0],l=O[f];if(!l)return 1e6;var i=l.indexOf(k.slice(f.length+1));return i<0?1e6:i;}
document.querySelectorAll('.auto').forEach(function(box){
 var folders=box.getAttribute('data-folders').split(','),type=box.getAttribute('data-type');
 var P={};var pf=type==='video'?folders.map(function(f){return get(f+'/portadas').then(function(l){P[f]=l}).catch(function(){})}):[];
 Promise.all(folders.map(get).concat(pf)).then(function(lists){
  var items=[];
  lists.slice(0,folders.length).forEach(function(l,i){l.forEach(function(n){
   if(type==='img'&&IMG.test(n))items.push({n:n,k:folders[i]+'/'+n,s:'imagenes/'+folders[i]+'/'+encodeURIComponent(n)});
   if(type==='video'&&VID.test(n))items.push({n:n,k:folders[i]+'/'+n,s:'imagenes/'+folders[i]+'/'+encodeURIComponent(n)});
  });});
  items=items.filter(function(it){return visible(it.k)});
  items.sort(function(a,b){var d=rank(a.k)-rank(b.k);return d||a.n.localeCompare(b.n,undefined,{numeric:true})});
  if(!items.length){if(box.getAttribute('data-reveal')){var se=box.closest('section');if(se)se.style.display='none';return;}box.innerHTML='<div class="ph" style="grid-column:1/-1">'+esc(box.getAttribute('data-empty')||'')+'</div>';return;}
  if(box.getAttribute('data-reveal')){var se2=box.closest('section');if(se2)se2.style.display='';}
  var D=window.CEFRO_DESC||{};
  box.innerHTML=items.map(function(it){
   if(type==='video'){var vc=D[it.k]||human(it.n.replace(/^\d+-/,''));var pb=it.n.replace(/\.[^.]+$/,'.jpg'),hp=P[it.k.split('/')[0]]&&P[it.k.split('/')[0]].indexOf(pb)>=0;
    return '<figure><video controls playsinline '+(hp?'preload="none" poster="imagenes/'+it.k.split('/')[0]+'/portadas/'+encodeURIComponent(pb)+'" src="'+it.s+'"':'preload="metadata" src="'+it.s+'#t=0.5"')+'></video>'+(esNuevo(it.k)?'<span class="nuevo">Nuevo</span>':'')+(vc?'<figcaption>'+esc(vc)+'</figcaption>':'')+'</figure>';}
   var c=D[it.k]||human(it.n);
   return '<figure><img src="'+it.s+'" alt="'+esc(c||'Trabajo de CEFRO')+'" loading="lazy" onerror="this.parentNode.remove()">'+(esNuevo(it.k)?'<span class="nuevo">Nuevo</span>':'')+(c?'<figcaption>'+esc(c)+'</figcaption>':'')+'</figure>';
  }).join('');
 }).catch(function(){});
});
document.querySelectorAll('.yr').forEach(function(e){e.textContent=HOY.slice(0,4)});
document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('.sh.cp');if(!b)return;try{navigator.clipboard.writeText(b.dataset.u).then(function(){b.textContent='¡Enlace copiado!';setTimeout(function(){b.textContent='Copiar enlace'},1800)})}catch(x){}});
document.addEventListener('play',function(e){[].forEach.call(document.querySelectorAll('.auto video'),function(v){if(v!==e.target)v.pause()})},true);
/* Ver fotos en grande */
document.addEventListener('click',function(e){var im=e.target.closest&&e.target.closest('.gal.auto img');if(!im)return;
 var all=[].slice.call(im.closest('.gal').querySelectorAll('img')),i=all.indexOf(im),bx=document.createElement('div');bx.className='lb';
 bx.innerHTML='<img alt=""><p></p><button class="x" aria-label="Cerrar">×</button><button class="pv" aria-label="Anterior">‹</button><button class="nx" aria-label="Siguiente">›</button>';
 function show(){var s=all[i];bx.querySelector('img').src=s.src;bx.querySelector('img').alt=s.alt;var c=s.parentNode.querySelector('figcaption');bx.querySelector('p').textContent=c?c.textContent:''}
 function go(d){i=(i+d+all.length)%all.length;show()}
 function close(){bx.remove();document.removeEventListener('keydown',key)}
 function key(ev){if(ev.key==='Escape')close();if(ev.key==='ArrowRight')go(1);if(ev.key==='ArrowLeft')go(-1)}
 bx.addEventListener('click',function(ev){if(ev.target.classList.contains('pv'))go(-1);else if(ev.target.classList.contains('nx'))go(1);else if(ev.target.tagName!=='IMG')close()});
 document.addEventListener('keydown',key);if(all.length<2){bx.querySelector('.pv').style.display=bx.querySelector('.nx').style.display='none'}
 show();document.body.appendChild(bx)});
/* Carrusel de banners: cambia solo cada mes (hora de Lima).
   imagenes/banners           -> banners de todo el año (cada mes empieza por uno distinto)
   imagenes/banners-enero ... -> banners solo de ese mes (salen primero) */
var MESES=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
function limaMes(){try{return new Date(new Date().toLocaleString('en-US',{timeZone:'America/Lima'})).getMonth()}catch(e){return new Date().getMonth()}}
function rot(a,k){if(!a.length)return a;k=k%a.length;return a.slice(k).concat(a.slice(0,k))}
function initBnr(b){if(b._stop)b._stop();var tr=b.querySelector('.track'),n=tr.children.length,i=0,t=null,d=b.querySelector('.dots');
 b.querySelectorAll('button').forEach(function(x){x.style.display=n<2?'none':''});d.innerHTML=n<2?'':new Array(n+1).join('<i></i>');tr.style.transform='';if(n<2)return;
 function go(k){i=(k+n)%n;tr.style.transform='translateX(-'+(i*100)+'%)';[].forEach.call(d.children,function(x,j){x.classList.toggle('on',j===i)})}
 function auto(){clearInterval(t);t=setInterval(function(){if(!document.hidden)go(i+1)},5500)}
 b.querySelector('.bp').onclick=function(){go(i-1);auto()};b.querySelector('.bn').onclick=function(){go(i+1);auto()};
 [].forEach.call(d.children,function(x,j){x.onclick=function(){go(j);auto()}});
 if(!b._sw){b._sw=1;var sx=null;b.addEventListener('touchstart',function(e){sx=e.touches[0].clientX},{passive:true});b.addEventListener('touchend',function(e){if(sx===null||!b._go)return;var dx=e.changedTouches[0].clientX-sx;if(Math.abs(dx)>40)b._go(dx<0?1:-1);sx=null});
  b.addEventListener('mouseenter',function(){b._pause&&b._pause()});b.addEventListener('mouseleave',function(){b._auto&&b._auto()})}
 b._go=function(s){go(i+s);auto()};b._pause=function(){clearInterval(t)};b._auto=auto;b._stop=function(){clearInterval(t)};go(0);auto()}
document.querySelectorAll('.bnr').forEach(function(b){
 var tr=b.querySelector('.track'),m=limaMes(),LINK={},ALT={};
 [].forEach.call(tr.children,function(a){var im=a.querySelector('img');if(!im)return;var n=decodeURIComponent(im.getAttribute('src').split('/').pop());LINK[n]=a.outerHTML.match(/^<a[^>]*>/)[0];ALT[n]=im.alt});
 /* 1) al instante: el banner que abre el carrusel cambia según el mes */
 var st=[].slice.call(tr.children);rot(st,m).forEach(function(a){tr.appendChild(a)});initBnr(b);
 /* 2) luego: lee las carpetas de banners por si se subieron nuevos desde el panel */
 Promise.all([get('banners'),get('banners-'+MESES[m])]).then(function(r){
  var D=window.CEFRO_DESC||{};
  function list(f,l){return l.filter(function(n){return IMG.test(n)&&visible(f+'/'+n)}).map(function(n){return{f:f,n:n,k:f+'/'+n}}).sort(function(a,c){return rank(a.k)-rank(c.k)||a.n.localeCompare(c.n,undefined,{numeric:true})})}
  var mes=list('banners-'+MESES[m],r[1]),todos=rot(list('banners',r[0]),m),all=mes.concat(todos);
  if(!all.length)return;
  var sig=all.map(function(x){return x.f+'/'+x.n}).join('|'),cur=[].map.call(tr.querySelectorAll('img'),function(i){return decodeURIComponent(i.getAttribute('src').replace(/^imagenes\//,''))}).join('|');
  if(sig===cur)return;
  tr.innerHTML=all.map(function(x,j){var alt=esc(D[x.k]||ALT[x.n]||human(x.n.replace(/^banner-/,''))||'Promoción CEFRO Doblez y Rolado');
   var open=x.f==='banners'&&LINK[x.n]?LINK[x.n]:'<a href="https://wa.me/51992550533?text='+encodeURIComponent('Hola, vi su promoción en la web y quiero cotizar')+'" target="_blank" rel="noopener">';
   return open+'<img'+(j?' decoding="async"':'')+' src="imagenes/'+x.f+'/'+encodeURIComponent(x.n)+'" alt="'+alt+'" width="1200" height="600"></a>'}).join('');
  initBnr(b);
 }).catch(function(){});
});
})();
