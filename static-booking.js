/* Browser-only demo. No requests or reservations are sent to the property. */
(() => {
  const storageKey = 'myntau-demo-reservations';
  let fallback = [];
  const today = () => new Intl.DateTimeFormat('en-CA', {timeZone:'Asia/Almaty',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  const read = () => { try { const rows = JSON.parse(localStorage.getItem(storageKey) || '[]'); return Array.isArray(rows) ? rows : []; } catch { return fallback; } };
  const save = rows => { fallback = rows; try { localStorage.setItem(storageKey, JSON.stringify(rows)); } catch {} };
  const overlaps = (a,b) => a.checkIn < b.checkOut && a.checkOut > b.checkIn;
  const dateValid = d => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d) && Number.isFinite(Date.parse(d)) && new Date(d).toISOString().slice(0,10) === d;
  const dates = (start,end) => {
    if (!dateValid(start) || !dateValid(end)) throw Error('Выберите корректные даты');
    const nights = (Date.parse(end)-Date.parse(start))/86400000;
    if (start < today() || nights < 1 || nights > 30) throw Error('Выберите будущие даты, от 1 до 30 ночей');
    return nights;
  };
  const id = () => Array.from(crypto.getRandomValues(new Uint8Array(16)), b=>b.toString(16).padStart(2,'0')).join('');
  window.MynTauDemo = {
    async request(url, options = {}) {
      const parsed = new URL(url, 'https://demo.invalid');
      const method = options.method || 'GET';
      const body = options.body ? JSON.parse(options.body) : {};
      const records = read();
      if (parsed.pathname === '/api/cabins' && method === 'GET') {
        const guests = Number(parsed.searchParams.get('guests') || 1);
        const checkIn = parsed.searchParams.get('checkIn'), checkOut = parsed.searchParams.get('checkOut');
        if (checkIn || checkOut) dates(checkIn,checkOut);
        return {today:today(),cabins:window.MYNTAU_CABINS.map(c=>({...c,available:c.capacity>=guests && (!checkIn || !records.some(b=>b.status==='active' && b.cabinId===c.id && overlaps(b,{checkIn,checkOut})))}))};
      }
      if (parsed.pathname === '/api/bookings/lookup' && method === 'POST') {
        return {bookings:records.filter(r=>(body.keys || []).some(k=>k.id===r.id && k.token===r.token)).map(({token,...r})=>r).reverse()};
      }
      if (parsed.pathname === '/api/bookings' && method === 'POST') {
        const cabin = window.MYNTAU_CABINS.find(c=>c.id===body.cabinId);
        if (!cabin) throw Error('Домик не найден');
        const nights = dates(body.checkIn,body.checkOut);
        if (!Number.isInteger(body.guests) || body.guests<1 || body.guests>cabin.capacity) throw Error('Проверьте количество гостей');
        if (typeof body.name!=='string' || body.name.trim().length<2 || body.name.length>80) throw Error('Укажите имя');
        if (typeof body.phone!=='string' || !/^\+?[\d\s()-]{10,24}$/.test(body.phone) || body.phone.replace(/\D/g,'').length<10 || body.phone.replace(/\D/g,'').length>15) throw Error('Проверьте номер телефона');
        if (!body.consent) throw Error('Подтвердите сохранение данных в этом браузере');
        if (body.comment != null && (typeof body.comment!=='string' || body.comment.length>500)) throw Error('Комментарий должен содержать не более 500 символов');
        if (records.some(b=>b.status==='active' && b.cabinId===cabin.id && overlaps(b,body))) throw Error('На эти даты уже есть ваша демонстрационная заявка');
        const booking = {id:id(),token:id(),cabinId:cabin.id,cabinName:cabin.name,checkIn:body.checkIn,checkOut:body.checkOut,guests:body.guests,name:body.name.trim(),phone:body.phone.trim(),comment:(body.comment||'').trim(),nights,price:cabin.price,total:nights*cabin.price,status:'active',createdAt:new Date().toISOString()};
        save([...records,booking]);
        return {booking};
      }
      if (parsed.pathname.startsWith('/api/bookings/') && method === 'DELETE') {
        const booking=records.find(b=>b.id===parsed.pathname.split('/').pop() && b.token===body.token);
        if (!booking) throw Error('Заявка не найдена');
        booking.status='cancelled';save(records);return {ok:true};
      }
      throw Error('Действие недоступно в демонстрационной версии');
    }
  };
})();
