const params = new URLSearchParams(location.search);
const type = params.get("type") || "all";
const QUESTION_LIMIT = 50;

const quizInfo = {
  surveyor: { title: "測量士", desc: "測量法、基準点測量、水準測量、地形測量、写真測量、GNSS、公共測量の実務" },
  surveyorAssistant: { title: "測量士補", desc: "測量の基礎、誤差、距離・角度・水準測量、地図、GNSS、公共測量" },
  kenchikushi1: { title: "一級建築士", desc: "計画、環境設備、法規、構造、施工、建築設計実務" },
  kenchikushi2: { title: "二級建築士", desc: "住宅・中小規模建築の計画、法規、構造、施工" },
  mokuzoKenchikushi: { title: "木造建築士", desc: "木造住宅、軸組構法、木材、壁量、接合、施工管理" },
  interiorCoordinator: { title: "インテリアコーディネーター", desc: "インテリア計画、家具、照明、内装材料、販売、関連法規" },
  welfareHousing: { title: "福祉住環境コーディネーター", desc: "高齢者・障害者の住環境、バリアフリー、福祉用具、住宅改修" }
};

const pageTitle = document.getElementById("pageTitle");
const pageDesc = document.getElementById("pageDesc");
const quizList = document.getElementById("quizList");

if (type === "all") {
  document.title = "測量・建築・インテリア資格クイズ";
  pageTitle.textContent = "測量・建築・インテリア資格クイズ";
  pageDesc.textContent = "7カテゴリ・各180問から50問ランダムで出題";
} else {
  const info = quizInfo[type] || quizInfo.surveyor;
  document.title = info.title;
  pageTitle.textContent = info.title;
  pageDesc.textContent = info.desc;
}

quizList.innerHTML = `
  <a href="index.html" class="${type === "all" ? "active" : ""}">全カテゴリ50問</a>
  ${Object.keys(quizInfo).map(key => `
    <a href="?type=${key}" class="${type === key ? "active" : ""}">${quizInfo[key].title}</a>
  `).join("")}
`;

function normalizeQuestion(q){
  return { question: q.question || q.q, choices: q.choices || q.c, answer: q.answer || q.a, explanation: q.explanation || q.e || "" };
}
function shuffle(array){ return array.map(v => [Math.random(), v]).sort((a,b) => a[0] - b[0]).map(v => v[1]); }
function uniqueByQuestion(array){
  const seen = new Set();
  return array.filter(q => {
    const key = (q.question || q.q || "").replace(/\s+/g, " ").trim();
    if (!key || seen.has(key)) return false;
    seen.add(key); return true;
  });
}

let questions = [];
if (type === "all") {
  Object.keys(quizInfo).forEach(key => {
    if (window.quizData && Array.isArray(window.quizData[key])) questions.push(...window.quizData[key].map(normalizeQuestion));
  });
} else {
  questions = window.quizData?.[type] ? window.quizData[type].map(normalizeQuestion) : [];
}
questions = shuffle(uniqueByQuestion(questions)).slice(0, QUESTION_LIMIT);

let currentIndex = 0, score = 0, answered = false;
const counter = document.getElementById("counter"), scoreEl = document.getElementById("score"), questionEl = document.getElementById("question"), choicesEl = document.getElementById("choices"), resultEl = document.getElementById("result"), nextBtn = document.getElementById("nextBtn"), progressBar = document.getElementById("progressBar");

function showQuestion() {
  answered = false; resultEl.textContent = ""; nextBtn.style.display = "none";
  if (questions.length === 0) {
    questionEl.textContent = "問題データが読み込めませんでした"; choicesEl.innerHTML = ""; counter.textContent = "0 / 0"; scoreEl.textContent = "スコア: 0"; progressBar.style.width = "0%"; return;
  }
  if (currentIndex >= questions.length) {
    questionEl.textContent = "終了！"; choicesEl.innerHTML = ""; counter.textContent = `${questions.length} / ${questions.length}`; scoreEl.textContent = `スコア: ${score}`; resultEl.textContent = `${questions.length}問中 ${score}問正解`; progressBar.style.width = "100%"; return;
  }
  const q = questions[currentIndex];
  counter.textContent = `${currentIndex + 1} / ${questions.length}`; scoreEl.textContent = `スコア: ${score}`; questionEl.textContent = q.question; progressBar.style.width = `${((currentIndex + 1) / questions.length) * 100}%`; choicesEl.innerHTML = "";
  q.choices.forEach(choice => {
    const btn = document.createElement("button"); btn.textContent = choice;
    btn.onclick = () => {
      if (answered) return; answered = true;
      if (choice === q.answer) { score++; resultEl.textContent = "正解！"; btn.classList.add("correct"); }
      else { resultEl.textContent = `不正解。正解は「${q.answer}」`; btn.classList.add("wrong"); }
      [...choicesEl.children].forEach(b => { b.disabled = true; if (b.textContent === q.answer) b.classList.add("correct"); });
      if (q.explanation) resultEl.textContent += ` ${q.explanation}`;
      scoreEl.textContent = `スコア: ${score}`;
      setTimeout(() => { currentIndex++; showQuestion(); }, 900);
    };
    choicesEl.appendChild(btn);
  });
}
nextBtn.onclick = () => { currentIndex++; showQuestion(); };
showQuestion();
