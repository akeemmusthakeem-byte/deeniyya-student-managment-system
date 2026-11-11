const $=id=>document.getElementById(id);
const e=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const KEY='aldheeniyya_v2';
const req=['Birth Certificate','Admission Form','Parent / Guardian Document','Medical Record'];
const sreq=['NIC Copy','Academic Certificate','Appointment Letter'];
const TYPES=['Birth Certificate','NIC Copy','Admission Form','School Leaving Certificate','Medical Record','Parent / Guardian Document','Academic Certificate','Appointment Letter','Mark Sheet','Other'];
const COLL={student:'students',staff:'staff',doc:'docs'};
const F={
student:['student',[['photo','Profile picture','photo'],['id','Student ID *'],['name','Full name *'],['dob','Date of birth','date'],['gender','Gender','select',['Male','Female']],['cls','Class / grade'],['guardian','Guardian name'],['phone','Phone'],['admit','Admission date','date'],['status','Status','select',['Active','Inactive','Passed Out']],['address','Address','textarea']]],
staff:['teacher / staff member',[['photo','Profile picture','photo'],['id','Employee ID *'],['name','Full name *'],['dob','Date of birth','date'],['designation','Designation'],['dept','Department'],['phone','Phone'],['joined','Date joined','date'],['nic','NIC / ID reference'],['type','Employment type','select',['Permanent','Contract','Temporary']],['status','Status','select',['Active','Inactive']],['notes','Address / notes','textarea']]],
doc:['document',[['id','Student / Employee ID *','list'],['type','Document type *','select',TYPES],['ref','Reference number'],['date','Document date','date'],['status','Status','select',['Verified','Pending','Expired']],['file','Upload file (PDF, Excel, Word or image)','file'],['notes','Notes','textarea']]]};
const seed=()=>({pw:'admin123',marks:[],att:[],
students:[
{id:'STU-2026-0001',name:'Mohamed Ahamed',dob:'2009-04-12',gender:'Male',cls:'Year 1',guardian:'Ahamed Fawzi',phone:'0771234567',status:'Active'},
{id:'STU-2026-0002',name:'Abdul Hakeem',dob:'2008-09-18',gender:'Male',cls:'Year 2',guardian:'M. Hakeem',phone:'0712345678',status:'Active'},
{id:'STU-2026-0003',name:'Ibrahim Niyas',dob:'2007-02-22',gender:'Male',cls:'Year 3',guardian:'Niyas Ahamed',phone:'0763456789',status:'Active'},
{id:'STU-2026-0004',name:'Ahamed Rishad',dob:'2010-06-05',gender:'Male',cls:'Year 1',guardian:'Rishad M.',phone:'0754567890',status:'Inactive'}],
staff:[
{id:'EMP-0001',name:'M. A. Rahman',designation:'Principal',dept:'Administration',phone:'0771111111',joined:'2018-01-05',type:'Permanent',status:'Active'},
{id:'EMP-0002',name:'A. F. Sameer',designation:'Lecturer',dept:'Arabic',phone:'0772222222',joined:'2020-06-10',type:'Permanent',status:'Active'},
{id:'EMP-0003',name:'S. N. Fathima',designation:'Office Clerk',dept:'Administration',phone:'0773333333',joined:'2021-03-15',type:'Contract',status:'Active'}],
docs:[
{id:'STU-2026-0001',name:'Mohamed Ahamed',type:'Birth Certificate',ref:'BC-1001',date:'2026-01-12',status:'Verified'},
{id:'STU-2026-0001',name:'Mohamed Ahamed',type:'Admission Form',ref:'ADM-2026-001',date:'2026-01-05',status:'Verified'},
{id:'STU-2026-0002',name:'Abdul Hakeem',type:'NIC Copy',ref:'NIC-2201',date:'2026-02-11',status:'Verified'},
{id:'STU-2026-0003',name:'Ibrahim Niyas',type:'Medical Record',ref:'MED-031',date:'2026-02-18',status:'Pending'},
{id:'STU-2026-0004',name:'Ahamed Rishad',type:'Academic Certificate',ref:'AC-004',date:'2026-03-01',status:'Verified'}]});
const SB_URL='https://vmkgowilnevgnczqcidq.supabase.co',SB_KEY='sb_publishable_nroVv5Ypye1o6L9_07UShw_fqmasjS5',AK='adm_online_auth';
let C={tok:null,ref:null,exp:0,uid:null,email:null};
let db={students:[],staff:[],docs:[],marks:[],att:[],profiles:[],audit:[],org:{},wish:{},wishSent:{},log:[],changes:0};
const cloud={busy:false,again:false,dirty:false,t:null,err:'',at:0,base:null,sig:''},enc=encodeURIComponent;
const hdr=a=>{const h={apikey:SB_KEY,'Content-Type':'application/json'};if(a!==false&&C.tok)h.Authorization='Bearer '+C.tok;return h};
async function jfetch(url,opt){let r;try{r=await fetch(url,opt)}catch(x){throw new Error('No internet connection.')}
 const tx=await r.text();let b=null;try{b=tx?JSON.parse(tx):null}catch(x){b=tx}
 if(!r.ok){const er=new Error((b&&(b.message||b.msg||b.error_description||b.error))||('Error '+r.status));er.status=r.status;throw er}return b}
const authCall=(p,body,tok)=>jfetch(SB_URL+'/auth/v1/'+p,{method:p=='user'?'PUT':'POST',headers:{...hdr(false),...(tok?{Authorization:'Bearer '+tok}:{})},body:JSON.stringify(body)});
function setSess(b){C.tok=b.access_token;C.ref=b.refresh_token;C.exp=Date.now()+(b.expires_in||3600)*1000;if(b.user){C.uid=b.user.id;C.email=b.user.email}try{localStorage.setItem(AK,JSON.stringify({ref:C.ref}))}catch(x){}}
async function refreshTok(){setSess(await authCall('token?grant_type=refresh_token',{refresh_token:C.ref}))}
async function fresh(){if(C.ref&&C.exp-Date.now()<90000)await refreshTok()}
async function rest(path,o={}){await fresh();const h=hdr();if(o.prefer)h.Prefer=o.prefer;return jfetch(SB_URL+'/rest/v1/'+path,{method:o.method||'GET',headers:h,body:o.body===undefined?undefined:JSON.stringify(o.body)})}
async function restAll(path){let out=[],i=0;for(;;){await fresh();let b;try{b=await jfetch(SB_URL+'/rest/v1/'+path,{headers:{...hdr(),Range:`${i}-${i+999}`}})}catch(x){if(x.status==416)break;throw x}out=out.concat(b);if(b.length<1000)break;i+=1000}return out}
const sfolder=id=>String(id).replace(/[^A-Za-z0-9._-]/g,'_'),spath=p=>p.split('/').map(enc).join('/');
async function stReq(method,path,body,mime){await fresh();const h={apikey:SB_KEY,Authorization:'Bearer '+C.tok};if(mime)h['Content-Type']=mime;let r;try{r=await fetch(SB_URL+'/storage/v1/object/'+(method=='GET'?'authenticated/':'')+'docs/'+spath(path),{method,headers:h,body})}catch(x){throw new Error('No internet connection.')}
 if(!r.ok){let m='File request failed';try{m=(await r.json()).message||m}catch(x){}throw new Error(m)}return method=='GET'?r.blob():null}
async function cloudUpload(owner,blob,name){const path=sfolder(owner)+'/'+crypto.randomUUID()+'-'+String(name||'file').replace(/[^A-Za-z0-9._-]/g,'_').slice(-60);await stReq('POST',path,blob,blob.type||'application/octet-stream');return path}
const nmOf=id=>{const x=db.students.find(s=>s.id==id)||db.staff.find(s=>s.id==id);return x?x.name:''};
const J=JSON.stringify;
const COLS={
 students:{t:'students',on:'id',key:r=>r.id,row:r=>({id:r.id,cls:r.cls||'',status:r.status||'Active',data:r}),del:r=>'id=eq.'+enc(r.id)},
 staff:{t:'staff',on:'id',key:r=>r.id,row:r=>({id:r.id,status:r.status||'Active',data:r}),del:r=>'id=eq.'+enc(r.id)},
 docs:{t:'documents',on:'uid',key:r=>r.uid,row:r=>({uid:r.uid,owner_id:r.id,type:r.type,ref:r.ref||'',doc_date:r.date||'',status:r.status||'Pending',notes:r.notes||'',file_path:r.file&&String(r.file.fid).startsWith('cloud:')?r.file.fid.slice(6):null,file_name:r.file?r.file.name:null,mime:r.file?r.file.mime||null:null,size:r.file?Math.round(r.file.size||0):null}),del:r=>'uid=eq.'+r.uid},
 marks:{t:'marks',on:'student_id,exam,year,subject',key:r=>[r.id,r.exam,r.year,r.subject].join('|'),row:r=>({student_id:r.id,exam:r.exam,year:+r.year,subject:r.subject,marks:r.marks==null?null:+r.marks,max:+r.max,remarks:r.remarks||''}),del:r=>`student_id=eq.${enc(r.student_id)}&exam=eq.${enc(r.exam)}&year=eq.${r.year}&subject=eq.${enc(r.subject)}`},
 att:{t:'attendance',on:'student_id,month',key:r=>r.id+'|'+r.month,row:r=>({student_id:r.id,month:r.month,days:+r.days,present:+r.present}),del:r=>`student_id=eq.${enc(r.student_id)}&month=eq.${r.month}`}};
