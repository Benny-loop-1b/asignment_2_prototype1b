let audioContext;
let analyser;
let stream;
let animationFrame;

const bar = document.querySelector("#bar");
const pulse = document.querySelector("#pulse");
const status = document.querySelector("#status");
const startBtn = document.querySelector("#startBtn");
const stopBtn = document.querySelector("#stopBtn");

startBtn.addEventListener("click", async function () {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: true
      }
    });

    audioContext = new AudioContext();
    analyser = audioContext.createAnalyser();

    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);

    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.7;

    const data = new Uint8Array(analyser.frequencyBinCount);

    status.textContent = "Listening... speak, clap or tap.";

    function updateVisuals() {
      analyser.getByteFrequencyData(data);

      const average = data.reduce(function (total, value) {
        return total + value;
      }, 0) / data.length;

      const percent = Math.min(100, average * 2.5);

      bar.style.width = percent + "%";
      pulse.style.transform = "scale(" + (0.7 + percent / 140) + ")";

      animationFrame = requestAnimationFrame(updateVisuals);
    }

    updateVisuals();

  } catch (error) {
    console.error(error);
    status.textContent = "Microphone error: " + error.name;
  }
});

stopBtn.addEventListener("click", function () {
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