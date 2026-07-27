const stage = document.querySelector(".prototype-stage");
const shape = document.querySelector(".draggable-shape");
const correct = document.querySelector(".house-correct");
const wrong = document.querySelector(".house-wrong");
const speaker = document.querySelector(".speaker-button");
const speakerImage = speaker.querySelector("img");
const correctImage = correct.querySelector("img");
const wrongImage = wrong.querySelector("img");
const success = document.querySelector(".success-burst");
const audio = document.querySelector("audio");

let dragging = false;
let solved = false;
let startX = 0;
let startY = 0;
let offsetX = 0;
let offsetY = 0;

function playInstruction() {
  audio.currentTime = 0;
  audio.play().catch(() => speaker.classList.remove("is-playing"));
}

audio.addEventListener("play", () => {
  speaker.classList.add("is-playing");
  speakerImage.src = "./assets/speaker-playing.svg";
});

function stopPlayingState() {
  speaker.classList.remove("is-playing");
  speakerImage.src = "./assets/speaker-default.svg";
}

audio.addEventListener("pause", stopPlayingState);
audio.addEventListener("ended", stopPlayingState);
speaker.addEventListener("click", playInstruction);
window.setTimeout(playInstruction, 2000);

function contains(element, x, y) {
  const rect = element.getBoundingClientRect();
  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}

function targetAt(x, y) {
  if (contains(correct, x, y)) return "correct";
  if (contains(wrong, x, y)) return "wrong";
  return null;
}

function setHover(target) {
  correct.classList.toggle("is-hovered", target === "correct");
  wrong.classList.toggle("is-hovered", target === "wrong");
  correctImage.src = target === "correct" ? "./assets/true-success.svg" : "./assets/true-default.svg";
  wrongImage.src = target === "wrong" ? "./assets/wrong-success.svg" : "./assets/wrong-default.svg";
}

shape.addEventListener("pointerdown", (event) => {
  if (solved) return;
  shape.setPointerCapture(event.pointerId);
  dragging = true;
  startX = event.clientX - offsetX;
  startY = event.clientY - offsetY;
  shape.classList.add("is-dragging");
  wrong.classList.remove("is-wrong");
});

shape.addEventListener("pointermove", (event) => {
  if (!dragging || solved) return;
  offsetX = event.clientX - startX;
  offsetY = event.clientY - startY;
  shape.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0)`;
  setHover(targetAt(event.clientX, event.clientY));
});

function endDrag(event) {
  if (!dragging || solved) return;
  const target = targetAt(event.clientX, event.clientY);
  dragging = false;
  shape.classList.remove("is-dragging");
  setHover(null);

  if (target === "correct") {
    solved = true;
    stage.classList.add("is-solved");
    correctImage.src = "./assets/true-success.svg";
    success.textContent = "Верно!";
  } else {
    if (target === "wrong") {
      wrong.classList.add("is-wrong");
      wrongImage.src = "./assets/wrong-success.svg";
      window.setTimeout(() => {
        wrong.classList.remove("is-wrong");
        wrongImage.src = "./assets/wrong-default.svg";
      }, 650);
    }
    offsetX = 0;
    offsetY = 0;
    shape.style.transform = "translate3d(0, 0, 0)";
  }
}

shape.addEventListener("pointerup", endDrag);
shape.addEventListener("pointercancel", endDrag);
