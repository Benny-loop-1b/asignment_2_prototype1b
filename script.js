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