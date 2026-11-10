const $=s=>document.querySelector(s),D=window.DEPTS;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let DB,me=null;const KEYS=['guests','staff','requests'];
/* data layer: JSON files via server.py, else browser fallback */
async function load(){
  try{const r=await fetch('/api/db');if(!r.ok)throw 0;DB=await r.json();DB.mode='server'}
  catch(e){DB=JSON.parse(localStorage.getItem('stayserve_db')||'null')||{guests:[],staff:[],requests:[]};DB.mode='browser'}
}
async function save(){
  if(DB.mode==='server'){for(const k of KEYS){const r=await fetch('/api/save/'+k,{method:'POST',body:JSON.stringify(DB[k])});if(!r.ok)return false}}
  else localStorage.setItem('stayserve_db',JSON.stringify(DB));return true}
const toast=t=>{const e=$('#toast');e.textContent=t;e.style.display='block';setTimeout(()=>e.style.display='none',2200)};
const modal=(t,h)=>{$('#mt').textContent=t;$('#mb').innerHTML=h;$('#modal').classList.add('on')},closeM=()=>$('#modal').classList.remove('on');
const show=id=>{document.querySelectorAll('.view').forEach(v=>v.classList.toggle('on',v.id===id));scrollTo(0,0)};
const logout=()=>{me=null;closeM();show('v-landing')};
const now=()=>new Date().toLocaleString();
document.querySelector('[name=dept]').innerHTML+=Object.keys(D).map(d=>`<option>${d}</option>`).join('');

/* ---- guest auth ---- */
function guestLogin(){
  modal('Login as Guest',`<form id="gl"><input name="email" type="email" placeholder="Email id" required><input name="password" type="password" placeholder="Password" minlength="8" maxlength="16" required><div class="cap"></div><p class="err"></p><button class="btn">Login</button></form>`);
  const f=$('#gl'),cap=Captcha.mount($('#gl .cap'));
  f.onsubmit=e=>{e.preventDefault();if(!cap.verify())return;const v=f.elements,u=DB.guests.find(g=>g.email.toLowerCase()===v.email.value.trim().toLowerCase());
    if(!u){modal('No account found','<p>This email is not registered. Sign up as a new guest?</p><button class="btn" onclick="openSign(\'gs\')">Yes, sign me up</button> <button class="link" onclick="guestLogin()">No, try again</button>');return}
    if(u.password!==v.password.value){$('#gl .err').textContent='Incorrect password.';cap.refresh();return}
    me=u;closeM();$('#gname').textContent=`${u.name} · Room ${u.room}`;show('v-guest')};
}
function staffLogin(){
  modal('Login as Staff',`<form id="sl"><input name="empId" placeholder="Employee ID (6 digits)" inputmode="numeric" pattern="[0-9]{6}" maxlength="6" required><input name="password" type="password" placeholder="Password" minlength="8" maxlength="16" required><div class="cap"></div><p class="err"></p><button class="btn">Login</button></form>`);
  const f=$('#sl'),cap=Captcha.mount($('#sl .cap'));
  f.onsubmit=e=>{e.preventDefault();if(!cap.verify())return;const v=f.elements,u=DB.staff.find(s=>s.empId===v.empId.value);
    if(!u){modal('No account found','<p>This employee ID is not registered. Sign up as new staff?</p><button class="btn" onclick="openSign(\'ss\')">Yes, sign me up</button> <button class="link" onclick="staffLogin()">No, try again</button>');return}
    if(u.password!==v.password.value){$('#sl .err').textContent='Incorrect password.';cap.refresh();return}
    me=u;closeM();$('#sname').textContent=`${u.name} · ${u.dept}`;staffHome();show('v-staff')};
}
const caps={};
function openSign(k){closeM();const f=$('#'+k);f.reset();f.querySelector('.err').textContent='';show(k==='gs'?'v-gsign':'v-ssign');caps[k]=Captcha.mount(f.querySelector('.cap'))}
async function signUp(e,k,list,dupMsg,build){e.preventDefault();const f=e.target,v=f.elements,err=f.querySelector('.err');
  if(!caps[k].verify())return;const d=dupMsg(v);if(d){err.textContent=d;return}
  const rec=build(v);DB[list].push(rec);if(!await save()){DB[list].pop();err.textContent='Could not save (duplicate details?).';return}
  modal('Registered',`<p>Your account has been created. Please log in.</p><button class="btn" onclick="show('v-login');${list==='guests'?'guestLogin':'staffLogin'}()">Go to login</button>`)}
$('#gs').onsubmit=e=>signUp(e,'gs','guests',v=>DB.guests.some(g=>g.email.toLowerCase()===v.email.value.trim().toLowerCase())&&'This email id is already registered. Use a different email id.',
  v=>({name:v.name.value.trim(),mobile:v.mobile.value,email:v.email.value.trim(),room:v.room.value,password:v.password.value}));
$('#ss').onsubmit=e=>signUp(e,'ss','staff',v=>DB.staff.some(s=>s.email.toLowerCase()===v.email.value.trim().toLowerCase())?'This email id is already registered.':DB.staff.some(s=>s.empId===v.empId.value)?'This employee ID is already registered.':'',
  v=>({name:v.name.value.trim(),empId:v.empId.value,email:v.email.value.trim(),dept:v.dept.value,password:v.password.value}));

