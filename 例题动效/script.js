const correctAnswer = "2";
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

document.querySelectorAll("[data-tex]").forEach((element) => {
  if (!window.katex) return;
  window.katex.render(element.dataset.tex, element, {
    throwOnError: false,
    strict: "ignore",
  });
});

const example = document.querySelector("#example");
const form = document.querySelector("#quiz");
const choices = [...document.querySelectorAll(".choice")];
const action = document.querySelector("#action");
const message = document.querySelector("#message");
const solution = document.querySelector("#solution");
const miniPi = document.querySelector("#pi-creature");
const canvas = document.querySelector("#burst-layer");
const ctx = canvas.getContext("2d");

let selected = null;
let state = "idle";
let bursts = [];
let piShapePoints = null;
let animationHandle = 0;
let burstIndex = 0;
let burstAngleSeed = (Math.random() - 0.5) * 0.18;

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
const easeInOutCubic = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.max(1, Math.round(rect.width * dpr));
  canvas.height = Math.max(1, Math.round(rect.height * dpr));
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function canvasPointFromViewport(x, y) {
  const canvasRect = canvas.getBoundingClientRect();
  return {
    x: x - canvasRect.left,
    y: y - canvasRect.top,
  };
}

function samplePiShape() {
  if (piShapePoints) return piShapePoints;

  const piPathStr = "m10.5 177.038 20.675 1.532c21.44-24.249 29.864-95.974 156.213-81.935-4.595 307.32-139.367 339.737-130.943 402.784 3.063 35.735 31.395 57.687 62.025 58.963 96.74-3.318 92.4-133.751 122.52-462.513h124.818c-6.637 115.883-24.76 231.767-26.802 345.353 1.532 75.554 47.477 115.884 107.971 116.394 99.548 3.318 130.943-112.82 130.943-162.339h-21.44c-2.043 40.84-21.697 70.194-63.558 71.98-114.097 1.532-51.305-200.626-50.54-369.857l135.538.766-.765-86.53C13.807 8.908 85.312-2.137 10.5 177.038";

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", piPathStr);
  svg.appendChild(path);
  document.body.appendChild(svg);
  
  const bbox = path.getBBox();
  const points = [];
  const pt = svg.createSVGPoint();
  
  const stepX = bbox.width / 60; 
  const stepY = bbox.height / 60;
  
  for (let y = bbox.y; y < bbox.y + bbox.height; y += stepY) {
    for (let x = bbox.x; x < bbox.x + bbox.width; x += stepX) {
      pt.x = x; pt.y = y;
      if (path.isPointInFill(pt)) {
        const nx = (x - (bbox.x + bbox.width / 2)) / (bbox.width / 2) * 110;
        const ny = (y - (bbox.y + bbox.height / 2)) / (bbox.height / 2) * 110;
        points.push({ x: nx, y: ny });
      }
    }
  }
  
  document.body.removeChild(svg);
  piShapePoints = points;
  return piShapePoints;
}

function getBurstCenter() {
  const exampleRect = example.getBoundingClientRect();
  const titleRect = document.querySelector(".quiz h1").getBoundingClientRect();
  const choicesRect = document.querySelector(".choices").getBoundingClientRect();
  const x = exampleRect.left + exampleRect.width / 2;
  const y = titleRect.bottom + (choicesRect.bottom - titleRect.bottom) * 0.46;
  return canvasPointFromViewport(x, y);
}

