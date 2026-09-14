let rec, chunks = [], audio, stream;

const guide = document.querySelector("#guide");
const recordBtn = document.querySelector("#record");
const stopRecBtn = document.querySelector("#stopRec");
const playBtn = document.querySelector("#play");

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

      guide.textContent = "Step 3 — Your sound is ready. Press Play.";

      stream.getTracks().forEach(track => track.stop());
    };

  } catch (error) {
    console.error(error);
    guide.textContent = "Microphone error: " + error.name;
  }
}

recordBtn.onclick = async () => {
  await setup();

  chunks = [];
  rec.start();

  guide.textContent =
    "Step 2 — Recording now. Make a short sound and press Stop Recording.";
};

stopRecBtn.onclick = () => {
  if (rec && rec.state === "recording") {
    rec.stop();
    guide.textContent = "Processing your recording...";
  }
};

playBtn.onclick = () => {
  if (!audio) {
    guide.textContent = "Please record a sound first.";
    return;
  }

  audio.currentTime = 0;
  audio.play();

  guide.textContent =
    "Playing your sound. You can record another one when ready.";
};