/* ---- guest dashboard ---- */
const mine=()=>DB.requests.filter(r=>r.guest===me.email).reverse();
function newM(){
  modal('New Service Request',`<form id="nr"><select name="dept" required><option value="">Department</option>${Object.keys(D).map(d=>`<option>${d}</option>`).join('')}</select>
  <select name="cat" required><option value="">Select department first</option></select><textarea name="det" placeholder="Describe your request" maxlength="300" required></textarea>
  <select name="pri"><option>Normal</option><option>Urgent</option></select><select name="when"><option>As soon as possible</option><option>Within 1 hour</option><option>This evening</option><option>Tomorrow morning</option></select>
  <button class="btn">Submit request</button></form>`);
  const f=$('#nr'),v=f.elements;v.dept.onchange=()=>v.cat.innerHTML=(D[v.dept.value]||[]).map(c=>`<option>${c}</option>`).join('')||'<option value="">Select department first</option>';
  f.onsubmit=async e=>{e.preventDefault();DB.requests.push({id:'REQ'+(1001+DB.requests.length),guest:me.email,guestName:me.name,room:me.room,dept:v.dept.value,cat:v.cat.value,details:v.det.value.trim(),priority:v.pri.value,when:v.when.value,status:'Pending',created:now(),ts:Date.now(),staff:'',note:'',rating:0});
    await save();myM();toast('Request submitted')};
}
function myM(){
  const rows=mine().map(r=>`<div class="row ${r.priority==='Urgent'?'urg':''}"><div><b>${r.id}</b> · ${r.dept} – ${esc(r.cat)} ${r.priority==='Urgent'?'<span class="tag">URGENT</span>':''}<br>${esc(r.details)}<br><small>${r.created} · ${r.when}</small><br>Status: <b class="st-${r.status.replace(' ','-')}">${r.status}</b>${r.staff?' · Handled by '+esc(r.staff):''}${r.note?'<br>Staff note: '+esc(r.note):''}${r.rating?'<br>Your rating: '+'★'.repeat(r.rating):''}</div>
  <div>${r.status==='Pending'?`<button class="del" onclick="setS('${r.id}','Cancelled')">Cancel</button>`:''}${r.status==='Completed'&&!r.rating?[1,2,3,4,5].map(n=>`<button class="btn sm" onclick="rate('${r.id}',${n})">${n}★</button>`).join(''):''}</div></div>`).join('')||'<p>No requests yet.</p>';
  modal('My Requests',rows)}
const find=id=>DB.requests.find(r=>r.id===id);
async function setS(id,s,extra={}){Object.assign(find(id),{status:s},extra);await save();me.dept?qM(window._k):myM()}
async function rate(id,n){find(id).rating=n;await save();myM();toast('Thanks for rating')}
function svcM(){modal('Hotel Services',Object.entries(D).map(([d,c])=>`<h3>${d}</h3><p>${c.join(' · ')}</p>`).join(''))}

/* ---- staff dashboard ---- */
const dq=()=>DB.requests.filter(r=>r.dept===me.dept);
function staffHome(){const q=dq(),c=s=>q.filter(r=>r.status===s).length;
  $('#scards').innerHTML=`<div class="card" onclick="qM('Pending')"><h3>Pending <span class="badge">${c('Pending')}</span></h3></div><div class="card" onclick="qM('In Progress')"><h3>In Progress <span class="badge">${c('In Progress')}</span></h3></div><div class="card" onclick="qM('Completed')"><h3>Completed <span class="badge">${c('Completed')}</span></h3></div><div class="card" onclick="ovM()"><h3>Overview</h3></div>`}
function qM(k){window._k=k;const q=dq().filter(r=>r.status===k).sort((a,b)=>(b.priority==='Urgent')-(a.priority==='Urgent')||a.ts-b.ts);
  const act=r=>k==='Pending'?`<button class="btn sm ok" onclick="setS('${r.id}','In Progress',{staff:me.name})">Accept</button>`:k==='In Progress'?`<button class="btn sm ok" onclick="done('${r.id}')">Complete</button>`:r.rating?'★'.repeat(r.rating):'';
  modal(k+' Requests',q.map(r=>`<div class="row ${r.priority==='Urgent'?'urg':''}"><div><b>${r.id}</b> · Room ${r.room} · ${esc(r.guestName)} ${r.priority==='Urgent'?'<span class="tag">URGENT</span>':''}<br>${esc(r.cat)}: ${esc(r.details)}<br><small>${r.created} · Wanted: ${r.when}${r.staff?' · '+esc(r.staff):''}</small>${r.note?'<br>Note: '+esc(r.note):''}</div><div>${act(r)}</div></div>`).join('')||'<p>Nothing here.</p>');staffHome()}
function done(id){const n=prompt('Completion note for the guest (optional):');if(n!==null)setS(id,'Completed',{note:n.trim(),staff:me.name})}
function ovM(){const q=dq(),c=s=>q.filter(r=>r.status===s).length,rt=q.filter(r=>r.rating);
  modal(me.dept+' Overview',`<table><tr><td>Total requests</td><td>${q.length}</td></tr><tr><td>Pending</td><td>${c('Pending')} (${q.filter(r=>r.status==='Pending'&&r.priority==='Urgent').length} urgent)</td></tr><tr><td>In progress</td><td>${c('In Progress')}</td></tr><tr><td>Completed</td><td>${c('Completed')}</td></tr><tr><td>Cancelled</td><td>${c('Cancelled')}</td></tr><tr><td>Average guest rating</td><td>${rt.length?(rt.reduce((a,r)=>a+r.rating,0)/rt.length).toFixed(1)+' / 5':'No ratings yet'}</td></tr></table>`)}
load();
