
let rec,chunks=[],audio,timer,index=0;
const holder=document.querySelector('#steps');
const status=document.querySelector('#status');

for(let i=0;i<8;i++){
  const s=document.createElement('div');
  s.className='step'; s.textContent=i+1;
  s.onclick=()=>s.classList.toggle('on');
  holder.appendChild(s);
}
const steps=[...document.querySelectorAll('.step')];

async function setup(){
  const stream=await navigator.mediaDevices.getUserMedia({audio:true});
  rec=new MediaRecorder(stream);
  rec.ondataavailable=e=>chunks.push(e.data);
  rec.onstop=()=>{
    const blob=new Blob(chunks,{type:rec.mimeType});
    chunks=[]; audio=new Audio(URL.createObjectURL(blob));
    status.textContent='Sample ready.';
  };
}
record.onclick=async()=>{if(!rec)await setup();chunks=[];rec.start();status.textContent='Recording...';};
stopRec.onclick=()=>{if(rec&&rec.state==='recording')rec.stop();};
play.onclick=()=>{
  clearInterval(timer);index=0;
  timer=setInterval(()=>{
    steps.forEach(s=>s.classList.remove('playing'));
    const s=steps[index];
    s.classList.add('playing');
    if(s.classList.contains('on')&&audio){audio.currentTime=0;audio.play();}
    index=(index+1)%8;
  },350);
  status.textContent='Sequence playing.';
};
stop.onclick=()=>{clearInterval(timer);steps.forEach(s=>s.classList.remove('playing'));status.textContent='Stopped.';};
