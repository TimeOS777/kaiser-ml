/* =========================================================
   CONFIG — edit everything in this block to personalize.
   ========================================================= */
const CONFIG = {
  // her Discord alias for now — swap in her real name later, that's it.
  HER_NAME: "My Sweetheart",

  // the date you two started dating, format: YYYY-MM-DD
  START_DATE: "2026-08-21",

  // your letter to her. Use \n\n for paragraph breaks.
  LETTER: `My Love,

I made this as a way to get to know you better. Its funny how we've just been friends for over 2 weeks but you're already the most dearest thing to me. I mean its so early that I am unaware of your real name still. But We will get to it soon haha.

We came into eachothers life, broken. I saw you hurt, I knew i had to comfort you because I didn't want anyone to go throught the stuff I did. Glafully you felt better after I did so. I was happy to be able to help you. Ever since that very day we've driven our friendship. Our sleepless nights together till 3am, they were speical to me. Made me get closer to someone so special. A person who cares so much and so well, a person who understand and who is a perfect mix of fun, silly and love. In truth, there is no person better than you at all this.

Here's to more days like the ones we've already had, and a lot more still coming. I wish to get to know you very well, so well that each day, I look at things and realise, "yes my gf likes to do that too". As that is what true love really is and I want to achieve it with you.

— Yours forever<3`,

  // reasons grid — front is the short word/emoji, back is the sentence.
  REASONS: [
    { front: "01", back: "The way you text back with way too much enthusiasm." },
    { front: "02", back: "You make ordinary days feel like inside jokes." },
    { front: "03", back: "You actually listen. That's rarer than it should be." },
    { front: "04", back: "You make me want to build silly little websites at midnight." },
    { front: "05", back: "I like who I am when I'm talking to you." },
    { front: "06", back: "Reason six is still being written. Ask me in person." },
  ],

  // quiz questions — purely for fun, no right answers.
  QUESTIONS: [
    {
      q: "Pick a way to spend a free evening:",
      options: ["Curled up with a show", "Out somewhere loud", "Talking to one person for hours", "Doing something with my hands"],
    },
    {
      q: "Coffee, tea, or neither?",
      options: ["Coffee, always", "Tea, obviously", "Energy drink truther", "Water. I'm boring."],
    },
    {
      q: "Your texting style is closer to:",
      options: ["Paragraphs", "One word replies (with love)", "Voice messages", "Memes as a personality"],
    },
    {
      q: "Pick a season:",
      options: ["Autumn", "Summer nights", "Winter under blankets", "Spring, new beginnings"],
    },
    {
      q: "When you're upset, you'd rather:",
      options: ["Talk it out immediately", "Have space first", "Be distracted", "Be held and say nothing"],
    },
  ],
};

/* =========================================================
   STARFIELD
   Fixed to the viewport (not the full scroll height) so it stays
   cheap no matter how long the page is. Star count is capped and
   the frame rate is throttled — this is the main fix for the lag.
   ========================================================= */
(function stars() {
  const canvas = document.getElementById("stars");
  const ctx = canvas.getContext("2d");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let w, h, starList, running = true;
  const MAX_STARS = 90;
  const FRAME_INTERVAL = 1000 / 30; // cap at ~30fps, plenty for a twinkle
  let lastFrame = 0;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    const count = Math.min(MAX_STARS, Math.floor((w * h) / 12000));
    starList = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.2 + 0.3,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.0015 + 0.0006,
    }));
    drawStatic();
  }

  function drawFrame(t) {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#f7ecdd";
    for (const s of starList) {
      const twinkle = 0.4 + 0.6 * Math.abs(Math.sin(s.phase + t * s.speed));
      ctx.globalAlpha = twinkle * 0.7;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawStatic() {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#f7ecdd";
    ctx.globalAlpha = 0.55;
    for (const s of starList) {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function loop(t) {
    if (!running) return;
    if (t - lastFrame >= FRAME_INTERVAL) {
      drawFrame(t);
      lastFrame = t;
    }
    requestAnimationFrame(loop);
  }

  document.addEventListener("visibilitychange", () => {
    running = !document.hidden;
    if (running && !reduceMotion) requestAnimationFrame(loop);
  });

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 150);
  });

  resize();
  if (!reduceMotion) requestAnimationFrame(loop);
})();

/* =========================================================
   HERO — name + day counter
   ========================================================= */
document.getElementById("her-name").textContent = CONFIG.HER_NAME;

const startDate = new Date(CONFIG.START_DATE + "T00:00:00");
document.getElementById("start-date-text").textContent = startDate.toLocaleDateString(undefined, {
  day: "numeric", month: "long", year: "numeric",
});

