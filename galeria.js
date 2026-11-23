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
  items.sort(function(a,b){var d=rank(a.k)-rank(b.k);return d||a.n.localeCompare(b.n,undefined,{numeric:true})});
  if(!items.length){if(box.getAttribute('data-reveal')){var se=box.closest('section');if(se)se.style.display='none';return;}box.innerHTML='<div class="ph" style="grid-column:1/-1">'+esc(box.getAttribute('data-empty')||'')+'</div>';return;}
  if(box.getAttribute('data-reveal')){var se2=box.closest('section');if(se2)se2.style.display='';}
  var D=window.CEFRO_DESC||{};
  box.innerHTML=items.map(function(it){
   if(type==='video'){var vc=D[it.k]||human(it.n.replace(/^\d+-/,''));var pb=it.n.replace(/\.[^.]+$/,'.jpg'),hp=P[it.k.split('/')[0]]&&P[it.k.split('/')[0]].indexOf(pb)>=0;
    return '<figure><video controls playsinline '+(hp?'preload="none" poster="imagenes/'+it.k.split('/')[0]+'/portadas/'+encodeURIComponent(pb)+'" src="'+it.s+'"':'preload="metadata" src="'+it.s+'#t=0.5"')+'></video>'+(vc?'<figcaption>'+esc(vc)+'</figcaption>':'')+'</figure>';}
   var c=D[it.k]||human(it.n);
   return '<figure><img src="'+it.s+'" alt="'+esc(c||'Trabajo de CEFRO')+'" loading="lazy" onerror="this.parentNode.remove()">'+(c?'<figcaption>'+esc(c)+'</figcaption>':'')+'</figure>';
  }).join('');
 }).catch(function(){});
});
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
})();
