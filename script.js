
let ctx,analyser,stream,raf;
const canvas=document.querySelector('#canvas');
const g=canvas.getContext('2d');
const status=document.querySelector('#status');

start.onclick=async()=>{
  stream=await navigator.mediaDevices.getUserMedia({audio:true});
  ctx=new AudioContext();
  analyser=ctx.createAnalyser();
  ctx.createMediaStreamSource(stream).connect(analyser);
  analyser.fftSize=128;
  const data=new Uint8Array(analyser.frequencyBinCount);
  status.textContent='Listening... make a sound.';
  function draw(){
    analyser.getByteFrequencyData(data);
    g.clearRect(0,0,canvas.width,canvas.height);
    const w=canvas.width/data.length;
    data.forEach((v,i)=>{
      const h=(v/255)*canvas.height*.9;
      g.fillStyle='#f4f4f1';
      g.fillRect(i*w,canvas.height-h,Math.max(2,w-2),h);
    });
    raf=requestAnimationFrame(draw);
  }
  draw();
};
stop.onclick=()=>{
  cancelAnimationFrame(raf);
  if(stream)stream.getTracks().forEach(t=>t.stop());
  if(ctx)ctx.close();
  g.clearRect(0,0,canvas.width,canvas.height);
  status.textContent='Microphone off.';
};
