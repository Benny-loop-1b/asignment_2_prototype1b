document.addEventListener("DOMContentLoaded", function () {
  let recorder;
  let chunks = [];
  let recordedAudio;
  let audioURL;
  let stream;

  const recordBtn = document.querySelector("#recordBtn");
  const stopRecordBtn =
    document.querySelector("#stopRecordBtn");
  const playBtn = document.querySelector("#playBtn");
  const stopBtn = document.querySelector("#stopBtn");
  const status = document.querySelector("#status");

  // Make sure that all required HTML elements exist.
  if (
    !recordBtn ||
    !stopRecordBtn ||
    !playBtn ||
    !stopBtn ||
    !status
  ) {
    console.error("Some HTML elements are missing.");
    return;
  }

  // Check whether microphone recording is supported.
  if (
    !navigator.mediaDevices ||
    !navigator.mediaDevices.getUserMedia ||
    !window.MediaRecorder
  ) {
    status.textContent =
      "Microphone recording is not supported in this browser.";

    recordBtn.disabled = true;
    return;
  }

  // Set the initial button states.
  stopRecordBtn.disabled = true;
  playBtn.disabled = true;
  stopBtn.disabled = true;

  // Start recording.
  recordBtn.addEventListener("click", async function () {
    try {
      stopAudio();

      stream =
        await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: true
          }
        });

      chunks = [];
      recorder = new MediaRecorder(stream);

      recorder.addEventListener(
        "dataavailable",
        function (event) {
          if (event.data.size > 0) {
            chunks.push(event.data);
          }
        }
      );

      recorder.addEventListener("stop", function () {
        const blob = new Blob(chunks, {
          type: recorder.mimeType || "audio/webm"
        });

        if (audioURL) {
          URL.revokeObjectURL(audioURL);
        }

        audioURL = URL.createObjectURL(blob);
        recordedAudio = new Audio(audioURL);

        // Repeating the recorded sound creates the loop.
        recordedAudio.loop = true;
        recordedAudio.volume = 1;

        status.textContent =
          "Recording ready. Press Play Loop.";

        playBtn.disabled = false;
        stopBtn.disabled = true;

        stopMicrophone();
      });

      recorder.start();

      status.textContent = "Recording...";
      recordBtn.disabled = true;
      stopRecordBtn.disabled = false;
      playBtn.disabled = true;
    } catch (error) {
      console.error("Microphone error:", error);

      status.textContent =
        "Microphone error: " + error.name;

      recordBtn.disabled = false;
      stopRecordBtn.disabled = true;

      stopMicrophone();
    }
  });

  // Stop recording and prepare the recorded audio.
  stopRecordBtn.addEventListener("click", function () {
    if (
      recorder &&
      recorder.state === "recording"
    ) {
      recorder.stop();

      status.textContent =
        "Processing recording...";

      recordBtn.disabled = false;
      stopRecordBtn.disabled = true;
    }
  });

  // Play the recorded sound continuously.
  playBtn.addEventListener("click", function () {
    if (!recordedAudio) {
      status.textContent =
        "Please record a sound first.";
      return;
    }

    recordedAudio.currentTime = 0;

    recordedAudio.play()
      .then(function () {
        status.textContent =
          "Loop is playing.";

        playBtn.disabled = true;
        stopBtn.disabled = false;
      })
      .catch(function (error) {
        console.error("Playback error:", error);

        status.textContent =
          "Audio could not play. Please try again.";
      });
  });

  // Stop loop playback.
  stopBtn.addEventListener("click", function () {
    stopAudio();

    status.textContent = "Loop stopped.";
    playBtn.disabled = false;
    stopBtn.disabled = true;
  });

  function stopAudio() {
    if (recordedAudio) {
      recordedAudio.pause();
      recordedAudio.currentTime = 0;
    }
  }

  function stopMicrophone() {
    if (stream) {
      stream.getTracks().forEach(function (track) {
        track.stop();
      });

      stream = null;
    }
  }
});