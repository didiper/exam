// ChemBreaker/script.js

// 載入離子題庫
let ionBank = [];
fetch("questionBank.json")
  .then((res) => res.json())
  .then((data) => {
    ionBank = data;
    generateQuestions();
  });

const questionContainer = document.getElementById("question-container");
const showAnswersButton = document.getElementById("show-answers-button");
const timerDisplay = document.getElementById("timer-display");
let timer = 180; // 3分鐘
let timerInterval;

let questions = [];
let usedIons = {};

function getRandomIon(filter) {
  let ion;
  let attempts = 0;
  do {
    ion = ionBank[Math.floor(Math.random() * ionBank.length)];
    attempts++;
  } while (
    (filter === "+" && !ion.formula.includes("+")) ||
    (filter === "-" && !ion.formula.includes("-")) ||
    (usedIons[ion.formula] || 0) >= 2
  );
  usedIons[ion.formula] = (usedIons[ion.formula] || 0) + 1;
  return ion;
}

function getCharge(formula) {
  const match = formula.match(/<sup>([\d]*)([+-])<\/sup>/);
  if (!match) return 0;
  const number = match[1] === "" ? 1 : parseInt(match[1]);
  return match[2] === "+" ? number : -number;
}

function getSubscript(n) {
  return n === 1 ? "" : `<sub>${n}</sub>`;
}

function generateFormula(ion1, ion2) {
  const charge1 = getCharge(ion1.formula);
  const charge2 = getCharge(ion2.formula);

  const lcm = (a, b) => (a * b) / gcd(a, b);
  const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));

  const commonMultiple = lcm(Math.abs(charge1), Math.abs(charge2));
  const ratio1 = commonMultiple / Math.abs(charge1);
  const ratio2 = commonMultiple / Math.abs(charge2);

  const formula =
    ion1.formula.replace(/<.*?>/g, "") + getSubscript(ratio1) +
    ion2.formula.replace(/<.*?>/g, "") + getSubscript(ratio2);

  return formula;
}

function generateDissociation(formula, ion1, ion2, ratio1, ratio2) {
  const arrow = "\u2192";
  return `${formula} ${arrow} ${ratio1 > 1 ? ratio1 : ""}${ion1.formula} + ${
    ratio2 > 1 ? ratio2 : ""
  }${ion2.formula}`;
}

function generateQuestions() {
  // 產生題目並啟動倒數
  questions = [];
  questionContainer.innerHTML = "";
  usedIons = {};

  for (let i = 0; i < 10; i++) {
    const cation = getRandomIon("+");
    const anion = getRandomIon("-");

    const charge1 = getCharge(cation.formula);
    const charge2 = getCharge(anion.formula);

    const lcm = (a, b) => (a * b) / gcd(a, b);
    const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
    const commonMultiple = lcm(Math.abs(charge1), Math.abs(charge2));
    const ratio1 = commonMultiple / Math.abs(charge1);
    const ratio2 = commonMultiple / Math.abs(charge2);

    const formula =
      cation.formula.replace(/<.*?>/g, "") + getSubscript(ratio1) +
      anion.formula.replace(/<.*?>/g, "") + getSubscript(ratio2);

    const compoundName = `${anion.answer}${cation.answer}`;
    const dissociation = generateDissociation(
      formula,
      cation,
      anion,
      ratio1,
      ratio2
    );

    const item = document.createElement("div");
    item.className = "question-item";
    item.innerHTML = `
      <div class="question-title">${i + 1}. ${compoundName}</div>
      <div class="dissociation" style="display:none">${dissociation}</div>
    `;
    questionContainer.appendChild(item);
  }

  // 啟動計時
  timerInterval = setInterval(() => {
    timer--;
    timerDisplay.textContent = `剩餘時間：${timer} 秒`;
    if (timer <= 0) {
      clearInterval(timerInterval);
      showAnswers();
    }
  }, 1000);
}

function showAnswers() {
  document.querySelectorAll(".dissociation").forEach((el) => {
    el.style.display = "block";
  });
  showAnswersButton.disabled = true;
}

showAnswersButton.addEventListener("click", showAnswers);
