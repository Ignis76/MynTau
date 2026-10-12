'use strict';
(() => {
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 const hero=document.querySelector('.layered-hero');
 const houseData={aframe:{image:(window.MYNTAU_ROOT + 'assets/aframe-reference.png'),alt:'A-frame - треугольный дом',capacity:'До 3 гостей',area:'32 м²',url:(window.MYNTAU_ROOT + 'cabins/a-frame.html'),caption:'ПОД ВЫСОКИМ ПОТОЛКОМ',title:'Больше воздуха<br>Больше вас',text:'Треугольный силуэт, тёплое дерево и большое окно. Собственное пространство для отдыха вдвоём или втроём.'},shell:{image:(window.MYNTAU_ROOT + 'assets/shell-reference.png'),alt:'Shell House - дом с овальным фасадом',capacity:'До 4 гостей',area:'38 м²',url:(window.MYNTAU_ROOT + 'cabins/shell.html'),caption:'АРХИТЕКТУРА ПЛАВНЫХ ЛИНИЙ',title:'Своя форма<br>Свой ритм',text:'Скульптурная оболочка, овальный стеклянный фасад и отдельная терраса. Необычный дом для компании до четырёх гостей.'}};
 let currentHouse='aframe',currentView='outside',catalog=[],search=null;
 const cabinFor=key=>catalog.find(c=>c.id===(key==='aframe'?'panorama':'shell'));
 const isAvailable=key=>!search||!!cabinFor(key)?.available;
 const money=value=>new Intl.NumberFormat('ru-RU').format(value)+' ₸';
 window.updateCabinExplorer=(cabins,chosenSearch)=>{
  catalog=cabins;search=chosenSearch;
  if(!isAvailable(currentHouse))currentHouse=Object.keys(houseData).find(isAvailable)||currentHouse;
  updateLab();
 };
 const stage=document.querySelector('.lab-stage');
 function updateLab(){
  const d=houseData[currentHouse];
  document.querySelector('#lab-exterior-image').src=d.image;document.querySelector('#lab-exterior-image').alt=d.alt;
  document.querySelector('#lab-capacity').textContent=d.capacity;document.querySelector('#lab-area').textContent=d.area;const houseUrl=d.url+(search?'?'+new URLSearchParams(search):'');
  document.querySelector('#lab-house-link').href=houseUrl;
  const photoLink=document.querySelector('#lab-photo-link');
  photoLink.href=houseUrl;
  photoLink.setAttribute('aria-label','Подробнее о доме '+(currentHouse==='aframe'?'A-frame':'Shell House'));
  const cabin=cabinFor(currentHouse),price=cabin?.price||(currentHouse==='aframe'?45000:65000);
  const anyAvailable=Object.keys(houseData).some(isAvailable);
  document.querySelector('#empty-state').hidden=anyAvailable;
  document.querySelector('.explorer-search').hidden=!search;
  [stage,document.querySelector('.lab-description'),document.querySelector('#lab-booking'),document.querySelector('.mobile-extras')].forEach(el=>el.hidden=!anyAvailable);
  document.querySelector('#lab-price').textContent=money(price);
  document.querySelector('#lab-booking-spec').textContent=d.capacity+' · '+d.area+' · Своя терраса';
  const nights=search?(Date.parse(search.checkOut)-Date.parse(search.checkIn))/86400000:0;
  document.querySelector('#lab-total').textContent=nights?money(price*nights)+' за весь отдых':'';
  document.querySelector('.lab-caption').textContent=d.caption;document.querySelector('.lab-description h3').textContent=d.title.replace('<br>',' ');document.querySelector('.lab-description p').textContent=d.text;
  document.querySelector('.lab-exterior').hidden=currentView!=='outside';
  document.querySelectorAll('[data-lab-plan]').forEach(p=>p.hidden=currentView!=='plan'||p.dataset.labPlan!==currentHouse);
  document.querySelectorAll('[data-lab-house]').forEach(b=>{const available=isAvailable(b.dataset.labHouse),active=available&&b.dataset.labHouse===currentHouse;b.disabled=!available;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));b.querySelector('.house-choice-state').textContent=!available?'Недоступен':active?'Сейчас открыт':'Посмотреть';b.querySelector('.house-choice-arrow').textContent=!available?'−':active?'✓':'→';});
  document.querySelectorAll('[data-lab-view]').forEach(b=>{const active=b.dataset.labView===currentView;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
  stage.classList.remove('is-updating');requestAnimationFrame(()=>stage.classList.add('is-updating'));
 }
 document.querySelectorAll('[data-lab-house]').forEach(b=>b.addEventListener('click',()=>{currentHouse=b.dataset.labHouse;updateLab();}));
 document.querySelectorAll('[data-lab-view]').forEach(b=>b.addEventListener('click',()=>{currentView=b.dataset.labView;updateLab();}));
 if(window.cabinExplorerSnapshot)window.updateCabinExplorer(window.cabinExplorerSnapshot.cabins,window.cabinExplorerSnapshot.search);else updateLab();
 const zones={sleep:'Большая кровать, мягкое бельё и утро, которое можно начать попозже.',cook:'Мини-кухня, посуда, чайник, чай и кофе. Готовьте любимые завтраки в своём ритме.',terrace:'Собственная терраса: выпить кофе, почитать книгу и просто побыть с видом на природу.'};
 document.querySelectorAll('[data-lab-zone]').forEach(b=>b.addEventListener('click',()=>{document.querySelector('#lab-zone-copy').textContent=zones[b.dataset.labZone];document.querySelectorAll('[data-lab-zone]').forEach(el=>{const active=el===b;el.classList.toggle('active',active);el.setAttribute('aria-pressed',String(active));});}));
 if(matchMedia('(pointer:fine)').matches){let frame;hero.addEventListener('pointermove',event=>{if(reduce.matches)return;const r=hero.getBoundingClientRect(),x=(event.clientX-r.left)/r.width-.5,y=(event.clientY-r.top)/r.height-.5;cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{hero.style.setProperty('--pan-x',`${x*-13}px`);hero.style.setProperty('--pan-y',`${y*-10}px`);});},{passive:true});hero.addEventListener('pointerleave',()=>{cancelAnimationFrame(frame);hero.style.setProperty('--pan-x','0px');hero.style.setProperty('--pan-y','0px');});}
 let pending=false;
 function scrollLayers(){pending=false;if(reduce.matches)return;const r=hero.getBoundingClientRect();if(r.bottom>0&&r.top<innerHeight)hero.style.setProperty('--landscape-lift',`${Math.max(0,-r.top)*-.055}px`);}
 window.addEventListener('scroll',()=>{if(!pending){pending=true;requestAnimationFrame(scrollLayers);}},{passive:true});
})();
