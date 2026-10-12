'use strict';
(() => {
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const compare=document.querySelector('#compare-dialog');
 document.querySelector('.compare-trigger').addEventListener('click',()=>{compare.showModal();document.body.classList.add('modal-open');});
 const moods={
  slow:{image:(window.MYNTAU_ROOT + 'assets/hero.jpg'),alt:'Домик на зелёном склоне и тихое утро в горах',sticker:'do less<br>feel more',number:'01 / МЕДЛЕННЫЙ ДЕНЬ',plan:[['09:00','Кофе с видом на горы'],['14:00','Книга и тишина на террасе'],['20:00','Чай, плед и ни одного дела']]},
  explore:{image:(window.MYNTAU_ROOT + 'assets/almaty.jpg'),alt:'Озеро среди гор Алматы',sticker:'go out<br>look up',number:'02 / ДЕНЬ ОТКРЫТИЙ',plan:[['08:00','Неспешный завтрак перед прогулкой'],['12:00','Прогулка и поиск красивых видов'],['19:00','Ужин и разговоры о пройденном']]},
  together:{image:(window.MYNTAU_ROOT + 'assets/cover.jpg'),alt:'Тёплый свет домика в вечернем лесу',sticker:'just us<br>right here',number:'03 / ДЕНЬ ДЛЯ СВОИХ',plan:[['10:00','Готовим завтрак вместе'],['15:00','Разговоры и настольные игры'],['21:00','Любимая музыка и вечер вдвоём']]}
 };
 document.querySelectorAll('[data-mood]').forEach(button=>button.addEventListener('click',()=>{
  const mood=moods[button.dataset.mood];
  document.querySelectorAll('[data-mood]').forEach(b=>{const active=b===button;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
  const photo=document.querySelector('.day-builder-photo');photo.classList.remove('is-changing');
  const img=document.querySelector('#mood-image');img.src=mood.image;img.alt=mood.alt;
  document.querySelector('#mood-sticker').innerHTML=mood.sticker;
  document.querySelector('#mood-number').textContent=mood.number;
  document.querySelector('.day-plan').innerHTML=mood.plan.map(([time,text])=>`<div><span>${time}</span><p>${text}</p></div>`).join('');
  requestAnimationFrame(()=>photo.classList.add('is-changing'));
 }));
 const strip=document.querySelector('.filmstrip'),back=document.querySelector('.gallery-back'),next=document.querySelector('.gallery-forward');
 function updateGallery(){
  back.disabled=strip.scrollLeft<4;next.disabled=strip.scrollLeft+strip.clientWidth>=strip.scrollWidth-4;
  const cards=[...strip.querySelectorAll('button')],origin=strip.getBoundingClientRect().left;
  const index=cards.reduce((best,card,i)=>Math.abs(card.getBoundingClientRect().left-origin)<Math.abs(cards[best].getBoundingClientRect().left-origin)?i:best,0);
  document.querySelector('#gallery-counter').textContent=String(index+1).padStart(2,'0')+' / '+String(cards.length).padStart(2,'0');
 }
 function moveGallery(direction){const card=strip.querySelector('button');strip.scrollBy({left:direction*(card.getBoundingClientRect().width+parseFloat(getComputedStyle(strip).gap)),behavior:reduced.matches?'instant':'smooth'});}
 back.addEventListener('click',()=>moveGallery(-1));next.addEventListener('click',()=>moveGallery(1));strip.addEventListener('scroll',updateGallery,{passive:true});window.addEventListener('resize',updateGallery);updateGallery();
 strip.addEventListener('keydown',event=>{if(event.target!==strip)return;if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();moveGallery(event.key==='ArrowRight'?1:-1);}});
 if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){if(!reduced.matches)entry.target.classList.add('is-revealed');observer.unobserve(entry.target)}}),{threshold:.12});document.querySelectorAll('.manifesto-content,.section-heading,.day-builder-heading,.map-copy,.faq-section>div:first-child').forEach(el=>observer.observe(el));}
})();
