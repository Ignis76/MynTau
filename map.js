'use strict';
(() => {
 const {latitude:lat,longitude:lon}=window.SAI_LOCATION;
 const map=document.querySelector('#region-map');
 const coordinates=`${lat.toFixed(4)}, ${lon.toFixed(4)}`;
 const coordinateLabel=document.querySelector('#map-coordinates');
 coordinateLabel.textContent=coordinates;
 document.querySelector('#map-external').href=`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=14/${lat}/${lon}`;
 function showMap(view){
  const bbox=view==='city'?[76.80,43.08,77.13,43.34]:[lon-.038,lat-.025,lon+.038,lat+.025];
  const query=new URLSearchParams({bbox:bbox.map(v=>v.toFixed(4)).join(','),layer:'mapnik',marker:`${lat},${lon}`});
  map.src='https://www.openstreetmap.org/export/embed.html?'+query;
  document.querySelectorAll('[data-map]').forEach(button=>{const active=button.dataset.map===view;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active))});
 }
 document.querySelectorAll('[data-map]').forEach(button=>button.addEventListener('click',()=>showMap(button.dataset.map)));
 document.querySelector('#copy-coordinates').addEventListener('click',async()=>{
  const status=document.querySelector('#coordinate-status');
  try{
   await navigator.clipboard.writeText(coordinates);
   status.textContent='Координаты скопированы';
   const button=document.querySelector('#copy-coordinates');button.textContent='Скопировано ✓';
   setTimeout(()=>{button.textContent='Копировать ↗'},2200);
  }catch{status.textContent='Выделите и скопируйте координаты рядом с кнопкой.'}
 });
 showMap('camp');
})();
