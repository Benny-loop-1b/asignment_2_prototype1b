let recorder, stream, audio;
let chunks = [];

const status = document.querySelector("#status");
const recordBtn = document.querySelector("#recordBtn");
const stopRecordBtn = document.querySelector("#stopRecordBtn");
const playBtn = document.querySelector("#playBtn");
const stopBtn = document.querySelector("#stopBtn");

recordBtn.onclick = async () => {
  try {
    if (audio) { audio.pause(); audio.currentTime = 0; }
    stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: true }
    });
    chunks = [];
    recorder = new MediaRecorder(stream);
    recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: recorder.mimeType });
      audio = new Audio(URL.createObjectURL(blob));
      audio.loop = true;
      audio.volume = 1;
      stream.getTracks().forEach(track => track.stop());
      status.textContent = "Recording ready. Press Play Loop.";
    };
    recorder.start();
    status.textContent = "Recording...";
  } catch (error) {
    console.error(error);
    status.textContent = "Microphone error: " + error.name;
  }
};

stopRecordBtn.onclick = () => {
  if (recorder && recorder.state === "recording") {
    recorder.stop();
    status.textContent = "Processing recording...";
  }
};

playBtn.onclick = async () => {
  if (!audio) { status.textContent = "Please record a sound first."; return; }
  try {
    audio.currentTime = 0;
    await audio.play();
    status.textContent = "Loop playing.";
  } catch (error) {
    console.error(error);
    status.textContent = "Playback error: " + error.name;
  }
};

stopBtn.onclick = () => {
  if (audio) { audio.pause(); audio.currentTime = 0; }
  status.textContent = "Loop stopped.";
};