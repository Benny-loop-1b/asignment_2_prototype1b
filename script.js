let recorder;
let chunks = [];
let recordedAudio;
let stream;
let timer;
let currentBeat = 0;

const circle = document.querySelector("#circle");
const status = document.querySelector("#status");

const recordBtn = document.querySelector("#record");
const stopRecBtn = document.querySelector("#stopRec");
const startBtn = document.querySelector("#start");
const stopBtn = document.querySelector("#stop");

for (let i = 0; i < 8; i++) {
  const beat = document.createElement("div");

  beat.className = "beat";
  beat.textContent = i + 1;

  const angle = (Math.PI * 2 / 8) * i - Math.PI / 2;
  const radius = 105;

  beat.style.left =
    (112 + Math.cos(angle) * radius) + "px";

  beat.style.top =
    (112 + Math.sin(angle) * radius) + "px";

  circle.appendChild(beat);
}

const beats = document.querySelectorAll(".beat");

recordBtn.onclick = async function () {
  try {
    if (timer) {
      clearInterval(timer);
    }

    if (recordedAudio) {
      recordedAudio.pause();
    }

    stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: true
      }
    });

    chunks = [];

    recorder = new MediaRecorder(stream);

    recorder.ondataavailable = function (event) {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    recorder.onstop = function () {
      const blob = new Blob(chunks, {
        type: recorder.mimeType
      });

      const audioURL =
        URL.createObjectURL(blob);

      recordedAudio =
        new Audio(audioURL);

      recordedAudio.volume = 1;

      status.textContent =
        "Recording ready. Press Start Loop.";

      stream.getTracks().forEach(function (track) {
        track.stop();
      });
    };

    recorder.start();

    status.textContent =
      "Recording...";

  } catch (error) {
    console.error(error);

    status.textContent =
      "Microphone error: " + error.name;
  }
};

stopRecBtn.onclick = function () {
  if (
    recorder &&
    recorder.state === "recording"
  ) {
    recorder.stop();

    status.textContent =
      "Processing recording...";
  }
};

startBtn.onclick = function () {
  if (!recordedAudio) {
    status.textContent =
      "Please record a sound first.";
    return;
  }

  clearInterval(timer);

  currentBeat = 0;

  beats.forEach(function (beat) {
    beat.classList.remove("active");
  });

  runBeat();

  timer = setInterval(
    runBeat,
    400
  );

  status.textContent =
    "Circular loop running.";
};

function runBeat() {
  beats.forEach(function (beat) {
    beat.classList.remove("active");
  });

  beats[currentBeat]
    .classList.add("active");

  if (currentBeat === 0) {
    recordedAudio.currentTime = 0;

    recordedAudio.play()
      .catch(function (error) {
        console.error(error);
      });
  }

  currentBeat =
    (currentBeat + 1) % 8;
}

stopBtn.onclick = function () {
  clearInterval(timer);

  beats.forEach(function (beat) {
    beat.classList.remove("active");
  });

  if (recordedAudio) {
    recordedAudio.pause();
    recordedAudio.currentTime = 0;
  }

  status.textContent =
    "Loop stopped.";
};