const ORDER=['students','staff','docs','marks','att'],SETK=['org','wish','wishSent'];
function snapAll(){const s={};ORDER.forEach(c=>{const m=new Map();(db[c]||[]).forEach(r=>{const row=COLS[c].row(r);m.set(COLS[c].key(r),{j:J(row),row})});s[c]=m});s.settings=new Map(SETK.map(k=>[k,{j:J(db[k]||{}),row:{key:k,value:db[k]||{}}}]));return s}
function setSync(){const el=$('sync');if(!el)return;let t,c='';if(cloud.err){t='⚠ Not saved. Click to retry';c='bad'}else if(cloud.busy||cloud.dirty){t='● Saving…';c='warn'}else{t='● Online'+(cloud.at?' · '+new Date(cloud.at).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'}):'')}el.textContent=t;el.className='user '+c}
function cloudQueue(){cloud.dirty=true;clearTimeout(cloud.t);cloud.t=setTimeout(cloudPush,600);setSync()}
async function cloudPush(){
 if(!C.tok)return;if(cloud.busy){cloud.again=true;return}
 cloud.busy=true;cloud.again=false;setSync();
 try{db.docs.forEach(d=>{if(!d.uid)d.uid=crypto.randomUUID()});const now=snapAll(),base=cloud.base||snapAll();
  for(const c of [...ORDER,'settings']){const up=[];now[c].forEach((v,k)=>{const b=base[c].get(k);if(!b||b.j!=v.j)up.push(v.row)});
   for(let i=0;i<up.length;i+=100)await rest((c=='settings'?'settings':COLS[c].t)+'?on_conflict='+(c=='settings'?'key':COLS[c].on),{method:'POST',body:up.slice(i,i+100),prefer:'resolution=merge-duplicates,return=minimal'})}
  for(const c of [...ORDER].reverse()){const dl=[];base[c].forEach((v,k)=>{if(!now[c].has(k))dl.push(v.row)});for(const r of dl)await rest(COLS[c].t+'?'+COLS[c].del(r),{method:'DELETE'})}
  cloud.base=now;cloud.err='';cloud.at=Date.now();cloud.dirty=false}
 catch(x){cloud.err=x.message;clearTimeout(cloud.t);cloud.t=setTimeout(cloudPush,15000);toast('Could not save to the college database: '+x.message,'err')}
 finally{cloud.busy=false;setSync();if(cloud.again){cloud.again=false;cloudQueue()}}}
async function cloudLoad(force){
 const [st,sf,dc,mk,at,se,pf,au]=await Promise.all([restAll('students?select=*&order=id'),restAll('staff?select=*&order=id'),restAll('documents?select=*&order=updated_at.desc'),restAll('marks?select=*'),restAll('attendance?select=*'),rest('settings?select=*'),rest('profiles?select=*&order=created_at'),rest('audit_log?select=*&order=at.desc&limit=200')]);
 const n={students:st.map(r=>({...r.data,id:r.id,cls:r.cls||r.data.cls||'',status:r.status})),staff:sf.map(r=>({...r.data,id:r.id,status:r.status})),
  marks:mk.map(x=>({id:x.student_id,exam:x.exam,year:x.year,subject:x.subject,marks:x.marks===null?null:+x.marks,max:+x.max,remarks:x.remarks||''})),att:at.map(a=>({id:a.student_id,month:a.month,days:a.days,present:a.present})),profiles:pf,audit:au};
 const lk=Object.fromEntries(se.map(r=>[r.key,r.value]));n.org=lk.org||{};n.wish=lk.wish||{};n.wishSent=lk.wishSent||{};
 n.docs=dc.map(r=>({uid:r.uid,id:r.owner_id,type:r.type,ref:r.ref,date:r.doc_date,status:r.status,notes:r.notes,...(r.file_path?{file:{fid:'cloud:'+r.file_path,name:r.file_name,size:r.size,mime:r.mime}}:{})}));
 const sig=J(n);if(!force&&sig==cloud.sig)return false;cloud.sig=sig;Object.assign(db,n);db.docs.forEach(d=>{d.name=nmOf(d.id)});cloud.base=snapAll();cloud.at=Date.now();setSync();return true}
async function cloudPoll(manual){if(!C.tok||cloud.busy||(cloud.dirty&&!manual)||document.querySelector('.modal.open'))return;try{cloud.err='';if(await cloudLoad())renderAll();setSync()}catch(x){cloud.err=x.message;setSync()}}
function syncNow(){if(cloud.err||cloud.dirty){clearTimeout(cloud.t);cloudPush()}else cloudPoll(true).then(()=>toast('Up to date'))}
const save=q=>{if(!q)db.changes=(db.changes||0)+1;cloudQueue()};
const TITLES={dashboard:'Dashboard',students:'Students',staff:'Teachers & Staff',documents:'Documents',reports:'Reports',settings:'Settings',marks:'Mark Sheets',attendance:'Attendance',birthdays:'Staff Birthdays',teachers:'Class Teachers'};
let cur={},dId=null,tt;

const av=(r,c='')=>r.photo?`<img class="av ${c}" src="${r.photo}" alt="">`:`<span class="av ${c}">${e((r.name||'?').trim().split(/\s+/).map(w=>w[0]).slice(0,2).join('').toUpperCase())}</span>`;
const kb=n=>n>1048576?(n/1048576).toFixed(1)+' MB':Math.max(1,Math.round(n/1024))+' KB';
const idb=()=>new Promise((res,rej)=>{const q=indexedDB.open('ad_files',1);q.onupgradeneeded=()=>q.result.createObjectStore('f');q.onsuccess=()=>res(q.result);q.onerror=()=>rej(q.error)});
const tx=(m,fn)=>idb().then(d=>new Promise((res,rej)=>{const t=d.transaction('f',m),r=fn(t.objectStore('f'));t.oncomplete=()=>res(r.result);t.onerror=()=>rej(t.error)}));
const putFile=(k,b)=>tx('readwrite',s=>s.put(b,k)),getFile=k=>String(k).startsWith('cloud:')?stReq('GET',k.slice(6)):tx('readonly',s=>s.get(k)),delFile=k=>String(k).startsWith('cloud:')?stReq('DELETE',k.slice(6)).catch(()=>{}):tx('readwrite',s=>s.delete(k)).catch(()=>{});
const XL='https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',JP='https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',JT='https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js';
const loadJS=u=>new Promise((res,rej)=>{if(document.querySelector(`script[src="${u}"]`))return res();const x=document.createElement('script');x.src=u;x.onload=res;x.onerror=()=>rej();document.head.appendChild(x)});
const ex=k=>`<span class="exp noprint"><button class="btn secondary" onclick="window.print()">Print</button><button class="btn secondary" onclick="exp('${k}','pdf')">PDF</button><button class="btn secondary" onclick="exp('${k}','xlsx')">Excel</button></span> `;
async function saveFile(name,data){
 try{const dl=window.claude&&await claude.use('downloads');
  if(dl){await dl.save({filename:name,data});toast('File saved');return true}}
 catch(x){if(x&&x.code){toast(x.code=='declined'?'Save cancelled.':'This file type could not be saved here.','err');return false}}
 const a=document.createElement('a');a.href=URL.createObjectURL(data instanceof Blob?data:new Blob([data]));a.download=name;document.body.appendChild(a);a.click();a.remove();return true}
function pickPhoto(inp){const f=inp.files[0];if(!f)return;const rd=new FileReader(),im=new Image();
 im.onload=()=>{const z=Math.min(1,240/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.round(im.width*z);c.height=Math.round(im.height*z);c.getContext('2d').drawImage(im,0,0,c.width,c.height);cur.photo=c.toDataURL('image/jpeg',.8);$('pvw').innerHTML=av({photo:cur.photo},'lg')};
 im.onerror=()=>toast('That file is not a readable image.','err');rd.onload=()=>{im.src=rd.result};rd.readAsDataURL(f)}
function clearPhoto(){cur.photo='';$('pvw').innerHTML=av({name:$('f_name')?.value},'lg');$('f_photo').value=''}
async function viewFile(j){const d=db.docs[j];let b;try{b=await getFile(d.file.fid)}catch(x){}
 if(!b)return toast('This file is not stored in this browser.','err');
 if(/^image\//.test(d.file.mime)){const rd=new FileReader();rd.onload=()=>{$('mvb').innerHTML=`<h2 style="margin-bottom:10px">${e(d.type)}</h2><img src="${rd.result}" alt="" style="max-width:100%;max-height:68vh"><div class="foot" style="justify-content:center"><button class="btn primary" id="svb">Save a copy</button><button class="btn secondary" onclick="$('mview').classList.remove('open')">Close</button></div>`;$('svb').onclick=()=>saveFile(d.file.name,b);$('mview').classList.add('open')};rd.readAsDataURL(b)}
 else saveFile(d.file.name,b)}
function printDrawer(){document.body.classList.add('pd');window.print();setTimeout(()=>document.body.classList.remove('pd'),600)}
const DEFAULT_LOGO="/images/logo.png";
const GR=p=>p>=75?'A':p>=65?'B':p>=50?'C':p>=35?'S':'W';
const stu=id=>db.students.find(s=>s.id==id)||{};
const mg=[];
const gstat=g=>{const v=g.rows.filter(r=>r.marks!=null),t=v.reduce((a,r)=>a+r.marks,0),mx=v.reduce((a,r)=>a+r.max,0);return{t,mx,p:mx?t/mx*100:0,n:g.rows.length}};
function groups(){const m=new Map();db.marks.forEach(x=>{const k=x.id+'|'+x.exam+'|'+x.year;if(!m.has(k))m.set(k,{id:x.id,exam:x.exam,year:x.year,rows:[]});m.get(k).rows.push(x)});return [...m.values()]}
function rMarks(){
 const q=$('mq').value.toLowerCase(),ex0=$('mex').value,cl0=$('mcl').value,all=groups();
 $('mex').innerHTML='<option value="">All exams</option>'+[...new Set(all.map(g=>g.exam))].map(x=>`<option ${x==ex0?'selected':''}>${e(x)}</option>`).join('');
 $('mcl').innerHTML='<option value="">All classes</option>'+[...new Set(db.students.map(x=>x.cls).filter(Boolean))].sort().map(x=>`<option ${x==cl0?'selected':''}>${e(x)}</option>`).join('');
 const a=all.filter(g=>{const t=stu(g.id);return(!q||(g.id+' '+(t.name||'')).toLowerCase().includes(q))&&(!ex0||g.exam==ex0)&&(!cl0||t.cls==cl0)});
 $('marksTable').innerHTML=a.length?a.map(g=>{const t=stu(g.id),z=gstat(g);return `<tr onclick="markSheet(${mg.push(g)-1})"><td>${av(t)}<b>${e(t.name||g.id)}</b></td><td>${e(g.id)}</td><td>${e(t.cls)||'—'}</td><td>${e(g.exam)} (${e(g.year)})</td><td>${z.n}</td><td>${z.t} / ${z.mx}</td><td>${z.p.toFixed(1)}%</td><td>${badge(GR(z.p))}</td></tr>`}).join(''):empty(8,db.marks.length?'No results match. Clear the search or filters.':'No marks yet. Download the template, fill it in and upload it above.')}
function resBlock(id){const a=groups().filter(g=>g.id==id);return `<h3>Exam results (${a.length})</h3><ul class="rows">${a.length?a.map(g=>{const z=gstat(g);return `<li><span>${e(g.exam)} (${e(g.year)})<br><small class="muted">${z.t} / ${z.mx} · ${z.p.toFixed(1)}%</small></span><span>${badge(GR(z.p))} <button class="btn secondary sm noprint" onclick="markSheet(${mg.push(g)-1})">Mark sheet</button></span></li>`}).join(''):'<li class="muted">No marks uploaded yet.</li>'}</ul>`}
async function markTemplate(){try{await loadJS(XL)}catch(x){return toast('Could not load the Excel library. Check your internet connection.','err')}
 const id=db.students[0]?.id||'STU-2026-0001',wb=XLSX.utils.book_new();
 XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet([{'Student ID':id,'Exam':'First Term Exam','Year':new Date().getFullYear(),'Subject':'Mathematics','Marks':78,'Full Marks':100,'Remarks':''},{'Student ID':id,'Exam':'First Term Exam','Year':new Date().getFullYear(),'Subject':'Arabic','Marks':85,'Full Marks':100,'Remarks':''}]),'One row per subject');
 XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet([{'Student ID':id,'Mathematics':78,'Arabic':85,'Science':'AB'}]),'One column per subject');
 saveFile('Al-Dheeniyya-Marks-Template.xlsx',new Blob([XLSX.write(wb,{bookType:'xlsx',type:'array'})]))}
async function importMarks(){
 const f=$('m_file').files[0],out=$('m_res');
 if(!f)return toast('Choose an Excel or CSV file first.','err');
 try{await loadJS(XL)}catch(x){return toast('Could not load the Excel reader. Check your internet connection.','err')}
 const rd=new FileReader();
 rd.onload=()=>{try{
  const wb=XLSX.read(new Uint8Array(rd.result),{type:'array'}),rows=XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]],{defval:''});
  if(!rows.length)throw new Error('The file is empty.');
  const nh=h=>String(h??'').trim().toLowerCase().replace(/[\s_\-\/\.]+/g,''),get=(row,ns)=>{for(const k of Object.keys(row))if(ns.includes(nh(k)))return row[k];return ''};
  const META=['studentid','id','admissionno','name','studentname','class','grade','exam','examname','term','year','fullmarks','maxmarks','max','remarks','remark','total','average','rank','percentage','subject','marks','mark','score'];
  snap('Before marks import');const dEx=$('m_exam').value.trim(),dYr=+$('m_year').value||new Date().getFullYear(),dMax=+$('m_max').value||100;
  let add=0,upd=0,skip=0;const errs=[];
  rows.forEach((row,i)=>{const ln=i+2,sid=String(get(row,['studentid','id','admissionno'])).trim();
   if(!sid){skip++;errs.push(`Row ${ln}: Student ID is missing`);return}
   if(!db.students.some(x=>x.id==sid)){skip++;errs.push(`Row ${ln}: no student with ID ${sid}`);return}
   const exam=String(get(row,['exam','examname','term'])).trim()||dEx,year=+get(row,['year'])||dYr,max=+get(row,['fullmarks','maxmarks','max'])||dMax,rem=String(get(row,['remarks','remark'])).trim(),sub=String(get(row,['subject'])).trim();
   if(!exam){skip++;errs.push(`Row ${ln}: no exam name (type one above or add an Exam column)`);return}
   const items=sub?[[sub,get(row,['marks','mark','score'])]]:Object.keys(row).filter(k=>String(k).trim()&&!META.includes(nh(k))).map(k=>[String(k).trim(),row[k]]);
   if(!items.length){skip++;errs.push(`Row ${ln}: no subject or marks found`);return}
   items.forEach(([sj,v])=>{if(v===''||v==null)return;const ab=/^(ab|absent|a)$/i.test(String(v).trim()),n=ab?null:Number(v);
    if(!ab&&(isNaN(n)||n<0||n>max)){skip++;errs.push(`Row ${ln}: invalid mark "${v}" for ${sj}`);return}
    const ex=db.marks.find(m=>m.id==sid&&m.exam==exam&&m.year==year&&m.subject==sj);
    if(ex){ex.marks=n;ex.max=max;if(rem)ex.remarks=rem;upd++}else{db.marks.push({id:sid,exam,year,subject:sj,marks:n,max,remarks:rem});add++}})});
  logA(`Imported marks: ${add} added, ${upd} updated`);save();renderAll();$('m_file').value='';
  out.innerHTML=`<div style="background:var(--greenbg);border-radius:8px;padding:12px 14px;font-size:13px"><b>Import finished.</b> ${add} added, ${upd} updated, ${skip} skipped.${errs.length?`<ul style="margin:8px 0 0;padding-left:18px">${errs.slice(0,8).map(x=>`<li>${e(x)}</li>`).join('')}${errs.length>8?`<li>and ${errs.length-8} more</li>`:''}</ul>`:''}</div>`;
  toast(`${add+upd} marks saved`)
 }catch(x){out.innerHTML=`<div style="background:var(--redbg);border-radius:8px;padding:12px 14px;font-size:13px"><b>Import failed:</b> ${e(x.message||'The file could not be read.')}</div>`}};
 rd.readAsArrayBuffer(f)}
function markSheet(gi){const g=mg[gi],s=stu(g.id),o=org(),z=gstat(g),rem=(g.rows.find(r=>r.remarks)||{}).remarks||'';
 const tr=g.rows.map(r=>{const q=r.marks==null?null:r.marks/r.max*100;return `<tr><td>${e(r.subject)}</td><td>${r.marks==null?'AB':r.marks}</td><td>${r.max}</td><td>${q==null?'—':q.toFixed(1)}</td><td>${q==null?'—':GR(q)}</td></tr>`}).join('');
 const body=`<div class="ms">${o.logo?`<img class="mswm" src="${o.logo}" alt="">`:''}<div class="msh">${o.logo?`<img src="${o.logo}" alt="">`:''}<div><h2>${e(o.name)}</h2>${orgSub(o)}</div></div><h1>Mark Sheet</h1>
<div class="msi">${av(s,'lg')}<dl><dt>Name</dt><dd><b>${e(s.name||g.id)}</b></dd><dt>Student ID</dt><dd>${e(g.id)}</dd><dt>Class</dt><dd>${e(s.cls)||'—'}</dd><dt>Examination</dt><dd>${e(g.exam)} (${e(g.year)})</dd></dl></div>
<table class="mst"><thead><tr><th>Subject</th><th>Marks</th><th>Full marks</th><th>Percent</th><th>Grade</th></tr></thead><tbody>${tr}</tbody><tfoot><tr><td>Total</td><td>${z.t}</td><td>${z.mx}</td><td>${z.p.toFixed(1)}</td><td>${GR(z.p)}</td></tr></tfoot></table>
${rem?`<p style="font:10.5pt 'Segoe UI',sans-serif"><b>Remarks:</b> ${e(rem)}</p>`:''}<p style="font:9pt 'Segoe UI',sans-serif;color:#66767f">Grades: A 75 and above, B 65 to 74, C 50 to 64, S 35 to 49, W below 35. AB means absent.</p>
<div class="cf" style="margin-top:22mm;font-size:10pt"><div class="sig"><i style="width:45mm"></i>Class teacher</div><div class="sig"><i style="width:45mm"></i>${e(o.principal)||'Principal'}</div></div></div>`;
 showPrint('Mark sheet: '+(s.name||g.id),`<div class="toolbar"><button class="btn danger sm" onclick="delMarks(${gi})">Delete these marks</button></div>`,body,'portrait')}
