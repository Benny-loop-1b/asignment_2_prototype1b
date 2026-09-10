
let rec, chunks=[], audio, timer;
const status=document.querySelector('#status');

async function setup(){
  const stream=await navigator.mediaDevices.getUserMedia({audio:true});
  rec=new MediaRecorder(stream);
  rec.ondataavailable=e=>chunks.push(e.data);
  rec.onstop=()=>{
    const blob=new Blob(chunks,{type:rec.mimeType});
    chunks=[];
    audio=new Audio(URL.createObjectURL(blob));
    status.textContent='Recording ready.';
  };
}
record.onclick=async()=>{
  if(!rec) await setup();
  chunks=[]; rec.start(); status.textContent='Recording...';
};
stopRec.onclick=()=>{ if(rec && rec.state==='recording') rec.stop(); };
play.onclick=()=>{
  if(!audio){status.textContent='Record a sound first.';return;}
  clearInterval(timer);
  audio.currentTime=0; audio.play();
  timer=setInterval(()=>{audio.currentTime=0;audio.play();},2000);
  status.textContent='Loop playing.';
};
stopLoop.onclick=()=>{
  clearInterval(timer);
  if(audio){audio.pause();audio.currentTime=0;}
  status.textContent='Loop stopped.';
};