function makeBurst() {
  if (reduceMotion.matches) return;
  resizeCanvas();
  const center = getBurstCenter();
  const rotation = burstAngleSeed + Math.sin(burstIndex * 1.91) * 0.085 + (Math.random() - 0.5) * 0.035;
  burstIndex += 1;

  const points = samplePiShape();
  const shuffled = [...points].sort(() => Math.random() - 0.5);
  const particleCount = window.matchMedia("(max-width: 640px)").matches ? 260 : 620;
  const particles = shuffled.slice(0, particleCount).map((point) => {
    const scale = 0.96 + Math.random() * 0.05;
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);
    const shapeX = point.x * scale;
    const shapeY = point.y * scale;
    const targetOffsetX = shapeX * cos - shapeY * sin;
    const targetOffsetY = shapeX * sin + shapeY * cos;
    const length = Math.hypot(targetOffsetX, targetOffsetY) || 1;
    const radialX = targetOffsetX / length;
    const radialY = targetOffsetY / length;
    const outward = 58 + Math.random() * 80;
    const startRadius = Math.random() * 8;
    const startAngle = Math.random() * Math.PI * 2;
    return {
      startX: center.x + Math.cos(startAngle) * startRadius,
      startY: center.y + Math.sin(startAngle) * startRadius,
      targetX: center.x + targetOffsetX,
      targetY: center.y + targetOffsetY,
      radialX,
      radialY,
      outward,
      radius: 1.55 + Math.random() * 1.55,
      alpha: 0.76 + Math.random() * 0.24,
      delay: Math.random() * 0.045,
    };
  });

  bursts.push({
    born: performance.now(),
    duration: 1600,
    particles,
  });

  if (!animationHandle) {
    animationHandle = requestAnimationFrame(drawBursts);
  }
}

function drawBursts(now) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const alive = [];

  for (const burst of bursts) {
    const elapsed = now - burst.born;
    const t = elapsed / burst.duration;
    if (t < 1.08) alive.push(burst);

    for (const particle of burst.particles) {
      const localT = clamp((t - particle.delay) / (1 - particle.delay), 0, 1);
      if (localT <= 0) continue;

      let x;
      let y;
      let alpha;
      if (localT < 0.38) {
        const k = localT / 0.38; // Use linear progress so it accelerates without slowing down
        const grow = 0.1 + 0.9 * k;
        x = particle.startX + (particle.targetX - particle.startX) * k;
        y = particle.startY + (particle.targetY - particle.startY) * k;
        x = particle.startX + (x - particle.startX) * grow;
        y = particle.startY + (y - particle.startY) * grow;
        alpha = particle.alpha * Math.min(1, k * 1.45);
      } else {
        const k = easeOutCubic((localT - 0.38) / 0.62);
        const spread = particle.outward * k;
        x = particle.targetX + particle.radialX * spread;
        y = particle.targetY + particle.radialY * spread;
        alpha = particle.alpha * Math.pow(1 - k, 1.35);
      }

      ctx.globalAlpha = alpha;
      ctx.fillStyle = "rgb(27, 134, 205)";
      ctx.beginPath();
      ctx.arc(x, y, particle.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.globalAlpha = 1;
  bursts = alive;
  if (bursts.length) {
    animationHandle = requestAnimationFrame(drawBursts);
  } else {
    animationHandle = 0;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

function updateChoices() {
  choices.forEach((choice) => {
    const input = choice.querySelector("input");
    choice.classList.toggle("selected", input.checked && state !== "correct");
    choice.classList.toggle("correct", state === "correct" && input.value === correctAnswer);
  });
}

function setState(next) {
  state = next;
  if (state === "idle") {
    action.textContent = "Check";
    action.disabled = selected === null;
    action.className = selected === null ? "action" : "action ready";
    message.textContent = "What could it be...";
    solution.classList.remove("revealed");
  }
  if (state === "wrong") {
    action.textContent = "Try Again";
    action.disabled = false;
    action.className = "action try-again";
    message.textContent = "Not quite...";
  }
  if (state === "correct") {
    action.textContent = "Reset";
    action.disabled = false;
    action.className = "action reset";
    message.textContent = "Correct!";
    solution.classList.add("revealed");
    makeBurst();
  }
  updateChoices();
}

choices.forEach((choice) => {
  const input = choice.querySelector("input");
  choice.addEventListener("click", () => {
    selected = input.value;
    if (state !== "correct") {
      setState("idle");
    }
  });
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (state === "correct") {
    selected = null;
    form.reset();
    setState("idle");
    updateChoices();
    return;
  }

  if (selected === correctAnswer) {
    setState("correct");
    return;
  }

  const selectedChoice = choices.find((choice) => choice.querySelector("input").checked);
  if (selectedChoice) {
    selectedChoice.classList.remove("wrong-shake");
    void selectedChoice.offsetWidth;
    selectedChoice.classList.add("wrong-shake");
  }
  setState("wrong");
});

miniPi.addEventListener("click", () => {
  if (state === "correct") {
    makeBurst();
  }
});

window.addEventListener("resize", resizeCanvas);
resizeCanvas();