function delMarks(gi){const g=mg[gi];if(!confirm(`Delete all ${g.rows.length} marks for ${g.exam} (${g.year})? This cannot be undone.`))return;snap('Before deleting marks');logA('Deleted marks: '+g.exam+' '+g.year);db.marks=db.marks.filter(m=>!(m.id==g.id&&m.exam==g.exam&&m.year==g.year));save();$('mprint').classList.remove('open');renderAll();toast('Marks deleted')}
const IM={
student:{label:'students',map:{id:['studentid','id','admissionno','admissionnumber','regno'],name:['fullname','name','studentname'],dob:['dateofbirth','dob','birthdate','birthday'],gender:['gender','sex'],cls:['class','classgrade','grade','level'],guardian:['guardianname','guardian','parent','parentname','fathername'],phone:['phone','phonenumber','mobile','contact','telephone'],admit:['admissiondate','admitted','dateofadmission'],status:['status'],address:['address']},
 tpl:['Student ID','Full name','Date of birth','Gender','Class / grade','Guardian name','Phone','Admission date','Status','Address'],ex:['STU-2026-0100','Example Student','2010-05-20','Male','Year 1','Guardian Name','0771234567','2026-01-05','Active','Colombo'],def:{status:'Active'}},
staff:{label:'teachers and staff',map:{id:['employeeid','staffid','id','empid'],name:['fullname','name','staffname','teachername'],designation:['designation','position','title','role'],dept:['department','dept'],phone:['phone','phonenumber','mobile','contact','telephone'],joined:['datejoined','joined','joindate','dateofjoining','joineddate'],dob:['dateofbirth','dob','birthdate','birthday'],nic:['nicidreference','nic','nicno','idnumber'],type:['employmenttype','type','employment'],status:['status'],notes:['addressnotes','notes','address','remarks']},
 tpl:['Employee ID','Full name','Designation','Department','Phone','Date joined','Date of birth','NIC / ID reference','Employment type','Status','Address / notes'],ex:['EMP-0100','Example Teacher','Lecturer','Arabic','0771234567','2026-01-05','1985-03-12','NIC number','Permanent','Active','Colombo'],def:{status:'Active',type:'Permanent'}}};
const hnorm=h=>String(h??'').trim().toLowerCase().replace(/[\s_\-\/\.]+/g,''),hget=(row,ns)=>{for(const k of Object.keys(row))if(ns.includes(hnorm(k)))return row[k];return ''};
const isoD=d=>new Date(d.getTime()+43200000).toISOString().slice(0,10);
function cellV(f,v){
 if(v instanceof Date)return isoD(v);
 if(typeof v=='number'&&f=='phone'){v=String(v);return v.length==9?'0'+v:v}
 v=String(v??'').trim();
 if(['dob','admit','joined'].includes(f)){const a=v.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4})$/);if(a)return `${a[3]}-${a[2].padStart(2,'0')}-${a[1].padStart(2,'0')}`;const b=v.match(/^(\d{4})[\/.\-](\d{1,2})[\/.\-](\d{1,2})/);if(b)return `${b[1]}-${b[2].padStart(2,'0')}-${b[3].padStart(2,'0')}`}
 if(f=='gender')return /^f/i.test(v)?'Female':/^m/i.test(v)?'Male':v;
 if(f=='status')return v?(/^(pass|alumni|graduat|complet)/i.test(v)?'Passed Out':/^(in|left|dis|resign)/i.test(v)?'Inactive':'Active'):'';
 if(f=='type')return v?(['Permanent','Contract','Temporary'].find(x=>x.toLowerCase()==v.toLowerCase())||v):'';
 return v}
function impCard(k){const m=IM[k];return `<div class="card" style="margin:0 0 16px"><div class="toolbar" style="justify-content:space-between;margin-bottom:10px"><div><h2 style="margin:0">Import ${m.label} from Excel</h2><p class="muted" style="margin:4px 0 0;font-size:13px">Add many records in one click. Records with an ID already in the system are updated, and blank cells never erase existing details.</p></div><button class="btn secondary" onclick="impTemplate('${k}')">Download template</button></div>
<label class="drop" ondragover="event.preventDefault();this.classList.add('over')" ondragleave="this.classList.remove('over')" ondrop="dropImp(event,'${k}',this)"><input type="file" id="ifile_${k}" accept=".xlsx,.xls,.csv" onchange="impPick('${k}')"><b id="iname_${k}">Drop an Excel or CSV file here, or click to choose</b><small>Required columns: ${m.tpl[0]} and Full name. Dates as 2010-05-20 or 20/05/2010. You can also re-import a file exported from this system.</small></label>
<div class="toolbar" style="margin:12px 0 0"><button class="btn primary" onclick="importPeople('${k}')">Import ${m.label}</button></div><div id="ires_${k}" style="margin-top:10px"></div></div>`}
function impPick(k){const f=$('ifile_'+k).files[0];$('iname_'+k).textContent=f?`${f.name} (${kb(f.size)}) ready to import`:'Drop an Excel or CSV file here, or click to choose'}
function dropImp(ev,k,el){ev.preventDefault();el.classList.remove('over');const f=ev.dataTransfer.files[0];if(!f)return;const dt=new DataTransfer();dt.items.add(f);$('ifile_'+k).files=dt.files;impPick(k)}
async function impTemplate(k){try{await loadJS(XL)}catch(x){return toast('Could not load the Excel library. Check your internet connection.','err')}
 const m=IM[k],ws=XLSX.utils.aoa_to_sheet([m.tpl,m.ex]);ws['!cols']=m.tpl.map(h=>({wch:Math.max(14,h.length+2)}));const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,k=='staff'?'Staff':'Students');
 saveFile(`Al-Dheeniyya-${k=='staff'?'Staff':'Student'}-Import-Template.xlsx`,new Blob([XLSX.write(wb,{bookType:'xlsx',type:'array'})]))}
async function importPeople(k){
 const m=IM[k],f=$('ifile_'+k).files[0],out=$('ires_'+k);
 if(!f)return toast('Choose an Excel or CSV file first.','err');
 try{await loadJS(XL)}catch(x){return toast('Could not load the Excel reader. Check your internet connection.','err')}
 const rd=new FileReader();
 rd.onload=()=>{try{
  const wb=XLSX.read(new Uint8Array(rd.result),{type:'array',cellDates:true}),rows=XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]],{defval:''});
  if(!rows.length)throw new Error('The file is empty.');
  snap('Before Excel import of '+m.label);const col=db[COLL[k]];let add=0,upd=0,skip=0;const errs=[];
  rows.forEach((row,i)=>{const ln=i+2,r={};
   Object.keys(m.map).forEach(fl=>{r[fl]=cellV(fl,hget(row,m.map[fl]))});
   if(!Object.values(r).some(Boolean))return;
   if(!r.id){skip++;errs.push(`Row ${ln}: ${m.tpl[0]} is missing`);return}
   const ex=col.find(x=>x.id==r.id);
   if(ex){Object.keys(r).forEach(fl=>{if(r[fl])ex[fl]=r[fl]});upd++;return}
   if(!r.name){skip++;errs.push(`Row ${ln}: Full name is missing for ${r.id}`);return}
   const n={...m.def};Object.keys(r).forEach(fl=>{if(r[fl])n[fl]=r[fl]});col.push(n);add++});
  logA(`Imported ${m.label}: ${add} added, ${upd} updated`);save();renderAll();$('ifile_'+k).value='';impPick(k);
  out.innerHTML=`<div style="background:var(--greenbg);border-radius:8px;padding:12px 14px;font-size:13px"><b>Import finished.</b> ${add} added, ${upd} updated, ${skip} skipped.${errs.length?`<ul style="margin:8px 0 0;padding-left:18px">${errs.slice(0,8).map(x=>`<li>${e(x)}</li>`).join('')}${errs.length>8?`<li>and ${errs.length-8} more</li>`:''}</ul>`:''}</div>`;
  toast(`${add} added, ${upd} updated`)
 }catch(x){out.innerHTML=`<div style="background:var(--redbg);border-radius:8px;padding:12px 14px;font-size:13px"><b>Import failed:</b> ${e(x.message||'The file could not be read.')}</div>`}};
 rd.readAsArrayBuffer(f)}
const blobToData=b=>new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res({type:b.type,data:r.result});r.onerror=rej;r.readAsDataURL(b)});
const dataToBlob=d=>{const bin=atob(d.data.split(',')[1]),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);return new Blob([u],{type:d.type})};
function logA(m){db.log=db.log||[];db.log.unshift({t:Date.now(),m});db.log.length=Math.min(db.log.length,100);if(C.tok)rest('audit_log',{method:'POST',body:{who:C.email,action:m},prefer:'return=minimal'}).catch(()=>{})}
let snaps=[];
async function snap(reason){try{const k='snap:'+Date.now()+'|'+reason;await putFile(k,JSON.stringify(db));const ks=(await tx('readonly',x=>x.getAllKeys())).filter(x=>String(x).startsWith('snap:')).sort();for(const x of ks.slice(0,Math.max(0,ks.length-5)))await delFile(x)}catch(x){}}
async function rSafety(){
 const fmt=t=>new Date(t).toLocaleString('en-GB',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});
 $('actlog').innerHTML=(db.log||[]).slice(0,15).map(x=>`<li><span>${e(x.m)}</span><span class="muted">${fmt(x.t)}</span></li>`).join('')||'<li class="muted">No activity yet.</li>';
 try{snaps=(await tx('readonly',x=>x.getAllKeys())).filter(x=>String(x).startsWith('snap:')).sort().reverse();
  $('snaplist').innerHTML=snaps.length?snaps.map((k,i)=>{const [t,...r]=k.slice(5).split('|');return `<li><span>${e(r.join('|'))}<br><small class="muted">${fmt(+t)}</small></span><button class="btn secondary sm" onclick="restoreSnap(${i})">Restore</button></li>`}).join(''):'<li class="muted">No safety copies yet. One is made automatically before risky actions.</li>'}catch(x){$('snaplist').innerHTML='<li class="muted">Safety copies are not available in this browser.</li>'}}
async function restoreSnap(i){const k=snaps[i];let j;try{j=await getFile(k)}catch(x){}
 if(!j)return toast('That safety copy could not be read.','err');
 if(!confirm('Go back to this safety copy? Records changed since then will be replaced. A new safety copy of the current records is kept.'))return;
 await snap('Before restoring a safety copy');db=JSON.parse(j);if(!Array.isArray(db.marks))db.marks=[];if(!Array.isArray(db.att))db.att=[];logA('Restored a safety copy');save(true);renderAll();rSafety();toast('Safety copy restored')}

function getAuditCategory(action){
 const a=String(action||'').toLowerCase();
 if(/password|login|signup|delstaff|delete login|reset password|created login|role|access/i.test(a))return{name:'Security & Auth',badge:'bad'};
 if(/mark|exam|subject|grade/i.test(a))return{name:'Marks & Exams',badge:'warn'};
 if(/attendance|present|absent/i.test(a))return{name:'Attendance',badge:''};
 if(/document|doc|certificate|verified|nic|birth/i.test(a))return{name:'Documents',badge:''};
 if(/backup|restore|safety|snapshot|college details|logo/i.test(a))return{name:'System & Backup',badge:'warn'};
 if(/teacher|staff|employee|designation/i.test(a))return{name:'Staff & Faculty',badge:'info'};
 if(/student|stu-|admission/i.test(a))return{name:'Students',badge:'info'};
 return{name:'General',badge:''};
}

function timeAgo(ts){
 const s=Math.floor((Date.now()-Number(ts))/1000);
 if(isNaN(s)||s<0)return 'Just now';
 if(s<60)return `${s}s ago`;
 const m=Math.floor(s/60);
 if(m<60)return `${m}m ago`;
 const h=Math.floor(m/60);
 if(h<24)return `${h}h ago`;
 const d=Math.floor(h/24);
 if(d<30)return `${d}d ago`;
 return new Date(ts).toLocaleDateString('en-GB',{day:'numeric',month:'short'});
}

function getMergedAuditLogs(){
 const map=new Map();
 (db.audit||[]).forEach(item=>{
  const atTs=item.at?new Date(item.at).getTime():Date.now();
  const key=`${atTs}|${item.action}|${item.who||''}`;
  map.set(key,{
   id:item.id||key,
   at:atTs,
   who:item.who||'Administrator',
   action:item.action,
   source:'Cloud DB'
  });
 });
 (db.log||[]).forEach(item=>{
  const atTs=item.t||Date.now();
  const key=`${atTs}|${item.m}|${C.email||'Current Device'}`;
  if(!map.has(key)){
   map.set(key,{
    id:key,
    at:atTs,
    who:C.email||'Administrator (Current Session)',
    action:item.m,
    source:'Session'
   });
  }
 });
 return Array.from(map.values()).sort((a,b)=>b.at-a.at);
}

function getFilteredAuditLogs(){
 const list=getMergedAuditLogs();
 const q=($('audit_q')?.value||'').trim().toLowerCase();
 const catFilter=$('audit_cat')?.value||'all';
 const actorFilter=$('audit_actor')?.value||'all';
 const fromVal=$('audit_from')?.value;
 const toVal=$('audit_to')?.value;

 let fromTime=null;
 if(fromVal){
  const d=new Date(fromVal+'T00:00:00');
  if(!isNaN(d.getTime()))fromTime=d.getTime();
 }
 let toTime=null;
 if(toVal){
  const d=new Date(toVal+'T23:59:59.999');
  if(!isNaN(d.getTime()))toTime=d.getTime();
 }

 return list.filter(item=>{
  if(fromTime!==null&&item.at<fromTime)return false;
  if(toTime!==null&&item.at>toTime)return false;
  const cat=getAuditCategory(item.action).name;
  if(catFilter!=='all'){
   const normCat=cat.toLowerCase();
   if(catFilter==='student'&&!normCat.includes('student'))return false;
   if(catFilter==='staff'&&!normCat.includes('staff'))return false;
   if(catFilter==='marks'&&!normCat.includes('mark'))return false;
   if(catFilter==='attendance'&&!normCat.includes('attendance'))return false;
   if(catFilter==='document'&&!normCat.includes('doc'))return false;
   if(catFilter==='security'&&!normCat.includes('security'))return false;
   if(catFilter==='backup'&&!normCat.includes('system')&&!normCat.includes('backup'))return false;
  }
  if(actorFilter!=='all'&&item.who!==actorFilter)return false;
  if(q){
   const match=(item.action||'').toLowerCase().includes(q)||
               (item.who||'').toLowerCase().includes(q)||
               cat.toLowerCase().includes(q);
   if(!match)return false;
  }
  return true;
 });
}

