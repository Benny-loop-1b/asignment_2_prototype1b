let rec, chunks = [], audio, timer, index = 0, stream;

const holder = document.querySelector("#steps");
const status = document.querySelector("#status");
const recordBtn = document.querySelector("#record");
const stopRecBtn = document.querySelector("#stopRec");
const playBtn = document.querySelector("#play");
const stopBtn = document.querySelector("#stop");

for (let i = 0; i < 8; i++) {
  const s = document.createElement("div");
  s.className = "step";
  s.textContent = i + 1;
  s.onclick = () => s.classList.toggle("on");
  holder.appendChild(s);
}

const steps = [...document.querySelectorAll(".step")];

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

playBtn.onclick = () => {
  if (!audio) {
    status.textContent = "Record a sample first.";
    return;
  }

  clearInterval(timer);
  index = 0;

  timer = setInterval(() => {
    steps.forEach(s => s.classList.remove("playing"));

    const s = steps[index];
    s.classList.add("playing");

    if (s.classList.contains("on") && audio) {
      audio.currentTime = 0;
      audio.play();
    }

    index = (index + 1) % 8;
  }, 350);

  status.textContent = "Sequence playing.";
};

stopBtn.onclick = () => {
  clearInterval(timer);

  steps.forEach(s => s.classList.remove("playing"));

  if (audio) {
    audio.pause();
    audio.currentTime = 0;
  }

  status.textContent = "Stopped.";
};