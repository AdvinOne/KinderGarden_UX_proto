const stage = document.querySelector(".prototype-stage");
const correct = document.querySelector(".answer-correct");
const speaker = document.querySelector(".speaker-button");
const textButton = document.querySelector(".text-button");
const textPanel = document.querySelector(".instruction-text");
const instructionAudio = document.querySelector(".instruction-audio");
const successAudio = document.querySelector(".success-audio");

let solved = false;
let answerLocked = false;

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

function showSuccess() {
  if (solved) return;
  solved = true;
  stop(instructionAudio);
  stage.classList.add("is-solved");
  successAudio.currentTime = 0;
  successAudio.play().catch(() => {});
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

correct.addEventListener("click", () => {
  if (answerLocked || solved) return;
  answerLocked = true;
  correct.classList.add("is-feedback");
  correct.disabled = true;
  window.setTimeout(showSuccess, 650);
});

window.setTimeout(playInstruction, 2000);