function rGlobalAudit(){
 if(!$('auditTableBody'))return;
 const list=getMergedAuditLogs();
 const actorSel=$('audit_actor');
 if(actorSel){
  const curVal=actorSel.value;
  const actors=[...new Set(list.map(x=>x.who).filter(Boolean))].sort();
  actorSel.innerHTML=`<option value="all">All Users / Actors (${actors.length})</option>`+
   actors.map(u=>`<option value="${e(u)}" ${u===curVal?'selected':''}>${e(u)}</option>`).join('');
 }

 const filtered=getFilteredAuditLogs();

 const secCount=list.filter(x=>/password|login|signup|delete|restor/i.test(x.action)).length;
 if($('auditTotalCount'))$('auditTotalCount').textContent=`${list.length} logged events`;
 if($('auditFilterCount'))$('auditFilterCount').textContent=`${filtered.length} showing`;
 if($('auditSecCount'))$('auditSecCount').textContent=`${secCount} security`;
 if($('auditLastMod'))$('auditLastMod').textContent=list.length?timeAgo(list[0].at):'None';

 if(!filtered.length){
  $('auditTableBody').innerHTML=empty(5,list.length?'No audit records match your search or filter.':'No audit records logged yet.');
  return;
 }

 $('auditTableBody').innerHTML=filtered.map(x=>{
  const cat=getAuditCategory(x.action);
  const dateFormatted=new Date(x.at).toLocaleString('en-GB',{
   day:'2-digit',month:'short',year:'numeric',
   hour:'2-digit',minute:'2-digit',second:'2-digit'
  });
  const relativeTime=timeAgo(x.at);
  const isSecurity=/password|login|signup|delete|restor/i.test(x.action);

  return `<tr>
   <td style="white-space:nowrap">
    <strong style="color:var(--emerald-950);font-size:12.5px">${dateFormatted}</strong>
    <div class="muted" style="font-size:11.5px">${relativeTime}</div>
   </td>
   <td>
    <span class="badge ${x.who.includes('admin')?'':'info'}" style="font-size:11px" title="${e(x.who)}">
     ${e(x.who)}
    </span>
   </td>
   <td>
    <span class="badge ${cat.badge}" style="font-size:11px">${cat.name}</span>
   </td>
   <td>
    <div style="font-weight:600;color:var(--text);font-size:13px">${e(x.action)}</div>
   </td>
   <td>
    <span class="badge ${isSecurity?'warn':''}" style="font-size:10.5px">
     ${x.source}
    </span>
   </td>
  </tr>`;
 }).join('');
}

async function refreshGlobalAudit(){
 toast('Refreshing global audit log…');
 if(C.tok){
  try{
   const logs=await rest('audit_log?select=*&order=at.desc&limit=200');
   db.audit=logs;
   rGlobalAudit();
   toast(`Loaded ${logs.length} cloud audit events`);
  }catch(err){
   rGlobalAudit();
   toast('Refreshed local audit view');
  }
 }else{
  rGlobalAudit();
  toast('Audit log updated');
 }
}

function exportAuditLog(fmt){
 const list=getFilteredAuditLogs();
 if(!list.length)return toast('No audit records match the selected date/filter criteria to export.','err');
 const dateStr=new Date().toISOString().slice(0,10);

 if(fmt==='json'){
  const data=JSON.stringify(list,null,2);
  saveFile(`aldheeniyya-global-audit-log-${dateStr}.json`,new Blob([data],{type:'application/json'}));
  toast(`Exported ${list.length} audit records as JSON`);
  return;
 }

 const headers=['Timestamp','Date Formatted','Actor / User','Category','Action Description','Source'];

 const rows=list.map(item=>{
  const cat=getAuditCategory(item.action).name;
  const dateFormatted=new Date(item.at).toISOString();
  return[
   item.at,
   dateFormatted,
   item.who,
   cat,
   item.action,
   item.source
  ];
 });

 const q=v=>`"${String(v??'').replace(/"/g,'""')}"`;
 const csvContent='\ufeff'+[headers,...rows].map(row=>row.map(q).join(',')).join('\r\n');
 saveFile(`aldheeniyya-global-audit-log-${dateStr}.csv`,new Blob([csvContent],{type:'text/csv;charset=utf-8;'}));
 toast(`Exported ${list.length} audit records as CSV`);
}
function rBackup(){const lb=db.lastBackup,days=lb?Math.floor((Date.now()-lb)/864e5):null,ch=db.changes||0,old=lb==null||days>=7||ch>=25;
 $('bk').innerHTML=`<div class="card" style="margin:0 0 16px;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;${old?'background:var(--amberbg);border-color:#ecd29a':''}"><div><b>${old?'Back up your records':'Your records are backed up'}</b><div class="muted" style="font-size:13px">${lb?`Last backup ${days==0?'today':days+' day'+(days>1?'s':'')+' ago'}, ${ch} change${ch==1?'':'s'} since.`:'No backup downloaded yet. Records are safe online, but a copy on your computer is still wise.'}</div></div><button class="btn ${old?'primary':'secondary'}" onclick="backup()">Back up now</button></div>`}
function rExtra(){const act=db.students.filter(x=>x.status=='Active'),m={};act.forEach(x=>{const c=x.cls||'No class';m[c]=(m[c]||0)+1});const mx=Math.max(1,...Object.values(m));
 $('byclass').innerHTML=Object.keys(m).sort().map(c=>`<div style="display:flex;align-items:center;gap:10px;margin:7px 0;font-size:13px"><span style="width:90px">${e(c)}</span><span class="prog" style="flex:1;width:auto;height:10px;margin:0"><i style="width:${m[c]/mx*100}%"></i></span><b>${m[c]}</b></div>`).join('')||'<p class="muted">No active students yet.</p>';
 const D=x=>new Date(x.dob+'T12:00'),mo=new Date().getMonth(),b=act.filter(x=>x.dob&&D(x).getMonth()==mo).sort((a,c)=>D(a).getDate()-D(c).getDate());
 $('bdays').innerHTML=b.length?b.map(x=>`<li><span>${av(x)}<b>${e(x.name)}</b></span><span class="muted">${D(x).getDate()} ${new Date().toLocaleString('en-GB',{month:'long'})}${x.cls?' · '+e(x.cls):''}</span></li>`).join(''):'<li class="muted">No birthdays this month.</li>'}
const CAMPUS=[
  {"cap":"College building","src":"/images/campus-0.jpg"},
  {"cap":"Prayer hall & dormitory","src":"/images/campus-1.jpg"},
  {"cap":"Library","src":"/images/campus-2.jpg"},
  {"cap":"Library reading hall","src":"/images/campus-3.jpg"},
  {"cap":"Office entrance","src":"/images/campus-4.jpg"},
  {"cap":"College grounds","src":"/images/campus-5.jpg"}
];
let hi=0,ht;
function heroGo(i,auto){hi=i;document.querySelectorAll('.hs').forEach((x,k)=>x.classList.toggle('on',k==i));document.querySelectorAll('.hdots button').forEach((x,k)=>x.classList.toggle('on',k==i));$('hcap').textContent=CAMPUS[i].cap;if(!auto&&ht){clearInterval(ht);ht=setInterval(()=>heroGo((hi+1)%CAMPUS.length,1),6500)}}
function openCampus(i){$('mvb').innerHTML=`<h2 style="margin-bottom:10px">${e(CAMPUS[i].cap)}</h2><img src="${CAMPUS[i].src}" alt="${e(CAMPUS[i].cap)}" style="max-width:100%;max-height:70vh;border-radius:8px"><div class="foot" style="justify-content:center"><button class="btn secondary" onclick="$('mview').classList.remove('open')">Close</button></div>`;$('mview').classList.add('open')}
function rHero(){const o=org(),h=$('hero');
 if(!h.dataset.built){h.dataset.built=1;
  h.innerHTML=CAMPUS.map((c,i)=>`<img class="hs${i?'':' on'}" src="${c.src}" alt="${e(c.cap)}">`).join('')+`<div class="hov"></div><div class="hc"><div class="hb"><img class="hl" alt="" src="${o.logo}"><div><h2 id="hn"></h2><p>Knowledge · Deeds · Propagation</p></div></div><div class="hw" id="hw"></div><div class="hchips" id="hch"></div></div><div class="hcap"><span id="hcap">${e(CAMPUS[0].cap)}</span><span class="hdots">${CAMPUS.map((c,i)=>`<button aria-label="Show ${e(c.cap)}" onclick="heroGo(${i})" class="${i?'':'on'}"></button>`).join('')}</span></div>`;
  $('gal').innerHTML=CAMPUS.map((c,i)=>`<button onclick="openCampus(${i})" aria-label="View ${e(c.cap)}"><img src="${c.src}" alt="${e(c.cap)}" loading="lazy"><span>${e(c.cap)}</span></button>`).join('');
  if(!matchMedia('(prefers-reduced-motion:reduce)').matches)ht=setInterval(()=>heroGo((hi+1)%CAMPUS.length,1),6500)}
 $('hn').textContent=o.name;
 $('hw').textContent='Welcome back, Administrator. '+new Date().toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
 $('hch').innerHTML=`<span class="hj"><b>☪</b> ${hijri()}</span><span><b>${db.students.filter(x=>x.status=='Active').length}</b> students</span><span><b>${db.staff.filter(x=>x.status=='Active').length}</b> teachers & staff</span><span><b>${db.docs.length}</b> documents</span>`}
const toB64=u=>{let s='';for(let i=0;i<u.length;i+=0x8000)s+=String.fromCharCode.apply(null,u.subarray(i,i+0x8000));return btoa(s)};
const fromB64=b=>Uint8Array.from(atob(b),c=>c.charCodeAt(0));
async function kdf(pw,salt){const m=await crypto.subtle.importKey('raw',new TextEncoder().encode(pw),'PBKDF2',false,['deriveKey']);return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:150000,hash:'SHA-256'},m,{name:'AES-GCM',length:256},false,['encrypt','decrypt'])}
async function encJ(key,obj){const iv=crypto.getRandomValues(new Uint8Array(12)),ct=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv},key,new TextEncoder().encode(JSON.stringify(obj))));return{iv:toB64(iv),d:toB64(ct)}}
async function decJ(key,o){const pt=await crypto.subtle.decrypt({name:'AES-GCM',iv:fromB64(o.iv)},key,fromB64(o.d));return JSON.parse(new TextDecoder().decode(pt))}
const TEACHER_URL='https://claude.ai/artifact/QSphScYC49qi5geUMVu9C2';
const TF=['guardian','phone','address','dob','gender','photo'];
let lastList=[],wl=false,pend=null,clsAll=[];
function assignClass(i){document.querySelectorAll('#t_classes input').forEach(x=>x.checked=x.value==clsAll[i]);$('t_user').value='';$('t_staff').value='';$('t_staff').scrollIntoView({behavior:'smooth',block:'center'});$('t_staff').focus();toast('Choose the class teacher for '+clsAll[i])}
function bulkStatus(sel){const v=sel.value;sel.value='';if(!v||!lastList.length)return toast('No students are listed.','err');
 if(!confirm(`Set ${lastList.length} listed student${lastList.length>1?'s':''} to "${v}"? A safety copy is kept.`))return;
 snap('Before bulk status change');lastList.forEach(x=>x.status=v);logA(`Set ${lastList.length} students to ${v}`);save();renderAll();toast(`${lastList.length} students set to ${v}`)}
const WISH={formal:`Assalamu alaikum {name},

On behalf of {college}, we extend our warmest birthday wishes to you. Thank you for your dedicated service to teaching and the pursuit of knowledge. May Allah grant you good health, barakah in your work and continued success.

With best wishes,
{principal}
{college}`,warm:`Happy birthday, {name}! 🎉 Wishing you a blessed year ahead filled with good health, joy and success. With best wishes from all of us at {college}.`,dua:`Assalamu alaikum {name}. Barakallahu feek on your birthday. May Allah grant you good health and a life of benefit, and make your teaching a source of reward and guidance for many. Jazakallahu khairan for all you do for {college}.

{principal}`};
const wishCfg=()=>({preset:'formal',text:WISH.formal,remind:true,...db.wish});
const toWa=p=>{const d=String(p||'').replace(/\D/g,'');if(!d)return '';if(d.startsWith('94'))return d;if(d.startsWith('0'))return '94'+d.slice(1);return d.length==9?'94'+d:d};
const wishMsg=r=>wishCfg().text.replace(/\{name\}/g,r.name).replace(/\{college\}/g,org().name).replace(/\{principal\}/g,org().principal||'The Principal');
const bdOk=r=>r.status!='Inactive'&&/^\d{4}-\d{2}-\d{2}$/.test(r.dob||'');
const fdShort=d=>d.toLocaleDateString('en-GB',{day:'numeric',month:'short'});
function bdInfo(r){const t=new Date();t.setHours(0,0,0,0);const [y,m,d]=r.dob.split('-').map(Number);let n=new Date(t.getFullYear(),m-1,d);if(n<t)n=new Date(t.getFullYear()+1,m-1,d);return{days:Math.round((n-t)/864e5),date:n,age:n.getFullYear()-y}}
function cp2(t){const a=document.createElement('textarea');a.value=t;document.body.appendChild(a);a.select();try{document.execCommand('copy');toast('Copied')}catch(x){toast('Could not copy','err')}a.remove()}
function copyText(t){try{navigator.clipboard.writeText(t).then(()=>toast('Copied'),()=>cp2(t))}catch(x){cp2(t)}}
const wkey=(r,n)=>r.id+'|'+n.getFullYear();
function bdRow(r,inf){const i=db.staff.indexOf(r),wa=toWa(r.phone),sent=(db.wishSent||{})[wkey(r,inf.date)];
 return `<li><span style="display:flex;align-items:center;min-width:0">${av(r)}<span><b>${e(r.name)}</b><br><small class="muted">${e(r.designation)||'Staff'} · ${inf.days==0?'Today':inf.days==1?'Tomorrow':fdShort(inf.date)+', in '+inf.days+' days'}${inf.age>=15&&inf.age<=100?' · turns '+inf.age:''}</small></span></span><span class="exp">${sent?'<span class="badge">Opened</span>':''}${wa?`<a class="btn primary sm" href="https://wa.me/${wa}?text=${encodeURIComponent(wishMsg(r))}" target="_blank" rel="noopener" onclick="markSent(${i},${inf.date.getFullYear()})">WhatsApp</a>`:'<span class="badge warn">No phone</span>'}<button class="btn secondary sm" onclick="copyText(wishMsg(db.staff[${i}]))">Copy</button></span></li>`}
