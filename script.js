function init() {
  const guide = document.querySelector("#guide");
  const recordBtn = document.querySelector("#record");
  const stopBtn = document.querySelector("#stopRec");
  const playBtn = document.querySelector("#play");
  const audio = document.querySelector("#audio");

  if (!guide || !recordBtn || !stopBtn || !playBtn || !audio) {
    console.error("HTML IDs do not match the JavaScript.");
    return;
  }

  let recorder;
  let stream;
  let audioURL;
  let timeLimit;
  let busy = false;

  guide.textContent = "Step 1 — Ready. Press Record.";
  recordBtn.disabled = false;

  function releaseMicrophone() {
    clearTimeout(timeLimit);

    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      stream = null;
    }
  }

  function resetButtons() {
    busy = false;
    recordBtn.disabled = false;
    stopBtn.disabled = true;
    playBtn.disabled = !audioURL;
  }

  function showError(error) {
    const messages = {
      NotAllowedError: "Allow microphone access in your browser, then try again.",
      NotFoundError: "No microphone found. Connect one and try again.",
      NotReadableError: "Cannot open the microphone. Check your device settings."
    };

    guide.textContent = messages[error.name] ||
      "Error: " + error.message;

    console.error(error);
  }

  recordBtn.onclick = async function () {
    if (busy) return;

    busy = true;
    recordBtn.disabled = true;
    playBtn.disabled = true;
    audio.pause();
    audio.hidden = true;

    guide.textContent = "Record clicked. Please allow microphone access.";

    try {
      if (!window.isSecureContext) {
        throw new Error("Open your published HTTPS webpage.");
      }

      if (!navigator.mediaDevices?.getUserMedia ||
          !window.MediaRecorder) {
        throw new Error("Microphone recording is unavailable in this browser.");
      }

      stream = await navigator.mediaDevices.getUserMedia({
        audio: true
      });

      const chunks = [];
      const session = new MediaRecorder(stream);
      let failed = false;

      recorder = session;

      session.ondataavailable = function (event) {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      session.onerror = function (event) {
        failed = true;
        releaseMicrophone();
        resetButtons();
        audio.hidden = !audioURL;
        showError(event.error || new Error("Recording failed."));
      };

      session.onstop = function () {
        releaseMicrophone();
        if (failed) return;

        const blob = new Blob(chunks, {
          type: session.mimeType
        });

        if (blob.size > 0) {
          if (audioURL) URL.revokeObjectURL(audioURL);

          audioURL = URL.createObjectURL(blob);
          audio.src = audioURL;
          audio.load();

          guide.textContent = "Step 3 — Recording ready. Press Play.";
        } else {
          guide.textContent = "No sound captured. Try recording again.";
        }

        audio.hidden = !audioURL;
        resetButtons();
      };

      session.start();
      stopBtn.disabled = false;

      guide.textContent =
        "Step 2 — Recording. Speak, then press Stop Recording.";

      // Stop automatically after 30 seconds.
      timeLimit = setTimeout(stopRecording, 30000);
    } catch (error) {
      releaseMicrophone();
      resetButtons();
      audio.hidden = !audioURL;
      showError(error);
    }
  };

  function stopRecording() {
    if (recorder && recorder.state === "recording") {
      clearTimeout(timeLimit);
      stopBtn.disabled = true;
      guide.textContent = "Preparing your recording...";
      recorder.stop();
    }
  }

  stopBtn.onclick = stopRecording;

  playBtn.onclick = async function () {
    if (!audioURL || busy) return;

    try {
      audio.currentTime = 0;
      await audio.play();
    } catch (error) {
      showError(error);
    }
  };

  audio.onplay = function () {
    guide.textContent = "Playing your recording...";
  };

  audio.onended = function () {
    guide.textContent = "Finished. Play again or record a new sound.";
  };

  audio.onerror = function () {
    guide.textContent =
      "This recording could not play. Please record again.";
  };

  window.addEventListener("pagehide", function () {
    stopRecording();
    releaseMicrophone();
    audio.pause();
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}