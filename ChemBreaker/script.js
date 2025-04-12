// script.js

// 題庫資料
let ions = [];
let usedIons = {}; // 用來統計離子出現次數
let quizContainer = document.getElementById("quiz");
let showAnswersButton = document.getElementById("show-answers");
let timerDisplay = document.getElementById("timer");
let timer = 180;
let interval;

// 載入題庫後產生題目
fetch("questionBank.json")
  .then((res) => res.json())
  .then((data) => {
    ions = data;
    generateQuiz();
    startTimer();
  });

// 隨機挑選一個離子（type: "cation" 或 "anion"）且不能重複出現超過兩次
function pickIon(type) {
  let filtered = ions.filter((ion) => {
    if (type === "cation") return !ion.answer.includes("根");
    if (type === "anion") return ion.answer.includes("根") || ion.answer.includes("酸");
  });

  let selected;
  do {
    selected = filtered[Math.floor(Math.random() * filtered.length)];
  } while ((usedIons[selected.answer] || 0) >= 2);

  usedIons[selected.answer] = (usedIons[selected.answer] || 0) + 1;
  return selected;
}

// 計算最小公倍數與係數
function getRatio(cationFormula, anionFormula) {
  const getCharge = (f) => {
    const match = f.match(/([0-9]+)?\<sup>([0-9]?)([+-])\<\/sup>/);
    if (!match) return 1;
    let val = parseInt(match[2] || "1");
    return match[3] === "+" ? val : -val;
  };

  const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
  const lcm = (a, b) => Math.abs(a * b) / gcd(a, b);

  const c = getCharge(cationFormula);
  const a = -getCharge(anionFormula);
  const l = lcm(c, a);

  return [l / c, l / a];
}

// 顯示 10 題題目
function generateQuiz() {
  for (let i = 0; i < 10; i++) {
    const cation = pickIon("cation");
    const anion = pickIon("anion");

    const [cCount, aCount] = getRatio(cation.formula, anion.formula);

    let formula = "";
    formula += cCount > 1 ? `(${cation.formula})${cCount}` : cation.formula;
    formula += aCount > 1 ? `(${anion.formula})${aCount}` : anion.formula;

    const compoundName = `${anion.answer.replace("根", "").replace("酸", "")} ${cation.answer}`;

    const item = document.createElement("div");
    item.className = "quiz-item";
    item.innerHTML = `<p><strong>題目 ${i + 1}：</strong>${compoundName}</p>
      <div class="answer hidden">${formula} → ${cation.formula.repeat(cCount)} + ${anion.formula.repeat(aCount)}</div>`;
    quizContainer.appendChild(item);
  }
}

// 顯示答案
showAnswersButton.addEventListener("click", () => {
  document.querySelectorAll(".answer").forEach((el) => el.classList.remove("hidden"));
});

// 計時器
function startTimer() {
  interval = setInterval(() => {
    timer--;
    timerDisplay.textContent = `時間：${timer} 秒`;
    if (timer <= 0) {
      clearInterval(interval);
      showAnswersButton.click();
    }
  }, 1000);
}