function markSent(i,y){db.wishSent=db.wishSent||{};db.wishSent[db.staff[i].id+'|'+y]=Date.now();logA('Opened WhatsApp birthday wish for '+db.staff[i].name);save(true);setTimeout(rBday,400)}
function wishPreset(){const v=$('w_pre').value;if(WISH[v])$('w_txt').value=WISH[v]}
function saveWish(){db.wish={preset:$('w_pre').value,text:$('w_txt').value.trim()||WISH.formal,remind:$('w_rem').checked};save();rBday();toast('Message saved')}
function rBday(){
 if(!$('bdtoday'))return;const w=wishCfg();
 if(!wl){wl=true;$('w_pre').value=w.preset;$('w_txt').value=w.text;$('w_rem').checked=w.remind}
 const L=db.staff.filter(bdOk).map(r=>[r,bdInfo(r)]).sort((a,b)=>a[1].days-b[1].days),today=L.filter(x=>x[1].days==0),next=L.filter(x=>x[1].days>0&&x[1].days<=30);
 $('bdtoday').innerHTML=today.length?`<div class="card" style="margin:0 0 16px;background:var(--greenbg);border-color:#bcdccf"><h2>Today's birthdays</h2><ul class="rows">${today.map(([r,i])=>bdRow(r,i)).join('')}</ul></div>`:`<div class="card" style="margin:0 0 16px"><b>No staff birthdays today.</b><div class="muted" style="font-size:13px">${L.length?`Next: ${e(L[0][0].name)}, ${fdShort(L[0][1].date)}.`:'Add dates of birth to your staff to see birthdays here.'}</div></div>`;
 $('bdnext').innerHTML=next.length?next.map(([r,i])=>bdRow(r,i)).join(''):'<li class="muted">No birthdays in the next 30 days.</li>';
 const act=db.staff.filter(x=>x.status!='Inactive'),miss=db.staff.map((x,i)=>[x,i]).filter(([x])=>x.status!='Inactive'&&!/^\d{4}-\d{2}-\d{2}$/.test(x.dob||''));
 $('bdmissing').innerHTML=miss.length?`<li class="muted">${miss.length} of ${act.length} staff have no date of birth yet. Add dates by editing a record, or upload an Excel file with a "Date of birth" column on the Teachers &amp; Staff page.</li>`+miss.slice(0,8).map(([x,i])=>`<li><span>${av(x)}<b>${e(x.name)}</b></span><button class="btn secondary sm" onclick="openForm('staff',${i})">Add date</button></li>`).join('')+(miss.length>8?`<li class="muted">and ${miss.length-8} more</li>`:''):'<li class="muted">Every staff member has a date of birth.</li>';
 const un=today.filter(([r,i])=>!(db.wishSent||{})[wkey(r,i.date)]);
 $('bdbanner').innerHTML=w.remind&&un.length?`<div class="card" style="margin:0 0 16px;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;background:var(--greenbg);border-color:#bcdccf"><div><b>🎂 ${un.length} staff birthday${un.length>1?'s':''} today</b><div class="muted" style="font-size:13px">${un.map(x=>e(x[0].name)).join(', ')}</div></div><button class="btn primary" onclick="go('birthdays')">Send wishes</button></div>`:'';
 $('bdn').textContent=un.length;$('bdn').classList.toggle('hidden',!un.length)}

let pfCur=-1;
function rTeachers(){
 if(!$('pfTable'))return;const o=org(),P=db.profiles||[];
 if(document.activeElement!=$('t_link'))$('t_link').value=o.teacherUrl||'';
 $('t_wa').href='https://wa.me/?text='+encodeURIComponent('Assalamu alaikum. Please open the Al-Dheeniyya Class Teacher app on your phone and sign in with the username and password the office gave you: '+(o.teacherUrl||''));
 const RL={pending:'<span class="badge warn">No access</span>',teacher:'<span class="badge">Class teacher</span>',admin:'<span class="badge info">Administrator</span>'};
 $('pfTable').innerHTML=P.length?P.map((x,i)=>`<tr><td>${e(x.username||x.email)}</td><td>${e(x.name)||'—'}</td><td>${RL[x.role]||e(x.role)}</td><td>${e((x.classes||[]).join(', '))||'—'}</td><td><button class="btn ${x.role=='pending'?'primary':'secondary'} sm" onclick="editPf(${i})">${x.role=='pending'?'Give access':'Edit access'}</button>${x.id!=C.uid?` <button class="btn secondary sm" onclick="resetPw(${i})">Reset password</button> <button class="btn secondary sm" onclick="delStaff(${i})">Delete</button>`:''}</td></tr>`).join(''):empty(5,'No accounts yet.');
 const act=db.students.filter(s=>s.status=='Active'),cls=[...new Set(act.map(s=>s.cls).filter(Boolean))].sort();
 $('clsTable').innerHTML=cls.length?cls.map(c=>{const t=P.find(x=>x.role=='teacher'&&(x.classes||[]).includes(c));return `<tr><td><b>${e(c)}</b></td><td>${act.filter(s=>s.cls==c).length}</td><td>${t?`${e(t.name||t.email)} <small class="muted">(${e(t.username||t.email)})</small>`:'<span class="badge warn">No class teacher</span>'}</td></tr>`}).join(''):empty(3,'No classes yet. Give your students a class first.');
 {const sel=new Set([...document.querySelectorAll('#na_cls input:checked')].map(x=>x.value)),free=cls.filter(c=>!P.some(x=>x.role=='teacher'&&(x.classes||[]).includes(c)));
 $('na_cls').innerHTML=free.map(c=>`<label><input type="checkbox" value="${e(c)}" ${sel.has(c)?'checked':''}> ${e(c)}</label>`).join('')||'<span class="muted">Every class already has a class teacher, or there are no classes yet.</span>';
 $('pf_staff').innerHTML=db.staff.map(s=>`<option value="${e(s.name)}">`).join('')}
 $('tact').innerHTML=(db.audit||[]).length?db.audit.map(a=>`<li><span>${e(a.action)}<br><small class="muted">${e(a.who||'')}</small></span><span class="muted" style="font-size:12px;white-space:nowrap">${new Date(a.at).toLocaleString('en-GB',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</span></li>`).join(''):'<li class="muted">No activity yet.</li>'}
function saveTLink(){db.org={...db.org,teacherUrl:$('t_link').value.trim()};save();rTeachers();toast('Address saved')}
function pfRole(){$('pf_cls_wrap').classList.toggle('hidden',$('pf_role').value!='teacher')}
function editPf(i){const p=db.profiles[i];pfCur=i;$('pf_box').classList.remove('hidden');$('pf_title').textContent='Access for '+(p.username||p.email);$('pf_name').value=p.name||'';$('pf_staff').innerHTML=db.staff.map(s=>`<option value="${e(s.name)}">`).join('');
 $('pf_role').value=p.role;$('pf_role').disabled=p.id==C.uid;
 const cls=[...new Set(db.students.filter(s=>s.status=='Active').map(s=>s.cls).filter(Boolean))].sort();
 $('pf_cls').innerHTML=cls.map(c=>`<label><input type="checkbox" value="${e(c)}" ${(p.classes||[]).includes(c)?'checked':''}> ${e(c)}</label>`).join('')||'<span class="muted">No classes yet.</span>';pfRole();$('pf_box').scrollIntoView({behavior:'smooth',block:'center'})}
async function savePf(){const p=db.profiles[pfCur],role=$('pf_role').value,cls=role=='teacher'?[...document.querySelectorAll('#pf_cls input:checked')].map(x=>x.value):[];
 if(role=='teacher'&&!cls.length)return toast('Choose at least one class for a class teacher.','err');
 const taken=cls.find(c=>db.profiles.some(x=>x.id!=p.id&&x.role=='teacher'&&(x.classes||[]).includes(c)));if(taken)return toast(`${taken} already has a class teacher. Change that account first.`,'err');
 if(p.id==C.uid&&role!='admin')return toast('You cannot remove your own administrator access.','err');
 try{const r=await rest('profiles?id=eq.'+p.id,{method:'PATCH',body:{name:$('pf_name').value.trim(),role,classes:cls},prefer:'return=representation'});if(!r.length)throw new Error('The change was not accepted.');Object.assign(p,r[0]);logA(`Set access for ${p.email}: ${role}${cls.length?' ('+cls.join(', ')+')':''}`);$('pf_box').classList.add('hidden');renderAll();toast('Access saved')}catch(x){toast(x.message,'err')}}

function genPw(){const a='abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789',r=crypto.getRandomValues(new Uint32Array(10));$('na_pw').value=[...r].map(x=>a[x%a.length]).join('')}
function showCred(u,pw,name){const link=org().teacherUrl||'',txt=`Al-Dheeniyya Class Teacher login\n${link?'App: '+link+'\n':''}Username: ${u}\nPassword: ${pw}`;window._cred=txt;const d=$('na_done');d.classList.remove('hidden');
 d.innerHTML=`<h2>Login ready${name?' for '+e(name):''}</h2><p class="muted" style="font-size:13px;margin:-6px 0 10px">Give these details to the teacher now. The password is not shown again, but you can reset it any time.</p><pre style="background:#eef3f1;color:#25343c;padding:12px;border-radius:10px;white-space:pre-wrap;margin:0 0 10px;font:inherit">${e(txt)}</pre><div class="toolbar" style="margin:0"><button class="btn secondary" onclick="copyCred()">Copy</button><a class="btn primary" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(txt)}">Share on WhatsApp</a><button class="btn secondary" onclick="$('na_done').classList.add('hidden')">Close</button></div>`;d.scrollIntoView({behavior:'smooth',block:'center'})}
function copyCred(){navigator.clipboard.writeText(window._cred).then(()=>toast('Copied')).catch(()=>toast('Could not copy. Select the text and copy it.','err'))}
async function createStaff(){const u=$('na_user').value.trim().toLowerCase(),n=$('na_name').value.trim(),pw=$('na_pw').value,cls=[...document.querySelectorAll('#na_cls input:checked')].map(x=>x.value);
 if(!/^[a-z0-9._-]{3,30}$/.test(u))return toast('Username: 3 to 30 letters, numbers, dot, dash or underscore, no spaces.','err');
 if(!n)return toast('Enter the full name.','err');if(pw.length<8)return toast('The password must have at least 8 characters.','err');if(!cls.length)return toast('Choose a class.','err');
 const taken=cls.find(c=>db.profiles.some(x=>x.role=='teacher'&&(x.classes||[]).includes(c)));if(taken)return toast(`${taken} already has a class teacher.`,'err');
 try{const id=await rest('rpc/admin_create_user',{method:'POST',body:{p_username:u,p_password:pw,p_name:n,p_classes:cls}});
  const r=await rest('profiles?select=*&id=eq.'+id);if(r[0])db.profiles.push(r[0]);logA(`Created login ${u} (${cls.join(', ')})`);['na_user','na_name','na_pw'].forEach(i=>$(i).value='');renderAll();showCred(u,pw,n)}
 catch(x){toast(x.message,'err')}}
async function resetPw(i){const p=db.profiles[i],pw=prompt(`New password for ${p.username||p.email} (at least 8 characters). Leave empty to make one for you:`);if(pw===null)return;let np=pw;if(!np){genPw();np=$('na_pw').value;$('na_pw').value=''}
 if(np.length<8)return toast('The password must have at least 8 characters.','err');
 try{await rest('rpc/admin_set_password',{method:'POST',body:{p_uid:p.id,p_password:np}});logA('Reset password for '+(p.username||p.email));showCred(p.username||p.email,np,p.name)}catch(x){toast(x.message,'err')}}
async function delStaff(i){const p=db.profiles[i];if(!p||p.id==C.uid)return;if(!confirm(`Delete the login "${p.username||p.email}"? This person will no longer be able to sign in. Documents they uploaded stay.`))return;
 try{await rest('rpc/admin_delete_user',{method:'POST',body:{p_uid:p.id}});db.profiles.splice(i,1);logA('Deleted login '+(p.username||p.email));renderAll();toast('Login deleted')}catch(x){toast(x.message,'err')}}

function hijri(d,adj){try{const x=new Date((d||new Date()).getTime()+(adj??(+org().hadj||0))*864e5);return new Intl.DateTimeFormat('en-u-ca-islamic-umalqura',{day:'numeric',month:'long',year:'numeric'}).format(x)}catch(x){return ''}}
const orgSub=o=>`${o.mrca?`<div class="mrca">MRCA Reg. No: ${e(o.mrca)}</div>`:''}${[o.addr,o.phone].filter(Boolean).length?`<div class="oa">${[o.addr,o.phone].filter(Boolean).map(e).join(' · ')}</div>`:''}`;
const pctOf=(p,d)=>d>0?p/d*100:0,pcb=p=>`<span class="badge ${p>=90?'':p>=75?'warn':'bad'}">${p.toFixed(1)}%</span>`;
const actIn=c=>db.students.filter(x=>x.status=='Active'&&x.cls==c).sort((a,b)=>a.name.localeCompare(b.name));
const actClasses=()=>[...new Set(db.students.filter(x=>x.status=='Active').map(x=>x.cls).filter(Boolean))].sort();
function attBlock(id){const a=db.att.filter(x=>x.id==id).sort((p,q)=>q.month.localeCompare(p.month)).slice(0,4);return `<h3>Attendance</h3><ul class="rows">${a.length?a.map(x=>`<li><span>${x.month}<br><small class="muted">${x.present} of ${x.days} days</small></span>${pcb(pctOf(x.present,x.days))}</li>`).join(''):'<li class="muted">No attendance recorded yet.</li>'}</ul>`}
function rAtt(){if(!$('a_cls'))return;const c0=$('a_cls').value,cs=actClasses();
 $('a_cls').innerHTML=cs.map(c=>`<option ${c==c0?'selected':''}>${e(c)}</option>`).join('');if(!$('a_mon').value)$('a_mon').value=new Date().toISOString().slice(0,7);
 if(!(document.activeElement&&document.activeElement.classList.contains('ap')))attLoad();
 const g=new Map();db.att.forEach(a=>{const t=stu(a.id),k=a.month+'|'+(t.cls||'');if(!g.has(k))g.set(k,{m:a.month,c:t.cls||'—',d:a.days,n:0,p:0});const x=g.get(k);x.n++;x.p+=pctOf(a.present,a.days)});
 $('attSum').innerHTML=g.size?[...g.values()].sort((a,b)=>b.m.localeCompare(a.m)||a.c.localeCompare(b.c)).map(x=>`<tr><td>${x.m}</td><td>${e(x.c)}</td><td>${x.d}</td><td>${x.n}</td><td>${pcb(x.p/x.n)}</td></tr>`).join(''):empty(5,'No attendance saved yet.')}
