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

let evaluationData = window.EVALUATION_DATA;

const db = window.supabase.createClient(window.SUPABASE_CONFIG.url, window.SUPABASE_CONFIG.publishableKey);
const memberEmails = { "서성준":"seongjun@jeja-travel.com", "최민규":"minkyu@jeja-travel.com", "한은혜":"eunhye@jeja-travel.com", "이다경":"dagyeong@jeja-travel.com", "김학진":"hakjin@jeja-travel.com", "은태경":"taegyeong@jeja-travel.com", "이은비":"eunbi@jeja-travel.com" };
const state = { member:"", user:null, profile:null, photos:{}, photoPaths:{}, completedAt:{}, settings:{missions_open:false,gallery_open:false,qt_open:false,quiz_open:false,quiz_results_open:false}, groupProgress:{}, quizResults:{}, galleryEntries:[], galleryLikes:[], likedPhotoIds:new Set() };
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
const qtEntry = document.getElementById("qtEntry");
const quizEntry = document.querySelector(".quiz-entry");
let quizSubject = "";
let resultSubject = members[0];
let gallerySubject = "";
let toastTimer;
let settingsChannel;

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

function missionsAreOpen() { return state.settings.missions_open; }
function galleryIsOpen() { return state.settings.gallery_open; }
function qtIsOpen() { return state.settings.qt_open; }
function quizIsOpen() { return state.settings.quiz_open; }
function quizResultsAreOpen() { return state.settings.quiz_results_open; }
function missionsReceived() { return Boolean(state.profile?.missions_received); }
function savedQuizResult(member) { return state.quizResults[member] || null; }
async function hasPassword(member) {
  const { data, error } = await db.rpc("account_exists", { target_name:member });
  if (error) throw error;
  return Boolean(data);
}

async function updateLoginMode() {
  const member = select.value;
  loginError.textContent = ""; passwordInput.value = ""; passwordConfirm.value = "";
  passwordFields.classList.toggle("hidden", !member);
  loginButton.disabled = !member;
  if (!member) {
    loginButton.firstChild.textContent = "이름을 먼저 선택합니다 ";
    return;
  }
  let returning = false;
  try { returning = await hasPassword(member); }
  catch (error) { loginError.textContent = "데이터베이스 설정이 필요합니다."; return; }
  passwordTitle.textContent = returning ? "비밀번호 입력" : "첫 비밀번호 설정";
  passwordGuide.textContent = returning ? "처음 설정한 비밀번호를 입력합니다." : "6자 이상으로 설정합니다.";
  confirmField.classList.toggle("hidden", returning);
  passwordInput.autocomplete = returning ? "current-password" : "new-password";
  loginButton.firstChild.textContent = returning ? "로그인하기 " : "비밀번호 만들고 입장하기 ";
  setTimeout(() => passwordInput.focus(), 0);
}
async function loadPhotos() {
  state.photos = {}; state.photoPaths = {}; state.completedAt = {};
  if (!state.user) return;
  const { data, error } = await db.from("mission_photos").select("mission_index,storage_path,completed_at").eq("user_id",state.user.id);
  if (error) throw error;
  for (const row of data) {
    const { data:signed } = await db.storage.from("mission-photos").createSignedUrl(row.storage_path,3600);
    state.photos[row.mission_index] = signed?.signedUrl || "";
    state.photoPaths[row.mission_index] = row.storage_path;
    state.completedAt[row.mission_index] = row.completed_at;
  }
}

function subscribeToSettings() {
  if (settingsChannel) db.removeChannel(settingsChannel);
  settingsChannel = db.channel("shared-app-settings")
    .on("postgres_changes", { event:"UPDATE", schema:"public", table:"app_settings", filter:"id=eq.1" }, async payload => {
      state.settings = payload.new;
      if (quizResultsAreOpen()) {
        const { data } = await db.from("quiz_results").select("user_id,answers,score,total,submitted_at,profiles(name)");
        (data || []).forEach(row => { if (row.profiles?.name) state.quizResults[row.profiles.name] = { answers:row.answers, correct:row.score, total:row.total, submittedAt:row.submitted_at }; });
      }
      const active = document.querySelector(".view.active")?.id || "dashboardView";
      showView(active);
    }).subscribe();
}

