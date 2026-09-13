
let rec,chunks=[],audio;
const guide=document.querySelector('#guide');

async function setup(){
  const stream=await navigator.mediaDevices.getUserMedia({audio:true});
  rec=new MediaRecorder(stream);
  rec.ondataavailable=e=>chunks.push(e.data);
  rec.onstop=()=>{
    const blob=new Blob(chunks,{type:rec.mimeType});
    chunks=[]; audio=new Audio(URL.createObjectURL(blob));
    guide.textContent='Step 3 — Your sound is ready. Press Play.';
  };
}
record.onclick=async()=>{
  if(!rec)await setup();
  chunks=[];rec.start();
  guide.textContent='Step 2 — Recording now. Make a short sound and press Stop Recording.';
};
stopRec.onclick=()=>{if(rec&&rec.state==='recording')rec.stop();};
play.onclick=()=>{
  if(!audio){guide.textContent='Please record a sound first.';return;}
  audio.currentTime=0;audio.play();
  guide.textContent='Playing your sound. You can record another one when ready.';
};