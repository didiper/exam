let questionBank = []; // 初始化題庫
let currentQuestionIndex = 0; // 當前題目索引
let score = 0; // 初始分數
let hasAnswered = false; // 記錄是否已回答該題
let timer = 40; // 倒數計時
let timerInterval; // 計時器 ID
let incorrectQuestions = []; // 記錄答錯的題目
let playedQuestions = []; // 記錄已玩過的題目
let correctQuestions = 0; // 記錄答對的題目數
let isSymbolQuestion = true; // 記錄題目類型：true=化學符號題，false=中文題

// 從 JSON 檔案讀取題庫
fetch("questionBank.json") // 從 "questionBank.json" 加載題庫
  .then((response) => response.json()) // 解析 JSON 資料
  .then((data) => {
    questionBank = data; // 將資料存入題庫變數
  })
  .catch((error) => console.error("無法加載題庫:", error)); // 捕捉錯誤並顯示訊息

// 啟動挑戰
function startChallenge() {
  // 隱藏開始畫面，顯示測驗畫面
  document.querySelector(".start-screen").style.display = "none";
  document.getElementById("quiz-container").style.display = "block";

  startTimer(); // 啟動計時器
  randomQuestion(); // 顯示隨機題目
}

// 啟動計時器
function startTimer() {
  const timerDisplay = document.getElementById("timer-display");
  timerInterval = setInterval(() => {
    timer--; // 每秒減少 1
    timerDisplay.textContent = `時間：${timer}秒`; // 更新計時器顯示

    if (timer <= 0) {
      endChallenge(); // 如果時間到，結束挑戰
    }
  }, 1000); // 設置每 1000 毫秒執行一次
}

// 隨機選擇題目
function randomQuestion() {
  // 如果所有題目都已經回答過，則結束挑戰
  if (playedQuestions.length === questionBank.length) {
    endChallenge();
    return;
  }

  let newQuestionIndex;
  do {
    // 隨機產生題目索引
    newQuestionIndex = Math.floor(Math.random() * questionBank.length);
  } while (playedQuestions.includes(newQuestionIndex)); // 確保題目未被選過

  currentQuestionIndex = newQuestionIndex; // 設置當前題目索引
  playedQuestions.push(currentQuestionIndex); // 將該題目加入已玩過題目列表
  isSymbolQuestion = Math.random() < 0.5; // 隨機決定題目類型（50% 機率）

  updateQuestion(); // 更新題目顯示

  // 清空結果顯示，重置回答狀態
  document.getElementById("result").textContent = "";
  hasAnswered = false;
}

// 更新題目與選項
function updateQuestion() {
  const questionElement = document.getElementById("word-box");
  const optionsElement = document.getElementById("options");

  // 獲取當前題目
  const currentQuestion = questionBank[currentQuestionIndex];

  // 設定題目
  questionElement.textContent = isSymbolQuestion
    ? currentQuestion.symbol // 顯示化學符號
    : currentQuestion.name; // 顯示中文名稱

  // 生成選項
  const correctAnswer = isSymbolQuestion
    ? currentQuestion.name // 正確答案為中文名稱
    : currentQuestion.symbol; // 正確答案為化學符號

  const allOptions = [correctAnswer]; // 將正確答案加入選項列表
  while (allOptions.length < 4) {
    // 隨機加入其他選項，直到總共 4 個
    const randomIndex = Math.floor(Math.random() * questionBank.length);
    const randomOption = isSymbolQuestion
      ? questionBank[randomIndex].name // 選擇中文名稱
      : questionBank[randomIndex].symbol; // 選擇化學符號

    if (!allOptions.includes(randomOption)) {
      allOptions.push(randomOption);
    }
  }

  // 隨機排序選項
  allOptions.sort(() => Math.random() - 0.5);

  // 顯示選項按鈕
  optionsElement.innerHTML = ""; // 清空之前的選項
  allOptions.forEach((option) => {
    const button = document.createElement("button"); // 創建按鈕
    button.textContent = option; // 設置按鈕文字為選項
    button.className = "option-button"; // 設置按鈕樣式
    button.onclick = () => checkAnswer(option, button); // 設置按鈕的點擊事件
    optionsElement.appendChild(button); // 將按鈕加入選項容器
  });
}

// 檢查答案
function checkAnswer(selectedAnswer, button) {
  if (hasAnswered) return; // 如果已回答，直接返回

  const currentQuestion = questionBank[currentQuestionIndex];
  const correctAnswer = isSymbolQuestion
    ? currentQuestion.name // 正確答案為中文名稱
    : currentQuestion.symbol; // 正確答案為化學符號
  const resultElement = document.getElementById("result");

  hasAnswered = true; // 標記該題已回答

  if (selectedAnswer === correctAnswer) {
    // 如果選擇正確
    resultElement.textContent = "正確！";
    resultElement.style.color = "green";
    score += 1; // 加分
    correctQuestions += 1; // 記錄答對題數
  } else {
    // 如果選擇錯誤
    resultElement.textContent = `錯誤！正確答案是：${correctAnswer}`;
    resultElement.style.color = "red";
    score -= 1; // 扣分
    incorrectQuestions.push({
      question: isSymbolQuestion
        ? currentQuestion.symbol
        : currentQuestion.name, // 記錄題目
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
  const totalQuestions = playedQuestions.length; // 總答題數
  const incorrectCount = incorrectQuestions.length; // 答錯題數
  const accuracy =
    totalQuestions > 0
      ? ((correctQuestions / totalQuestions) * 100).toFixed(2) // 計算答對率
      : 0;

  // 顯示統計數據
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

  // 顯示答錯題目列表
  const incorrectList = document.getElementById("incorrect-list");
  incorrectList.innerHTML = "";
  incorrectQuestions.forEach((question) => {
    const listItem = document.createElement("li");
    listItem.textContent = `${question.question} 的正確答案是：${question.correctAnswer}`;
    incorrectList.appendChild(listItem);
  });
}

// 重新挑戰
function restartGame() {
  score = 0; // 分數歸零
  timer = 30; // 重置計時器
  hasAnswered = false; // 重置回答狀態
  playedQuestions = []; // 清空已玩題目記錄
  incorrectQuestions = []; // 清空答錯題目記錄
  correctQuestions = 0; // 重置答對題數

  // 隱藏結束畫面，顯示開始畫面
  document.getElementById("end-screen").style.display = "none";
  document.querySelector(".start-screen").style.display = "block";

  // 更新分數顯示
  const scoreDisplay = document.getElementById("score-display");
  scoreDisplay.textContent = `分數：${score}`;
}
