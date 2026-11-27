const $=(s,root=document)=>root.querySelector(s);
const $$=(s,root=document)=>[...root.querySelectorAll(s)];
const header=$('.site-header'),menu=$('#menuToggle'),nav=$('#mainNav');
const updateHeader=()=>header?.classList.toggle('scrolled',window.scrollY>15);
updateHeader();window.addEventListener('scroll',updateHeader,{passive:true});
menu?.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));menu.textContent=open?'×':'☰';});
$$('#mainNav a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menu?.setAttribute('aria-expanded','false');if(menu)menu.textContent='☰';}));
$('#year').textContent=new Date().getFullYear();

const euro=n=>new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(n);
const basePrices={landing:650,business:1100,store:1800,webapp:2600,ai:1500,custom:1800};
const pageFactors={landing:0,business:90,store:130,webapp:180,ai:120,custom:150};
const form=$('#quoteForm'),range=$('#quoteRange'),note=$('#quoteNote');
const typeNames={landing:'Landing page',business:'Web para empresa',store:'Tienda online',webapp:'Aplicación web / dashboard',ai:'Sistema con IA o automatización',custom:'Proyecto a medida'};
const designNames={standard:'Limpio y profesional',premium:'Premium a medida',art:'Dirección creativa avanzada'};
function getQuote(){
 const type=$('#projectType').value,pages=Number($('#pages').value),design=$('#design').value;
 const extras=$$('input[name="features"]:checked',form).reduce((sum,input)=>sum+Number(input.dataset.price),0);
 const factor={standard:.85,premium:1.18,art:1.5}[design];
 const pageCost=type==='landing'?0:Math.max(0,pages-1)*(pageFactors[type]||120);
 const raw=(basePrices[type]+pageCost+extras)*factor;
 const low=Math.max(350,Math.round(raw*.88/50)*50),high=Math.max(500,Math.round(raw*1.18/50)*50);
 const includeDomain=$('#includeDomain')?.checked||false;
 const extension=$('#domainExtension')?.value||'com';
 const provider=$('#emailProvider')?.value||'google';
 return{low,high,type,pages,design,features:$$('input[name="features"]:checked',form).map(i=>i.value),details:$('#details').value.trim(),includeDomain,extension,provider};
}
function updateDomainCosts(q){
 const options=$('#domainAddonOptions');if(!options)return;
 options.hidden=!q.includeDomain;if(!q.includeDomain)return;
 const domain=q.extension==='es'?{first:7.25,renew:8.46}:{first:9.67,renew:16.32};
 const email=q.provider==='google'?{first:81.60,renew:81.60,label:'Google Workspace Starter · 1 usuario'}:{first:0,renew:0,label:'Zoho Mail gratuito · sujeto a disponibilidad'};
 $('#domainFirstYear').textContent=euro(domain.first);
 $('#emailFirstYear').textContent=email.first===0?'0 €':euro(email.first)+' / año';
 $('#domainTotalFirst').textContent=euro(domain.first+email.first);
 $('#domainRenewalTotal').textContent=euro(domain.renew+email.renew)+' / año';
 $('#domainCostNote').textContent='Correo: '+email.label+'. Google Workspace: 6,80 €/usuario/mes con compromiso anual. Dominio: tarifa publicada por OVHcloud, IVA incluido. Precios sujetos a cambios.';
 const google=q.provider==='google';
 $('#domainProviderLinks').innerHTML='<a href="https://www.ovhcloud.com/es-es/domains/" target="_blank" rel="noopener noreferrer">Ver dominios en OVHcloud ↗</a>'+
 (google?'<a href="https://workspace.google.com/intl/es/business/" target="_blank" rel="noopener noreferrer">Ver Google Workspace ↗</a>':'<a href="https://www.zoho.com/mail/zohomail-pricing.html" target="_blank" rel="noopener noreferrer">Ver Zoho Mail ↗</a>');
}
function updateQuote(){
 const q=getQuote();range.textContent=euro(q.low)+' – '+euro(q.high);
 note.textContent='Estimación orientativa, sin IVA · '+(q.features.length?q.features.length+' extras seleccionados':'sin extras adicionales');
 updateDomainCosts(q);return q;
}
form.addEventListener('input',updateQuote);form.addEventListener('change',updateQuote);updateQuote();
function quoteSummary(q){return['PROYECTO: '+typeNames[q.type],'PÁGINAS: '+q.pages,'DISEÑO: '+designNames[q.design],'FUNCIONALIDADES: '+(q.features.join(', ')||'No especificadas'),'DETALLES: '+(q.details||'Pendiente de definir'),'DOMINIO Y CORREO: '+(q.includeDomain?('.'+q.extension+' · '+(q.provider==='google'?'Google Workspace Starter':'Zoho Mail')):'No añadidos'),'ESTIMACIÓN: '+euro(q.low)+' – '+euro(q.high)+' (sin IVA, orientativa)'].join('\n');}
$('#copyQuote').addEventListener('click',async()=>{const b=$('#copyQuote');try{await navigator.clipboard.writeText(quoteSummary(getQuote()));b.textContent='Resumen copiado ✓';setTimeout(()=>b.textContent='Copiar resumen',1800);}catch{b.textContent='No se pudo copiar';}});
const aiButton=$('#aiQuoteButton'),aiBox=$('#aiResult'),aiText=$('#aiText');
form.addEventListener('submit',async e=>{
 e.preventDefault();const q=updateQuote();aiButton.disabled=true;aiButton.innerHTML='Analizando <span>◌</span>';aiBox.hidden=false;$('#aiStatus').textContent='PROCESANDO';
 aiText.textContent='Estoy revisando el alcance, las funcionalidades y los puntos que conviene definir.';
 try{
  const response=await fetch('https://hector-jimenez-web.vercel.app/api/estimate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({project:typeNames[q.type],pages:q.pages,design:designNames[q.design],features:q.features,details:q.details,range:euro(q.low)+' – '+euro(q.high)})});
  const data=await response.json();if(!response.ok)throw new Error(data.error||'No se pudo conectar con el análisis IA.');
  aiText.replaceChildren();String(data.analysis||'La estimación está preparada.').split('\n').filter(Boolean).forEach(line=>{const p=document.createElement('p');p.textContent=line;aiText.appendChild(p);});
  $('#aiStatus').textContent='ANÁLISIS LISTO';
 }catch(error){aiText.textContent=error.message+' Puedes seguir utilizando la estimación automática y copiar el resumen.';$('#aiStatus').textContent='MODO ESTIMACIÓN';}
 finally{aiButton.disabled=false;aiButton.innerHTML='Analizar con IA <span>✳</span>';}
});
$('#contactForm').addEventListener('submit',e=>{
 e.preventDefault();const name=$('#contactName').value.trim(),email=$('#contactEmail').value.trim(),message=$('#contactMessage').value.trim();
 const subject=encodeURIComponent('Nueva consulta desde la web — '+name),body=encodeURIComponent('Nombre: '+name+'\nEmail: '+email+'\n\n'+message);
 window.location.href='mailto:alejandro.87.estevez@gmail.com?subject='+subject+'&body='+body;
 $('#contactFeedback').textContent='Si no se abre tu correo, escribe directamente a alejandro.87.estevez@gmail.com';
});
const revealObserver=('IntersectionObserver'in window)?new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');revealObserver.unobserve(entry.target);}}),{threshold:.12}):null;
const revealNodes=$$('.work-card,.capability-list article,.process-grid article,.section-top,.manifesto-copy,.contact-left,.estimator-card');
if(revealObserver){revealNodes.forEach(el=>{el.classList.add('reveal');revealObserver.observe(el);});}else{revealNodes.forEach(el=>el.classList.add('visible'));}


// Mascota conversacional Piña: asistente de presupuestos
(()=>{
 const launcher=$('#petLauncher'),panel=$('#petPanel'),close=$('#petClose'),petForm=$('#petForm'),input=$('#petInput'),messages=$('#petMessages'),send=$('#petSend');
 if(!launcher||!panel||!petForm)return;

 // Piña sigue el cursor con los ojos y se inclina suavemente hacia él.
 const petFace=launcher.querySelector('.pet-face');
 if(petFace && window.matchMedia('(pointer:fine)').matches){
  const eyes=[...petFace.querySelectorAll('.pet-eye')];
  let frame=0,lastX=0,lastY=0;
  document.addEventListener('mousemove',event=>{
   lastX=event.clientX;lastY=event.clientY;
   if(frame)return;
   frame=requestAnimationFrame(()=>{
    frame=0;
    const rect=petFace.getBoundingClientRect();
    const dx=(lastX-(rect.left+rect.width/2))/(window.innerWidth/2);
    const dy=(lastY-(rect.top+rect.height/2))/(window.innerHeight/2);
    const x=Math.max(-1,Math.min(1,dx)),y=Math.max(-1,Math.min(1,dy));
    eyes.forEach(eye=>{eye.style.transform='translate('+x*3+'px,'+y*2.5+'px)';});
    petFace.style.setProperty('--look-x',(x*2.5)+'px');
    petFace.style.setProperty('--look-y',(y*2)+'px');
    petFace.classList.toggle('pet-looking',Math.hypot(lastX-(rect.left+rect.width/2),lastY-(rect.top+rect.height/2))<190);
   });
  },{passive:true});
  launcher.addEventListener('mouseleave',()=>{eyes.forEach(eye=>eye.style.transform='');petFace.classList.remove('pet-looking');});
 }

 const open=()=>{panel.hidden=false;launcher.setAttribute('aria-expanded','true');input.focus();};
 const shut=()=>{panel.hidden=true;launcher.setAttribute('aria-expanded','false');};
 launcher.addEventListener('click',()=>panel.hidden?open():shut());close.addEventListener('click',shut);
 const add=(text,who='bot')=>{const el=document.createElement('div');el.className='pet-message pet-'+who;el.textContent=text;messages.appendChild(el);messages.scrollTop=messages.scrollHeight;return el;};
 messages.querySelectorAll('[data-prompt]').forEach(btn=>btn.addEventListener('click',()=>{input.value=btn.dataset.prompt;input.focus();}));
 petForm.addEventListener('submit',async e=>{
  e.preventDefault();const details=input.value.trim();if(!details)return;
  add(details,'user');input.value='';send.disabled=true;const thinking=add('¡Genial! Estoy pensando cómo plantear tu proyecto…','bot');
  try{
   const response=await fetch('https://hector-jimenez-web.vercel.app/api/estimate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({project:'Proyecto a medida',pages:'Por definir',design:'A medida',features:[],details,range:'Pendiente de definir'})});
   const data=await response.json();if(!response.ok)throw new Error(data.error||'No he podido conectar con mi asistente.');
   thinking.textContent='¡Ya tengo una primera orientación!';
   const result=document.createElement('div');result.className='pet-message pet-bot pet-analysis';result.textContent=data.analysis;messages.appendChild(result);
   const action=document.createElement('button');action.type='button';action.className='pet-estimator-link';action.textContent='Abrir calculador detallado ↗';action.addEventListener('click',()=>{shut();document.querySelector('#estimator')?.scrollIntoView({behavior:'smooth'});});messages.appendChild(action);
  }catch(err){thinking.textContent=err.message+' También puedes usar el calculador detallado de la página.';}
  finally{send.disabled=false;messages.scrollTop=messages.scrollHeight;}
 });
})();
