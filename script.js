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

  analyser.fftSize = 256;

  const data = new Uint8Array(analyser.frequencyBinCount);

  status.textContent = "Listening... speak, clap or tap.";

  function updateVisuals() {
    analyser.getByteFrequencyData(data);

    const average = data.reduce(function (total, value) {
      return total + value;
    }, 0) / data.length;

    const percent = Math.min(100, average * 1.6);

    bar.style.width = percent + "%";
    pulse.style.transform = "scale(" + (0.7 + percent / 180) + ")";

    animationFrame = requestAnimationFrame(updateVisuals);
  }

  updateVisuals();
});

document.querySelector("#stopBtn").addEventListener("click", function () {
  cancelAnimationFrame(animationFrame);

  if (stream) {
    stream.getTracks().forEach(function (track) {
      track.stop();
    });
  }

  if (audioContext) {
    audioContext.close();
  }

  bar.style.width = "0%";
  pulse.style.transform = "scale(0.7)";
  status.textContent = "Microphone stopped.";
});