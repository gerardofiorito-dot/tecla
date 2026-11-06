const $ = id => document.getElementById(id);
const wordBank = ['camino','tiempo','desafío','práctica','energía','teclado','velocidad','precisión','aprendizaje','objetivo','confianza','ritmo','palabra','memoria','atención','progreso','esfuerzo','constancia','experiencia','resultado','ventana','pantalla','tecla','movimiento','lectura','entrenamiento','habilidad','respuesta','concentración','descanso','mañana','música','árbol','rápido','difícil','fácil','corazón','canción','también','después'];
const paragraphs = [
'La práctica constante transforma una tarea difícil en una habilidad cada vez más natural. Lo importante no es escribir rápido desde el primer intento, sino mantener un ritmo cómodo y cuidar la precisión. Con pequeños desafíos diarios, la confianza y la velocidad pueden mejorar.',
'Cada palabra es una oportunidad para entrenar la atención. Mirá el texto, anticipá lo que sigue y dejá que tus manos acompañen el ritmo. No te detengas por un error: seguí adelante y concentrate en completar la prueba con precisión.',
'Aprender algo nuevo requiere paciencia, curiosidad y repetición. Un buen entrenamiento combina concentración y descanso. Medir los resultados permite reconocer avances, descubrir dificultades y elegir qué aspecto conviene practicar.',
'La velocidad no lo es todo. Una escritura clara y precisa ayuda a comunicar ideas, estudiar y trabajar mejor. Encontrá tu propio ritmo, mantené una postura cómoda y practicá un poco cada día.'
];
let mode='words', target='', startedAt=0, timerId=null, duration=60, finished=false;
function normalizeText(value){const n=value.normalize('NFC');return $('plain').checked?n.normalize('NFD').replace(/[\u0300-\u036f]/g,'').normalize('NFC'):n;}
function chars(s){return Array.from(s)}
function makeTarget(){if(mode==='words')return Array.from({length:220},()=>wordBank[Math.floor(Math.random()*wordBank.length)]).join(' ')+' ';let list=[...paragraphs].sort(()=>Math.random()-.5),out='';while(out.length<1800)out+=list[Math.floor(Math.random()*list.length)]+' ';return out;}
function escapeHtml(s){return s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function metrics(){const typed=chars(normalizeText($('typing').value)),expected=chars(normalizeText(target));let correct=0,errors=0;typed.forEach((c,i)=>{if(c===expected[i])correct++;else errors++;});let elapsed=startedAt?Math.max(.001,(Date.now()-startedAt)/1000):0;return{typed,expected,correct,errors,accuracy:typed.length?Math.round(correct/typed.length*100):100,wpm:elapsed?Math.round(correct/5/(elapsed/60)):0};}
function render(){const m=metrics(),from=Math.max(0,m.typed.length-15),to=Math.min(m.expected.length,Math.max(115,m.typed.length+115));let out='';for(let i=from;i<to;i++){let cls=i<m.typed.length?(m.typed[i]===m.expected[i]?'correct':'wrong'):(i===m.typed.length?'current':'');out+=`<span class="${cls}">${m.expected[i]===' '?'&nbsp;':escapeHtml(m.expected[i])}</span>`;}$('prompt').innerHTML=out;$('progressLabel').textContent=`${m.typed.length} caracteres`;$('liveWpm').textContent=m.wpm;$('liveAccuracy').textContent=m.accuracy+'%';}
function start(){if(startedAt||finished)return;startedAt=Date.now();$('status').textContent='PRUEBA EN CURSO';timerId=setInterval(tick,100);}
function tick(){let left=Math.max(0,duration-Math.floor((Date.now()-startedAt)/1000));$('time').textContent=left;render();if(left<=0)finish();}
function finish(){if(finished)return;finished=true;clearInterval(timerId);$('typing').disabled=true;$('status').textContent='PRUEBA FINALIZADA';const m=metrics();$('finalWpm').textContent=m.wpm;$('finalAccuracy').textContent=m.accuracy+'%';$('finalCorrect').textContent=m.correct;$('finalErrors').textContent=m.errors;$('result').classList.remove('hidden');$('result').scrollIntoView({behavior:'smooth',block:'nearest'});}
function reset(){clearInterval(timerId);startedAt=0;timerId=null;finished=false;duration=Number($('duration').value);target=makeTarget();$('typing').disabled=false;$('typing').value='';$('time').textContent=duration;$('liveWpm').textContent='0';$('liveAccuracy').textContent='100%';$('result').classList.add('hidden');$('status').textContent='LISTO PARA EMPEZAR';render();$('typing').focus();}
$('typing').addEventListener('input',()=>{if($('typing').value.length)start();render();if(chars(normalizeText($('typing').value)).length>=chars(normalizeText(target)).length)finish();});
$('typing').addEventListener('keydown',e=>{if(e.key==='Enter'&&mode==='words')e.preventDefault();});
$('duration').addEventListener('change',reset);$('plain').addEventListener('change',()=>{render();$('typing').focus();});
document.querySelectorAll('.segment').forEach(b=>b.addEventListener('click',()=>{mode=b.dataset.mode;document.querySelectorAll('.segment').forEach(x=>x.classList.toggle('active',x===b));reset();}));
$('restart').addEventListener('click',reset);$('again').addEventListener('click',reset);
document.addEventListener('keydown',e=>{const a=document.activeElement,control=a&&['SELECT','BUTTON','INPUT'].includes(a.tagName);if(a!==$('typing')&&!control&&!e.ctrlKey&&!e.altKey&&!e.metaKey&&e.key.length===1)$('typing').focus();});
reset();
