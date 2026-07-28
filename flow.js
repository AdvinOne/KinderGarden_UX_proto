const FLOW_DELAY_MS = 3000;

const tasks = [
  "./index.html",
  "./task2.html",
  "./task3.html",
  "./task4.html",
  "./task5.html",
  "./task6.html",
  "./task7.html",
];

const frame = document.querySelector(".task-frame");

let currentTaskIndex = 0;
let completionWatcher = null;
let transitionTimer = null;

function isCurrentTaskComplete(documentRoot) {
  if (currentTaskIndex === 5) {
    return Boolean(documentRoot.querySelector(".answer-correct.is-feedback"));
  }

  return Boolean(documentRoot.querySelector(".prototype-stage.is-solved"));
}

function stopWatching() {
  window.clearInterval(completionWatcher);
  completionWatcher = null;
}

function moveToNextTask() {
  stopWatching();
  transitionTimer = null;

  if (currentTaskIndex >= tasks.length - 1) return;

  currentTaskIndex += 1;
  frame.src = tasks[currentTaskIndex];
}

function watchForCompletion() {
  stopWatching();
  window.clearTimeout(transitionTimer);
  transitionTimer = null;

  if (currentTaskIndex >= tasks.length - 1) return;

  completionWatcher = window.setInterval(() => {
    let taskDocument;

    try {
      taskDocument = frame.contentDocument;
    } catch {
      return;
    }

    if (!taskDocument || !isCurrentTaskComplete(taskDocument)) return;

    stopWatching();
    transitionTimer = window.setTimeout(moveToNextTask, FLOW_DELAY_MS);
  }, 100);
}

frame.addEventListener("load", watchForCompletion);
frame.src = tasks[currentTaskIndex];