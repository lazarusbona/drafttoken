function init_tka(){

(()=>{
const root=document.getElementById('tka'),$=s=>root.querySelector('#tka-'+s),svg=$('map'),ns='http://www.w3.org/2000/svg';
const fmt=n=>new Intl.NumberFormat('id-ID',{maximumFractionDigits:0}).format(n);
const colors=['var(--viz-series-1)','var(--viz-series-2)','var(--viz-series-3)'];
let seed=773;function rand(){seed=(Math.imul(1664525,seed)+1013904223)>>>0;return seed/4294967296;}
const accuracy=[[.98,.75,.35],[.99,.95,.72],[.995,.98,.92]],questions=[];
for(let i=0;i<60;i++){const d=i%10<7?0:i%10<9?1:2;const ok=accuracy.map(a=>rand()<a[d]);const scores=ok.map(b=>b?75+rand()*25:30+rand()*65);const predicted=rand()<.85?d:(d+1+Math.floor(rand()*2))%3;questions.push({d,ok,scores,predicted});}
let positions={},counts=[0,0,0],sent=0,done=0,correct=0,cost=0,escalations=0,particles=[],running=false,last=0,clock=0,next=0,raf=0,records=[],circles,labels={};
let auto=false,repeat=null;
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
function el(tag,attrs={},txt){const e=document.createElementNS(ns,tag);for(const [k,v]of Object.entries(attrs))e.setAttribute(k,v);if(txt!==undefined)e.textContent=txt;return e;}
function line(a,b){svg.appendChild(el('line',{x1:a[0],y1:a[1],x2:b[0],y2:b[1],stroke:'var(--border)','stroke-width':1.5}));}
function draw(){const w=Math.max(300,root.getBoundingClientRect().width),mobile=w<600,h=mobile?220:370;svg.setAttribute('viewBox',`0 0 ${w} ${h}`);svg.style.height=h+'px';svg.replaceChildren();
positions=mobile?{q:[w*.18,26],r:[w*.65,26],m0:[w/6,110],m1:[w/2,110],m2:[w*5/6,110],ok:[w*.27,192],bad:[w*.73,192]}:{q:[w*.09,182],r:[w*.28,182],m0:[w*.55,65],m1:[w*.55,182],m2:[w*.55,300],ok:[w*.86,125],bad:[w*.86,260]};
line(positions.q,positions.r);for(let m=0;m<3;m++){line(positions.r,positions['m'+m]);line(positions['m'+m],positions.ok);line(positions['m'+m],positions.bad);}line(positions.m0,positions.m1);line(positions.m1,positions.m2);
const nodes=[['q','Pertanyaan','60 au total'],['r','tokenku.ai','Pilih model'],['m0','Ekonomis','Rp10 / coba'],['m1','Menengah','Rp40 / coba'],['m2','Premium','Rp200 / coba'],['ok','Benar','0'],['bad','Salah','0']];
labels={};for(const [id,title,sub] of nodes){const [x,y]=positions[id],isModel=id[0]==='m',bw=mobile?Math.min(96,w/3-8):isModel?124:104;svg.appendChild(el('rect',{x:x-bw/2,y:y-(mobile?23:29),width:bw,height:mobile?46:58,rx:10,fill:'var(--background)',stroke:'var(--border)'}));if(isModel)svg.appendChild(el('rect',{x:x-bw/2+1,y:y-(mobile?22:28),width:bw-2,height:mobile?44:56,rx:9,fill:colors[+id[1]],opacity:.12}));svg.appendChild(el('text',{x,y:y-5,'text-anchor':'middle'},title));const t=el('text',{x,y:y+15,'text-anchor':'middle'},id==='q'?'60 masuk':sub);svg.appendChild(t);labels[id]=t;}
const ex=positions.m0[0]+(mobile?58:72);if(!mobile)svg.appendChild(el('text',{x:ex,y:(positions.m0[1]+positions.m1[1])/2,'text-anchor':'middle'},'↑ kemampuan'));
circles=el('g');svg.appendChild(circles);update();paint();}
function route(q){let m=$('mode').value==='premium'?2:q.predicted,path=['q','r','m'+m],bill=$('mode').value==='premium'?0:1,tries=[],esc=0;
while(true){tries.push(m);bill+=[10,40,200][m];if($('mode').value==='cascade'&&m<2){bill+=2;if(q.scores[m]<+$('th').value){m++;esc++;path.push('m'+m);continue;}}break;}
path.push(q.ok[m]?'ok':'bad');return {path,bill,tries,esc,good:q.ok[m],final:m,q};}
function update(){const avg=done?cost/done*1000:0;$('cost').textContent=done?'Rp '+fmt(avg):'—';$('save').textContent=done?((1-avg/200000)*100).toFixed(1)+'%':'—';$('accuracy').textContent=done?(100*correct/done).toFixed(1)+'%':'—';$('progress').textContent=(done===60?'Selesai':running?'Berjalan':'Siap / jeda')+' · '+done+' / 60 selesai';$('bar-value').textContent=done?'Rp '+fmt(avg):'—';$('livebar').style.width=100*avg/Math.max(200000,avg)+'%';$('current').textContent=$('mode').selectedOptions[0].textContent;
if(labels.ok){labels.ok.textContent=correct+' jawaban';labels.bad.textContent=(done-correct)+' jawaban';for(let m=0;m<3;m++)labels['m'+m].textContent=counts[m]+' percobaan';labels.q.textContent=sent+' / 60 masuk';}
}
function paint(){circles.replaceChildren();for(const p of particles){const t=Math.min(p.age/480,p.path.length-1),i=Math.min(Math.floor(t),p.path.length-2),f=t-i,a=positions[p.path[i]],b=positions[p.path[i+1]];circles.appendChild(el('circle',{cx:a[0]+(b[0]-a[0])*f,cy:a[1]+(b[1]-a[1])*f,r:4,fill:colors[p.q.d]}));}}
function finish(p){done++;correct+=+p.good;cost+=p.bill;escalations+=p.esc;p.tries.forEach(m=>counts[m]++);records.push(p);$('detail').textContent='Terakhir: '+['mudah','sedang','sulit'][p.q.d]+' → '+p.tries.map(m=>['ekonomis','menengah','premium'][m]).join(' → ')+' · '+(p.good?'benar':'salah')+' · Total eskalasi '+escalations;}
function frame(t){if(!running)return;const dt=last?Math.min(t-last,70):0;last=t;clock+=dt;if(sent<60&&clock>=next){const p=route(questions[sent++]);p.age=0;particles.push(p);next=clock+230;}
for(const p of particles)p.age+=dt;particles=particles.filter(p=>{if(p.age>=(p.path.length-1)*480){finish(p);return false;}return true;});paint();update();if(done===60){running=false;repeat=setTimeout(()=>{if(auto){reset();start();}},2500);$('play').textContent='Putar lagi';$('mode').disabled=false;$('th').disabled=false;return;}raf=requestAnimationFrame(frame);}
function reset(){cancelAnimationFrame(raf);running=false;last=clock=next=sent=done=correct=cost=escalations=0;particles=[];records=[];counts=[0,0,0];$('play').textContent='Jalankan animasi';$('mode').disabled=false;$('th').disabled=false;$('thv').textContent=$('th').value;$('detail').textContent='Titik = pertanyaan · Garis antarmodel = eskalasi';update();paint();}
function start(){if(running)return;clearTimeout(repeat);if(done===60)reset();if(reduce){sent=60;questions.forEach(q=>finish(route(q)));update();return;}running=true;last=0;$('play').textContent='Jeda';raf=requestAnimationFrame(frame);}
function pause(){auto=false;clearTimeout(repeat);running=false;last=0;cancelAnimationFrame(raf);update();}
$('play').addEventListener('click',()=>running?pause():start());
$('reset').addEventListener('click',()=>{reset();if(auto)start();});
$('mode').addEventListener('change',()=>{clearTimeout(repeat);reset();if(auto)start();});
$('th').addEventListener('input',()=>{clearTimeout(repeat);reset();if(auto)start();});
root.addEventListener('simulation:pause',pause);
root.addEventListener('simulation:resume',()=>{auto=true;start();});
new ResizeObserver(()=>{if(root.getBoundingClientRect().width)draw();}).observe(root);draw();
})();

}
function init_me(){

(()=>{
const root=document.getElementById('me'),$=id=>root.querySelector('#me-'+id),svg=$('svg'),ns='http://www.w3.org/2000/svg';
const names=['JUNIOR','MIDDLE','SENIOR','GOAT'],desc=['Semua tugas → Astra, effort max.','Pilih model manual; effort selalu high.','Mulai Luna low; tes gagal → Sol medium → Astra high.','tokenku.ai memilih model + effort; tes gagal → eskalasi.'];
const tasks=['Perbaiki typo','Format JSON','Validasi formulir','Perbaiki bug API','Refactor lintas file','Perbaiki race condition'];
const models=['GPT-6 Luna','GPT-6.1 Sol','GPT-6 Astra'],short=['Luna','Sol','Astra'],efforts=['low','medium','high','xhigh','max'],rates=[[.1,.5],[2,10],[10,50]],input=[2000,4000,6000,10000,16000,24000],output=[400,600,800,1200,1600,2400],mult=[1,2,5,10,24],need=[1,1,2,4,5,6];
const dollars=n=>'$'+n.toFixed(4),number=n=>new Intl.NumberFormat('id-ID').format(n);
function attempts(mode,t){let seq=mode===0?[[2,4]]:mode===1?[[t<3?0:t<5?1:2,2]]:mode===2?[[0,0],[1,1],[2,2]]:t<2?[[0,0]]:t===2?[[0,0],[0,1]]:[[1,t-2],[2,2]];let result=[];for(const [m,e]of seq){let pass=[1,3,6][m]+e>=need[t];result.push({m,e,pass,cost:(input[t]*rates[m][0]+output[t]*mult[e]*rates[m][1])/1e6,tokens:input[t]+output[t]*mult[e]});if(pass)break;}return result;}
function events(mode){let list=[];for(let t=0;t<6;t++){if(mode===3)list.push({kind:'router',t,cost:.00007,tokens:460});attempts(mode,t).forEach((a,j)=>{list.push({...a,t,j,kind:'model'});list.push({...a,t,j,kind:'verify'});});}return list;}
const totals=names.map((_,mode)=>{let ev=events(mode),cost=0,solved=0;for(const e of ev)if(e.kind==='router'||e.kind==='verify'){cost+=e.cost;if(e.kind==='verify'&&e.pass)solved++;}return {cost,solved};});
let auto=false,repeat=null;
let mode=3,list=events(3),idx=0,spent=0,tokens=0,solved=0,retries=0,timer=null,raf=null,positions={},labels={},marks=[],marker,active=null,ledger=Array(6).fill(''),taskCosts=Array(6).fill(0),lastNode='q';
function el(tag,attr={},text){const e=document.createElementNS(ns,tag);Object.entries(attr).forEach(([k,v])=>e.setAttribute(k,v));if(text!==undefined)e.textContent=text;return e;}
function draw(){const w=Math.max(300,root.getBoundingClientRect().width),xs=[w/6,w/2,w*5/6];const mobile=w<600;svg.setAttribute('viewBox',`0 0 ${w} ${mobile?235:345}`);svg.style.height=(w<600?'220':'345')+'px';svg.replaceChildren();positions={q:[w/2,25],r:[w/2,mobile?77:80],v:[w/2,mobile?181:253]};xs.forEach((x,i)=>positions['m'+i]=[x,mobile?129:167]);const links=[['q','r'],...xs.map((_,i)=>['r','m'+i]),...xs.map((_,i)=>['m'+i,'v'])];links.forEach(([a,b])=>svg.appendChild(el('line',{x1:positions[a][0],y1:positions[a][1],x2:positions[b][0],y2:positions[b][1],stroke:'var(--border)','stroke-width':1.5})));
labels={};const node=(id,title,sub,bw,bh)=>{let[x,y]=positions[id];svg.appendChild(el('rect',{x:x-bw/2,y:y-bh/2,width:bw,height:bh,rx:8,fill:'var(--background)',stroke:'var(--border)'}));svg.appendChild(el('text',{x,y:y-5,'text-anchor':'middle'},title));labels[id]=el('text',{x,y:y+15,'text-anchor':'middle'},sub);svg.appendChild(labels[id]);};node('q','6 tugas coding','Workload yang sama',165,45);node('r',mode===3?'tokenku.ai':mode===2?'Mulai termurah':'Pilihan model',names[mode],165,45);xs.forEach((x,i)=>node('m'+i,models[i],'Effort: —',Math.min(w/3-10,160),mobile?44:70));node('v','Verifikasi tes','Menunggu',165,45);
marks=[];for(let i=0;i<6;i++){const x=(i+.5)*w/6;svg.appendChild(el('circle',{cx:x,cy:mobile?222:315,r:mobile?10:15,fill:'var(--muted)'}));const t=el('text',{x,y:mobile?226:319,'text-anchor':'middle'},String(i+1));svg.appendChild(t);marks.push(t);}marker=el('circle',{r:5,fill:'var(--viz-series-1)',cx:positions[lastNode][0],cy:positions[lastNode][1]});svg.appendChild(marker);render();}
function render(){ $('cost').textContent=dollars(spent);$('pass').textContent=solved+' / 6';$('unit').textContent=solved?dollars(spent/solved):'—';$('counts').textContent=number(tokens)+' token · '+retries+' percobaan ulang';$('desc').textContent=desc[mode];if(active){if(active.kind==='model')labels['m'+active.m].textContent='Effort: '+efforts[active.e];if(active.kind==='verify')labels.v.textContent=active.pass?'PASS':'FAIL → naik';}for(let i=0;i<6;i++)marks[i].textContent=ledger[i].endsWith('PASS')?'✓':String(i+1);
$('ledger').innerHTML=tasks.map((t,i)=>'<tr><td>'+t+'</td><td>'+(ledger[i]||'—')+'</td><td>'+dollars(taskCosts[i])+'</td></tr>').join('');}
function move(target){cancelAnimationFrame(raf);const a=positions[lastNode],b=positions[target];lastNode=target;if(matchMedia('(prefers-reduced-motion: reduce)').matches){marker.setAttribute('cx',b[0]);marker.setAttribute('cy',b[1]);return;}let start;function f(t){if(!start)start=t;const p=Math.min(1,(t-start)/550);marker.setAttribute('cx',a[0]+(b[0]-a[0])*p);marker.setAttribute('cy',a[1]+(b[1]-a[1])*p);if(p<1)raf=requestAnimationFrame(f);}raf=requestAnimationFrame(f);}
function stop(){clearInterval(timer);timer=null;$('play').textContent=idx>=list.length?'Putar lagi':'Lanjutkan';}
function step(){if(idx>=list.length){stop();return;}const e=list[idx++];active=e;let message='Tugas '+(e.t+1)+' · '+tasks[e.t]+' · ';
if(e.kind==='router'){spent+=e.cost;tokens+=e.tokens;taskCosts[e.t]+=e.cost;ledger[e.t]='tokenku.ai; ';message+='tokenku.ai memilih model + effort';move('r');}
if(e.kind==='model'){message+=short[e.m]+' / '+efforts[e.e]+(e.j?' · eskalasi':'');move('m'+e.m);labels['m'+e.m].textContent='Effort: '+efforts[e.e];}
if(e.kind==='verify'){spent+=e.cost;tokens+=e.tokens;taskCosts[e.t]+=e.cost;retries+=e.j>0?1:0;solved+=e.pass?1:0;ledger[e.t]+=short[e.m]+' '+efforts[e.e]+' '+(e.pass?'PASS':'FAIL; ');message+=e.pass?'tes lolos':'tes gagal → coba konfigurasi berikutnya';move('v');}
$('status').textContent=message;render();if(idx===list.length){stop();repeat=setTimeout(()=>{if(auto){reset();start();}},2500);$('status').textContent='Selesai · '+solved+'/6 lolos tes simulasi · '+retries+' percobaan ulang';}}
function reset(){stop();cancelAnimationFrame(raf);list=events(mode);idx=spent=tokens=solved=retries=0;ledger=Array(6).fill('');taskCosts=Array(6).fill(0);active=null;lastNode='q';$('play').textContent='Jalankan';$('status').textContent='Siap · Tugas 1: '+tasks[0];root.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',Number(b.dataset.mode)===mode));draw();bars();}
function bars(){const max=Math.max(...totals.map(t=>t.cost/t.solved));$('bars').innerHTML=totals.map((r,i)=>'<div class="barrow"><div class="barlabel"><span>'+names[i]+(i===mode?' · dipilih':'')+'</span><span class="tabular-nums">'+dollars(r.cost/r.solved)+'</span></div><div class="track"><div class="fill" style="width:'+100*r.cost/r.solved/max+'%;opacity:'+(i===mode?1:.4)+'"></div></div></div>').join('');}
function start(){if(timer)return;clearTimeout(repeat);if(idx>=list.length)reset();$('play').textContent='Jeda';step();if(idx<list.length)timer=setInterval(step,1000);}
root.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>{clearTimeout(repeat);mode=Number(b.dataset.mode);reset();if(auto)start();}));
$('play').addEventListener('click',()=>timer?stop():start());$('next').addEventListener('click',()=>{stop();step();});$('reset').addEventListener('click',()=>{clearTimeout(repeat);reset();if(auto)start();});
root.addEventListener('simulation:pause',()=>{auto=false;clearTimeout(repeat);stop();cancelAnimationFrame(raf);});
root.addEventListener('simulation:resume',()=>{auto=true;start();});
new ResizeObserver(()=>{if(root.getBoundingClientRect().width)draw();}).observe(root);reset();
})();

}
(()=>{
const tabs=[...document.querySelectorAll('.efficiency-tabs [role="tab"]')];let started=false,visible=false,selected=0;
function select(i){selected=i;
 document.getElementById('tka').dispatchEvent(new Event('simulation:pause'));
 document.getElementById('me').dispatchEvent(new Event('simulation:pause'));
 tabs.forEach((t,j)=>{t.setAttribute('aria-selected',String(i===j));t.tabIndex=i===j?0:-1;document.getElementById(t.getAttribute('aria-controls')).hidden=i!==j;});
 document.getElementById('sim-explanation').innerHTML=i===0?'<strong>tokenku.ai memilih model pertama. Cascade menaikkan kemampuan bila diperlukan.</strong><p>Bandingkan semua pertanyaan ke premium, tokenku.ai saja, dan tokenku.ai dengan pemeriksaan serta eskalasi. Percobaan ulang tetap memakai biaya.</p>':'<strong>Model yang sama bisa bekerja dengan tingkat effort berbeda.</strong><p>Effort mengatur upaya penalaran model. Bandingkan empat strategi pada enam tugas coding yang sama; verifikasi menentukan kapan percobaan perlu diulang.</p>';
 if(i===1&&!started){init_me();started=true;}
 resume();
}
init_tka();tabs.forEach((t,i)=>{t.addEventListener('click',()=>select(i));t.addEventListener('keydown',e=>{let next=e.key==='Home'?0:e.key==='End'?1:['ArrowRight','ArrowLeft'].includes(e.key)?1-i:null;if(next!==null){e.preventDefault();select(next);tabs[next].focus();}});});
const pause=()=>{['tka','me'].forEach(id=>document.getElementById(id).dispatchEvent(new Event('simulation:pause')));};
function resume(){if(visible&&!document.hidden)document.getElementById(selected===0?'tka':'me').dispatchEvent(new Event('simulation:resume'));}
document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();else resume();});
new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)resume();else pause();},{threshold:0.1}).observe(document.querySelector('.simulation-shell'));
})();
