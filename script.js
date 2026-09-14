
let rec, chunks = [], audio, timer, index = 0, stream;

const circle = document.querySelector("#circle");
const status = document.querySelector("#status");
const recordBtn = document.querySelector("#record");
const stopRecBtn = document.querySelector("#stopRec");
const startBtn = document.querySelector("#start");
const stopBtn = document.querySelector("#stop");

for (let i = 0; i < 8; i++) {
  const b = document.createElement("div");
  b.className = "beat";
  b.textContent = i + 1;

  const angle = (Math.PI * 2 / 8) * i - Math.PI / 2;
  const r = 112;

  b.style.left = (118 + Math.cos(angle) * r) + "px";
  b.style.top = (118 + Math.sin(angle) * r) + "px";

  circle.appendChild(b);
}

const beats = [...document.querySelectorAll(".beat")];

async function setup() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: true
      }
    });

    rec = new MediaRecorder(stream);

    rec.ondataavailable = e => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    rec.onstop = () => {
      const blob = new Blob(chunks, { type: rec.mimeType });
      chunks = [];

      audio = new Audio(URL.createObjectURL(blob));
      audio.volume = 1;

      status.textContent = "Sample ready.";

      stream.getTracks().forEach(track => track.stop());
    };

  } catch (error) {
    console.error(error);
    status.textContent = "Microphone error: " + error.name;
  }
}

recordBtn.onclick = async () => {
  await setup();
  chunks = [];
  rec.start();
  status.textContent = "Recording...";
};

stopRecBtn.onclick = () => {
  if (rec && rec.state === "recording") {
    rec.stop();
    status.textContent = "Processing...";
  }
};

startBtn.onclick = () => {
  if (!audio) {
    status.textContent = "Record a sample first.";
    return;
  }

  clearInterval(timer);
  index = 0;

  timer = setInterval(() => {
    beats.forEach(b => b.classList.remove("active"));
    beats[index].classList.add("active");

    if (index === 0) {
      audio.currentTime = 0;
      audio.play();
    }

    index = (index + 1) % 8;
  }, 350);

  status.textContent = "Circular loop running.";
};

stopBtn.onclick = () => {
  clearInterval(timer);

  beats.forEach(b => b.classList.remove("active"));

  if (audio) {
    audio.pause();
    audio.currentTime = 0;
  }

  status.textContent = "Stopped.";
};