async function loadOnlineState() {
  const [{ data:profile, error:profileError },{ data:settings, error:settingsError },{ data:progress },{ data:results },{ data:evaluations, error:evaluationsError }] = await Promise.all([
    db.from("profiles").select("id,name,role,missions_received").eq("id",state.user.id).single(),
    db.from("app_settings").select("*").eq("id",1).single(),
    db.rpc("group_progress"),
    db.from("quiz_results").select("user_id,answers,score,total,submitted_at,profiles(name)"),
    db.from("evaluation_entries").select("subject,author,body,sort_order").order("sort_order",{ascending:true})
  ]);
  if (profileError) throw profileError;
  if (settingsError) throw settingsError;
  state.profile=profile; state.member=profile.name; state.settings=settings;
  state.groupProgress=Object.fromEntries((progress||[]).map(row=>[row.name,Number(row.completed_count)]));
  state.quizResults={};
  (results||[]).forEach(row=>{ if(row.profiles?.name) state.quizResults[row.profiles.name]={answers:row.answers,correct:row.score,total:row.total,submittedAt:row.submitted_at}; });
  if (!evaluationsError && evaluations?.length) {
    evaluationData = Object.fromEntries(members.map(name => [name, []]));
    evaluations.forEach(entry => {
      if (entry.author !== entry.subject && evaluationData[entry.subject]) evaluationData[entry.subject].push({ author:entry.author, text:entry.body });
    });
  } else if (evaluationsError) {
    notify(`평가 데이터를 불러오지 못해 기본 데이터를 사용합니다: ${evaluationsError.message}`);
  }
  await loadPhotos();
}

function formatCompletedAt(value) {
  if (!value) return "완료 시간 기록 없음";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "완료 시간 기록 없음";
  return new Intl.DateTimeFormat("ko-KR", { month:"long", day:"numeric", weekday:"short", hour:"2-digit", minute:"2-digit", hour12:false }).format(date);
}

