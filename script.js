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