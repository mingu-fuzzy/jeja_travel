const members = ["서성준", "최민규", "한은혜", "이다경", "김학진", "은태경", "이은비"];

const missionSets = {
  "서성준": ["음식을 먹으며 진심으로 행복해 보이는 사람 찍기", "길을 찾느라 지도에 집중한 사람 찍기", "두 명 이상이 똑같은 행동을 하는 순간 찍기", "제일 관광객처럼 행동하는 사람 찍기", "오늘 하루를 가장 잘 설명하는 장면 찍기"],
  "최민규": ["혼자 멍하니 바다나 풍경을 보는 사람 찍기", "누군가의 사진을 열심히 찍어주는 사람 찍기", "먹을 것을 한입 크게 베어 무는 순간 찍기", "갑자기 텐션이 올라간 사람 찍기", "7명 모두 나오지만 아무도 카메라를 보지 않는 사진 찍기"],
  "한은혜": ["사진 찍히는 줄 모르고 웃고 있는 사람 찍기", "무언가 살지 말지 심각하게 고민하는 사람 찍기", "일행 중 가장 먼저 지친 사람 찍기", "누군가를 자연스럽게 챙겨주는 순간 찍기", "오늘 가장 영화 같은 장면 찍기"],
  "이다경": ["예쁜 풍경보다 포즈에 더 진심인 사람 찍기", "음식이 나오자마자 사진부터 찍는 사람 찍기", "일행에서 혼자 조금 뒤처진 사람 찍기", "오늘 가장 평화로워 보이는 사람 찍기", "서로 다른 세 사람의 뒷모습이 함께 나온 사진 찍기"],
  "이은비": ["누군가의 사진을 익살스럽게 방해하는 사람 찍기", "무언가에 홀린 듯 구경하는 사람 찍기", "이동 중 잠든 사람 찍기", "오늘의 베스트 드레서라고 생각되는 사람 찍기", "여행 중 가장 '청춘' 같은 순간 찍기"],
  "은태경": ["오늘 제일 신나 보이는 사람의 순간 포착하기", "혼자만 다른 방향을 보고 있는 사람 찍기", "예상치 못하게 인생샷이 나온 사람 찍기", "바람 때문에 머리카락이나 옷이 날리는 사람 찍기", "서로 눈이 마주쳐 동시에 웃는 두 사람 찍기"],
  "김학진": ["'지금 뭐 하는 거지?' 싶은 엉뚱한 순간 찍기", "카메라를 전혀 의식하지 않는 자연스러운 단체 순간 찍기", "오늘 가장 웃긴 표정을 한 사람 찍기", "여행지에서 처음 보는 것에 놀란 사람 찍기", "여행의 시작과 끝을 닮은 구도로 한 장씩 찍기"]
};

const evaluationData = {
  "서성준": [
    { author:"이은비", text:"언제나 활발하고 에너지가 넘쳐요. 모두가 힘들어 할 때도 항상 웃고 있어서 보고 있는 사람도 힘이 나요. 모든 운동을 두루두루 잘해서 신기해요. 재미있어요. 시크릿자브종 같아요." },
    { author:"이다경", text:"체력무한대!!!! 같이있으면 웃기고, 둘이 있으면 진지한 대화도 할줄 아는 사람 최고의 팀장 ㅎㅎ" },
    { author:"김학진", text:"높은 텐션의 소유자. 누구와 있어도 어색할 것 같지가 않은 친화력이 있음. 그래도 진지해야 할 때는 진지하고, 주변 사람들을 잘 챙기는 세심함이 있음. 가끔 감당이 안될 정도로 텐션이 올라감" },
    { author:"최민규", text:"" }, { author:"한은혜", text:"" }, { author:"은태경", text:"" }
  ]
};

members.forEach(subject => {
  if (!evaluationData[subject]) {
    evaluationData[subject] = members.filter(author => author !== subject).map(author => ({ author, text:"" }));
  }
});

