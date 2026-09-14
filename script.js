document.addEventListener("DOMContentLoaded", function () {

  let recorder;
  let chunks = [];
  let audio;
  let stream;

  const recordBtn = document.getElementById("record");
  const stopRecBtn = document.getElementById("stopRec");
  const playBtn = document.getElementById("play");
  const stopLoopBtn = document.getElementById("stopLoop");
  const statusText = document.getElementById("status");


  // Record
  recordBtn.onclick = async function () {

    statusText.textContent = "Requesting microphone...";

    try {

      stream = await navigator.mediaDevices.getUserMedia({
        audio: true
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

        const audioURL = URL.createObjectURL(blob);

        audio = new Audio(audioURL);

        audio.loop = true;

        statusText.textContent = "Recording ready.";

        // Turn microphone off
        stream.getTracks().forEach(function (track) {
          track.stop();
        });

      };


      recorder.start();

      statusText.textContent = "Recording...";

    }

    catch (error) {

      console.log(error);

      statusText.textContent =
        "Microphone error: " + error.name;

    }

  };


  // Stop recording
  stopRecBtn.onclick = function () {

    if (
      recorder &&
      recorder.state === "recording"
    ) {

      recorder.stop();

      statusText.textContent =
        "Processing recording...";

    }

    else {

      statusText.textContent =
        "You are not recording.";

    }

  };


  // Play loop
  playBtn.onclick = function () {

    if (!audio) {

      statusText.textContent =
        "Record a sound first.";

      return;

    }

    audio.currentTime = 0;

    audio.play();

    statusText.textContent =
      "Loop playing.";

  };


  // Stop loop
  stopLoopBtn.onclick = function () {

    if (audio) {

      audio.pause();

      audio.currentTime = 0;

    }

    statusText.textContent =
      "Loop stopped.";

  };

});