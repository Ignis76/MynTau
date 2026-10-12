'use strict';
window.renderCabinPage=({cabins})=>{
 const c=cabins.find(c=>c.id===document.body.dataset.cabin);
 if(!c)throw new Error('Домик не найден. Обновите страницу после перезапуска сервера.');
 const currency=n=>new Intl.NumberFormat('ru-RU').format(n)+' ₸';
 document.querySelector('#stay-price').textContent=currency(c.price);
 document.querySelector('#full-amenities').replaceChildren(...c.amenities.map(text=>{const li=document.createElement('li');li.textContent=text;return li}));
 const start=document.querySelector('#check-in'),end=document.querySelector('#check-out');
 function quote(){
  const nights=(Date.parse(end.value)-Date.parse(start.value))/86400000;
  const output=document.querySelector('#stay-quote');
  if(!Number.isInteger(nights)||nights<1||nights>30){output.textContent='Выберите от 1 до 30 ночей.';return}
  const row=document.createElement('div'),total=document.createElement('div');total.className='quote-total';
  row.innerHTML=`<span>${currency(c.price)} × ${nights} ${nights%10===1&&nights%100!==11?'ночь':nights%10>=2&&nights%10<=4&&(nights%100<12||nights%100>14)?'ночи':'ночей'}</span><span>${currency(c.price*nights)}</span>`;
  total.innerHTML=`<span>Итого</span><strong>${currency(c.price*nights)}</strong>`;
  output.replaceChildren(row,total);
 }
 start.addEventListener('change',quote);end.addEventListener('change',quote);quote();
};
