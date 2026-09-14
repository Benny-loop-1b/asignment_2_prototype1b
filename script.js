let recorder;
let chunks = [];
let audio = null;
let timer = null;
let currentStep = 0;

const stepHolder = document.querySelector("#steps");
const status = document.querySelector("#status");

for (let i = 0; i < 8; i++) {
  const step = document.createElement("div");

  step.className = "step";
  step.textContent = i + 1;

  step.addEventListener("click", function () {
    step.classList.toggle("on");
  });

  stepHolder.appendChild(step);
}

const steps = document.querySelectorAll(".step");

async function setupMicrophone() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

  recorder = new MediaRecorder(stream);

  recorder.ondataavailable = function (event) {
    chunks.push(event.data);
  };

  recorder.onstop = function () {
    const blob = new Blob(chunks, { type: recorder.mimeType });
    chunks = [];

    audio = new Audio(URL.createObjectURL(blob));

    status.textContent = "Sample ready.";
  };
}

document.querySelector("#recordBtn").addEventListener("click", async function () {
  if (!recorder) {
    await setupMicrophone();
  }

  chunks = [];
  recorder.start();

  status.textContent = "Recording sample...";
});

document.querySelector("#stopRecordBtn").addEventListener("click", function () {
  if (recorder && recorder.state === "recording") {
    recorder.stop();
  }
});

document.querySelector("#playBtn").addEventListener("click", function () {
  clearInterval(timer);

  currentStep = 0;

  timer = setInterval(function () {
    steps.forEach(function (step) {
      step.classList.remove("playing");
    });

    const step = steps[currentStep];
    step.classList.add("playing");

    if (step.classList.contains("on") && audio) {
      audio.currentTime = 0;
      audio.play();
    }

    currentStep = (currentStep + 1) % 8;
  }, 350);

  status.textContent = "Sequence playing.";
});

document.querySelector("#stopBtn").addEventListener("click", function () {
  clearInterval(timer);

  steps.forEach(function (step) {
    step.classList.remove("playing");
  });

  status.textContent = "Sequence stopped.";
});