function updateDayCount() {
  const now = new Date();
  const diffMs = now - startDate;
  const days = Math.max(0, Math.floor(diffMs / 86400000));
  document.getElementById("day-count").textContent = days;
}
updateDayCount();
setInterval(updateDayCount, 60000);

document.getElementById("scroll-hint").addEventListener("click", () => {
  document.getElementById("quiz").scrollIntoView({ behavior: "smooth" });
});

/* =========================================================
   REVEAL ON SCROLL
   ========================================================= */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add("in-view");
  });
}, { threshold: 0.2 });

document.querySelectorAll(".hidden-section").forEach((el) => revealObserver.observe(el));

/* =========================================================
   QUIZ
   ========================================================= */
let currentQ = 0;
const answers = [];
const quizBox = document.getElementById("quiz-box");

function renderQuestion() {
  const total = CONFIG.QUESTIONS.length;
  const item = CONFIG.QUESTIONS[currentQ];

  const progress = Array.from({ length: total })
    .map((_, i) => `<span class="${i < currentQ || (i === currentQ && answers[currentQ] !== undefined) ? "done" : ""}"></span>`)
    .join("");

  const options = item.options
    .map((opt, i) => `<button type="button" class="quiz-option${answers[currentQ] === i ? " selected" : ""}" data-i="${i}">${opt}</button>`)
    .join("");

  quizBox.innerHTML = `
    <div class="quiz-progress">${progress}</div>
    <p class="quiz-question">${item.q}</p>
    <div class="quiz-options">${options}</div>
    <div class="quiz-nav"><button type="button" class="btn" id="next-btn">${currentQ === total - 1 ? "see my result" : "next"} →</button></div>
  `;

  quizBox.querySelectorAll(".quiz-option").forEach((btn) => {
    btn.addEventListener("click", () => {
      answers[currentQ] = parseInt(btn.dataset.i, 10);
      renderQuestion();
    });
  });

  const nextBtn = document.getElementById("next-btn");
  nextBtn.disabled = answers[currentQ] === undefined;

  nextBtn.addEventListener("click", () => {
    if (answers[currentQ] === undefined) return;
    if (currentQ < total - 1) {
      currentQ++;
      renderQuestion();
    } else {
      showResult();
    }
  });
}

const RESULT_TYPES = [
  {
    title: "A Golden Hour Kind of Person",
    text: "Warm, a little nostalgic, good at making ordinary moments feel worth remembering. Being around you probably feels like the last good light of the day.",
  },
  {
    title: "A Quiet Storm",
    text: "Calm on the surface, a whole world underneath. People probably underestimate how much you feel until they actually get close.",
  },
  {
    title: "A Constant, Not a Phase",
    text: "Steady. The kind of person who shows up the same way on the good days and the bad ones. That's rarer than it sounds.",
  },
  {
    title: "A Little Chaotic, Fully Lovable",
    text: "Unpredictable in the best way — keeps things interesting, keeps people on their toes, never boring to be around.",
  },
];

function showResult() {
  const sum = answers.reduce((a, b) => a + b, 0);
  const result = RESULT_TYPES[sum % RESULT_TYPES.length];
  document.getElementById("result-title").textContent = result.title;
  document.getElementById("result-text").textContent = result.text;
  document.getElementById("quiz").scrollIntoView({ behavior: "smooth" });
  setTimeout(() => {
    document.getElementById("result").scrollIntoView({ behavior: "smooth" });
  }, 400);
}

renderQuestion();

document.getElementById("to-letter-btn").addEventListener("click", () => {
  document.getElementById("letter").scrollIntoView({ behavior: "smooth" });
});

/* =========================================================
   ENVELOPE
   ========================================================= */
document.getElementById("letter-text").textContent = CONFIG.LETTER;

const envelope = document.getElementById("envelope");
const waxSeal = document.getElementById("wax-seal");
const envelopeHint = document.getElementById("envelope-hint");

waxSeal.addEventListener("click", () => {
  envelope.classList.add("open");
  waxSeal.setAttribute("aria-expanded", "true");
  envelopeHint.textContent = "";
});

/* =========================================================
   REASONS GRID
   ========================================================= */
const reasonsGrid = document.getElementById("reasons-grid");
CONFIG.REASONS.forEach((r) => {
  const card = document.createElement("div");
  card.className = "reason-card";
  card.innerHTML = `
    <div class="reason-card-inner">
      <div class="reason-face reason-front">${r.front}</div>
      <div class="reason-face reason-back">${r.back}</div>
    </div>
  `;
  card.addEventListener("click", () => card.classList.toggle("flipped"));
  reasonsGrid.appendChild(card);
});
