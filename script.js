
const canvas = document.getElementById('visualizer');
const ctx = canvas.getContext('2d');

let audioContext, analyser, source, audio, coverImage, title, artist;
let dataArray, bufferLength;
let image = new Image();
let isPlaying = false;
let capturer = new CCapture({ format: 'webm', framerate: 30 });

document.getElementById('startBtn').onclick = async () => {
  const audioInput = document.getElementById('audioInput').files[0];
  const coverInput = document.getElementById('coverInput').files[0];
  title = document.getElementById('songTitle').value;
  artist = document.getElementById('artistName').value;

  if (!audioInput || !coverInput) {
    alert("Upload both audio and cover image.");
    return;
  }

  image.src = URL.createObjectURL(coverInput);
  audio = new Audio(URL.createObjectURL(audioInput));
  audio.crossOrigin = "anonymous";

  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  analyser = audioContext.createAnalyser();
  source = audioContext.createMediaElementSource(audio);
  source.connect(analyser);
  analyser.connect(audioContext.destination);
  analyser.fftSize = 256;
  bufferLength = analyser.frequencyBinCount;
  dataArray = new Uint8Array(bufferLength);

  image.onload = () => {
    isPlaying = true;
    audio.play();
    draw();
  };
};

document.getElementById('recordBtn').onclick = () => {
  capturer.start();
};

function draw() {
  if (!isPlaying) return;
  requestAnimationFrame(draw);

  analyser.getByteFrequencyData(dataArray);
  const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
  const scale = 1 + (average / 256) * 0.3;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const size = 400 * scale;
  ctx.drawImage(image, (canvas.width - size)/2, (canvas.height - size)/2, size, size);

  ctx.fillStyle = "white";
  ctx.font = "40px Arial";
  ctx.textAlign = "center";
  ctx.fillText(title || "Song Title", canvas.width / 2, canvas.height - 100);
  ctx.font = "30px Arial";
  ctx.fillText(artist || "Artist Name", canvas.width / 2, canvas.height - 50);

  capturer.capture(canvas);
}
