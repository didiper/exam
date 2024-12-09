let questionBank = []; // 初始化題庫
let currentQuestionIndex = 0;
let score = 0; // 初始分數
let hasAnswered = false; // 記錄是否已回答該題
let timer = 30; // 倒數計時
let timerInterval; // 計時器 ID
let incorrectQuestions = []; // 記錄答錯的題目
let playedQuestions = []; // 記錄已玩過的題目
let correctQuestions = 0; // 記錄答對的題目數

// 從 JSON 檔案讀取題庫
fetch("questionBank.json")
  .then((response) => response.json())
  .then((data) => {
    questionBank = data;
  })
  .catch((error) => console.error("無法加載題庫:", error));

// 啟動挑戰
function startChallenge() {
  document.querySelector(".start-screen").style.display = "none";
  document.getElementById("quiz-container").style.display = "block";
  startTimer();
  randomQuestion();
}

// 啟動計時器
function startTimer() {
  const timerDisplay = document.getElementById("timer-display");
  timerInterval = setInterval(() => {
    timer--;
    timerDisplay.textContent = `時間：${timer}秒`;
    if (timer <= 0) {
      endChallenge();
    }
  }, 1000);
}

// 隨機選擇題目
function randomQuestion() {
  if (playedQuestions.length === questionBank.length) {
    endChallenge(); // 若所有題目都玩過則結束挑戰
    return;
  }

  let newQuestionIndex;
  do {
    newQuestionIndex = Math.floor(Math.random() * questionBank.length);
  } while (playedQuestions.includes(newQuestionIndex));

  currentQuestionIndex = newQuestionIndex;
  playedQuestions.push(currentQuestionIndex);
  updateQuestion();

  // 清空結果顯示
  document.getElementById("result").textContent = "";
  hasAnswered = false; // 重置回答狀態
}

// 更新題目與選項
function updateQuestion() {
  const questionElement = document.getElementById("word-box");
  const optionsElement = document.getElementById("options");

  // 更新題目
  const currentQuestion = questionBank[currentQuestionIndex];
  questionElement.textContent = currentQuestion.formula;

  // 生成選項
  const correctAnswer = currentQuestion.answer;
  const allOptions = [correctAnswer];
  while (allOptions.length < 4) {
    const randomIndex = Math.floor(Math.random() * questionBank.length);
    const randomAnswer = questionBank[randomIndex].answer;
    if (!allOptions.includes(randomAnswer)) {
      allOptions.push(randomAnswer);
    }
  }

  // 隨機排序選項
  allOptions.sort(() => Math.random() - 0.5);

  // 顯示選項按鈕
  optionsElement.innerHTML = "";
  allOptions.forEach((option) => {
    const button = document.createElement("button");
    button.textContent = option;
    button.className = "option-button";
    button.onclick = () => checkAnswer(option, button);
    optionsElement.appendChild(button);
  });
}

// 檢查答案
function checkAnswer(selectedAnswer, button) {
  if (hasAnswered) return; // 如果已回答，直接返回

  const correctAnswer = questionBank[currentQuestionIndex].answer;
  const resultElement = document.getElementById("result");

  hasAnswered = true; // 設置回答狀態為已回答

  if (selectedAnswer === correctAnswer) {
    resultElement.textContent = "正確！";
    resultElement.style.color = "green";
    score += 1; // 加分
    correctQuestions += 1; // 記錄答對題數
  } else {
    resultElement.textContent = `錯誤！正確答案是：${correctAnswer}`;
    resultElement.style.color = "red";
    score -= 1; // 扣分
    incorrectQuestions.push({
      formula: questionBank[currentQuestionIndex].formula,
      correctAnswer: correctAnswer,
    }); // 記錄答錯題目
  }

  // 更新分數顯示
  updateScore();
}

// 更新分數顯示
function updateScore() {
  const scoreDisplay = document.getElementById("score-display");
  scoreDisplay.textContent = `分數：${score}`;
}

// 結束挑戰
function endChallenge() {
  clearInterval(timerInterval); // 停止計時器
  document.getElementById("quiz-container").style.display = "none";
  const endScreen = document.getElementById("end-screen");
  endScreen.style.display = "block";

  // 計算統計數據
  const totalQuestions = playedQuestions.length;
  const incorrectCount = incorrectQuestions.length;
  const accuracy =
    totalQuestions > 0
      ? ((correctQuestions / totalQuestions) * 100).toFixed(2)
      : 0;

  // 顯示數據
  document.getElementById("final-score").textContent = `你的分數是：${score}`;
  document.getElementById(
    "total-questions"
  ).textContent = `總答題數：${totalQuestions}`;
  document.getElementById(
    "correct-questions"
  ).textContent = `答對題數：${correctQuestions}`;
  document.getElementById(
    "incorrect-questions-count"
  ).textContent = `答錯題數：${incorrectCount}`;
  document.getElementById("accuracy").textContent = `答對率：${accuracy}%`;

  // 顯示答錯題目
  const incorrectList = document.getElementById("incorrect-list");
  incorrectList.innerHTML = "";
  incorrectQuestions.forEach((question) => {
    const listItem = document.createElement("li");
    listItem.textContent = `${question.formula} 的正確答案是：${question.correctAnswer}`;
    incorrectList.appendChild(listItem);
  });
}

// 重新挑戰
function restartGame() {
  score = 0; // 分數歸零
  timer = 30; // 重置計時器
  hasAnswered = false; // 重置回答狀態
  playedQuestions = []; // 清空已玩題目記錄
  incorrectQuestions = []; // 清空錯誤題目記錄
  correctQuestions = 0; // 重置答對題數

  // 隱藏結束畫面，顯示開始畫面
  document.getElementById("end-screen").style.display = "none";
  document.querySelector(".start-screen").style.display = "block";

  // 更新分數顯示
  const scoreDisplay = document.getElementById("score-display");
  scoreDisplay.textContent = `分數：${score}`;
}