const state = { member: localStorage.getItem("jeju-member") || "", photos: {}, completedAt: {} };
const views = [...document.querySelectorAll(".view")];
const topbar = document.getElementById("topbar");
const select = document.getElementById("memberSelect");
const passwordFields = document.getElementById("passwordFields");
const passwordInput = document.getElementById("passwordInput");
const passwordConfirm = document.getElementById("passwordConfirm");
const confirmField = document.getElementById("confirmField");
const passwordTitle = document.getElementById("passwordTitle");
const passwordGuide = document.getElementById("passwordGuide");
const loginButton = document.getElementById("loginButton");
const loginError = document.getElementById("loginError");
const adminEntry = document.getElementById("adminEntry");
const adminMemberSelect = document.getElementById("adminMemberSelect");
const missionEntry = document.getElementById("missionEntry");
const galleryEntry = document.getElementById("galleryEntry");
const quizEntry = document.querySelector(".quiz-entry");
let quizSubject = "";
let resultSubject = members[0];
let toastTimer;

members.forEach(name => {
  select.add(new Option(name, name));
  adminMemberSelect.add(new Option(name, name));
});

document.addEventListener("invalid", event => {
  if (event.target.matches("input, select")) {
    event.target.setCustomValidity("입력란은 공백이 될 수 없습니다.");
  }
}, true);

document.addEventListener("input", event => {
  if (event.target.matches("input, select")) event.target.setCustomValidity("");
});

document.addEventListener("change", event => {
  if (event.target.matches("input, select")) event.target.setCustomValidity("");
});

