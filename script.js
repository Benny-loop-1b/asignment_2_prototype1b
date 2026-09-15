function init() {
  const guide = document.querySelector("#guide");
  const recordBtn = document.querySelector("#record");
  const stopBtn = document.querySelector("#stopRec");
  const playBtn = document.querySelector("#play");

  if (!guide || !recordBtn || !stopBtn || !playBtn) {
    console.error("Check HTML IDs: guide, record, stopRec, play");
    return;
  }

  let recorder;
  let stream;
  let audio;
  let audioURL;

  stopBtn.disabled = true;
  playBtn.disabled = true;
  guide.textContent = "Step 1 — Ready. Press Record.";

  function releaseMicrophone() {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      stream = null;
    }
  }

  recordBtn.onclick = async function () {
    recordBtn.disabled = true;
    playBtn.disabled = true;
    guide.textContent = "Opening microphone. Please allow access.";

    if (audio) audio.pause();

    try {
      if (!navigator.mediaDevices?.getUserMedia ||
          !window.MediaRecorder) {
        throw new Error("Open the HTTPS website in a supported browser.");
      }

      stream = await navigator.mediaDevices.getUserMedia({
        audio: true
      });

      const chunks = [];
      const session = new MediaRecorder(stream);
      recorder = session;

      session.ondataavailable = function (event) {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      session.onstop = function () {
        releaseMicrophone();

        const blob = new Blob(chunks, {
          type: session.mimeType
        });

        recordBtn.disabled = false;
        stopBtn.disabled = true;

        if (!blob.size) {
          guide.textContent = "No audio captured. Please try again.";
          playBtn.disabled = !audio;
          return;
        }

        if (audioURL) URL.revokeObjectURL(audioURL);

        audioURL = URL.createObjectURL(blob);
        audio = new Audio(audioURL);
        playBtn.disabled = false;

        guide.textContent = "Step 3 — Your sound is ready. Press Play.";

        audio.onended = function () {
          guide.textContent = "Finished. Play again or record another sound.";
        };
      };

      session.start();
      stopBtn.disabled = false;
      guide.textContent = "Step 2 — Recording. Make a sound, then press Stop Recording.";
    } catch (error) {
      releaseMicrophone();
      recordBtn.disabled = false;
      stopBtn.disabled = true;
      playBtn.disabled = !audio;

      guide.textContent = "Microphone error: " + error.message;
      console.error(error);
    }
  };

  stopBtn.onclick = function () {
    if (recorder?.state === "recording") {
      stopBtn.disabled = true;
      guide.textContent = "Preparing your recording...";
      recorder.stop();
    }
  };

  playBtn.onclick = async function () {
    if (!audio) return;

    try {
      audio.currentTime = 0;
      await audio.play();
      guide.textContent = "Playing your sound...";
    } catch (error) {
      guide.textContent = "Playback error: " + error.message;
    }
  };
}

// Run after the HTML elements exist.
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}