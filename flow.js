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

const flowPage = document.querySelector(".flow-page");
const frame = document.querySelector(".task-frame");

const preloadPromises = new Map();
const IMAGE_LOAD_TIMEOUT_MS = 8000;
const IMAGE_DECODE_TIMEOUT_MS = 1200;

let currentTaskIndex = 0;
let completionWatcher = null;
let transitionTimer = null;
let navigationToken = 0;

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

function waitForImageElement(image) {
  return new Promise((resolve) => {
    let settled = false;
    let timeout;

    const finish = async () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeout);

      if (image.naturalWidth > 0 && typeof image.decode === "function") {
        await Promise.race([
          image.decode().catch(() => {}),
          new Promise((decodeDone) => {
            window.setTimeout(decodeDone, IMAGE_DECODE_TIMEOUT_MS);
          }),
        ]);
      }

      resolve();
    };

    timeout = window.setTimeout(finish, IMAGE_LOAD_TIMEOUT_MS);

    if (image.complete) {
      finish();
      return;
    }

    image.addEventListener("load", finish, { once: true });
    image.addEventListener("error", finish, { once: true });
  });
}

function preloadImage(url) {
  return new Promise((resolve) => {
    const image = new Image();
    let settled = false;
    let timeout;

    const finish = () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeout);
      resolve();
    };

    timeout = window.setTimeout(finish, IMAGE_LOAD_TIMEOUT_MS);

    image.addEventListener("load", finish, { once: true });
    image.addEventListener("error", finish, { once: true });
    image.src = url;

    if (image.complete) finish();
  });
}

function getCriticalImages(documentRoot) {
  const selector = [
    ".task-screen",
    ".background",
    ".task-background",
    ".answer-default",
    ".answer img:not(.answer-feedback)",
    ".speaker-default",
    ".speaker img:not(.speaker-playing)",
    ".text-button img",
    ".text-btn img",
  ].join(", ");
  const criticalImages = [...documentRoot.querySelectorAll(selector)];
  const firstImage = documentRoot.querySelector("img[src]");

  if (firstImage) criticalImages.unshift(firstImage);

  return [...new Set(criticalImages)];
}

function preloadTask(taskIndex) {
  if (taskIndex < 0 || taskIndex >= tasks.length) {
    return Promise.resolve();
  }

  if (preloadPromises.has(taskIndex)) {
    return preloadPromises.get(taskIndex);
  }

  const preloadPromise = (async () => {
    const taskUrl = new URL(tasks[taskIndex], window.location.href);
    const response = await fetch(taskUrl, { cache: "force-cache" });

    if (!response.ok) {
      throw new Error(`Не удалось загрузить ${taskUrl.pathname}`);
    }

    const taskMarkup = await response.text();
    const taskDocument = new DOMParser().parseFromString(taskMarkup, "text/html");
    const criticalImageUrls = getCriticalImages(taskDocument)
      .map((image) => new URL(image.getAttribute("src"), taskUrl).href);
    const allImageUrls = [...taskDocument.querySelectorAll("img[src]")]
      .map((image) => new URL(image.getAttribute("src"), taskUrl).href);

    const criticalUrlSet = new Set(criticalImageUrls);
    const deferredImageUrls = [...new Set(allImageUrls)]
      .filter((url) => !criticalUrlSet.has(url));

    Promise.allSettled(deferredImageUrls.map(preloadImage));
    await Promise.allSettled([...criticalUrlSet].map(preloadImage));
  })().catch(() => {});

  preloadPromises.set(taskIndex, preloadPromise);
  return preloadPromise;
}

async function waitForFrameImages() {
  let taskDocument;

  try {
    taskDocument = frame.contentDocument;
  } catch {
    return;
  }

  if (!taskDocument) return;

  await Promise.allSettled(
    getCriticalImages(taskDocument).map(waitForImageElement),
  );
}

async function showTask(taskIndex) {
  const token = ++navigationToken;
  flowPage.classList.add("is-loading");

  await preloadTask(taskIndex);
  if (token !== navigationToken) return;

  frame.src = tasks[taskIndex];
}

async function moveToNextTask() {
  stopWatching();
  transitionTimer = null;

  if (currentTaskIndex >= tasks.length - 1) return;

  currentTaskIndex += 1;
  await showTask(currentTaskIndex);
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

frame.addEventListener("load", async () => {
  const token = navigationToken;

  await waitForFrameImages();
  if (token !== navigationToken) return;

  flowPage.classList.remove("is-loading");
  watchForCompletion();
  preloadTask(currentTaskIndex + 1);
});

showTask(currentTaskIndex);
