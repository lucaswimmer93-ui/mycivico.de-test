const sb=supabase.createClient('https://fowlmllbyjkbedhisceo.supabase.co','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvd2xtbGxieWprYmVkaGlzY2VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MTkzNjQsImV4cCI6MjA4OTQ5NTM2NH0.uNBcVHHfKg7C56iQhxfu9SJ1V1XCACsuiYvy6JfR6jw',{auth:{autoRefreshToken:true,persistSession:true,detectSessionInUrl:false}});

// ── PAGE ROUTING ──
function showPage(id){document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));const el=document.getElementById('page-'+id);if(el)el.classList.add('active');window.scrollTo(0,0);}
function toast(msg,color){const el=document.getElementById('toast');el.textContent=msg;el.style.background=color||'#2C2416';el.classList.add('show');setTimeout(()=>el.classList.remove('show'),3000);}
function openModal(id){const el=document.getElementById('modal-'+id);if(el)el.classList.add('open');}
function closeModal(id){const el=document.getElementById('modal-'+id);if(el)el.classList.remove('open');}
document.addEventListener('click',e=>{
  if(e.target.classList.contains('modal-overlay'))e.target.classList.remove('open');
  const a=e.target.closest('a[href^="#"]');
  if(a){const id=a.getAttribute('href');if(id&&id!=='#'){e.preventDefault();const t=document.querySelector(id);if(t)t.scrollIntoView({behavior:'smooth'});}}
});

// ── LANDING ──
function openFreiwilliger(){openModal('fw');}
function openAdminModal(){openModal('admin-login');}
function showRecht(id){
  document.querySelectorAll('.recht-section').forEach(s=>s.classList.remove('visible'));
  const el=document.getElementById('recht-'+id);
  if(el){el.classList.add('visible');setTimeout(()=>el.scrollIntoView({behavior:'smooth'}),50);}
}

// ── PARTNER ──
function openKontakt(){document.getElementById('partner-form-wrap').scrollIntoView({behavior:'smooth'});}
async function sendPartnerAnfrage(){
  const name=document.getElementById('pf-name').value;
  const email=document.getElementById('pf-email').value;
  const paket=(document.getElementById('pf-paket')&&document.getElementById('pf-paket').value)||'Partner & Sponsoring';
  const msg=document.getElementById('pf-msg').value;
  if(!name||!email){document.getElementById('pf-err').textContent='Name und Email eingeben.';document.getElementById('pf-err').style.display='block';return;}
  document.getElementById('pf-err').style.display='none';
  await sb.from('anfragen').insert({typ:'partner',paket,name,email,nachricht:msg,gelesen:false}).catch(()=>{});
  window.location.href=`mailto:Lucas-wimmer@hotmail.de?subject=Civico Partner: ${paket}&body=Name: ${name}%0AEmail: ${email}%0ANachricht: ${msg}`;
  toast('✓ Anfrage gesendet!');
}

// ── TERMIN ──
async function openTerminModal(kontext){
  document.getElementById('termin-modal-sub').textContent='Gespräch zu: '+kontext;
  const list=document.getElementById('termin-slots-list');
  list.innerHTML='<div style="font-size:13px;color:var(--brown)">Lade...</div>';
  openModal('termin');
  const{data}=await sb.from('gespraechstermine').select('*').eq('gebucht',false).gte('datum',new Date().toISOString().split('T')[0]).order('datum').limit(10);
  if(!data||!data.length){list.innerHTML='<div style="font-size:13px;color:var(--brown)">Keine freien Termine. Bitte per Email anfragen.</div>';return;}
  list.innerHTML=data.map(t=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:12px;background:var(--cream);border-radius:10px;margin-bottom:8px;border:1px solid var(--border)"><div><div style="font-size:14px;font-weight:500">📅 ${new Date(t.datum+'T00:00').toLocaleDateString('de-DE',{weekday:'long',day:'2-digit',month:'long'})} · ${t.zeit} Uhr</div><div style="font-size:12px;color:var(--brown)">${t.typ==='gemeinde'?'Gemeinde-Gespräch':t.typ==='partner'?'Partner-Gespräch':'Demo-Call'}</div></div><button onclick="bucheTermin('${t.id}','${kontext}')" style="background:var(--green);color:#fff;border:none;padding:8px 16px;border-radius:9px;font-size:12px;cursor:pointer;font-family:inherit">Buchen</button></div>`).join('');
}
async function bucheTermin(terminId,kontext){
  const name=prompt('Ihr Name:');const email=prompt('Ihre Email:');
  if(!name||!email)return;
  await sb.from('gespraechstermine').update({gebucht:true,gebucht_von_n