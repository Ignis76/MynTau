'use strict';
(() => {
 const scene = document.querySelector('#build');
 const stage = scene.querySelector('.build-stage');
 const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
 const clamp = v => Math.max(0, Math.min(1, v));
 const smooth = v => { v = clamp(v); return v * v * (3 - 2 * v); };
 const phase = (p, start, end) => smooth((p - start) / (end - start));
 const parts = [
  {el:scene.querySelector('.part-deck'),start:0,end:.18,x:0,y:140,rotate:-5},
  {el:scene.querySelector('.part-frame'),start:.12,end:.35,x:0,y:-160,rotate:0},
  {el:scene.querySelector('.part-roof'),start:.29,end:.52,x:130,y:-180,rotate:12},
  {el:scene.querySelector('.part-glass'),start:.46,end:.70,x:-130,y:50,rotate:-7},
  {el:scene.querySelector('.part-details'),start:.64,end:.83,x:0,y:70,rotate:0}
 ];
 const stories = [
  ['Всё начинается с места','Своя терраса. Весь мир вокруг.'],
  ['У мечты появляется форма','Тёплое дерево. Смелые линии.'],
  ['Ближе к природе','Панорамные окна вместо экранов.'],
  ['Теперь здесь - ваш свет','За окном горы. Внутри - хорошо.']
 ];
 const buttons = [...scene.querySelectorAll('[data-build-step]')];
 const hero = document.querySelector('.hero');
 const progressBar = document.querySelector('.page-progress');
 let lastStory = -1, pending = false;
 function render() {
  pending = false;
  const rect = scene.getBoundingClientRect();
  const distance = Math.max(1, scene.offsetHeight - stage.offsetHeight);
  const p = reduce.matches ? 1 : clamp(-rect.top / distance);
  const heroRect = hero.getBoundingClientRect();
  const doc = document.documentElement;
  const pageProgress = clamp(window.scrollY / Math.max(1, doc.scrollHeight - innerHeight));
  progressBar.style.transform = `scaleX(${pageProgress})`;
  if (rect.bottom >= 0 && rect.top <= innerHeight || reduce.matches) {
   scene.style.setProperty('--scene-progress', p.toFixed(4));
   scene.style.setProperty('--sunset', (phase(p,.24,.55)*(1-phase(p,.62,.95))).toFixed(4));
   scene.style.setProperty('--night', phase(p,.58,.95).toFixed(4));
   scene.style.setProperty('--warm', phase(p,.71,.96).toFixed(4));
   scene.style.setProperty('--blueprint', (.28*(1-phase(p,.45,.75))).toFixed(4));
   scene.style.setProperty('--shadow', (.2+phase(p,0,.2)*.8).toFixed(4));
   for(const part of parts){
    const t = phase(p,part.start,part.end);
    part.el.style.opacity = String(t);
    part.el.style.transform = `translate(${part.x*(1-t)}px,${part.y*(1-t)}px) rotate(${part.rotate*(1-t)}deg)`;
   }
   const index = p < .22 ? 0 : p < .48 ? 1 : p < .77 ? 2 : 3;
   if (index !== lastStory) {
    lastStory = index;
    document.querySelector('#stage-number').textContent = `0${index+1} / 04`;
    document.querySelector('#stage-title').textContent = stories[index][0];
    document.querySelector('#stage-description').textContent = stories[index][1];
    buttons.forEach((b,i)=>{b.classList.toggle('active',i===index);b.setAttribute('aria-pressed',String(i===index))});
   }
  }
  if (!reduce.matches && heroRect.bottom > 0) hero.style.setProperty('--hero-shift', `${Math.max(0,-heroRect.top)*.13}px`);
 }
 function requestRender(){if(!pending){pending=true;requestAnimationFrame(render)}}
 window.addEventListener('scroll',requestRender,{passive:true});
 window.addEventListener('resize',requestRender,{passive:true});
 reduce.addEventListener('change',()=>{document.body.classList.toggle('motion-on',!reduce.matches);requestRender()});
 buttons.forEach(button=>button.addEventListener('click',()=>{
  const progress = [.12,.39,.68,.98][Number(button.dataset.buildStep)];
  const top = window.scrollY + scene.getBoundingClientRect().top;
  window.scrollTo({top:top+progress*(scene.offsetHeight-stage.offsetHeight),behavior:reduce.matches?'instant':'smooth'});
 }));
 render();

})();
