// script.js المعدل بالكامل بدون تحديد مستوى صعوبة (اختيار عشوائي من جميع المستويات)

// DOM element selectors
const configContainer = document.querySelector(".config-container");
const quizContainer = document.querySelector(".quiz-container");
const answerOptions = quizContainer.querySelector(".answer-options");
const nextQuestionBtn = quizContainer.querySelector(".next-question-btn");
const questionStatus = quizContainer.querySelector(".question-status");
const timerDisplay = quizContainer.querySelector(".timer-duration");
const resultContainer = document.querySelector(".result-container");
const firstNameInput = document.getElementById('firstname');
const lastNameInput = document.getElementById('lastname');
const startQuizBtn = document.getElementById('start-quiz-btn');

// Quiz state variables
const QUIZ_TIME_LIMIT = 15;
let currentTime = QUIZ_TIME_LIMIT;
let timer = null;
let quizCategory = "";
let numberOfQuestions = 10;
let currentQuestion = null;
const questionsIndexHistory = [];
let correctAnswersCount = 0;
let disableSelection = false;

// Function to check if both inputs are filled
const checkInputs = () => {
  if (firstNameInput.value.trim() && lastNameInput.value.trim()) {
    startQuizBtn.disabled = false;
  } else {
    startQuizBtn.disabled = true;
  }
};

firstNameInput.addEventListener('input', checkInputs);
lastNameInput.addEventListener('input', checkInputs);

// Display the quiz result and hide the quiz container
const showQuizResult = () => {
  clearInterval(timer);
  document.querySelector(".quiz-popup").classList.remove("active");
  document.querySelector(".result-popup").classList.add("active");

  const firstName = firstNameInput.value.trim();
  const lastName = lastNameInput.value.trim();
  const score = correctAnswersCount;

  // Save user data to localStorage
  const userData = {
    firstName,
    lastName,
    score,
  };
  localStorage.setItem('userData', JSON.stringify(userData));

  // Display the result message
  const resultText = `أجبت بشكل صحيح على <b>${score}</b> من <b>${numberOfQuestions}</b> سؤال.`;
  document.querySelector(".result-message").innerHTML = resultText;

  // Redirect based on score after a short delay to allow the user to read the message
  setTimeout(() => {
    if (score > numberOfQuestions / 2) {
      window.location.href = 'blank.html';
    } else {
      window.location.href = 'notfound.html';
    }
  }, 3000); // 3 seconds delay before redirecting
};

// Clear and reset the timer
const resetTimer = () => {
  clearInterval(timer);
  currentTime = QUIZ_TIME_LIMIT;
  timerDisplay.textContent = `${currentTime}s`;
};

// Initialize and start the timer for the current question
const startTimer = () => {
  timer = setInterval(() => {
    currentTime--;
    timerDisplay.textContent = `${currentTime}s`;
    if (currentTime <= 0) {
      clearInterval(timer);
      disableSelection = true;
      nextQuestionBtn.style.visibility = "visible";
      quizContainer.querySelector(".quiz-timer").style.background = "#c31402";
      highlightCorrectAnswer();
      answerOptions.querySelectorAll(".answer-option").forEach((option) => (option.style.pointerEvents = "none"));
    }
  }, 1000);
};

// Fetch a random question from based on the selected category (random difficulty)
const getRandomQuestion = () => {
  const categoryQuestions = questions.find((cat) => cat.category.toLowerCase() === quizCategory.toLowerCase())?.questions || [];

  // Show the results if all questions have been used
  if (questionsIndexHistory.length >= Math.min(numberOfQuestions, categoryQuestions.length)) {
    return showQuizResult();
  }

  // Filter out already asked questions and choose a random one
  const availableQuestions = categoryQuestions.filter((_, index) => !questionsIndexHistory.includes(index));
  const randomQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
  questionsIndexHistory.push(categoryQuestions.indexOf(randomQuestion));
  return randomQuestion;
};

// Highlight the correct answer option and add icon
const highlightCorrectAnswer = () => {
  const correctOption = answerOptions.querySelectorAll(".answer-option")[currentQuestion.correctAnswer];
  correctOption.classList.add("correct");
  const iconHTML = `<span class="material-symbols-rounded"> check_circle </span>`;
  correctOption.insertAdjacentHTML("beforeend", iconHTML);
};

// Handle the user's answer selection
const handleAnswer = (option, answerIndex) => {
  if (disableSelection) return;
  clearInterval(timer);
  disableSelection = true;
  const isCorrect = currentQuestion.correctAnswer === answerIndex;
  option.classList.add(isCorrect ? "correct" : "incorrect");
  !isCorrect ? highlightCorrectAnswer() : correctAnswersCount++;
  const iconHTML = `<span class="material-symbols-rounded"> ${isCorrect ? "check_circle" : "cancel"} </span>`;
  option.insertAdjacentHTML("beforeend", iconHTML);
  answerOptions.querySelectorAll(".answer-option").forEach((option) => (option.style.pointerEvents = "none"));
  nextQuestionBtn.style.visibility = "visible";
};

// Render the current question and its options in the quiz
const renderQuestion = () => {
  currentQuestion = getRandomQuestion();
  if (!currentQuestion) return;
  disableSelection = false;
  resetTimer();
  startTimer();
  nextQuestionBtn.style.visibility = "hidden";
  quizContainer.querySelector(".quiz-timer").style.background = "#32313C";
  quizContainer.querySelector(".question-text").textContent = currentQuestion.question;
  questionStatus.innerHTML = `<b>${questionsIndexHistory.length}</b> من <b>${numberOfQuestions}</b>`;
  answerOptions.innerHTML = "";
  currentQuestion.options.forEach((option, index) => {
    const li = document.createElement("li");
    li.classList.add("answer-option");
    li.textContent = option;
    answerOptions.appendChild(li);
    li.addEventListener("click", () => handleAnswer(li, index));
  });
};

// Start the quiz and render the random question
const startQuiz = () => {
  document.querySelector(".config-popup").classList.remove("active");
  document.querySelector(".quiz-popup").classList.add("active");
  quizCategory = configContainer.querySelector(".category-option.active").textContent;
  numberOfQuestions = parseInt(configContainer.querySelector(".question-option.active").textContent);
  renderQuestion();
};

// Highlight the selected option on click - category or no. of question
configContainer.querySelectorAll(".category-option, .question-option").forEach((option) => {
  option.addEventListener("click", () => {
    option.parentNode.querySelector(".active")?.classList.remove("active");
    option.classList.add("active");
  });
});

// Reset the quiz and return to the configuration container
const resetQuiz = () => {
  resetTimer();
  correctAnswersCount = 0;
  questionsIndexHistory.length = 0;
  document.querySelector(".config-popup").classList.add("active");
  document.querySelector(".result-popup").classList.remove("active");
};

// Event listeners
nextQuestionBtn.addEventListener("click", renderQuestion);
resultContainer.querySelector(".try-again-btn").addEventListener("click", resetQuiz);
configContainer.querySelector(".start-quiz-btn").addEventListener("click", startQuiz);
