// script.js for IonicCompoundQuiz.html

let questionBank = [];
let currentQuestions = [];
let currentIndex = 0;
let timer = 180;
let timerInterval;

// 取得 DOM 元素
const startButton = document.getElementById("start-button");
const quizContainer = document.getElementById("quiz-container");
const questionList = document.getElementById("question-list");
const timerDisplay = document.getElementById("timer");
const showAnswerButton = document.getElementById("show-answer-button");
const answerSection = document.getElementById("answer-section");
const answerList = document.getElementById("answer-list");

// 讀取題庫 JSON
fetch("questionBank.json")
  .then((res) => res.json())
  .then((data) => {
    questionBank = data;
  });

startButton.addEventListener("click", () => {
  startButton.style.display = "none";
  quizContainer.style.display = "block";
  generateQuestions();
  startTimer();
});

showAnswerButton.addEventListener("click", () => {
  answerSection.style.display = "block";
});

function startTimer() {
  timerDisplay.textContent = `倒數時間：${timer} 秒`;
  timerInterval = setInterval(() => {
    timer--;
    timerDisplay.textContent = `倒數時間：${timer} 秒`;
    if (timer <= 0) {
      clearInterval(timerInterval);
      showAnswerButton.disabled = false;
    }
  }, 1000);
}

function generateQuestions() {
  const usedCations = new Map();
  const usedAnions = new Map();
  currentQuestions = [];

  while (currentQuestions.length < 10) {
    const cation = getRandomItem(questionBank.filter(q => q.type === "cation"));
    const anion = getRandomItem(questionBank.filter(q => q.type === "anion"));

    const cationName = cation.answer;
    const anionName = anion.answer;

    if ((usedCations.get(cationName) || 0) >= 2) continue;
    if ((usedAnions.get(anionName) || 0) >= 2) continue;

    usedCations.set(cationName, (usedCations.get(cationName) || 0) + 1);
    usedAnions.set(anionName, (usedAnions.get(anionName) || 0) + 1);

    const compoundName = `${anionName}${cationName}`;
    const compoundFormula = combineFormula(cation.formula, anion.formula);
    const dissociation = `${compoundFormula} → ${cation.formula} + ${anion.formula}`;

    currentQuestions.push({ compoundName, compoundFormula, dissociation });
  }

  renderQuestions();
}

function renderQuestions() {
  questionList.innerHTML = "";
  answerList.innerHTML = "";
  currentQuestions.forEach((q, idx) => {
    const qElem = document.createElement("div");
    qElem.className = "question";
    qElem.innerHTML = `第 ${idx + 1} 題：${q.compoundName}`;
    questionList.appendChild(qElem);

    const ansElem = document.createElement("div");
    ansElem.className = "dissociation-line";
    ansElem.innerHTML = `第 ${idx + 1} 題解離反應：${q.dissociation}`;
    answerList.appendChild(ansElem);
  });
}

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function combineFormula(cation, anion) {
  const cationCharge = extractCharge(cation);
  const anionCharge = extractCharge(anion);
  const lcm = getLCM(cationCharge, anionCharge);
  const cationCount = lcm / cationCharge;
  const anionCount = lcm / anionCharge;

  const cationPart = cationCount > 1 ? wrapFormula(cation, cationCount) : cation.replace(/<sup>.*?<\/sup>/g, "");
  const anionPart = anionCount > 1 ? wrapFormula(anion, anionCount) : anion.replace(/<sup>.*?<\/sup>/g, "");
  return cationPart + anionPart;
}

function extractCharge(formula) {
  const supMatch = formula.match(/<sup>(.*?)<\/sup>/);
  if (!supMatch) return 1;
  const raw = supMatch[1];
  const num = parseInt(raw.replace("+", "").replace("-", ""));
  return num || 1;
}

function getLCM(a, b) {
  const gcd = (x, y) => (!y ? x : gcd(y, x % y));
  return (a * b) / gcd(a, b);
}

function wrapFormula(formula, count) {
  const base = formula.replace(/<sub>.*?<\/sub>|<sup>.*?<\/sup>/g, "");
  return base + (count > 1 ? `<sub>${count}</sub>` : "");
}