function showView(id) {
  if (id === "missionsView" && !missionsAreOpen()) {
    notify("관리자가 공개하기 전에는 비밀 미션에 접근할 수 없습니다."); id = "dashboardView";
  }
  if (id === "galleryView" && !galleryIsOpen()) {
    notify("관리자가 공개하기 전에는 모두의 사진첩에 접근할 수 없습니다."); id = "dashboardView";
  }
  if (id === "qtView" && !qtIsOpen()) {
    notify("관리자가 공개하기 전에는 오늘의 QT에 접근할 수 없습니다."); id = "dashboardView";
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
  if (id === "qtView") showQtPage(0);
  if (id === "adminView") renderAdmin();
  if (id === "quizView") renderQuiz();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showQtPage(page) {
  document.querySelectorAll("[data-qt-page]").forEach(section => section.classList.toggle("hidden", Number(section.dataset.qtPage) !== page));
  window.scrollTo({ top:0, behavior:"smooth" });
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
  const galleryOpen = galleryIsOpen();
  galleryEntry.classList.toggle("locked", !galleryOpen);
  galleryEntry.setAttribute("aria-disabled", String(!galleryOpen));
  document.getElementById("galleryEntryCopy").textContent = galleryOpen ? "모두가 포착한 순간을 모읍니다" : "관리자가 공개하면 확인할 수 있습니다";
  const qtOpen = qtIsOpen();
  qtEntry.classList.toggle("locked", !qtOpen);
  qtEntry.setAttribute("aria-disabled", String(!qtOpen));
  qtEntry.querySelector("small").textContent = qtOpen ? "시편 100편 1~5절" : "관리자가 공개하면 확인할 수 있습니다";
  const quizOpen = quizIsOpen();
  const quizAvailable = quizOpen || quizResultsAreOpen();
  quizEntry.classList.toggle("locked", !quizAvailable);
  quizEntry.setAttribute("aria-disabled", String(!quizAvailable));
  document.getElementById("quizEntryCopy").textContent = quizOpen ? "나를 설명한 사람이 누구인지 맞힙니다" : quizResultsAreOpen() ? "전체 채점 결과를 확인합니다" : "관리자가 공개하면 확인할 수 있습니다";
  document.getElementById("memberProgressList").innerHTML = members.map(member => {
    const count = member === state.member ? complete : (state.groupProgress[member] || 0);
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
    ? "모든 멤버가 자신의 비밀 미션에 접근할 수 있습니다."
    : "현재 모든 멤버가 비밀 미션에 접근할 수 없습니다.";
  button.disabled = false;
  button.firstChild.textContent = open ? "전체 다시 비공개 " : "전체 공개 ";

  const galleryOpen = galleryIsOpen();
  const galleryControl = document.getElementById("galleryControl");
  const galleryButton = document.getElementById("openGalleryButton");
  galleryControl.classList.toggle("open", galleryOpen);
  document.getElementById("galleryAccessBadge").textContent = galleryOpen ? "공개됨" : "비공개";
  document.getElementById("galleryControlCopy").textContent = galleryOpen
    ? "모든 멤버가 모두의 사진첩에서 전체 미션 사진을 확인할 수 있습니다."
    : "현재 모든 멤버가 모두의 사진첩에 접근할 수 없습니다.";
  galleryButton.firstChild.textContent = galleryOpen ? "모두의 사진첩 다시 비공개 " : "모두의 사진첩 공개 ";

  const qtOpen = qtIsOpen();
  const qtControl = document.getElementById("qtControl");
  const qtButton = document.getElementById("openQtButton");
  qtControl.classList.toggle("open", qtOpen);
  document.getElementById("qtAccessBadge").textContent = qtOpen ? "공개됨" : "비공개";
  document.getElementById("qtControlCopy").textContent = qtOpen
    ? "모든 멤버가 오늘의 QT에 접근할 수 있습니다."
    : "현재 모든 멤버가 오늘의 QT에 접근할 수 없습니다.";
  qtButton.firstChild.textContent = qtOpen ? "오늘의 QT 다시 비공개 " : "오늘의 QT 공개 ";

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
  window.setTimeout(async () => {
    const { error } = await db.from("profiles").update({ missions_received:true }).eq("id", state.user.id);
    if (error) { button.disabled = false; receive.classList.remove("hidden"); drawing.classList.add("hidden"); notify("미션을 불러오지 못했습니다."); return; }
    state.profile.missions_received = true;
    button.disabled = false;
    renderMissions();
    notify("비밀 미션 5개가 도착했습니다.");
  }, 3000);
});

async function renderGallery() {
  const grid = document.getElementById("galleryGrid");
  const empty = document.getElementById("emptyGallery");
  if (!members.includes(gallerySubject)) gallerySubject = state.member;
  grid.classList.remove("hidden"); empty.classList.add("hidden");
  grid.innerHTML = `<div class="quiz-blank" aria-label="사진을 불러오는 중"></div>`;
  const [{ data, error }, { data:galleryProfiles, error:profilesError }] = await Promise.all([
    db.from("mission_photos").select("id,user_id,mission_index,storage_path,completed_at").order("completed_at",{ascending:true}),
    db.from("profiles").select("id,name")
  ]);
  if (error || profilesError) {
    grid.innerHTML = ""; empty.classList.remove("hidden");
    notify(`사진첩을 불러오지 못했습니다: ${(error || profilesError).message}`);
    return;
  }
  const profileNames = Object.fromEntries((galleryProfiles || []).map(profile => [profile.id, profile.name]));
  const entries = await Promise.all((data || []).map(async row => {
    const { data:signed } = await db.storage.from("mission-photos").createSignedUrl(row.storage_path,3600);
    return { ...row, name:profileNames[row.user_id], photo:signed?.signedUrl || "" };
  }));
  state.galleryEntries = entries;
  const { data:likes, error:likesError } = await db.from("photo_likes").select("photo_id,user_id");
  if (likesError) { notify(`하트 정보를 불러오지 못했습니다: ${likesError.message}`); state.galleryLikes = []; }
  else state.galleryLikes = likes || [];
  state.likedPhotoIds = new Set(state.galleryLikes.filter(like => like.user_id === state.user.id).map(like => Number(like.photo_id)));
  renderGalleryPerson();
}

function renderGalleryPerson() {
  const grid = document.getElementById("galleryGrid");
  const empty = document.getElementById("emptyGallery");
  const entries = state.galleryEntries || [];
  const remaining = Math.max(0, 20 - state.likedPhotoIds.size);
  document.getElementById("heartBalance").innerHTML = `<span>♥</span> 남은 하트 <strong>${remaining}</strong>개`;
  document.getElementById("galleryPersonTabs").innerHTML = members.map(name =>
    `<button class="result-person-tab ${name === gallerySubject ? "active" : ""}" type="button" data-gallery-subject="${name}">${name}</button>`
  ).join("");
  const byMember = Object.fromEntries(members.map(name => [name, {}]));
  entries.forEach(entry => { if (byMember[entry.name]) byMember[entry.name][Number(entry.mission_index)] = entry; });
  empty.classList.add("hidden");
  grid.classList.remove("hidden");
  const completed = Object.keys(byMember[gallerySubject]).length;
  const missions = missionSets[gallerySubject].map((mission, index) => {
      const entry = byMember[gallerySubject][index];
      const liked = entry ? state.likedPhotoIds.has(Number(entry.id)) : false;
      const likeCount = entry ? state.galleryLikes.filter(like => Number(like.photo_id) === Number(entry.id)).length : 0;
      return `<article class="gallery-mission ${entry ? "complete" : "pending"}">
        <div class="gallery-mission-copy"><span>${String(index + 1).padStart(2,"0")}</span><div><h4>${mission}</h4><small>${entry ? `완료 · ${formatCompletedAt(entry.completed_at)}` : "아직 사진이 등록되지 않았습니다."}</small></div></div>
        ${entry ? `<img src="${entry.photo}" alt="${gallerySubject}의 ${index + 1}번 미션 사진"><button class="photo-like-button ${liked ? "liked" : ""}" type="button" data-photo-like="${entry.id}" aria-pressed="${liked}"><span>${liked ? "♥" : "♡"}</span><b>${likeCount}</b><small>${liked ? "좋아요 취소" : "좋아요"}</small></button>` : `<div class="gallery-photo-placeholder"><span>PHOTO</span></div>`}
      </article>`;
  }).join("");
  grid.innerHTML = `<section class="member-gallery">
      <div class="member-gallery-head"><div><span>MEMBER</span><h3>${gallerySubject}</h3></div><strong>${completed} / 5 완료</strong></div>
      <div class="member-gallery-missions">${missions}</div>
    </section>`;
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
  if (password.length < 6) {
    loginError.textContent = "비밀번호는 6자 이상 입력해야 합니다."; passwordInput.focus(); return;
  }
  loginButton.disabled = true;
  try {
    const returning = await hasPassword(member);
    let authResult;
    if (returning) {
      authResult = await db.auth.signInWithPassword({ email:memberEmails[member], password });
    } else {
    if (password !== passwordConfirm.value) {
      loginError.textContent = "두 비밀번호가 서로 일치하지 않습니다.";
      passwordConfirm.focus(); loginButton.disabled = false; return;
    }
      authResult = await db.auth.signUp({ email:memberEmails[member], password, options:{ data:{ display_name:member } } });
    }
    if (authResult.error) throw authResult.error;
    if (!authResult.data.session) throw new Error("이메일 확인 설정을 해제해야 합니다.");
    state.user = authResult.data.user;
    await loadOnlineState();
    subscribeToSettings();
    passwordInput.value = ""; passwordConfirm.value = "";
    showView("dashboardView");
    if (!returning) notify(`${member}님의 비밀번호가 설정되었습니다.`);
  } catch (error) {
    loginError.textContent = error.message.includes("Invalid login") ? "비밀번호가 일치하지 않습니다." : `로그인하지 못했습니다. ${error.message}`;
    passwordInput.select();
  } finally { loginButton.disabled = false; }
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
  if (newPassword.value.length < 6) { error.textContent = "새 비밀번호는 6자 이상 입력해야 합니다."; newPassword.focus(); return; }
  if (newPassword.value !== confirmation.value) { error.textContent = "두 비밀번호가 서로 일치하지 않습니다."; confirmation.focus(); return; }
  const { data:{ session } } = await db.auth.getSession();
  const response = await fetch(`${window.SUPABASE_CONFIG.url}/functions/v1/admin-password-reset`, { method:"POST", headers:{ "Content-Type":"application/json", Authorization:`Bearer ${session.access_token}` }, body:JSON.stringify({ member:targetMember, password:newPassword.value }) });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) { error.textContent = payload.error || "비밀번호 변경 서버 함수 설정이 필요합니다."; return; }
  newPassword.value = ""; confirmation.value = ""; adminMemberSelect.value = "";
  notify(`${targetMember}님의 비밀번호가 변경되었습니다.`);
});

document.getElementById("openMissionsButton").addEventListener("click", async () => {
  if (state.member !== "최민규") return;
  const open = missionsAreOpen();
  const question = open
    ? "모든 멤버의 비밀 미션 접근을 다시 차단하시겠습니까?"
    : "모든 멤버에게 비밀 미션을 공개하시겠습니까?";
  if (!confirm(question)) return;
  const { error } = await db.from("app_settings").update({ missions_open:!open, updated_at:new Date().toISOString() }).eq("id",1);
  if (error) { notify("공개 상태를 변경하지 못했습니다."); return; }
  state.settings.missions_open = !open;
  renderAdmin();
  notify(open ? "비밀 미션이 다시 비공개되었습니다." : "모든 멤버에게 비밀 미션이 공개되었습니다.");
});

document.getElementById("resetMissionReceiptsButton").addEventListener("click", async () => {
  if (state.member !== "최민규") return;
  const question = "모든 멤버의 미션 수령 상태를 초기화하시겠습니까? 이미 저장된 사진과 완료 시간은 삭제되지 않습니다.";
  if (!confirm(question)) return;
  const { error } = await db.rpc("reset_mission_receipts");
  if (error) { notify(`미션 수령 상태를 초기화하지 못했습니다: ${error.message}`); return; }
  state.profile.missions_received = false;
  notify("모든 멤버가 미션을 다시 수령할 수 있습니다.");
});

document.getElementById("openGalleryButton").addEventListener("click", async () => {
  if (state.member !== "최민규") return;
  const open = galleryIsOpen();
  const question = open ? "모두의 사진첩을 다시 비공개하시겠습니까?" : "모든 멤버에게 모두의 사진첩을 공개하시겠습니까?";
  if (!confirm(question)) return;
  const { error } = await db.from("app_settings").update({ gallery_open:!open, updated_at:new Date().toISOString() }).eq("id",1);
  if (error) { notify(`사진첩 공개 상태를 변경하지 못했습니다: ${error.message}`); return; }
  state.settings.gallery_open = !open;
  renderAdmin();
  notify(open ? "모두의 사진첩이 다시 비공개되었습니다." : "모두의 사진첩이 공개되었습니다.");
});

document.getElementById("openQtButton").addEventListener("click", async () => {
  if (state.member !== "최민규") return;
  const open = qtIsOpen();
  const question = open ? "오늘의 QT를 다시 비공개하시겠습니까?" : "모든 멤버에게 오늘의 QT를 공개하시겠습니까?";
  if (!confirm(question)) return;
  const { error } = await db.from("app_settings").update({ qt_open:!open, updated_at:new Date().toISOString() }).eq("id",1);
  if (error) { notify(`QT 공개 상태를 변경하지 못했습니다: ${error.message}`); return; }
  state.settings.qt_open = !open;
  renderAdmin();
  notify(open ? "오늘의 QT가 다시 비공개되었습니다." : "오늘의 QT가 공개되었습니다.");
});

document.getElementById("openQuizButton").addEventListener("click", async () => {
  if (state.member !== "최민규") return;
  const open = quizIsOpen();
  const question = open
    ? "모든 멤버의 작성자 맞히기 접근을 다시 차단하시겠습니까?"
    : "모든 멤버에게 작성자 맞히기를 공개하시겠습니까?";
  if (!confirm(question)) return;
  const { error } = await db.from("app_settings").update({ quiz_open:!open, updated_at:new Date().toISOString() }).eq("id",1);
  if (error) { notify("공개 상태를 변경하지 못했습니다."); return; }
  state.settings.quiz_open = !open;
  renderAdmin();
  notify(open ? "작성자 맞히기가 다시 비공개되었습니다." : "작성자 맞히기가 공개되었습니다.");
});

document.getElementById("openQuizResultsButton").addEventListener("click", async () => {
  if (state.member !== "최민규") return;
  const open = quizResultsAreOpen();
  const question = open
    ? "모든 멤버의 전체 채점 결과를 다시 비공개하시겠습니까?"
    : "모든 멤버에게 전체 채점 결과를 공개하시겠습니까?";
  if (!confirm(question)) return;
  const { error } = await db.from("app_settings").update({ quiz_results_open:!open, updated_at:new Date().toISOString() }).eq("id",1);
  if (error) { notify("공개 상태를 변경하지 못했습니다."); return; }
  state.settings.quiz_results_open = !open;
  renderAdmin();
  notify(open ? "전체 채점 결과가 다시 비공개되었습니다." : "전체 채점 결과가 공개되었습니다.");
});

document.addEventListener("click", async event => {
  const qtPageButton = event.target.closest("[data-qt-go]");
  if (qtPageButton) { showQtPage(Number(qtPageButton.dataset.qtGo)); return; }
  const nav = event.target.closest("[data-target]");
  if (nav) showView(nav.dataset.target);
  const remove = event.target.closest("[data-remove]");
  if (remove && confirm("사진을 삭제하시겠습니까?")) {
    const index = remove.dataset.remove;
    const path = state.photoPaths[index];
    if (path) await db.storage.from("mission-photos").remove([path]);
    const { error } = await db.from("mission_photos").delete().eq("user_id",state.user.id).eq("mission_index",Number(index));
    if (error) { notify("사진을 삭제하지 못했습니다."); return; }
    delete state.photos[index]; delete state.photoPaths[index]; delete state.completedAt[index];
    state.groupProgress[state.member] = Object.keys(state.photos).length;
    renderMissions(); notify("사진이 삭제되었습니다.");
  }
  const resultButton = event.target.closest("[data-result-subject]");
  if (resultButton) { resultSubject = resultButton.dataset.resultSubject; renderGroupQuizResults(); }
  const galleryButton = event.target.closest("[data-gallery-subject]");
  if (galleryButton) { gallerySubject = galleryButton.dataset.gallerySubject; renderGalleryPerson(); }
  const likeButton = event.target.closest("[data-photo-like]");
  if (likeButton) {
    const photoId = Number(likeButton.dataset.photoLike);
    likeButton.disabled = true;
    if (state.likedPhotoIds.has(photoId)) {
      const { error } = await db.from("photo_likes").delete().eq("user_id",state.user.id).eq("photo_id",photoId);
      if (error) notify(`좋아요를 취소하지 못했습니다: ${error.message}`);
      else {
        state.likedPhotoIds.delete(photoId);
        state.galleryLikes = state.galleryLikes.filter(like => !(like.user_id === state.user.id && Number(like.photo_id) === photoId));
        renderGalleryPerson();
      }
    } else {
      if (state.likedPhotoIds.size >= 20) { notify("사용할 수 있는 하트 20개를 모두 사용했습니다."); likeButton.disabled = false; return; }
      const { error } = await db.from("photo_likes").insert({ user_id:state.user.id, photo_id:photoId });
      if (error) notify(`좋아요를 저장하지 못했습니다: ${error.message}`);
      else {
        state.likedPhotoIds.add(photoId);
        state.galleryLikes.push({ user_id:state.user.id, photo_id:photoId });
        renderGalleryPerson();
      }
    }
  }
});

document.getElementById("quizForm").addEventListener("submit", async event => {
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
  const submittedAt = new Date().toISOString();
  const { error } = await db.from("quiz_results").insert({ user_id:state.user.id, answers:submittedAnswers, score:correct, total:answers.length, submitted_at:submittedAt });
  if (error) { notify(error.code === "23505" ? "이미 답안을 제출했습니다." : "답안을 저장하지 못했습니다."); renderQuiz(); return; }
  state.quizResults[quizSubject] = { answers:submittedAnswers, correct, total:answers.length, submittedAt };
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
    const blob = await (await fetch(data)).blob();
    const path = `${state.user.id}/mission-${input.dataset.upload}.jpg`;
    const { error:uploadError } = await db.storage.from("mission-photos").upload(path, blob, { upsert:true, contentType:"image/jpeg" });
    if (uploadError) throw uploadError;
    const { error:rowError } = await db.from("mission_photos").upsert({ user_id:state.user.id, mission_index:Number(input.dataset.upload), storage_path:path, completed_at:completed }, { onConflict:"user_id,mission_index" });
    if (rowError) throw rowError;
    state.photos[input.dataset.upload] = data;
    state.photoPaths[input.dataset.upload] = path;
    state.completedAt[input.dataset.upload] = completed;
    state.groupProgress[state.member] = Object.keys(state.photos).length;
    renderMissions(); notify("미션이 완료되었습니다. 사진이 저장되었습니다.");
  } catch (error) { notify("사진을 저장하지 못했습니다. 다시 시도합니다."); }
});

document.getElementById("homeButton").addEventListener("click", () => showView("dashboardView"));
document.getElementById("logoutButton").addEventListener("click", async () => {
  if (settingsChannel) { await db.removeChannel(settingsChannel); settingsChannel = null; }
  await db.auth.signOut();
  state.member = ""; state.user = null; state.profile = null; state.photos = {}; state.photoPaths = {}; state.completedAt = {}; state.galleryEntries = []; state.galleryLikes = []; state.likedPhotoIds = new Set(); gallerySubject = ""; select.value = ""; updateLoginMode(); showView("loginView");
});

(async function initialize() {
  const { data:{ session } } = await db.auth.getSession();
  if (!session) { showView("loginView"); return; }
  try {
    state.user = session.user;
    await loadOnlineState();
    subscribeToSettings();
    showView("dashboardView");
  } catch (error) {
    await db.auth.signOut();
    loginError.textContent = "데이터베이스 초기 설정이 필요합니다.";
    showView("loginView");
  }
})();
