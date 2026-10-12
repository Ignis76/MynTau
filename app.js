'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const money=n=>new Intl.NumberFormat('ru-RU').format(n)+' ₸';
const formatDate=s=>new Date(s+'T12:00:00').toLocaleDateString('ru-RU',{day:'numeric',month:'long'});
const addDays=(s,n)=>{const d=new Date(s+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10)};
const escapeHTML=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const nightWord=n=>n%10===1&&n%100!==11?'ночь':n%10>=2&&n%10<=4&&(n%100<12||n%100>14)?'ночи':'ночей';
const state={cabins:[],search:null,today:'',photoIndex:0};
let memoryKeys=[];
function keys(){try{return JSON.parse(localStorage.getItem('myntau-demo-keys')||'[]')}catch{return memoryKeys}}
function saveKey(booking){const all=[...keys(),{id:booking.id,token:booking.token}].slice(-100);memoryKeys=all;try{localStorage.setItem('myntau-demo-keys',JSON.stringify(all))}catch{toast('Хранилище браузера недоступно. Сохраните номер заявки.')}}
async function api(url,options={}){return window.MynTauDemo.request(url,options)}
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('visible');clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('#toast').classList.remove('visible'),4000)}
function openModal(id){const modal=$(id);modal.showModal();document.body.classList.add('modal-open')}
function closeModal(modal){modal.close();if(!$$('dialog[open]').length)document.body.classList.remove('modal-open')}
$$('dialog').forEach(d=>{d.querySelector('.modal-close').addEventListener('click',()=>closeModal(d));d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeModal(d)}});d.addEventListener('close',()=>{if(!$$('dialog[open]').length)document.body.classList.remove('modal-open')})});
$('.menu-toggle').addEventListener('click',()=>{const open=$('.nav').classList.toggle('is-open');$('.menu-toggle').setAttribute('aria-expanded',open);$('.menu-toggle').setAttribute('aria-label',open?'Закрыть меню':'Открыть меню');$('.menu-toggle').textContent=open?'×':'☰'});
$$('.nav a').forEach(a=>a.addEventListener('click',()=>{ $('.nav').classList.remove('is-open');$('.menu-toggle').setAttribute('aria-expanded','false');$('.menu-toggle').setAttribute('aria-label','Открыть меню');$('.menu-toggle').textContent='☰'}));
function renderCabins(){
 if(!$('#lab-booking'))return;
 window.cabinExplorerSnapshot={cabins:state.cabins,search:state.search};
 window.updateCabinExplorer?.(state.cabins,state.search);
 $('#reset-search').hidden=!state.search;
}
function validateDates(start,end){if(!start||!end)return 'Укажите даты заезда и выезда.';if(start<state.today)return 'Дата заезда не может быть в прошлом.';if(end<=start)return 'Выезд должен быть позже заезда.';if((Date.parse(end)-Date.parse(start))/86400000>30)return 'Выберите не больше 30 ночей.';return ''}
$('#check-in').addEventListener('change',()=>{const date=$('#check-in').value;if(!date)return;$('#check-out').min=addDays(date,1);if($('#check-out').value<=date)$('#check-out').value=addDays(date,2)});
$('#search-form').addEventListener('submit',async e=>{
 e.preventDefault();
 const start=$('#check-in').value,end=$('#check-out').value,guests=Number($('#guests').value),error=validateDates(start,end);
 $('#search-error').textContent=error;
 if(error)return;
 const button=$('.search-button');button.disabled=true;
 try{
  const data=await api(`/api/cabins?checkIn=${start}&checkOut=${end}&guests=${guests}`);
  state.cabins=data.cabins;state.search={checkIn:start,checkOut:end,guests};
  if(document.body.dataset.cabin){
   const chosen=data.cabins.find(c=>c.id===document.body.dataset.cabin);
   if(chosen?.available)showReservation(chosen.id);
   else $('#search-error').textContent='На эти даты домик занят или не подходит по числу гостей. Попробуйте другие даты.';
   return;
  }
  $('#availability-note').textContent=`${formatDate(start)} - ${formatDate(end)} · ${guests} ${guests===1?'гость':guests<5?'гостя':'гостей'}`;
  renderCabins();
  $('#cabins').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
 }catch(e){$('#search-error').textContent=e.message}finally{button.disabled=false}
});
$('#reset-search')?.addEventListener('click',()=>{state.search=null;$('#availability-note').textContent='';renderCabins()});
function showReservation(id){
 const c=state.cabins.find(c=>c.id===id),checkIn=state.search?.checkIn||$('#check-in').value||addDays(state.today,1),checkOut=state.search?.checkOut||$('#check-out').value||addDays(checkIn,2),guests=Math.min(c.capacity,Number($('#guests').value));
 $('#reservation-content').innerHTML=`<span class="eyebrow">ВАШЕ ВРЕМЯ В ГОРАХ</span><h2>Ваша поездка</h2><div class="reservation-top"><img src="${c.image}" style="object-position:${c.position}" alt="${c.name}"><div><h3>${c.name}</h3><p>До ${c.capacity} гостей · ${c.area} м² · ${money(c.price)} / ночь</p></div></div><form id="reservation-form"><div class="reservation-fields"><label>Заезд<input type="date" name="checkIn" value="${checkIn}" min="${state.today}" required></label><label>Выезд<input type="date" name="checkOut" value="${checkOut}" min="${addDays(checkIn,1)}" required></label><label>Количество гостей<select name="guests">${Array.from({length:c.capacity},(_,i)=>`<option value="${i+1}" ${i+1===guests?'selected':''}>${i+1} ${i===0?'гость':i<4?'гостя':'гостей'}</option>`).join('')}</select></label><label>Ваше имя<input name="name" autocomplete="given-name" minlength="2" maxlength="80" placeholder="Как к вам обращаться" required></label><label class="full-width">Номер телефона<input name="phone" type="tel" autocomplete="tel" placeholder="+7 (___) ___-__-__" minlength="10" maxlength="24" required></label><label class="full-width">Пожелания <span>(необязательно)</span><textarea name="comment" maxlength="500" placeholder="Например, приедем с ребёнком или питомцем"></textarea></label></div><div class="price-breakdown" aria-live="polite" id="price-breakdown"></div><label class="consent"><input type="checkbox" name="consent" required><span>Согласен с сохранением имени и телефона только в этом браузере для оформления локальной заявки.</span></label><p class="form-error" id="reservation-error" role="alert"></p><button class="button reservation-submit" type="submit">Сохранить заявку <span>↗</span></button><p class="local-note">Это локальная демонстрация. Деньги не списываются, заявка не отправляется владельцу и не подтверждает реальное проживание.</p></form>`;
 const form=$('#reservation-form');function updatePrice(){const start=form.elements.checkIn.value,end=form.elements.checkOut.value,error=validateDates(start,end),nights=(Date.parse(end)-Date.parse(start))/86400000;$('#price-breakdown').innerHTML=error?`<p class="form-error">${error}</p>`:`<div><span>${money(c.price)} × ${nights} ${nightWord(nights)}</span><span>${money(nights*c.price)}</span></div><div><span>Дополнительные сборы</span><span>0 ₸</span></div><div class="total"><span>Итого</span><span>${money(nights*c.price)}</span></div>`}
 form.elements.checkIn.addEventListener('change',()=>{const start=form.elements.checkIn.value;if(!start)return;form.elements.checkOut.min=addDays(start,1);if(form.elements.checkOut.value<=start)form.elements.checkOut.value=addDays(start,1);updatePrice()});form.elements.checkOut.addEventListener('change',updatePrice);updatePrice();
 form.addEventListener('submit',async e=>{e.preventDefault();const b=Object.fromEntries(new FormData(form)),error=validateDates(b.checkIn,b.checkOut);$('#reservation-error').textContent=error;if(error)return;const button=$('.reservation-submit');button.disabled=true;button.textContent='Сохраняем…';try{const {booking}=await api('/api/bookings',{method:'POST',body:JSON.stringify({...b,cabinId:c.id,guests:Number(b.guests),consent:!!b.consent})});saveKey(booking);showSuccess(booking);if(state.search){const data=await api(`/api/cabins?${new URLSearchParams(state.search)}`);state.cabins=data.cabins;renderCabins()}}catch(error){if($('#reservation-error')){$('#reservation-error').textContent=error.message;button.disabled=false;button.innerHTML='Попробовать ещё раз <span>↗</span>'}else toast(error.message)}});
 openModal('#reservation-dialog');
}
function showSuccess(b){$('#reservation-content').innerHTML=`<div class="success-state"><div class="success-icon">✓</div><span class="eyebrow">ЛОКАЛЬНАЯ ЗАЯВКА СОХРАНЕНА</span><h2>В планах - горы</h2><p>${escapeHTML(b.name)}, ваш выбор сохранён только в этом браузере.</p><div class="success-info"><strong>${b.cabinName}</strong><br>${formatDate(b.checkIn)} - ${formatDate(b.checkOut)}<br>${b.nights} ${nightWord(b.nights)} · ${b.guests} ${b.guests===1?'гость':b.guests<5?'гостя':'гостей'}<br><strong>${money(b.total)}</strong><br><small>Заявка ${b.id.slice(0,8).toUpperCase()}</small></div><p>Это демонстрационная заявка. Она видна только вам в этом браузере и не отправляется владельцам глемпинга.</p><button class="button" id="download-reservation">Скачать подтверждение ↓</button><br><button class="text-button" style="margin-top:22px" id="finish-reservation">Вернуться к горам</button></div>`;$('#finish-reservation').addEventListener('click',()=>closeModal($('#reservation-dialog')));$('#download-reservation').addEventListener('click',()=>{const text=`MynTau - ЛОКАЛЬНАЯ ДЕМОНСТРАЦИОННАЯ ЗАЯВКА\nНомер: ${b.id}\nДомик: ${b.cabinName}\nЗаезд: ${b.checkIn}, 15:00\nВыезд: ${b.checkOut}, 12:00\nГостей: ${b.guests}\nИмя: ${b.name}\nСтоимость: ${money(b.total)}\n\nБез оплаты. Не является подтверждением реального проживания.\nУправление заявкой доступно в том же браузере через «Мои заявки».`;const url=URL.createObjectURL(new Blob(['\uFEFF'+text],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=`MynTau-${b.id.slice(0,8)}.txt`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)})}
async function loadBookings(){const container=$('#bookings-list');container.innerHTML='<p class="bookings-empty">Загружаем ваши планы…</p>';try{const {bookings}=await api('/api/bookings/lookup',{method:'POST',body:JSON.stringify({keys:keys()})});container.innerHTML=bookings.length?bookings.map(b=>`<article class="saved-booking"><h3>${escapeHTML(b.cabinName)} <small>№ ${b.id.slice(0,8).toUpperCase()}</small></h3><p>${formatDate(b.checkIn)} - ${formatDate(b.checkOut)} · ${b.nights} ${nightWord(b.nights)}<br>${money(b.total)}</p>${b.status==='active'?`<button class="text-button" data-cancel="${b.id}">Отменить заявку</button>`:'<span class="cancelled-label">Заявка отменена</span>'}</article>`).join(''):'<p class="bookings-empty">Пока никаких планов. Выберите домик и сохраните свою первую поездку в горы.</p>';$$('[data-cancel]').forEach(button=>button.addEventListener('click',async()=>{if(button.dataset.confirm!=='true'){button.dataset.confirm='true';button.textContent='Подтвердить отмену';return}button.disabled=true;try{await api('/api/bookings/'+button.dataset.cancel,{method:'DELETE',body:JSON.stringify({token:keys().find(k=>k.id===button.dataset.cancel)?.token})});await loadBookings();toast('Заявка отменена. Даты снова свободны.');if(state.search){const data=await api(`/api/cabins?${new URLSearchParams(state.search)}`);state.cabins=data.cabins;renderCabins()}}catch(e){toast(e.message);button.disabled=false}}))}catch(e){container.innerHTML=`<p class="form-error">${escapeHTML(e.message)}</p>`}}
$('#my-bookings').addEventListener('click',()=>{openModal('#bookings-dialog');loadBookings()});
const photos=$$('[data-photo]');function setPhoto(index){state.photoIndex=(index+photos.length)%photos.length;const p=photos[state.photoIndex];$('#lightbox-image').src=p.dataset.photo;$('#lightbox-image').alt=p.dataset.caption;$('#lightbox-caption').textContent=`${p.dataset.caption} · ${state.photoIndex+1} / ${photos.length}`}
photos.forEach((p,i)=>p.addEventListener('click',()=>{setPhoto(i);openModal('#photo-dialog')}));$('.photo-prev').addEventListener('click',()=>setPhoto(state.photoIndex-1));$('.photo-next').addEventListener('click',()=>setPhoto(state.photoIndex+1));$('#photo-dialog').addEventListener('keydown',e=>{if(e.key==='ArrowRight')setPhoto(state.photoIndex+1);if(e.key==='ArrowLeft')setPhoto(state.photoIndex-1)});
async function init(){try{const data=await api('/api/cabins');state.cabins=data.cabins;state.today=data.today;$('#check-in').min=data.today;$('#check-in').value=addDays(data.today,1);$('#check-out').min=addDays(data.today,2);$('#check-out').value=addDays(data.today,3);$('#year').textContent=data.today.slice(0,4);if(document.body.dataset.cabin){const params=new URLSearchParams(location.search),start=params.get('checkIn'),end=params.get('checkOut'),guests=params.get('guests');if(start&&end&&!validateDates(start,end)){$('#check-in').value=start;$('#check-out').value=end;$('#check-out').min=addDays(start,1)}if(guests&&[...$('#guests').options].some(o=>o.value===guests))$('#guests').value=guests;window.renderCabinPage?.(data)}renderCabins()}catch(e){if($('#cabin-grid'))$('#cabin-grid').innerHTML='<p class="form-error">Не удалось загрузить домики. Убедитесь, что локальный сервер запущен, и обновите страницу.</p>';$('#search-error').textContent=e.message}}
init();



const dayStories={
 morning:{position:'center 82%',image:(window.MYNTAU_ROOT + 'assets/hero.jpg'),alt:'Домик с террасой на фоне зелёных гор',time:'08:30',number:'01 / Медленное утро',title:'Ещё пять минут.<br>И чашку кофе.',description:'Солнечный свет в окне, прохладный воздух и завтрак на своей террасе. Сегодня можно никуда не торопиться.',link:'Хочу такое утро'},
 afternoon:{position:'center',image:(window.MYNTAU_ROOT + 'assets/forest.jpg'),alt:'Солнечный свет на лесной тропе',time:'14:00',number:'02 / Дорога без спешки',title:'Заблудиться<br>в хорошем дне.',description:'Выйти на прогулку без большого плана. Послушать лес, найти красивый вид и вернуться только тогда, когда захочется.',link:'Хочу такой день'},
 evening:{position:'center 65%',image:(window.MYNTAU_ROOT + 'assets/cover.jpg'),alt:'Тёплый свет вечернего домика среди леса',time:'20:45',number:'03 / Время для своих',title:'Весь мир<br>может подождать.',description:'В окнах загорается тёплый свет. Заварите чай, укутайтесь в плед и побудьте рядом с теми, кого любите.',link:'Хочу такой вечер'}
};
$$('[data-day]').forEach(button=>button.addEventListener('click',()=>{
 const story=dayStories[button.dataset.day];
 $('#day-image').src=story.image;$('#day-image').style.objectPosition=story.position;$('#day-image').alt=story.alt;$('#day-clock').textContent=story.time;$('#day-counter').textContent=story.number;$('#day-title').innerHTML=story.title;$('#day-description').textContent=story.description;
 $('.day-copy .editorial-link').innerHTML=story.link+' <span>↗</span>';
 $$('[data-day]').forEach(b=>{const active=b===button;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active))});
}));

// A date field is one click target, including its label and the date digits.
document.addEventListener('click', event => {
 const target = event.target;
 if (!(target instanceof Element)) return;
 const input = target.closest('input[type="date"]') || target.closest('label')?.querySelector('input[type="date"]');
 if (!input || input.disabled || input.readOnly || typeof input.showPicker !== 'function') return;
 try {
  input.focus({preventScroll:true});
  input.showPicker();
  event.preventDefault();
 } catch { /* Unsupported contexts retain the browser's default date control. */ }
});
