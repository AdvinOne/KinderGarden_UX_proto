const stage = document.querySelector(".prototype-stage");
const correctAnswers = [...document.querySelectorAll(".answer-correct")];
const wrongAnswers = [...document.querySelectorAll(".answer-wrong")];
const speaker = document.querySelector(".speaker-button");
const textButton = document.querySelector(".text-button");
const textPanel = document.querySelector(".instruction-text");
const instructionAudio = document.querySelector(".instruction-audio");
const completionStatus = document.querySelector(".completion-status");

const selectedCorrect = new Set();
let solved = false;

function stopInstruction() {
  instructionAudio.pause();
  instructionAudio.currentTime = 0;
}

function playInstruction() {
  stopInstruction();
  instructionAudio.play().catch(() => speaker.classList.remove("is-playing"));
}

function completeTask() {
  if (solved || selectedCorrect.size !== correctAnswers.length) return;
  solved = true;
  stopInstruction();
  stage.classList.add("is-solved");
  wrongAnswers.forEach((answer) => { answer.disabled = true; });
  completionStatus.textContent = "Задание выполнено верно";
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

correctAnswers.forEach((answer) => {
  answer.addEventListener("click", () => {
    if (answer.disabled) return;
    answer.classList.add("is-feedback");
    answer.disabled = true;
    selectedCorrect.add(answer);
    completeTask();
  });
});

wrongAnswers.forEach((answer) => {
  answer.addEventListener("click", () => {
    if (answer.disabled || solved) return;
    answer.disabled = true;
    answer.classList.add("is-feedback");
    window.setTimeout(() => {
      if (!solved) {
        answer.classList.remove("is-feedback");
        answer.disabled = false;
      }
    }, 700);
  });
});

window.setTimeout(playInstruction, 2000);
