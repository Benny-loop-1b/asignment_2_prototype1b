let mediaRecorder;
let audioChunks = [];
let recordedAudio;
let mediaStream;


// Get buttons from HTML
const recordBtn = document.querySelector("#record");
const stopRecBtn = document.querySelector("#stopRec");
const playBtn = document.querySelector("#play");
const stopLoopBtn = document.querySelector("#stopLoop");
const statusText = document.querySelector("#status");


// RECORD
recordBtn.addEventListener("click", async () => {

  try {

    // Ask the browser for microphone permission
    mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: true
    });


    audioChunks = [];


    // Create recorder
    mediaRecorder = new MediaRecorder(mediaStream);


    // Save recorded audio data
    mediaRecorder.addEventListener("dataavailable", (event) => {

      if (event.data.size > 0) {
        audioChunks.push(event.data);
      }

    });


    // When recording stops
    mediaRecorder.addEventListener("stop", () => {

      const audioBlob = new Blob(
        audioChunks,
        {
          type: mediaRecorder.mimeType
        }
      );


      const audioURL = URL.createObjectURL(audioBlob);


      recordedAudio = new Audio(audioURL);


      // Make the recording repeat
      recordedAudio.loop = true;


      statusText.textContent =
        "Recording ready. Press Play Loop.";


      // Turn microphone off after recording
      mediaStream.getTracks().forEach((track) => {

        track.stop();

      });

    });


    // Start recording
    mediaRecorder.start();


    statusText.textContent = "Recording...";

  }

  catch (error) {

    console.error(error);


    if (error.name === "NotAllowedError") {

      statusText.textContent =
        "Microphone permission is blocked. Please allow microphone access.";

    }

    else if (error.name === "NotFoundError") {

      statusText.textContent =
        "No microphone was found.";

    }

    else {

      statusText.textContent =
        "Microphone error: " + error.name;

    }

  }

});


// STOP RECORDING
stopRecBtn.addEventListener("click", () => {

  if (
    mediaRecorder &&
    mediaRecorder.state === "recording"
  ) {

    mediaRecorder.stop();

    statusText.textContent =
      "Processing recording...";

  }

});


// PLAY LOOP
playBtn.addEventListener("click", () => {

  if (!recordedAudio) {

    statusText.textContent =
      "Record a sound first.";

    return;

  }


  recordedAudio.currentTime = 0;

  recordedAudio.play();


  statusText.textContent =
    "Loop playing.";

});


// STOP LOOP
stopLoopBtn.addEventListener("click", () => {

  if (recordedAudio) {

    recordedAudio.pause();

    recordedAudio.currentTime = 0;

  }


  statusText.textContent =
    "Loop stopped.";

});