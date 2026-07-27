const stage = document.querySelector(".prototype-stage");
const correct = document.querySelector(".answer-correct");
const wrong = document.querySelector(".answer-wrong");
const speaker = document.querySelector(".speaker-button");
const textButton = document.querySelector(".text-button");
const textPanel = document.querySelector(".instruction-text");
const instructionAudio = document.querySelector(".instruction-audio");
const successAudio = document.querySelector(".success-audio");

let solved = false;

function stop(audio) {
  audio.pause();
  audio.currentTime = 0;
}

function playInstruction() {
  if (solved) return;
  stop(successAudio);
  instructionAudio.currentTime = 0;
  instructionAudio.play().catch(() => speaker.classList.remove("is-playing"));
}

instructionAudio.addEventListener("play", () => speaker.classList.add("is-playing"));
instructionAudio.addEventListener("pause", () => speaker.classList.remove("is-playing"));
instructionAudio.addEventListener("ended", () => speaker.classList.remove("is-playing"));
speaker.addEventListener("click", playInstruction);

textButton.addEventListener("click", () => {
  const willOpen = textPanel.hidden;
  textPanel.hidden = !willOpen;
  textButton.setAttribute("aria-expanded", String(willOpen));
});

wrong.addEventListener("click", () => {
  wrong.classList.remove("is-wrong");
  void wrong.offsetWidth;
  wrong.classList.add("is-wrong");
});

correct.addEventListener("click", () => {
  if (solved) return;
  solved = true;
  stop(instructionAudio);
  stage.classList.add("is-solved");
  successAudio.currentTime = 0;
  successAudio.play().catch(() => {});
});

window.setTimeout(playInstruction, 2000);