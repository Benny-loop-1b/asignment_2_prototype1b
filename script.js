let ctx, analyser, stream, raf;

const canvas = document.querySelector("#canvas");
const g = canvas.getContext("2d");
const status = document.querySelector("#status");
const startBtn = document.querySelector("#start");
const stopBtn = document.querySelector("#stop");

startBtn.onclick = async () => {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: true
      }
    });

    ctx = new AudioContext();
    analyser = ctx.createAnalyser();

    const source = ctx.createMediaStreamSource(stream);
    source.connect(analyser);

    analyser.fftSize = 128;
    analyser.smoothingTimeConstant = 0.7;

    const data = new Uint8Array(analyser.frequencyBinCount);

    status.textContent = "Listening... make a sound.";

    function draw() {
      analyser.getByteFrequencyData(data);

      g.clearRect(0, 0, canvas.width, canvas.height);

      const w = canvas.width / data.length;

      data.forEach((v, i) => {
        const boosted = Math.min(255, v * 1.8);
        const h = (boosted / 255) * canvas.height * 0.9;

        g.fillStyle = "#f4f4f1";
        g.fillRect(
          i * w,
          canvas.height - h,
          Math.max(2, w - 2),
          h
        );
      });

      raf = requestAnimationFrame(draw);
    }

    draw();

  } catch (error) {
    console.error(error);
    status.textContent = "Microphone error: " + error.name;
  }
};

stopBtn.onclick = () => {
  cancelAnimationFrame(raf);

  if (stream) {
    stream.getTracks().forEach(t => t.stop());
  }

  if (ctx) {
    ctx.close();
  }

  g.clearRect(0, 0, canvas.width, canvas.height);

  status.textContent = "Microphone off.";
};