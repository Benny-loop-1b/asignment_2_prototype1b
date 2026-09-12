let audioContext;
let analyser;
let stream;
let animationFrame;

const bar = document.querySelector("#bar");
const pulse = document.querySelector("#pulse");
const status = document.querySelector("#status");

document.querySelector("#startBtn").addEventListener("click", async function () {
  stream = await navigator.mediaDevices.getUserMedia({ audio: true });

  audioContext = new AudioContext();
  analyser = audioContext.createAnalyser();

  const source = audioContext.createMediaStreamSource(stream);
  source.connect(analyser);