function photoKey(member, index) { return `jeju-photo:${member}:${index}`; }
function completedKey(member, index) { return `jeju-completed-at:${member}:${index}`; }
function passwordKey(member) { return `jeju-password:${member}`; }
function missionsAreOpen() { return localStorage.getItem("jeju-missions-open") === "true"; }
function quizIsOpen() { return localStorage.getItem("jeju-quiz-open") === "true"; }
function quizResultsAreOpen() { return localStorage.getItem("jeju-quiz-results-open") === "true"; }
function receivedKey(member) { return `jeju-missions-received:${member}`; }
function missionsReceived() { return localStorage.getItem(receivedKey(state.member)) === "true"; }
function quizResultKey(member) { return `jeju-quiz-result:${member}`; }
function savedQuizResult(member) {
  try { return JSON.parse(localStorage.getItem(quizResultKey(member))) || null; }
  catch (error) { return null; }
}
function hasPassword(member) { return Boolean(localStorage.getItem(passwordKey(member))); }
async function hashPassword(member, password) {
  const bytes = new TextEncoder().encode(`jeju-seven:${member}:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map(value => value.toString(16).padStart(2, "0")).join("");
}

function updateLoginMode() {
  const member = select.value;
  loginError.textContent = ""; passwordInput.value = ""; passwordConfirm.value = "";
  passwordFields.classList.toggle("hidden", !member);
  loginButton.disabled = !member;
  if (!member) {
    loginButton.firstChild.textContent = "이름을 먼저 선택합니다 ";
    return;
  }
  const returning = hasPassword(member);
  passwordTitle.textContent = returning ? "비밀번호 입력" : "첫 비밀번호 설정";
  passwordGuide.textContent = returning ? "처음 설정한 비밀번호를 입력합니다." : "4자 이상으로 설정합니다.";
  confirmField.classList.toggle("hidden", returning);
  passwordInput.autocomplete = returning ? "current-password" : "new-password";
  loginButton.firstChild.textContent = returning ? "로그인하기 " : "비밀번호 만들고 입장하기 ";
  setTimeout(() => passwordInput.focus(), 0);
}
function loadPhotos() {
  state.photos = {}; state.completedAt = {};
  if (!state.member) return;
  missionSets[state.member].forEach((_, index) => {
    const photo = localStorage.getItem(photoKey(state.member, index));
    if (photo) {
      state.photos[index] = photo;
      const completed = localStorage.getItem(completedKey(state.member, index));
      if (completed) state.completedAt[index] = completed;
    }
  });
}

function formatCompletedAt(value) {
  if (!value) return "완료 시간 기록 없음";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "완료 시간 기록 없음";
  return new Intl.DateTimeFormat("ko-KR", { month:"long", day:"numeric", weekday:"short", hour:"2-digit", minute:"2-digit", hour12:false }).format(date);
}

function showView(id) {
  if ((id === "missionsView" || id === "galleryView") && !missionsAreOpen()) {
    notify("관리자가 공개하기 전에는 비밀 미션과 사진첩에 접근할 수 없습니다."); id = "dashboardView";
  }
  if (id === "quizView" && !quizIsOpen() && !quizResultsAreOpen()) {
    notify("관리자가 공개하기 전에는 작성자 맞히기에 접근할 수 없습니다."); id = "dashboardView";
  }
  if (id === "adminView" && state.member !== "최민규") {
    notify("관리자만 접근할 수 있습니다."); id = "dashboardView";
  }
  views.forEach(view => view.classList.toggle("active", view.id === id));
  topbar.classList.toggle("hidden", id === "loginView");
  if (id === "dashboardView") renderDashboard();
  if (id === "missionsView") renderMissions();
  if (id === "galleryView") renderGallery();
  if (id === "adminView") renderAdmin();
  if (id === "quizView") renderQuiz();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderDashboard() {
  document.getElementById("welcomeName").textContent = state.member;
  const complete = Object.keys(state.photos).length;
  document.getElementById("progressCount").textContent = `${complete} / 5`;
  document.getElementById("progressBar").style.width = `${complete * 20}%`;
  adminEntry.classList.toggle("hidden", state.member !== "최민규");
  const open = missionsAreOpen();
  missionEntry.classList.toggle("locked", !open);
  missionEntry.setAttribute("aria-disabled", String(!open));
  document.getElementById("missionEntryCopy").textContent = open ? "5개의 순간을 확인합니다" : "관리자가 공개하면 확인할 수 있습니다";
  galleryEntry.classList.toggle("locked", !open);
  galleryEntry.setAttribute("aria-disabled", String(!open));
  document.getElementById("galleryEntryCopy").textContent = open ? "포착한 순간을 모읍니다" : "관리자가 공개하면 확인할 수 있습니다";
  const quizOpen = quizIsOpen();
  const quizAvailable = quizOpen || quizResultsAreOpen();
  quizEntry.classList.toggle("locked", !quizAvailable);
  quizEntry.setAttribute("aria-disabled", String(!quizAvailable));
  document.getElementById("quizEntryCopy").textContent = quizOpen ? "나를 설명한 사람이 누구인지 맞힙니다" : quizResultsAreOpen() ? "전체 채점 결과를 확인합니다" : "관리자가 공개하면 확인할 수 있습니다";
  document.getElementById("memberProgressList").innerHTML = members.map(member => {
    const count = missionSets[member].reduce((total, _, index) => total + (localStorage.getItem(photoKey(member, index)) ? 1 : 0), 0);
    return `<div class="member-progress-row ${member === state.member ? "mine" : ""}">
      <span class="member-name">${member}${member === state.member ? " · 나" : ""}</span>
      <div class="member-mini-track" aria-label="${member} 미션 ${count}개 완료"><span style="width:${count * 20}%"></span></div>
      <span class="member-progress-value">${count}/5</span>
    </div>`;
  }).join("");
}

function renderAdmin() {
  const open = missionsAreOpen();
  const control = document.getElementById("missionControl");
  const button = document.getElementById("openMissionsButton");
  control.classList.toggle("open", open);
  document.getElementById("missionAccessBadge").textContent = open ? "공개됨" : "비공개";
  document.getElementById("missionControlCopy").textContent = open
    ? "모든 멤버가 자신의 비밀 미션과 사진첩에 접근할 수 있습니다."
    : "현재 모든 멤버가 비밀 미션과 사진첩에 접근할 수 없습니다.";
  button.disabled = false;
  button.firstChild.textContent = open ? "전체 다시 비공개 " : "전체 공개 ";

  const quizOpen = quizIsOpen();
  const quizControl = document.getElementById("quizControl");
  const quizButton = document.getElementById("openQuizButton");
  quizControl.classList.toggle("open", quizOpen);
  document.getElementById("quizAccessBadge").textContent = quizOpen ? "공개됨" : "비공개";
  document.getElementById("quizControlCopy").textContent = quizOpen
    ? "모든 멤버가 자신의 작성자 맞히기 페이지에 접근할 수 있습니다."
    : "현재 모든 멤버가 작성자 맞히기 페이지에 접근할 수 없습니다.";
  quizButton.firstChild.textContent = quizOpen ? "작성자 맞히기 다시 비공개 " : "작성자 맞히기 공개 ";

  const resultsOpen = quizResultsAreOpen();
  const resultsControl = document.getElementById("quizResultsControl");
  const resultsButton = document.getElementById("openQuizResultsButton");
  resultsControl.classList.toggle("open", resultsOpen);
  document.getElementById("quizResultsAccessBadge").textContent = resultsOpen ? "공개됨" : "비공개";
  document.getElementById("quizResultsControlCopy").textContent = resultsOpen
    ? "모든 멤버가 전체 점수와 문항별 채점 결과를 확인할 수 있습니다."
    : "현재 멤버별 점수와 채점 결과가 공개되지 않았습니다.";
  resultsButton.firstChild.textContent = resultsOpen ? "전체 결과 다시 비공개 " : "전체 결과 공개 ";
}

function renderQuiz() {
  quizSubject = state.member;
  const takingOpen = quizIsOpen();
  document.getElementById("quizSubjectCard").classList.toggle("hidden", !takingOpen);
  document.getElementById("quizForm").classList.toggle("hidden", !takingOpen);
  document.getElementById("quizSubjectName").textContent = quizSubject;
  const entries = evaluationData[quizSubject];
  const available = entries.filter(entry => entry.text.trim());
  document.getElementById("quizAvailableCount").textContent = available.length;
  document.getElementById("quizQuestionList").innerHTML = entries.map((entry, index) => {
    const hasText = entry.text.trim();
    const candidates = members.filter(member => member !== quizSubject);
    return `<article class="quiz-question ${hasText ? "" : "empty"}" data-quiz-index="${index}">
      <div class="quiz-question-head"><strong>설명 ${index + 1}</strong><span>${hasText ? "WHO?" : "EMPTY"}</span></div>
      ${hasText ? `<p class="quiz-description">${entry.text}</p><div class="select-wrap"><select class="quiz-answer-select" data-answer-index="${index}" required><option value="">작성자를 선택합니다</option>${candidates.map(name => `<option value="${name}">${name}</option>`).join("")}</select></div>` : `<div class="quiz-blank" aria-label="아직 입력되지 않은 설명"></div>`}
    </article>`;
  }).join("");
  const submitButton = document.getElementById("quizSubmitButton");
  const saved = savedQuizResult(quizSubject);
  submitButton.disabled = available.length === 0 || Boolean(saved);
  submitButton.firstChild.textContent = saved ? "답안 제출 완료 " : available.length === 0 ? "입력된 문제가 없습니다 " : "답안 제출 ";
  const result = document.getElementById("quizResult");
  result.classList.add("hidden");
  if (saved) {
    Object.entries(saved.answers).forEach(([index, answer]) => {
      const selectElement = document.querySelector(`[data-answer-index="${index}"]`);
      const card = document.querySelector(`[data-quiz-index="${index}"]`);
      if (!selectElement || !card) return;
      selectElement.value = answer;
      selectElement.disabled = true;
      const isCorrect = answer === evaluationData[quizSubject][Number(index)].author;
      card.classList.add(isCorrect ? "correct" : "wrong");
      card.querySelector(".quiz-question-head span").textContent = isCorrect ? "정답" : "오답";
    });
    result.innerHTML = `<strong>${saved.correct} / ${saved.total}</strong>총 ${saved.total}문제 중 ${saved.correct}개를 맞혔습니다. 제출이 완료되어 답안을 변경할 수 없습니다.`;
    result.classList.remove("hidden");
  }
  renderGroupQuizResults();
}

function renderGroupQuizResults() {
  const section = document.getElementById("groupQuizResults");
  const open = quizResultsAreOpen();
  section.classList.toggle("hidden", !open);
  if (!open) return;
  document.getElementById("resultPersonTabs").innerHTML = members.map(member =>
    `<button class="result-person-tab ${member === resultSubject ? "active" : ""}" type="button" data-result-subject="${member}">${member}</button>`
  ).join("");
  const saved = savedQuizResult(resultSubject);
  const availableEntries = evaluationData[resultSubject].map((entry, index) => ({ ...entry, index })).filter(entry => entry.text.trim());
  const details = availableEntries.map(entry => {
    const answer = saved?.answers?.[entry.index] || "미제출";
    const correct = answer === entry.author;
    const status = saved ? (correct ? "정답" : "오답") : "미제출";
    return `<div class="result-detail ${saved ? (correct ? "correct" : "wrong") : ""}">
      <div class="result-detail-head"><span>설명 ${entry.index + 1}</span><b>${status}</b></div>
      <p class="result-description">${entry.text}</p>
      <p class="result-answer">선택: ${answer} · 실제 정답: ${entry.author}</p>
    </div>`;
  }).join("") || `<div class="quiz-blank" aria-label="입력된 설명 없음"></div>`;
  document.getElementById("groupResultDetail").innerHTML = `<article class="group-result-card ${saved ? "" : "not-submitted"}">
    <div class="group-result-summary"><strong>${resultSubject}</strong><b>${saved ? `${saved.correct} / ${saved.total}` : "미제출"}</b></div>
    <div class="result-detail-list">${details}</div>
  </article>`;
}

function renderMissions() {
  const received = missionsReceived();
  document.getElementById("missionReceive").classList.toggle("hidden", received);
  document.getElementById("missionDrawing").classList.add("hidden");
  document.getElementById("missionResults").classList.toggle("hidden", !received);
  if (!received) return;
  const list = document.getElementById("missionList");
  list.innerHTML = missionSets[state.member].map((mission, index) => {
    const photo = state.photos[index];
    return `<article class="mission-card ${photo ? "done" : ""}">
      <div class="mission-head"><span class="mission-index">${photo ? "✓" : String(index + 1).padStart(2, "0")}</span>
        <div><h3>${mission}</h3><span class="status">${photo ? `완료 · ${formatCompletedAt(state.completedAt[index])}` : "SECRET MISSION"}</span></div>
      </div>
      ${photo ? `<img class="mission-thumb" src="${photo}" alt="${mission} 미션 사진"><button class="remove-photo" data-remove="${index}" type="button">사진 지우고 다시 찍기</button>` : `<label class="upload-label">사진 촬영 또는 선택<input type="file" accept="image/*" capture="environment" data-upload="${index}"></label>`}
    </article>`;
  }).join("");
}

document.getElementById("receiveMissionsButton").addEventListener("click", () => {
  const receive = document.getElementById("missionReceive");
  const drawing = document.getElementById("missionDrawing");
  const button = document.getElementById("receiveMissionsButton");
  button.disabled = true;
  receive.classList.add("hidden");
  drawing.classList.remove("hidden");
  window.setTimeout(() => {
    localStorage.setItem(receivedKey(state.member), "true");
    button.disabled = false;
    renderMissions();
    notify("비밀 미션 5개가 도착했습니다.");
  }, 3000);
});

function renderGallery() {
  const entries = Object.entries(state.photos);
  const grid = document.getElementById("galleryGrid");
  const empty = document.getElementById("emptyGallery");
  empty.classList.toggle("hidden", entries.length > 0);
  grid.classList.toggle("hidden", entries.length === 0);
  grid.innerHTML = entries.map(([index, photo]) => `<article class="gallery-item"><img src="${photo}" alt="미션 사진"><div class="gallery-caption"><p>${missionSets[state.member][Number(index)]}</p><time>${formatCompletedAt(state.completedAt[index])}</time></div></article>`).join("");
}

function compressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const max = 1200;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale); canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", .76));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function notify(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message; toast.classList.add("show");
  clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

select.addEventListener("change", updateLoginMode);

document.getElementById("loginForm").addEventListener("submit", async event => {
  event.preventDefault();
  const member = select.value;
  const password = passwordInput.value;
  loginError.textContent = "";
  if (!member) return;
  if (password.length < 4) {
    loginError.textContent = "비밀번호는 4자 이상 입력해야 합니다."; passwordInput.focus(); return;
  }
  loginButton.disabled = true;
  const hashed = await hashPassword(member, password);
  if (hasPassword(member)) {
    if (localStorage.getItem(passwordKey(member)) !== hashed) {
      loginError.textContent = "비밀번호가 일치하지 않습니다. 다시 확인합니다.";
      passwordInput.select(); loginButton.disabled = false; return;
    }
  } else {
    if (password !== passwordConfirm.value) {
      loginError.textContent = "두 비밀번호가 서로 일치하지 않습니다.";
      passwordConfirm.focus(); loginButton.disabled = false; return;
    }
    localStorage.setItem(passwordKey(member), hashed);
    notify(`${member}님의 비밀번호가 설정되었습니다.`);
  }
  state.member = member;
  localStorage.setItem("jeju-member", state.member);
  passwordInput.value = ""; passwordConfirm.value = "";
  loadPhotos(); showView("dashboardView"); loginButton.disabled = false;
});

document.getElementById("adminPasswordForm").addEventListener("submit", async event => {
  event.preventDefault();
  if (state.member !== "최민규") { showView("dashboardView"); return; }
  const targetMember = adminMemberSelect.value;
  const newPassword = document.getElementById("adminNewPassword");
  const confirmation = document.getElementById("adminPasswordConfirm");
  const error = document.getElementById("adminError");
  error.textContent = "";
  if (!targetMember) { error.textContent = "비밀번호를 변경할 멤버를 선택해야 합니다."; return; }
  if (newPassword.value.length < 4) { error.textContent = "새 비밀번호는 4자 이상 입력해야 합니다."; newPassword.focus(); return; }
  if (newPassword.value !== confirmation.value) { error.textContent = "두 비밀번호가 서로 일치하지 않습니다."; confirmation.focus(); return; }
  const hashed = await hashPassword(targetMember, newPassword.value);
  localStorage.setItem(passwordKey(targetMember), hashed);
  newPassword.value = ""; confirmation.value = ""; adminMemberSelect.value = "";
  notify(`${targetMember}님의 비밀번호가 변경되었습니다.`);
});

document.getElementById("openMissionsButton").addEventListener("click", () => {
  if (state.member !== "최민규") return;
  const open = missionsAreOpen();
  const question = open
    ? "모든 멤버의 비밀 미션과 사진첩 접근을 다시 차단하시겠습니까?"
    : "모든 멤버에게 비밀 미션과 사진첩을 공개하시겠습니까?";
  if (!confirm(question)) return;
  localStorage.setItem("jeju-missions-open", String(!open));
  renderAdmin();
  notify(open ? "비밀 미션과 사진첩이 다시 비공개되었습니다." : "모든 멤버에게 비밀 미션과 사진첩이 공개되었습니다.");
});

document.getElementById("openQuizButton").addEventListener("click", () => {
  if (state.member !== "최민규") return;
  const open = quizIsOpen();
  const question = open
    ? "모든 멤버의 작성자 맞히기 접근을 다시 차단하시겠습니까?"
    : "모든 멤버에게 작성자 맞히기를 공개하시겠습니까?";
  if (!confirm(question)) return;
  localStorage.setItem("jeju-quiz-open", String(!open));
  renderAdmin();
  notify(open ? "작성자 맞히기가 다시 비공개되었습니다." : "작성자 맞히기가 공개되었습니다.");
});

document.getElementById("openQuizResultsButton").addEventListener("click", () => {
  if (state.member !== "최민규") return;
  const open = quizResultsAreOpen();
  const question = open
    ? "모든 멤버의 전체 채점 결과를 다시 비공개하시겠습니까?"
    : "모든 멤버에게 전체 채점 결과를 공개하시겠습니까?";
  if (!confirm(question)) return;
  localStorage.setItem("jeju-quiz-results-open", String(!open));
  renderAdmin();
  notify(open ? "전체 채점 결과가 다시 비공개되었습니다." : "전체 채점 결과가 공개되었습니다.");
});

document.addEventListener("click", event => {
  const nav = event.target.closest("[data-target]");
  if (nav) showView(nav.dataset.target);
  const remove = event.target.closest("[data-remove]");
  if (remove && confirm("사진을 삭제하시겠습니까?")) {
    const index = remove.dataset.remove;
    localStorage.removeItem(photoKey(state.member, index)); localStorage.removeItem(completedKey(state.member, index));
    delete state.photos[index]; delete state.completedAt[index];
    renderMissions(); notify("사진이 삭제되었습니다.");
  }
  const resultButton = event.target.closest("[data-result-subject]");
  if (resultButton) { resultSubject = resultButton.dataset.resultSubject; renderGroupQuizResults(); }
});

document.getElementById("quizForm").addEventListener("submit", event => {
  event.preventDefault();
  if (savedQuizResult(quizSubject)) { notify("이미 제출한 답안은 변경할 수 없습니다."); return; }
  const answers = [...document.querySelectorAll("[data-answer-index]")];
  if (!answers.length) return;
  let correct = 0;
  const submittedAnswers = {};
  answers.forEach(selectElement => {
    const index = Number(selectElement.dataset.answerIndex);
    submittedAnswers[index] = selectElement.value;
    const card = document.querySelector(`[data-quiz-index="${index}"]`);
    const isCorrect = selectElement.value === evaluationData[quizSubject][index].author;
    card.classList.remove("correct", "wrong");
    card.classList.add(isCorrect ? "correct" : "wrong");
    card.querySelector(".quiz-question-head span").textContent = isCorrect ? "정답" : "오답";
    selectElement.disabled = true;
    if (isCorrect) correct += 1;
  });
  localStorage.setItem(quizResultKey(quizSubject), JSON.stringify({ answers:submittedAnswers, correct, total:answers.length, submittedAt:new Date().toISOString() }));
  const result = document.getElementById("quizResult");
  result.innerHTML = `<strong>${correct} / ${answers.length}</strong>총 ${answers.length}문제 중 ${correct}개를 맞혔습니다. 제출이 완료되어 답안을 변경할 수 없습니다.`;
  result.classList.remove("hidden");
  const submitButton = document.getElementById("quizSubmitButton");
  submitButton.disabled = true;
  submitButton.firstChild.textContent = "답안 제출 완료 ";
  result.scrollIntoView({ behavior:"smooth", block:"center" });
});

document.addEventListener("change", async event => {
  const input = event.target.closest("[data-upload]");
  if (!input || !input.files[0]) return;
  try {
    const data = await compressImage(input.files[0]);
    const completed = new Date().toISOString();
    localStorage.setItem(photoKey(state.member, input.dataset.upload), data);
    localStorage.setItem(completedKey(state.member, input.dataset.upload), completed);
    state.photos[input.dataset.upload] = data;
    state.completedAt[input.dataset.upload] = completed;
    renderMissions(); notify("미션이 완료되었습니다. 사진이 저장되었습니다.");
  } catch (error) { notify("사진을 저장하지 못했습니다. 다시 시도합니다."); }
});

document.getElementById("homeButton").addEventListener("click", () => showView("dashboardView"));
document.getElementById("logoutButton").addEventListener("click", () => {
  state.member = ""; state.photos = {}; localStorage.removeItem("jeju-member"); select.value = ""; updateLoginMode(); showView("loginView");
});

if (state.member && members.includes(state.member) && hasPassword(state.member)) { loadPhotos(); showView("dashboardView"); }
