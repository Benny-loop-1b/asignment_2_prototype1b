
let rec,chunks=[],audio,timer,index=0;
const circle=document.querySelector('#circle');
const status=document.querySelector('#status');

for(let i=0;i<8;i++){
  const b=document.createElement('div');
  b.className='beat';
  b.textContent=i+1;
  const angle=(Math.PI*2/8)*i-Math.PI/2, r=112;
  b.style.left=(118+Math.cos(angle)*r)+'px';
  b.style.top=(118+Math.sin(angle)*r)+'px';
  circle.appendChild(b);
}
const beats=[...document.querySelectorAll('.beat')];

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
start.onclick=()=>{
  clearInterval(timer);index=0;
  timer=setInterval(()=>{
    beats.forEach(b=>b.classList.remove('active'));
    beats[index].classList.add('active');
    if(index===0&&audio){audio.currentTime=0;audio.play();}
    index=(index+1)%8;
  },350);
  status.textContent='Circular loop running.';
};
stop.onclick=()=>{clearInterval(timer);beats.forEach(b=>b.classList.remove('active'));status.textContent='Stopped.';};
