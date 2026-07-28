const answers = [...document.querySelectorAll(".answer")];
const correct = document.querySelector(".answer-correct");
const wrongAnswers = [...document.querySelectorAll(".answer-wrong")];
const speaker = document.querySelector(".speaker-button");
const textButton = document.querySelector(".text-button");
const textPanel = document.querySelector(".instruction-text");
const instructionAudio = document.querySelector(".instruction-audio");

let solved = false;
let answerLocked = false;

function stopInstruction() {
  instructionAudio.pause();
  instructionAudio.currentTime = 0;
}

function playInstruction() {
  if (solved) return;
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

wrongAnswers.forEach((answer) => {
  answer.addEventListener("click", () => {
    if (answerLocked || solved) return;
    answerLocked = true;
    answer.classList.add("is-feedback");
    answer.disabled = true;

    window.setTimeout(() => {
      answer.classList.remove("is-feedback");
      answer.disabled = false;
      answerLocked = false;
    }, 650);
  });
});

correct.addEventListener("click", () => {
  if (answerLocked || solved) return;
  solved = true;
  answerLocked = true;
  stopInstruction();
  correct.classList.add("is-feedback");
  answers.forEach((answer) => { answer.disabled = true; });

  window.setTimeout(() => {
    document.querySelector(".prototype-stage").classList.add("is-final");
  }, 800);
});

window.setTimeout(playInstruction, 2000);