function attLoad(){const c=$('a_cls').value,mon=$('a_mon').value,L=actIn(c);let dd='';
 const vals=L.map(x=>{const r=db.att.find(a=>a.id==x.id&&a.month==mon);if(r&&!dd)dd=r.days;return r?r.present:''});$('a_days').value=dd;
 $('attTable').innerHTML=L.length?L.map((x,i)=>`<tr><td>${av(x)}<b>${e(x.name)}</b></td><td>${e(x.id)}</td><td><input class="ap num" type="number" min="0" max="31" value="${vals[i]}" oninput="attCalc()" aria-label="Days present for ${e(x.name)}"></td><td id="ab${i}">—</td><td id="ap${i}">—</td></tr>`).join(''):empty(5,'No active students in this class.');attCalc()}
function attCalc(){const d=+$('a_days').value,ins=[...document.querySelectorAll('#attTable .ap')];let t=0,n=0;
 ins.forEach((el,i)=>{const v=el.value;if(v===''||!d){$('ab'+i).textContent='—';$('ap'+i).textContent='—';return}const p=+v;$('ab'+i).textContent=Math.max(0,d-p);const q=pctOf(p,d);$('ap'+i).innerHTML=p>d?'<span class="badge bad">Over</span>':pcb(q);if(p<=d){t+=q;n++}});
 $('attAvg').innerHTML=n?pcb(t/n):'—'}
function attAll(){const d=$('a_days').value;if(!d)return toast('Enter the academic days first.','err');document.querySelectorAll('#attTable .ap').forEach(el=>el.value=d);attCalc()}
function saveAtt(){const c=$('a_cls').value,mon=$('a_mon').value,d=+$('a_days').value,L=actIn(c),ins=[...document.querySelectorAll('#attTable .ap')];
 if(!mon)return toast('Choose the month.','err');if(!Number.isInteger(d)||d<1||d>31)return toast('Academic days must be between 1 and 31.','err');
 for(const el of ins)if(el.value!==''&&(!Number.isInteger(+el.value)||+el.value<0||+el.value>d))return toast('Days present must be a whole number from 0 to '+d+'.','err');
 let n=0;L.forEach((x,i)=>{const v=ins[i].value;db.att=db.att.filter(a=>!(a.id==x.id&&a.month==mon));if(v!==''){db.att.push({id:x.id,month:mon,days:d,present:+v});n++}});
 logA(`Saved attendance ${mon} for ${c} (${n} students)`);save();renderAll();toast(`Attendance saved for ${n} students`)}
function rME(){if(!$('me_cls'))return;const c0=$('me_cls').value;$('me_cls').innerHTML=actClasses().map(c=>`<option ${c==c0?'selected':''}>${e(c)}</option>`).join('');if(!$('me_year').value)$('me_year').value=new Date().getFullYear();
 $('me_exams').innerHTML=[...new Set(db.marks.map(m=>m.exam))].map(x=>`<option value="${e(x)}">`).join('');if(!(document.activeElement&&document.activeElement.classList.contains('mi')))meLoad()}
function meLoad(){const L=actIn($('me_cls').value),ex=$('me_exam').value.trim(),yr=+$('me_year').value,sb=$('me_sub').value.trim();
 $('meTable').innerHTML=L.length?L.map(x=>{const r=db.marks.find(m=>m.id==x.id&&m.exam==ex&&m.year==yr&&m.subject==sb);return `<tr><td>${av(x)}<b>${e(x.name)}</b></td><td>${e(x.id)}</td><td><input class="mi num" value="${r?(r.marks==null?'AB':r.marks):''}" aria-label="Marks for ${e(x.name)}"></td></tr>`}).join(''):empty(3,'No active students in this class.')}
function saveME(){const L=actIn($('me_cls').value),ex=$('me_exam').value.trim(),yr=+$('me_year').value,sb=$('me_sub').value.trim(),mx=+$('me_max').value,ins=[...document.querySelectorAll('#meTable .mi')];
 if(!ex||!sb||!yr||!(mx>0))return toast('Enter the exam, year, subject and full marks.','err');
 for(const el of ins){const v=el.value.trim();if(v!==''&&!/^ab/i.test(v)&&(isNaN(+v)||+v<0||+v>mx))return toast(`Marks must be from 0 to ${mx}, or AB.`,'err')}
 snap('Before entering marks');let n=0;L.forEach((x,i)=>{const v=ins[i].value.trim();if(v==='')return;const ab=/^ab/i.test(v),r=db.marks.find(m=>m.id==x.id&&m.exam==ex&&m.year==yr&&m.subject==sb);if(r){r.marks=ab?null:+v;r.max=mx}else db.marks.push({id:x.id,exam:ex,year:yr,subject:sb,marks:ab?null:+v,max:mx,remarks:''});n++});
 logA(`Entered ${sb} marks for ${ex}: ${n} students`);save();renderAll();toast(`${n} marks saved`)}
