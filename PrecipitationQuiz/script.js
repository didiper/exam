// ========================
// 基本設定
// ========================

const GAME_TIME = 60;

let questionBank = [];
let currentQuestion = null;

let score = 0;
let timer = GAME_TIME;
document.getElementById("timer-display").textContent =
  `時間：${GAME_TIME}秒`;
let timerInterval = null;

let hasAnswered = false;
let gameActive = false;

let playedQuestions = [];
let incorrectQuestions = [];

let correctQuestions = 0;
let totalAnswered = 0;


// ========================
// 載入題庫
// ========================

fetch("questionBank.json")
  .then(response => {
    if (!response.ok) {
      throw new Error("題庫載入失敗");
    }
    return response.json();
  })
  .then(data => {
    questionBank = data;
    console.log(`成功載入 ${questionBank.length} 題`);
  })
  .catch(error => {
    console.error(error);
    alert("無法載入題庫，請檢查 questionBank.json");
  });


// ========================
// 化學式下標處理
// ========================

function formatFormula(formula) {
  return formula.replace(/\d+/g, number => {
    return number
      .split("")
      .map(digit => "₀₁₂₃₄₅₆₇₈₉"[Number(digit)])
      .join("");
  });
}


// ========================
// 開始挑戰
// ========================

function startChallenge() {

  if (questionBank.length === 0) {
    alert("題庫尚未載入，請稍後再試！");
    return;
  }

  document.querySelector(".start-screen").style.display = "none";
  document.getElementById("quiz-container").style.display = "block";

  gameActive = true;

  randomQuestion();
  startTimer();
}


// ========================
// 計時器
// ========================

function startTimer() {

  clearInterval(timerInterval);

  document.getElementById("timer-display").textContent =
    `時間：${timer}秒`;

  timerInterval = setInterval(() => {

    timer--;

    document.getElementById("timer-display").textContent =
      `時間：${timer}秒`;

    if (timer <= 0) {
      endChallenge();
    }

  }, 1000);
}


// ========================
// 隨機出題
// ========================

function randomQuestion() {

  if (!gameActive) return;

  if (playedQuestions.length >= questionBank.length) {
    endChallenge();
    return;
  }

  let index;

  do {
    index = Math.floor(Math.random() * questionBank.length);
  } while (playedQuestions.includes(index));

  playedQuestions.push(index);

  currentQuestion = questionBank[index];

  hasAnswered = false;

  document.getElementById("result").textContent = "";

  document.getElementById("next-button").disabled = true;

  updateQuestion();
}


// ========================
// 顯示題目
// ========================

function updateQuestion() {

  const questionElement = document.getElementById("word-box");
  const optionsElement = document.getElementById("options");

  questionElement.textContent =
    formatFormula(currentQuestion.formula);

  optionsElement.innerHTML = "";

  const options = ["難溶", "微溶", "可溶"];

  options.forEach(option => {

    const button = document.createElement("button");

    button.textContent = option;
    button.className = "option-button";

    button.onclick = () => checkAnswer(option, button);

    optionsElement.appendChild(button);

  });
}


// ========================
// 檢查答案
// ========================

function checkAnswer(selectedAnswer, selectedButton) {

  if (hasAnswered || !gameActive) return;

  hasAnswered = true;
  totalAnswered++;

  const correctAnswer = currentQuestion.solubility;

  const resultElement = document.getElementById("result");

  const buttons = document.querySelectorAll(".option-button");

  buttons.forEach(button => {

    button.disabled = true;

    if (button.textContent === correctAnswer) {
      button.classList.add("correct");
    }

    if (
      button === selectedButton &&
      selectedAnswer !== correctAnswer
    ) {
      button.classList.add("incorrect");
    }

  });

  if (selectedAnswer === correctAnswer) {

    resultElement.textContent = "正確！";
    resultElement.style.color = "green";

    score++;
    correctQuestions++;

  } else {

    resultElement.textContent =
      `錯誤！正確答案：${correctAnswer}`;

    resultElement.style.color = "red";

    score--;

    incorrectQuestions.push({
      formula: currentQuestion.formula,
      selectedAnswer: selectedAnswer,
      correctAnswer: correctAnswer
    });

  }

  document.getElementById("score-display").textContent =
    `分數：${score}`;

  document.getElementById("next-button").disabled = false;
}


// ========================
// 結束挑戰
// ========================

function endChallenge() {

  if (!gameActive) return;

  gameActive = false;

  clearInterval(timerInterval);

  document.getElementById("quiz-container").style.display = "none";
  document.getElementById("end-screen").style.display = "block";

  const accuracy =
    totalAnswered > 0
      ? ((correctQuestions / totalAnswered) * 100).toFixed(2)
      : "0.00";

  document.getElementById("final-score").textContent =
    `你的分數是：${score}`;

  document.getElementById("total-questions").textContent =
    `總答題數：${totalAnswered}`;

  document.getElementById("correct-questions").textContent =
    `答對題數：${correctQuestions}`;

  document.getElementById("incorrect-questions-count").textContent =
    `答錯題數：${incorrectQuestions.length}`;

  document.getElementById("accuracy").textContent =
    `答對率：${accuracy}%`;

  const incorrectList = document.getElementById("incorrect-list");

  incorrectList.innerHTML = "";

  incorrectQuestions.forEach(question => {

    const li = document.createElement("li");

    li.textContent =
      `${formatFormula(question.formula)}：` +
      `你選擇 ${question.selectedAnswer}，` +
      `正確答案為 ${question.correctAnswer}`;

    incorrectList.appendChild(li);

  });

}


// ========================
// 重新挑戰
// ========================

function restartGame() {

  clearInterval(timerInterval);

  score = 0;
  timer = GAME_TIME;

  currentQuestion = null;

  hasAnswered = false;
  gameActive = false;

  playedQuestions = [];
  incorrectQuestions = [];

  correctQuestions = 0;
  totalAnswered = 0;

  document.getElementById("score-display").textContent = "分數：0";

  document.getElementById("timer-display").textContent =
    `時間：${GAME_TIME}秒`;

  document.getElementById("end-screen").style.display = "none";
  document.querySelector(".start-screen").style.display = "block";

}