const org=()=>({name:'Al-Dheeniyya Arabic College',addr:'',phone:'',mrca:'',hadj:'0',principal:(db.staff.find(x=>/principal/i.test(x.designation))||{}).name||'',...db.org,logo:(db.org&&db.org.logo)||DEFAULT_LOGO});
const fd=d=>d?new Date(d+'T12:00').toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'}):'';
const ini=r=>e((r.name||'?').trim().split(/\s+/).map(w=>w[0]).slice(0,2).join('').toUpperCase());
let pr={},cert={};
function rOrg(){const o=org();[['o_name',o.name],['o_addr',o.addr],['o_phone',o.phone],['o_pr',o.principal],['o_mrca',o.mrca],['o_hadj',o.hadj||'0']].forEach(([i,v])=>{if($(i)&&document.activeElement!=$(i))$(i).value=v||''});if($('o_prev'))$('o_prev').innerHTML=o.logo?`<img class="av lg" style="border-radius:8px;object-fit:contain" src="${o.logo}" alt="">`:''}
function saveOrg(){db.org={...db.org,name:$('o_name').value.trim()||'Al-Dheeniyya Arabic College',addr:$('o_addr').value.trim(),phone:$('o_phone').value.trim(),principal:$('o_pr').value.trim(),mrca:$('o_mrca').value.trim(),hadj:$('o_hadj').value};save();renderAll();toast('College details saved')}
function pickLogo(inp){const f=inp.files[0];if(!f)return;const rd=new FileReader(),im=new Image();
 im.onload=()=>{const z=Math.min(1,240/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.round(im.width*z);c.height=Math.round(im.height*z);c.getContext('2d').drawImage(im,0,0,c.width,c.height);db.org={...db.org,logo:c.toDataURL('image/png')};save();rOrg();toast('Logo saved')};
 im.onerror=()=>toast('That file is not a readable image.','err');rd.onload=()=>{im.src=rd.result};rd.readAsDataURL(f)}
function showPrint(t,opts,body,orient){pr.orient=orient;$('pt').textContent=t;$('popts').innerHTML=opts;$('pbody').innerHTML=body;$('mprint').classList.add('open')}
function doPrint(){$('pgs').textContent=`@page{size:A4 ${pr.orient};margin:10mm}`;document.body.classList.add('pp');window.print();setTimeout(()=>document.body.classList.remove('pp'),600)}
function savePrintable(){const css=document.querySelector('head style').textContent;
 const h=`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${e($('pt').textContent)}</title><style>${css}.certwrap{zoom:1}body{background:#fff;margin:0}@page{size:A4 ${pr.orient};margin:10mm}</style></head><body>${$('pbody').innerHTML}<script>setTimeout(function(){print()},500)<\/script></body></html>`;
 saveFile('printable-'+Date.now()+'.html',new Blob([h],{type:'text/html'}))}
function cardRow(r,k){const o=org(),st=k=='staff',ph=r.photo?`<img class="idp" src="${r.photo}" alt="">`:`<span class="idp">${ini(r)}</span>`,wm=o.logo?`<img class="wm2" src="${o.logo}" alt="">`:'',
 head=`<div class="idh">${o.logo?`<img src="${o.logo}" alt="">`:''}<div><div class="nm">${e(o.name)}</div>${o.mrca?`<div class="mr">MRCA Reg. No: ${e(o.mrca)}</div>`:''}${o.addr?`<div class="ad">${e(o.addr)}</div>`:''}</div></div>`;
 return `<div class="idrow"><div class="idc">${wm}${head}<div class="idb">${ph}<div><h4>${e(r.name)}</h4><div class="rl">${st?'Teacher / Staff':'Student'}</div><p><small>ID</small>${e(r.id)}</p><p><small>${st?'Role':'Class'}</small>${e(st?r.designation:r.cls)||'—'}</p><p><small>Phone</small>${e(r.phone)||'—'}</p></div></div><div class="idt">Valid ${new Date().getFullYear()}</div></div>
<div class="idc">${wm}${head}<div class="idk"><p>This card is the property of ${e(o.name)}. If found, please return to:</p><p><b>${e(o.addr)||'College office'}</b>${o.phone?'<br>'+e(o.phone):''}</p>${!st&&r.guardian?`<p>Guardian: ${e(r.guardian)}${r.phone?' · '+e(r.phone):''}</p>`:''}<div class="sig"><i></i>Principal</div></div></div></div>`}
function idCard(i,k){const r=LIST(k)[i];showPrint('ID card: '+r.name,'<p class="muted" style="margin:0 0 12px;font-size:13px">Front on the left, back on the right. Add the college address and logo in Settings.</p>',`<div class="idsheet">${cardRow(r,k)}</div>`,'portrait')}
function bulkCards(k){const l=LIST(k).filter(x=>x.status=='Active');if(!l.length)return toast('No active records to print.','err');showPrint(`ID cards for ${l.length} active ${k=='staff'?'staff':'students'}`,'<p class="muted" style="margin:0 0 12px;font-size:13px">Four people per A4 page, front and back side by side.</p>',`<div class="idsheet">${l.map(r=>cardRow(r,k)).join('')}</div>`,'portrait')}
const CT={student:[['Student certificate','enrol'],['Character certificate','char'],['Course completion certificate','comp']],staff:[['Service certificate','svc']]};
function certForm(i,k){const r=LIST(k)[i];cert={i,k};
 const opts=`<div class="formgrid" style="margin-bottom:14px"><div class="field"><label for="c_t">Certificate type</label><select id="c_t" onchange="certRender()">${CT[k].map(([n,v])=>`<option value="${v}">${n}</option>`).join('')}</select></div>
<div class="field"><label for="c_d">Issue date</label><input id="c_d" type="date" value="${new Date().toISOString().slice(0,10)}" oninput="certRender()"></div>
<div class="field"><label for="c_s">Signed by</label><input id="c_s" value="${e(org().principal)}" oninput="certRender()"></div>
<div class="field"><label for="c_g">Signatory title</label><input id="c_g" value="Principal" oninput="certRender()"></div>
<div class="field full"><label for="c_x">${k=='staff'?'Extra remark (optional)':'Purpose or course name (optional)'}</label><input id="c_x" oninput="certRender()"></div>
<div class="field full"><label><input type="checkbox" id="c_p" style="width:auto" onchange="certRender()"> Include photo</label></div></div>`;
 showPrint('Certificate for '+r.name,opts,'<div id="cbox"></div>','landscape');certRender()}
function certRender(){const {i,k}=cert,r=LIST(k)[i],o=org(),t=$('c_t').value,x=e($('c_x').value.trim()),n=`<b>${e(r.name)}</b>`;
 const rel=r.gender=='Female'?'daughter of':r.gender=='Male'?'son of':'ward of',par=r.guardian?`, ${rel} ${e(r.guardian)},`:'';
 let T,b;
 if(t=='enrol'){T='Student Certificate';b=`This is to certify that ${n} (Student ID ${e(r.id)})${par} is a bona fide student of ${e(o.name)}${r.cls?`, currently studying in ${e(r.cls)}`:''}${r.admit?`, and has been enrolled since ${fd(r.admit)}`:''}.${x?` This certificate is issued for the purpose of ${x}.`:' This certificate is issued on request.'}`}
 else if(t=='char'){T='Character Certificate';b=`This is to certify that ${n} (Student ID ${e(r.id)})${par} studied at ${e(o.name)}${r.cls?` in ${e(r.cls)}`:''}. During this period, the conduct and character of ${n} have been found to be good.${x?' '+x:''}`}
 else if(t=='comp'){T='Certificate of Completion';b=`This is to certify that ${n} (Student ID ${e(r.id)})${par} has successfully completed ${x||`the course of study${r.cls?` in ${e(r.cls)}`:''}`} at ${e(o.name)}.`}
 else{T='Service Certificate';b=`This is to certify that ${n} (Employee ID ${e(r.id)}) has been employed at ${e(o.name)} as ${e(r.designation||'a member of staff')}${r.dept?` in the ${e(r.dept)} department`:''}${r.joined?` since ${fd(r.joined)}`:''}, on a ${e((r.type||'permanent').toLowerCase())} basis. Conduct and service have been found satisfactory.${x?' '+x:''}`}
 const d=$('c_d').value,hj=d?hijri(new Date(d+'T12:00')):'';
 $('cbox').innerHTML=`<div class="certwrap"><div class="cert"><div class="cin">${o.logo?`<img class="wm" src="${o.logo}" alt="">`:''}${$('c_p').checked&&r.photo?`<img class="cph" src="${r.photo}" alt="">`:''}<div class="chead">${o.logo?`<img class="clogo" src="${o.logo}" alt="">`:''}<h2 class="on">${e(o.name)}</h2>${orgSub(o)}</div><div class="rule"></div><h1>${T}</h1><p class="cb">${b}</p><div class="cf"><div>Date: ${fd(d)}${hj?'<br>'+hj:''}<br>Ref: CERT/${(d||'').slice(0,4)}/${e(r.id)}</div><div class="sig"><i></i><b>${e($('c_s').value)}</b><br>${e($('c_g').value)}</div></div></div></div></div>`}
function toast(m,k){const t=$('toast');t.textContent=m;t.className='show '+(k||'');clearTimeout(tt);tt=setTimeout(()=>t.className='',2800)}
const badge=s=>`<span class="badge ${{Pending:'warn',Expired:'bad',Inactive:'bad','Passed Out':'info'}[s]||''}">${e(s)}</span>`;
const have=id=>req.filter(t=>db.docs.some(d=>d.id==id&&d.type==t&&d.status=='Verified')).length;
const empty=(n,m)=>`<tr><td colspan="${n}" class="empty">${m}</td></tr>`;
const match=(o,q)=>Object.values(o).join(' ').toLowerCase().includes(q);

let fails=0,lockT=0,idleT,lastT=0,pollT;
async function login(){
 if(Date.now()<lockT){$('lerr').textContent=`Too many attempts. Try again in ${Math.ceil((lockT-Date.now())/1000)} seconds.`;return}
 const u=$('user').value.trim().toLowerCase(),pw=$('pass').value;if(!u||!pw){$('lerr').textContent='Enter your email or username and password.';return}
 $('lbtn').disabled=true;$('lbtn').textContent='Signing in…';
 try{setSess(await authCall('token?grant_type=password',{email:u.includes('@')?u:u+'@aldheeniyya.local',password:pw}));await startAdmin()}
 catch(x){fails++;if(fails>=5){lockT=Date.now()+30000;fails=0}$('lerr').textContent=[400,401,422].includes(x.status)?'Username or password is incorrect.':x.message}
 $('lbtn').disabled=false;$('lbtn').textContent='Sign in'}
async function adminSignup(){const u=$('user').value.trim().toLowerCase(),pw=$('pass').value;if(!/^\S+@\S+\.\S+$/.test(u)){$('lerr').textContent='Enter your email address first.';return}if(pw.length<6){$('lerr').textContent='Choose a password with at least 6 characters.';return}
 try{const b=await authCall('signup',{email:u,password:pw});if(b&&b.access_token){setSess(b);await startAdmin()}else $('lerr').textContent='Account created. If you were asked to confirm your email, check your inbox, then sign in.'}catch(x){$('lerr').textContent=x.message}}
async function adminForgot(){const u=$('user').value.trim().toLowerCase();if(!/^\S+@\S+\.\S+$/.test(u)){$('lerr').textContent='Enter your email address first.';return}try{await authCall('recover',{email:u});$('lerr').textContent='If this email has an account, a reset link was sent.'}catch(x){$('lerr').textContent=x.message}}
async function startAdmin(){
 const r=await rest('profiles?select=*&id=eq.'+C.uid),p=r[0];
 if(!p||p.role!='admin'){$('lerr').textContent=p&&p.role=='teacher'?'This account is a class teacher. Please sign in on the class teacher app.':'Your account is waiting for approval by the administrator.';await cloudSignOut();return}
 await cloudLoad(true);const lb=+localStorage.getItem('adm_lb');if(lb)db.lastBackup=lb;enter();clearInterval(pollT);pollT=setInterval(()=>cloudPoll(),20000)}
function enter(){$('login').classList.add('hidden');$('app').classList.remove('hidden');$('lerr').textContent='';$('pass').value='';renderAll();setSync();touch()}
function touch(){clearTimeout(idleT);idleT=setTimeout(()=>{if(!$('app').classList.contains('hidden')){logout();$('lerr').textContent='You were signed out after 15 minutes of inactivity.'}},900000)}
async function cloudSignOut(){const t=C.tok;if(t)fetch(SB_URL+'/auth/v1/logout',{method:'POST',headers:{apikey:SB_KEY,Authorization:'Bearer '+t}}).catch(()=>{});C={tok:null,ref:null,exp:0,uid:null,email:null};try{localStorage.removeItem(AK)}catch(x){}}
async function logout(){clearTimeout(idleT);clearInterval(pollT);if(cloud.dirty&&C.tok){try{await cloudPush()}catch(x){}}await cloudSignOut();db={students:[],staff:[],docs:[],marks:[],att:[],profiles:[],audit:[],org:{},wish:{},wishSent:{},log:[],changes:0};cloud.base=null;cloud.sig='';cloud.dirty=false;closeDrawer();document.querySelectorAll('.modal').forEach(m=>m.classList.remove('open'));$('app').classList.add('hidden');$('login').classList.remove('hidden')}
['click','keydown','mousemove','touchstart'].forEach(ev=>addEventListener(ev,()=>{if(!$('app').classList.contains('hidden')&&Date.now()-lastT>5000){lastT=Date.now();touch()}},{passive:true}));
addEventListener('focus',()=>{if(C.tok&&!$('app').classList.contains('hidden'))cloudPoll()});
function go(id){document.querySelectorAll('.view').forEach(x=>x.classList.toggle('active',x.id==id));document.querySelectorAll('.nav button[data-v]').forEach(b=>b.classList.toggle('active',b.dataset.v==id));$('title').textContent=TITLES[id];closeDrawer();scrollTo(0,0);if(id=='settings'){rSafety();rGlobalAudit();}}

function renderAll(){$('today').textContent=new Date().toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'})+' · '+hijri();rDash();rStudents();rStaff();rDocs();rReport();rOrg();rMarks();rBackup();rHero();rBday();rTeachers();rAtt();rME();rGlobalAudit();refreshDrawer()}

function rDash(){
 const S=db.students,D=db.docs,act=S.filter(s=>s.status=='Active').length,po=S.filter(s=>s.status=='Passed Out').length,pct=S.length?Math.round(S.reduce((a,s)=>a+have(s.id),0)/(S.length*req.length)*100):0;
 const cnt=k=>D.filter(d=>d.status==k).length,rev=cnt('Pending')+cnt('Expired');
 $('stats').innerHTML=[['Students',S.length,`${act} active${po?', '+po+' passed out':''}`],['Teachers & staff',db.staff.length,`${db.staff.filter(s=>s.status=='Active').length} active`],['Documents',D.length,rev?`${rev} need review`:'All verified'],['File completeness',pct+'%','Required documents verified']].map(([a,b,c])=>`<div class="stat"><small>${a}</small><strong>${b}</strong><span>${c}</span></div>`).join('');
 const bad=D.map((d,i)=>[d,i]).filter(([d])=>d.status!='Verified').slice(0,6);
 $('attn').innerHTML=bad.length?bad.map(([d,i])=>`<li><span><b>${e(d.type)}</b><br><small class="muted">${e(d.name||d.id)}</small></span><span>${badge(d.status)} <button class="btn secondary sm" onclick="verify(${i})">Mark verified</button></span></li>`).join(''):'<li class="muted">Nothing to review. Every document is verified.</li>';
 const tot=D.length||1,col={Verified:'#147a58',Pending:'#d9a13b',Expired:'#b43d48'};
 $('seg').innerHTML=Object.keys(col).map(k=>`<i style="width:${cnt(k)/tot*100}%;background:${col[k]}"></i>`).join('');
 $('legend').innerHTML=Object.keys(col).map(k=>`<span><b>${cnt(k)}</b> ${k.toLowerCase()}</span>`).join('');
 const inc=S.map((s,i)=>[s,i]).filter(([s])=>s.status=='Active'&&have(s.id)<req.length).slice(0,6);
 $('incomplete').innerHTML=inc.length?inc.map(([s,i])=>`<tr onclick="drawer(${i})"><td>${e(s.id)}</td><td>${av(s)}<b>${e(s.name)}</b></td><td>${e(s.cls)||'—'}</td><td>${prog(s.id)}</td></tr>`).join(''):empty(4,'Every active student has a complete file.');rExtra();
}
const prog=id=>{const n=have(id);return `<span class="prog"><i style="width:${n/req.length*100}%"></i></span>${n} of ${req.length}`};

function rStudents(){
 const q=$('sq').value.toLowerCase(),st=$('sst').value,c0=$('scl').value;
 const cls=[...new Set(db.students.map(s=>s.cls).filter(Boolean))].sort();
 $('scl').innerHTML='<option value="">All classes</option>'+cls.map(c=>`<option ${c==c0?'selected':''}>${e(c)}</option>`).join('');
 const a=db.students.map((s,i)=>[s,i]).filter(([s])=>match(s,q)&&(!st||s.status==st)&&(!c0||s.cls==c0));lastList=a.map(x=>x[0]);
 $('studentsTable').innerHTML=a.length?a.map(([s,i])=>`<tr onclick="drawer(${i})"><td>${e(s.id)}</td><td>${av(s)}<b>${e(s.name)}</b></td><td>${e(s.cls)||'—'}</td><td>${e(s.guardian)||'—'}</td><td>${e(s.phone)||'—'}</td><td>${prog(s.id)}</td><td>${badge(s.status)}</td></tr>`).join(''):empty(7,db.students.length?'No students match. Clear the search or filters.':'No students yet. Use “Add student” to create the first file.');
}
function rStaff(){
 const q=$('tq').value.toLowerCase(),st=$('tst').value;
 const a=db.staff.map((s,i)=>[s,i]).filter(([s])=>match(s,q)&&(!st||s.status==st));
 $('staffTable').innerHTML=a.length?a.map(([s,i])=>`<tr onclick="drawer(${i},'staff')"><td>${e(s.id)}</td><td>${av(s)}<b>${e(s.name)}</b></td><td>${e(s.designation)||'—'}</td><td>${e(s.dept)||'—'}</td><td>${e(s.phone)||'—'}</td><td>${e(s.joined)||'—'}</td><td>${badge(s.status)}</td></tr>`).join(''):empty(7,'No staff match. Clear the search or add a record.');
}
function rDocs(){
 const q=$('dq').value.toLowerCase(),st=$('dst').value;
 const a=db.docs.map((d,i)=>[d,i]).filter(([d])=>match(d,q)&&(!st||d.status==st));
 $('docGrid').innerHTML=a.length?a.map(([d,i])=>`<div class="doc"><span style="font-size:22px">📄</span><b>${e(d.type)}</b><small>${e(d.name||'—')} (${e(d.id)})</small><small>Reference: ${e(d.ref)||'—'}</small><small>Date: ${e(d.date)||'—'}</small>${d.file?`<small>📎 ${e(d.file.name)} (${kb(d.file.size)})</small>`:'<small>No file attached</small>'}<div style="margin-top:6px">${badge(d.status)}</div><div class="act">${d.file?`<button class="btn secondary sm" onclick="viewFile(${i})">Open file</button>`:''}${d.status!='Verified'?`<button class="btn primary sm" onclick="verify(${i})">Mark verified</button>`:''}<button class="btn secondary sm" onclick="openForm('doc',${i})">Edit</button></div></div>`).join(''):'<p class="muted" style="grid-column:1/-1;text-align:center;padding:24px">No documents match. Clear the search or add a document.</p>';
}
function verify(i){logA('Verified '+db.docs[i].type+' for '+db.docs[i].name);db.docs[i].status='Verified';save();renderAll();toast('Marked as verified')}

let dK='student';
const LIST=k=>k=='staff'?db.staff:db.students,RQ=k=>k=='staff'?sreq:req,haveN=(id,l)=>l.filter(t=>db.docs.some(d=>d.id==id&&d.type==t&&d.status=='Verified')).length;
function drawer(i,k='student'){
 dK=k;const s=LIST(k)[i];dId=s.id;const L=RQ(k),ds=db.docs.map((d,j)=>[d,j]).filter(([d])=>d.id==s.id),ok=haveN(s.id,L);
 const kv=k=='staff'?[['Designation',s.designation],['Department',s.dept],['Phone',s.phone],['Joined',s.joined],['Date of birth',s.dob],['NIC / ID ref',s.nic],['Employment',s.type],['Notes',s.notes]]:[['Class',s.cls],['Date of birth',s.dob],['Gender',s.gender],['Guardian',s.guardian],['Phone',s.phone],['Admitted',s.admit],['Address',s.address]];
 $('dr').innerHTML=`<div class="dh"><div style="display:flex;gap:14px;align-items:center">${av(s,'lg')}<div><h2>${e(s.name)}</h2><span class="muted">${e(s.id)}</span> ${badge(s.status)}</div></div><button class="btn secondary sm noprint" onclick="closeDrawer()" aria-label="Close">✕</button></div>
<dl>${kv.map(([a,v])=>`<dt>${a}</dt><dd>${e(v)||'—'}</dd>`).join('')}</dl>
<h3>Required documents</h3><span class="muted" style="font-size:12px">${ok} of ${L.length} verified</span>
<span class="prog big"><i style="width:${ok/L.length*100}%"></i></span>
<ul class="rows">${L.map((t,q)=>{const d=ds.find(([x])=>x.type==t);const v=d&&d[0].status=='Verified';return `<li><span>${v?'✓':'○'} ${t}</span>${d?badge(d[0].status):`<button class="btn secondary sm noprint" onclick="addReq(${i},${q},'${k}')">Add</button>`}</li>`}).join('')}</ul>
${k=='student'?resBlock(s.id)+attBlock(s.id):''}<h3>All documents (${ds.length})</h3>
<ul class="rows">${ds.length?ds.map(([d,j])=>`<li><span>${e(d.type)}<br><small class="muted">${e(d.ref)||'No reference'} · ${e(d.date)||'No date'}</small>${d.file?`<br><small>📎 ${e(d.file.name)}</small>`:''}</span><span>${badge(d.status)} <span class="noprint">${d.file?`<button class="btn secondary sm" onclick="viewFile(${j})">Open</button> `:''}<button class="btn secondary sm" onclick="openForm('doc',${j})">Edit</button></span></span></li>`).join(''):'<li class="muted">No documents recorded yet.</li>'}</ul>
<div class="foot noprint"><button class="btn primary" onclick="addReq(${i},null,'${k}')">＋ Add document</button><button class="btn secondary" onclick="openForm('${k}',${i})">Edit</button><button class="btn secondary" onclick="printDrawer()">Print</button><button class="btn secondary" onclick="idCard(${i},'${k}')">ID card</button><button class="btn secondary" onclick="certForm(${i},'${k}')">Certificate</button></div>`;
 $('dr').classList.add('open');$('scrim').classList.add('open');
}
const addReq=(i,q,k='student')=>openForm('doc',-1,{id:LIST(k)[i].id,type:q==null?undefined:RQ(k)[q]});
function closeDrawer(){dId=null;$('dr').classList.remove('open');$('scrim').classList.remove('open')}
function refreshDrawer(){if(!dId)return;const i=LIST(dK).findIndex(s=>s.id==dId);i>=0?drawer(i,dK):closeDrawer()}

function fld([k,l,t='text',o]){const v=cur.rec[k]??'',ro=k=='id'&&cur.idx>=0&&cur.kind!='doc';let c;
 if(t=='photo')c=`<div class="photo-pick"><span id="pvw">${av({photo:cur.photo,name:cur.rec.name},'lg')}</span><div><input id="f_photo" type="file" accept="image/*" onchange="pickPhoto(this)"><button type="button" class="btn secondary sm" style="margin-top:6px" onclick="clearPhoto()">Remove picture</button></div></div>`;
 else if(t=='file')c=`<input id="f_file" type="file" accept=".pdf,.xlsx,.docx,.csv,.txt,image/png,image/jpeg,image/webp">${cur.rec.file?`<small class="muted">Attached: ${e(cur.rec.file.name)} (${kb(cur.rec.file.size)}). Choose a new file to replace it.</small>`:''}`;
 else if(t=='select')c=`<select id="f_${k}">${o.map(x=>`<option ${x==v?'selected':''}>${e(x)}</option>`).join('')}</select>`;
 else if(t=='textarea')c=`<textarea id="f_${k}">${e(v)}</textarea>`;
 else c=`<input id="f_${k}" type="${t=='list'?'text':t}" ${t=='list'?'list="sidlist"':''} value="${e(v)}" ${ro?'readonly':''}>`;
 return `<div class="field ${['textarea','photo','file'].includes(t)?'full':''}"><label for="f_${k}">${l}</label>${c}</div>`}
function openForm(kind,idx=-1,pre){
 cur={kind,idx,rec:idx>=0?db[COLL[kind]][idx]:(pre||{})};cur.photo=cur.rec.photo||'';const [n,fs]=F[kind];
 $('mt').textContent=(idx>=0?'Edit ':'Add ')+n;
 $('mb').innerHTML=fs.map(fld).join('')+`<datalist id="sidlist">${[...db.students,...db.staff].map(s=>`<option value="${e(s.id)}">${e(s.name)}</option>`).join('')}</datalist>`;
 $('mdel').style.display=idx>=0?'':'none';$('mform').classList.add('open');
 setTimeout(()=>$('f_'+fs[kind=='doc'?(pre?.id?1:0):1][0]).focus(),30)}
function closeForm(){$('mform').classList.remove('open')}
function saveForm(){
 const {kind,idx}=cur,fs=F[kind][1],col=db[COLL[kind]],r={...cur.rec};
 fs.forEach(([k,,t])=>{if(t=='photo'||t=='file')return;const el=$('f_'+k);if(el)r[k]=el.value.trim()});if(kind!='doc')r.photo=cur.photo||'';
 if(kind=='doc'){
  if(!r.id||!r.type)return toast('Student ID and document type are required.','err');
  const s=db.students.find(x=>x.id==r.id)||db.staff.find(x=>x.id==r.id);if(!s)return toast('No student or staff member has this ID. Add them first.','err');r.name=s.name;r.uid=r.uid||crypto.randomUUID()}
 else{
  if(!r.id||!r.name)return toast('ID and full name are required.','err');
  if(col.some((x,i)=>x.id==r.id&&i!=idx))return toast(`ID ${r.id} is already in use.`,'err')}
 const fl=kind=='doc'&&$('f_file').files[0];
 const done=()=>{logA((idx>=0?'Edited ':'Added ')+(kind=='doc'?'document ':kind+' ')+(r.name||r.type));idx>=0?col[idx]=r:col.unshift(r);save();closeForm();renderAll();toast(idx>=0?'Changes saved':`Added ${r.name||r.type}`)};
 if(!fl)return done();
 if(fl.size>10e6)return toast('File is larger than 10 MB.','err');
 toast('Uploading file…');
 cloudUpload(r.id,fl,fl.name).then(path=>{if(r.file)delFile(r.file.fid);r.file={fid:'cloud:'+path,name:fl.name,size:fl.size,mime:fl.type};done()}).catch(x=>toast('Could not upload the file: '+x.message,'err'))}
function delCur(){
 const {kind,idx}=cur,col=db[COLL[kind]],r=col[idx];
 const n=kind!='doc'?db.docs.filter(d=>d.id==r.id).length:0;
 if(!confirm(`Delete ${r.name||r.type}${n?` and ${n} document record${n>1?'s':''}`:''}? This cannot be undone.`))return;
 snap('Before deleting '+(r.name||r.type));logA('Deleted '+kind+' '+(r.name||r.type));
 if(kind!='doc'){db.docs.filter(d=>d.id==r.id&&d.file).forEach(d=>delFile(d.file.fid));db.docs=db.docs.filter(d=>d.id!=r.id)}
 if(kind=='doc'&&r.file)delFile(r.file.fid);
 if(kind=='student'){db.marks=db.marks.filter(m=>m.id!=r.id);db.att=db.att.filter(m=>m.id!=r.id)}
 col.splice(idx,1);if(kind!='doc'&&dId==r.id)closeDrawer();
 save();closeForm();renderAll();toast('Record deleted')}

function regData(k){
 if(k=='attendance')return{name:'attendance-register',head:['Student ID','Name','Class','Month','Academic days','Days present','Days absent','Percent'],rows:[...db.att].sort((a,b)=>b.month.localeCompare(a.month)||a.id.localeCompare(b.id)).map(a=>{const t=stu(a.id);return[a.id,t.name||'',t.cls||'',a.month,a.days,a.present,a.days-a.present,pctOf(a.present,a.days).toFixed(1)]})};
 if(k=='marks')return{name:'marks-register',head:['Student ID','Name','Class','Exam','Year','Subject','Marks','Full marks','Percent','Grade'],rows:db.marks.map(m=>{const t=stu(m.id),q=m.marks==null?null:m.marks/m.max*100;return[m.id,t.name||'',t.cls||'',m.exam,m.year,m.subject,m.marks==null?'AB':m.marks,m.max,q==null?'':q.toFixed(1),q==null?'':GR(q)]})};
 if(k=='missing')return{name:'missing-documents',head:['Student ID','Student','Class','Missing verified documents'],rows:db.students.filter(s=>s.status=='Active').map(s=>[s.id,s.name,s.cls,req.filter(t=>!db.docs.some(d=>d.id==s.id&&d.type==t&&d.status=='Verified')).join('; ')]).filter(r=>r[3])};
 const fs=F[k][1].filter(f=>f[2]!='photo'&&f[2]!='file'),head=fs.map(f=>f[1].replace(' *','')),rows=db[COLL[k]].map(r=>fs.map(f=>r[f[0]]??''));
 if(k=='doc'){head.splice(1,0,'Student / staff name');rows.forEach((x,i)=>x.splice(1,0,db.docs[i].name||''));head.push('Attached file');rows.forEach((x,i)=>x.push(db.docs[i].file?.name||''))}
 return{name:{student:'student-register',staff:'staff-register',doc:'document-register'}[k],head,rows}}
function rReport(){
 const r=regData($('rsel').value);$('rcount').textContent=`${r.rows.length} record${r.rows.length==1?'':'s'}`;
 $('rtable').innerHTML=`<thead><tr>${r.head.map(h=>`<th>${e(h)}</th>`).join('')}</tr></thead><tbody>${r.rows.length?r.rows.map(x=>`<tr>${x.map(c=>`<td>${e(c)||'—'}</td>`).join('')}</tr>`).join(''):empty(r.head.length,'Nothing to report.')}</tbody>`}
function download(name,text,type){saveFile(name,new Blob([text],{type}))}
async function exp(k,fmt){
 const r=regData(k),n=`${r.name}-${new Date().toISOString().slice(0,10)}`,T={student:'Student register',staff:'Teacher and staff register',doc:'Document register',missing:'Missing documents',marks:'Marks register',attendance:'Attendance register'}[k];
 try{
  if(fmt=='csv'){const q=v=>`"${String(v??'').replace(/"/g,'""')}"`;return saveFile(n+'.csv',new Blob(['\ufeff'+[r.head,...r.rows].map(x=>x.map(q).join(',')).join('\r\n')],{type:'text/csv'}))}
  if(fmt=='xlsx'){await loadJS(XL);const ws=XLSX.utils.aoa_to_sheet([r.head,...r.rows]);ws['!cols']=r.head.map((h,i)=>({wch:Math.min(40,Math.max(h.length,...r.rows.map(x=>String(x[i]??'').length))+2)}));const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,'Register');return saveFile(n+'.xlsx',new Blob([XLSX.write(wb,{bookType:'xlsx',type:'array'})]))}
  await loadJS(JP);await loadJS(JT);const d=new window.jspdf.jsPDF({orientation:r.head.length>6?'landscape':'portrait'});
  d.setFontSize(14);d.text('Al-Dheeniyya Arabic College - '+T,14,16);d.setFontSize(9);d.text(new Date().toLocaleDateString('en-GB'),14,22);
  d.autoTable({head:[r.head],body:r.rows.map(x=>x.map(c=>c??'')),startY:27,styles:{fontSize:8},headStyles:{fillColor:[16,38,61]}});
  return saveFile(n+'.pdf',d.output('blob'))
 }catch(x){toast('Could not build the file. Check your internet connection and try again.','err')}}
async function changePw(){
 if($('pw1').value.length<6)return toast('New password needs at least 6 characters.','err');
 if($('pw1').value!=$('pw2').value)return toast('New passwords do not match.','err');
 try{await fresh();await authCall('user',{password:$('pw1').value},C.tok);['pw1','pw2'].forEach(i=>$(i).value='');logA('Password changed');toast('Password updated')}catch(x){toast(x.message,'err')}}
async function backup(full){
 const copy={students:db.students,staff:db.staff,docs:db.docs,marks:db.marks,att:db.att,org:db.org,wish:db.wish,wishSent:db.wishSent};
 if(full){copy.files={};for(const d of db.docs){if(d.file&&!copy.files[d.file.fid]){try{const b=await getFile(d.file.fid);if(b)copy.files[d.file.fid]=await blobToData(b)}catch(x){}}}}
 const ok=await saveFile(`aldheeniyya-${full?'full-':''}backup-${new Date().toISOString().slice(0,10)}.json`,new Blob([JSON.stringify(copy)],{type:'application/json'}));
 if(ok){db.lastBackup=Date.now();try{localStorage.setItem('adm_lb',db.lastBackup)}catch(x){}db.changes=0;logA(full?'Full backup downloaded':'Backup downloaded');save(true);rBackup()}}
function restore(inp){const f=inp.files[0];if(!f)return;const rd=new FileReader();
 rd.onload=async()=>{try{const d=JSON.parse(rd.result);if(!Array.isArray(d.students)||!Array.isArray(d.staff)||!Array.isArray(d.docs))throw 0;
  if(!confirm(`Replace ALL online records with this backup (${d.students.length} students, ${d.staff.length} staff, ${d.docs.length} documents)? Records that are not in the file will be removed. A safety copy is kept on this computer.`)){inp.value='';return}
  snap('Before restoring a backup');const files=d.files;
  db.students=d.students;db.staff=d.staff;db.docs=d.docs.map(x=>({...x}));db.marks=Array.isArray(d.marks)?d.marks:[];db.att=Array.isArray(d.att)?d.att:[];if(d.org)db.org={...db.org,...d.org};if(d.wish)db.wish=d.wish;if(d.wishSent)db.wishSent=d.wishSent;
  db.docs.forEach(x=>{delete x.uid;if(x.file&&!String(x.file.fid).startsWith('cloud:')){const v=files&&files[x.file.fid];if(v){x.__up=v}else delete x.file}});
  for(const x of db.docs){if(x.__up){try{const b=dataToBlob(x.__up);x.file.fid='cloud:'+await cloudUpload(x.id,b,x.file.name)}catch(e2){delete x.file}delete x.__up}}
  logA('Restored a backup');save();renderAll();toast('Backup restored. Saving to the college database…')}catch(x){toast('This file is not a valid backup.','err')}inp.value=''};rd.readAsText(f)}

document.addEventListener('keydown',ev=>{
 if(ev.key=='Escape'){$('mview').classList.remove('open');$('mprint').classList.remove('open');$('mform').classList.contains('open')?closeForm():closeDrawer()}
 if(ev.key=='Enter'&&!$('login').classList.contains('hidden'))login()});
$('login').style.backgroundImage=`linear-gradient(rgba(10,26,42,.6),rgba(10,26,42,.8)),url(${CAMPUS[0].src})`;
$('imp_student').innerHTML=impCard('student');$('imp_staff').innerHTML=impCard('staff');
document.querySelectorAll('img.brandlogo').forEach(i=>i.src=DEFAULT_LOGO);
// Attach all functions and variables to window for inline HTML onclick/onchange/oninput handlers
Object.assign(window, {
  $, e, go, login, logout, adminSignup, adminForgot, openForm, saveForm, closeForm, delCur,
  doPrint, savePrintable, exp, markTemplate, importMarks, attLoad, saveAtt, attAll, attCalc,
  rMarks, rReport, changePw, backup, restore, openCampus, heroGo, saveOrg, pickLogo,
  saveWish, wishPreset, saveTLink, genPw, createStaff, savePf, pfRole, closeDrawer,
  bulkCards, bulkStatus, rDocs, rStaff, rStudents, saveME, meLoad, syncNow,
  drawer, addReq, certForm, certRender, clearPhoto, copyCred, copyText, delMarks, delStaff,
  dropImp, editPf, idCard, impPick, impTemplate, importPeople, markSent, markSheet,
  pickPhoto, printDrawer, resetPw, restoreSnap, verify, viewFile, wishMsg,
  CAMPUS, DEFAULT_LOGO, org, stu, nmOf, db, cloud, renderAll, toast, snap, rBackup, rSafety, regData,
  hijri, refreshDrawer, rDash, rHero, rBday, rTeachers, rAtt, rME,
  rGlobalAudit, refreshGlobalAudit, exportAuditLog, getFilteredAuditLogs
});

(async()=>{try{const a=JSON.parse(localStorage.getItem(AK)||'null');if(a&&a.ref){C.ref=a.ref;await refreshTok();await startAdmin()}}catch(x){if(x&&x.status&&[400,401].includes(x.status))cloudSignOut()}})();