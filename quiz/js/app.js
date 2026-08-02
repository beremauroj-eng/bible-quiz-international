(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const tr = (text) => window.BQI18n?.t(text) || text;
  const appLocale = () => window.BQI18n?.locale || "en-AU";
  const PROFILE_KEY = "bqProfilesV3";
  const ACTIVE_KEY = "bqActiveProfileV3";
  const OLD_CURRENT_KEY = "bqCurrentQuizV2";
  const VERSION = 3;
  const screens = [$("welcomeScreen"), $("quizScreen"), $("resultsScreen")];

  const ACHIEVEMENTS = [
    { id: "first", icon: "✦", name: "First Steps", desc: "Complete your first quiz", test: (s) => s.totalQuizzes >= 1 },
    { id: "perfect", icon: "🏆", name: "Perfect Score", desc: "Score 100% in a quiz", test: (s) => s.perfectScores >= 1 },
    { id: "streak3", icon: "🔥", name: "Three-Day Streak", desc: "Study on three consecutive days", test: (s) => s.studyStreak >= 3 },
    { id: "streak7", icon: "🌟", name: "Seven-Day Streak", desc: "Study on seven consecutive days", test: (s) => s.studyStreak >= 7 },
    { id: "hundred", icon: "📖", name: "Century Scholar", desc: "Answer 100 questions correctly", test: (s) => s.totalCorrect >= 100 },
    { id: "thousand", icon: "💎", name: "Thousand Answers", desc: "Answer 1,000 questions", test: (s) => s.totalAnswered >= 1000 },
    { id: "ot", icon: "🕊", name: "Old Testament Scholar", desc: "Reach 80% Old Testament mastery", test: (s) => mastery(s, "OT") >= 80 },
    { id: "nt", icon: "✨", name: "New Testament Scholar", desc: "Reach 80% New Testament mastery", test: (s) => mastery(s, "NT") >= 80 },
    { id: "reader7", icon: "☀", name: "Daily Reader", desc: "Study the daily verse on seven days", test: (s) => (s.verseDays || []).length >= 7 },
    { id: "weekly", icon: "🌍", name: "Weekly Challenger", desc: "Complete a weekly challenge", test: (s) => Object.keys(s.weeklyScores || {}).length >= 1 },
    { id: "journey", icon: "🧭", name: "Bible Journey", desc: "Complete three learning lessons", test: (s) => (s.lessonsCompleted || []).length >= 3 },
    { id: "collector", icon: "🗂", name: "Collection Scholar", desc: "Complete five specialist collections", test: (s) => Object.keys(s.collectionProgress || {}).length >= 5 },
    { id: "speed", icon: "⚡", name: "Quick Thinker", desc: "Average under eight seconds across 50 answers", test: (s) => (s.responseTimes || []).length >= 50 && (s.responseTimes.reduce((a,b)=>a+b,0) / s.responseTimes.length) < 8 },
  ];
  let profiles = null;
  let profile = null;
  let state = freshQuizState();
  let exitTimerWasRunning = false;

  function freshQuizState() {
    return {
      questions: [],
      index: 0,
      score: 0,
      streak: 0,
      bestStreak: 0,
      answers: [],
      answered: false,
      timerId: null,
      remaining: 15,
      startedAt: 0,
      duration: 0,
      mode: "current",
      wrongIds: [],
      newAchievements: [],
      questionStartedAt: 0,
      challengeLabel: "",
    };
  }

  function dateKey(date = new Date()) {
    return date.toISOString().slice(0, 10);
  }

  function today() {
    return dateKey();
  }

  function blankStats() {
    return {
      totalQuizzes: 0,
      totalAnswered: 0,
      totalCorrect: 0,
      totalSeconds: 0,
      bestScore: 0,
      perfectScores: 0,
      studyStreak: 0,
      longestStudyStreak: 0,
      lastStudyDate: null,
      byTestament: { OT: { a: 0, c: 0 }, NT: { a: 0, c: 0 } },
      byDifficulty: {
        Easy: { a: 0, c: 0 },
        Medium: { a: 0, c: 0 },
        Hard: { a: 0, c: 0 },
      },
      history: [],
      missed: {},
      bookmarks: [],
      achievements: [],
      byBook: {},
      byCategory: {},
      responseTimes: [],
      weeklyScores: {},
      verseDays: [],
      lessonsCompleted: [],
      collectionProgress: {},
    };
  }

  function defaultSettings() {
    return {
      focus: "all",
      difficulty: "balanced",
      length: 30,
      timer: 15,
      book: "all",
      category: "all",
      shuffle: true,
      sound: true,
      masterVolume: 100,
      effectsVolume: 100,
      countdownSound: true,
      reduceMotion: false,
      adaptiveDifficulty: true,
      visualLearning: true,
      enhancedContext: true,
      highContrast: false,
      textScale: 100,
      dyslexiaFriendly: false,
      leftHanded: false,
    };
  }

  function createProfile(name = "Guest", id = "guest") {
    return {
      id,
      name,
      createdAt: new Date().toISOString(),
      settings: defaultSettings(),
      currentQuiz: [],
      stats: blankStats(),
    };
  }

  function normaliseStats(input = {}) {
    const base = blankStats();
    return {
      ...base,
      ...input,
      byTestament: {
        OT: { ...base.byTestament.OT, ...(input.byTestament?.OT || {}) },
        NT: { ...base.byTestament.NT, ...(input.byTestament?.NT || {}) },
      },
      byDifficulty: {
        Easy: { ...base.byDifficulty.Easy, ...(input.byDifficulty?.Easy || {}) },
        Medium: { ...base.byDifficulty.Medium, ...(input.byDifficulty?.Medium || {}) },
        Hard: { ...base.byDifficulty.Hard, ...(input.byDifficulty?.Hard || {}) },
      },
      history: Array.isArray(input.history) ? input.history : [],
      missed: input.missed && typeof input.missed === "object" ? input.missed : {},
      bookmarks: Array.isArray(input.bookmarks) ? input.bookmarks : [],
      achievements: Array.isArray(input.achievements) ? input.achievements : [],
      byBook: input.byBook && typeof input.byBook === "object" ? input.byBook : {},
      byCategory: input.byCategory && typeof input.byCategory === "object" ? input.byCategory : {},
      responseTimes: Array.isArray(input.responseTimes) ? input.responseTimes.slice(-500) : [],
      weeklyScores: input.weeklyScores && typeof input.weeklyScores === "object" ? input.weeklyScores : {},
      verseDays: Array.isArray(input.verseDays) ? input.verseDays : [],
      lessonsCompleted: Array.isArray(input.lessonsCompleted) ? input.lessonsCompleted : [],
      collectionProgress: input.collectionProgress && typeof input.collectionProgress === "object" ? input.collectionProgress : {},
    };
  }

  function loadProfiles() {
    try {
      profiles = JSON.parse(localStorage.getItem(PROFILE_KEY));
    } catch (_) {
      profiles = null;
    }

    if (!profiles || !profiles.items || typeof profiles.items !== "object") {
      profiles = { version: VERSION, items: { guest: createProfile() }, activeId: "guest" };
      migrateLegacyIntoGuest();
    }

    let activeId = localStorage.getItem(ACTIVE_KEY) || profiles.activeId || "guest";
    if (!profiles.items[activeId]) activeId = Object.keys(profiles.items)[0];
    profiles.activeId = activeId;
    profile = profiles.items[activeId];
    profile.settings = { ...defaultSettings(), ...(profile.settings || {}) };
    profile.stats = normaliseStats(profile.stats);
    profile.currentQuiz = Array.isArray(profile.currentQuiz) ? profile.currentQuiz : [];
    saveProfiles();
    BQAudio.configure(profile.settings);
    BQAudio.preload();
  }

  function migrateLegacyIntoGuest() {
    const guest = profiles.items.guest;
    try {
      const oldIds = JSON.parse(localStorage.getItem(OLD_CURRENT_KEY));
      if (Array.isArray(oldIds)) guest.currentQuiz = oldIds;
    } catch (_) {}

    try {
      const oldSettings = JSON.parse(localStorage.getItem("bqSettings")) || {};
      guest.settings = { ...guest.settings, ...oldSettings };
      if (guest.settings.focus === "ot") guest.settings.focus = "OT";
      if (guest.settings.focus === "nt") guest.settings.focus = "NT";
      if (!["all", "OT", "NT"].includes(guest.settings.focus)) guest.settings.focus = "all";
    } catch (_) {}

    guest.stats.bestScore = Number(localStorage.getItem("bqBest") || 0);
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profiles));
  }

  function saveProfiles() {
    if (!profiles || !profile) return;
    profiles.items[profile.id] = profile;
    profiles.activeId = profile.id;
    profiles.version = VERSION;
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profiles));
    localStorage.setItem(ACTIVE_KEY, profile.id);
  }

  function mastery(stats, testament) {
    const data = stats.byTestament?.[testament];
    return data && data.a ? Math.round((data.c / data.a) * 100) : 0;
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function showScreen(target) {
    const quizActive = target === $("quizScreen");

    // Reset the page offset before applying the quiz scroll lock so the header remains visible.
    if (quizActive) {
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      window.scrollTo(0, 0);
    }

    for (const screen of screens) {
      const active = screen === target;
      screen.hidden = !active;
      screen.classList.toggle("active", active);
    }

    document.body.classList.toggle("quiz-mode", quizActive);
    if (!quizActive) document.body.classList.remove("quiz-answered");

    if (quizActive) {
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      window.scrollTo(0, 0);
      window.requestAnimationFrame(() => window.scrollTo(0, 0));
    } else {
      window.scrollTo({ top: 0, behavior: profile.settings.reduceMotion ? "auto" : "smooth" });
    }

    $("mainContent").focus({ preventScroll: true });
  }

  function toast(message) {
    $("toast").textContent = tr(message);
    $("toast").classList.add("show");
    window.setTimeout(() => $("toast").classList.remove("show"), 2400);
  }

  function hideSplash() {
    const splash = $("appSplash");
    if (!splash) return;
    splash.classList.add("is-hidden");
    window.setTimeout(() => splash.remove(), 520);
  }

  function announce(message) {
    const region = $("liveRegion");
    region.textContent = "";
    window.setTimeout(() => {
      region.textContent = tr(message);
    }, 20);
  }

  function shuffle(values, rng = Math.random) {
    const result = [...values];
    for (let i = result.length - 1; i > 0; i -= 1) {
      const j = Math.floor(rng() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  function seededRandom(seed) {
    let hash = 2166136261;
    for (const character of seed) {
      hash ^= character.charCodeAt(0);
      hash = Math.imul(hash, 16777619);
    }
    return () => {
      hash += 0x6d2b79f5;
      let value = hash;
      value = Math.imul(value ^ (value >>> 15), value | 1);
      value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
      return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    };
  }

  function formatTime(seconds) {
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
  }

  function currentTypes(focus) {
    if (focus === "OT") return ["OT"];
    if (focus === "NT") return ["NT"];
    return ["OT", "NT"];
  }

  async function loadFullBank() {
    return BQData.load(["OT", "NT"]);
  }


  async function ensureCurrentQuiz() {
    const bank = await loadFullBank();
    const map = new Map(bank.map((question) => [question.id, question]));
    profile.currentQuiz = profile.currentQuiz.filter((id) => map.has(id));

    if (!profile.currentQuiz.length) {
      const defaults = {
        focus: "all",
        difficulty: "balanced",
        length: 30,
        book: "all",
        category: "all",
      };
      profile.currentQuiz = selectQuestions(bank, defaults).map((question) => question.id);
      saveProfiles();
    }

    return profile.currentQuiz.map((id) => map.get(id)).filter(Boolean);
  }

  function filterPool(bank, config) {
    return bank.filter((question) => {
      return (
        (config.focus === "all" || question.t === config.focus) &&
        (config.difficulty === "balanced" || question.d === config.difficulty) &&
        (config.book === "all" || question.book === config.book) &&
        (config.category === "all" || question.category === config.category)
      );
    });
  }

  function adaptiveWeights(stats) {
    const answered = Number(stats?.totalAnswered || 0);
    const accuracy = answered ? Number(stats.totalCorrect || 0) / answered : 0.62;
    if (accuracy >= 0.82) return { Easy: 0.18, Medium: 0.42, Hard: 0.40 };
    if (accuracy >= 0.66) return { Easy: 0.30, Medium: 0.47, Hard: 0.23 };
    return { Easy: 0.55, Medium: 0.35, Hard: 0.10 };
  }

  function selectQuestions(bank, config, excludedIds = [], rng = Math.random) {
    let pool = filterPool(bank, config);
    const excluded = new Set(excludedIds);
    const fresh = pool.filter((question) => !excluded.has(question.id));
    const requestedLength = Number(config.length) || 30;

    if (fresh.length >= Math.min(requestedLength, pool.length)) pool = fresh;
    const length = Math.min(requestedLength, pool.length);
    if (!length) return [];

    if (config.difficulty !== "balanced") return shuffle(pool, rng).slice(0, length);

    const groups = {
      Easy: shuffle(pool.filter((question) => question.d === "Easy"), rng),
      Medium: shuffle(pool.filter((question) => question.d === "Medium"), rng),
      Hard: shuffle(pool.filter((question) => question.d === "Hard"), rng),
    };

    const weights = config.adaptiveDifficulty ? adaptiveWeights(profile?.stats) : { Easy: 1 / 3, Medium: 1 / 3, Hard: 1 / 3 };
    const easyTarget = Math.round(length * weights.Easy);
    const mediumTarget = Math.round(length * weights.Medium);
    const hardTarget = Math.max(0, length - easyTarget - mediumTarget);
    const targets = [easyTarget, mediumTarget, hardTarget];
    const chosen = [];
    ["Easy", "Medium", "Hard"].forEach((difficulty, index) => {
      chosen.push(...groups[difficulty].splice(0, targets[index]));
    });

    const remaining = shuffle(Object.values(groups).flat(), rng);
    chosen.push(...remaining.slice(0, length - chosen.length));
    return shuffle(chosen, rng);
  }

  async function createNewQuiz() {
    saveSettings();
    toast("Creating your personalised quiz…");
    const bank = await BQData.load(currentTypes(profile.settings.focus));
    const selected = selectQuestions(bank, profile.settings, profile.currentQuiz);

    if (!selected.length) {
      toast("No questions match those filters. Choose a broader book or category.");
      return;
    }

    profile.currentQuiz = selected.map((question) => question.id);
    saveProfiles();
    toast(`New ${selected.length}-question quiz created`);
    BQAudio.play("newQuiz", { volume: 1.08 });
    startQuiz("current", selected);
  }

  async function startCurrentQuiz() {
    const questions = await ensureCurrentQuiz();
    startQuiz("current", profile.settings.shuffle ? shuffle(questions) : questions);
  }

  async function startDailyChallenge() {
    const bank = await BQData.load(["OT", "NT"]);
    const questions = selectQuestions(
      bank,
      { focus: "all", difficulty: "balanced", length: 10, book: "all", category: "all" },
      [],
      seededRandom(today())
    );
    startQuiz("daily", questions);
  }

  async function startMissedQuestions(ids = null) {
    const orderedIds = ids || Object.entries(profile.stats.missed)
      .sort((a, b) => b[1] - a[1])
      .map(([id]) => id);

    if (!orderedIds.length) {
      toast("No missed questions are waiting for practice.");
      return;
    }

    const bank = await loadFullBank();
    const map = new Map(bank.map((question) => [question.id, question]));
    const questions = orderedIds
      .map((id) => map.get(id))
      .filter(Boolean)
      .slice(0, Number(profile.settings.length) || 30);

    if (!questions.length) {
      toast("Those practice questions are no longer available.");
      return;
    }

    startQuiz("practice", profile.settings.shuffle ? shuffle(questions) : questions);
  }

  function startQuiz(mode, questions) {
    clearInterval(state.timerId);
    state = {
      ...freshQuizState(),
      questions,
      mode,
      remaining: profile.settings.timer,
      startedAt: Date.now(),
    };
    BQAudio.configure(profile.settings);
    BQAudio.unlock();
    showScreen($("quizScreen"));
    document.dispatchEvent(new CustomEvent("bq:start", { detail: { mode, questions, profile } }));
    renderQuestion();
    BQAudio.play("round", { volume: 1.04, delay: 0.04 });
  }

  function resetQuizFit() {
    const screen = $("quizScreen");
    screen.classList.remove("fit-compact", "fit-tight", "fit-ultra", "answered");
    document.body.classList.remove("quiz-answered");
  }

  function fitQuizToViewport() {
    const screen = $("quizScreen");
    if (!screen || screen.hidden || state.answered || window.innerWidth > 700) return;

    screen.classList.remove("fit-compact", "fit-tight", "fit-ultra");
    const levels = ["fit-compact", "fit-tight", "fit-ultra"];
    let level = 0;

    const applyNextLevel = () => {
      const answerBottom = $("answerGrid").getBoundingClientRect().bottom;
      const browserInset = Math.max(8, Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--quiz-bottom-inset")) || 8);
      const availableBottom = window.innerHeight - browserInset;
      if (answerBottom <= availableBottom || level >= levels.length) return;
      screen.classList.add(levels[level]);
      level += 1;
      window.requestAnimationFrame(applyNextLevel);
    };

    window.requestAnimationFrame(applyNextLevel);
  }

  function renderQuestion() {
    clearInterval(state.timerId);
    state.answered = false;
    $("feedback").hidden = true;
    $("nextBtn").hidden = true;
    $("answerGrid").innerHTML = "";
    resetQuizFit();

    const question = state.questions[state.index];
    const total = state.questions.length;
    state.questionStartedAt = Date.now();
    const progress = Math.round(((state.index + 1) / total) * 100);

    $("questionCounter").textContent = `Question ${state.index + 1} of ${total}`;
    $("progressPercent").textContent = `${progress}%`;
    $("progressFill").style.width = `${progress}%`;
    $("progressTrack").setAttribute("aria-valuenow", String(progress));
    $("questionText").textContent = question.q;
    $("difficultyBadge").textContent = question.d;
    $("questionBook").textContent = question.book;
    $("roundLabel").textContent =
      question.r === 1
        ? "Round I · Foundations"
        : question.r === 2
          ? "Round II · People & Events"
          : "Round III · Deeper Knowledge";
    $("modeLabel").textContent =
      state.mode === "daily" ? "Daily Challenge" : state.mode === "practice" ? "Practice Mode" : "Saved Quiz";
    $("scoreValue").textContent = String(state.score);
    $("streakValue").textContent = String(state.streak);

    if (state.index > 0 && state.questions[state.index - 1]?.r !== question.r) {
      BQAudio.play("round", { volume: 1.08 });
    }

    const letters = ["A", "B", "C", "D"];
    question.a.forEach((answer, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "answer-btn";
      button.setAttribute("aria-label", `${letters[index]}. ${answer}`);
      button.innerHTML = `
        <span class="answer-letter" aria-hidden="true">${letters[index]}</span>
        <span>${escapeHtml(answer)}</span>
        <span class="answer-mark" aria-hidden="true"></span>`;
      button.addEventListener("click", () => selectAnswer(index));
      $("answerGrid").appendChild(button);
    });

    const bookmarked = profile.stats.bookmarks.includes(question.id);
    $("bookmarkBtn").setAttribute("aria-pressed", String(bookmarked));
    $("bookmarkBtn").textContent = bookmarked ? "★ Saved for study" : "☆ Save for study";
    startTimer();
    fitQuizToViewport();
    $("questionText").focus();
    announce(`Question ${state.index + 1} of ${total}. ${question.q}`);
    document.dispatchEvent(new CustomEvent("bq:question", { detail: { question, index: state.index, total, mode: state.mode } }));
  }

  function runTimerInterval(duration) {
    clearInterval(state.timerId);
    state.timerId = window.setInterval(() => {
      state.remaining -= 1;
      updateTimer(state.remaining, duration);
      BQAudio.countdown(state.remaining);
      if ([10, 5, 3, 2, 1].includes(state.remaining)) announce(`${state.remaining} seconds remaining`);
      if (state.remaining <= 0) {
        clearInterval(state.timerId);
        state.timerId = null;
        selectAnswer(null, true);
      }
    }, 1000);
  }

  function startTimer() {
    const duration = Number(profile.settings.timer);
    if (!duration) {
      $("timer").hidden = true;
      state.timerId = null;
      return;
    }

    $("timer").hidden = false;
    state.remaining = duration;
    updateTimer(duration, duration);
    runTimerInterval(duration);
  }

  function updateTimer(remaining, duration) {
    $("timerValue").textContent = String(remaining);
    $("timer").style.setProperty("--timer-angle", `${Math.max(0, (remaining / duration) * 360)}deg`);
    $("timer").setAttribute("aria-label", `${remaining} seconds remaining`);
  }

  function adaptRemainingQuestions(correct) {
    if (!profile.settings.adaptiveDifficulty || state.mode === "daily" || state.mode === "weekly" || state.mode.startsWith("collection:") || state.mode.startsWith("lesson:")) return;
    const nextIndex = state.index + 1;
    if (nextIndex >= state.questions.length) return;
    const remaining = state.questions.slice(nextIndex);
    const attemptAccuracy = (state.score + (correct ? 0 : 0)) / Math.max(1, state.index + 1);
    let preferred = "Medium";
    if (correct && state.streak >= 3 && attemptAccuracy >= 0.72) preferred = "Hard";
    else if (!correct || attemptAccuracy < 0.5) preferred = "Easy";
    const candidateIndex = remaining.findIndex((question) => question.d === preferred);
    if (candidateIndex > 0) {
      const absolute = nextIndex + candidateIndex;
      [state.questions[nextIndex], state.questions[absolute]] = [state.questions[absolute], state.questions[nextIndex]];
    }
  }

  function selectAnswer(selectedIndex, timedOut = false) {
    if (state.answered) return;
    state.answered = true;
    clearInterval(state.timerId);
    $("quizScreen").classList.add("answered");
    document.body.classList.add("quiz-answered");

    const question = state.questions[state.index];
    const responseSeconds = Math.max(0.1, (Date.now() - (state.questionStartedAt || Date.now())) / 1000);
    const correct = selectedIndex === question.c;
    const buttons = [...$("answerGrid").children];

    buttons.forEach((button, index) => {
      button.disabled = true;
      const mark = button.querySelector(".answer-mark");
      if (index === question.c) {
        button.classList.add("correct");
        mark.textContent = "✓";
      } else if (index === selectedIndex) {
        button.classList.add("incorrect");
        mark.textContent = "×";
      } else {
        button.classList.add("dimmed");
      }
    });

    if (correct) {
      state.score += 1;
      state.streak += 1;
      state.bestStreak = Math.max(state.bestStreak, state.streak);
      $("feedbackTitle").textContent = "Correct — excellent work";
      const rewardSound = question.d === "Hard" || state.streak >= 5 ? "correctHard" : "correct";
      BQAudio.play(rewardSound, { volume: state.streak >= 5 ? 1.16 : 1.06 });
    } else {
      state.streak = 0;
      state.wrongIds.push(question.id);
      $("feedbackTitle").textContent = timedOut ? "Time is up" : "Not quite";
      BQAudio.play(timedOut ? "timeout" : "incorrect", { volume: timedOut ? 1.12 : 1.06 });
    }

    $("scoreValue").textContent = String(state.score);
    $("streakValue").textContent = String(state.streak);
    $("feedbackText").textContent = question.e;
    $("referenceText").textContent = question.ref;
    $("feedback").hidden = false;
    $("nextBtn").hidden = false;
    $("nextBtn").innerHTML =
      state.index === state.questions.length - 1
        ? 'View results <span aria-hidden="true">→</span>'
        : 'Next question <span aria-hidden="true">→</span>';

    state.answers.push({
      id: question.id,
      q: question.q,
      a: question.a,
      c: question.c,
      s: selectedIndex,
      ok: correct,
      ref: question.ref,
      e: question.e,
      t: question.t,
      d: question.d,
      book: question.book,
      category: question.category || "General Knowledge",
      responseSeconds,
    });

    adaptRemainingQuestions(correct);
    document.dispatchEvent(new CustomEvent("bq:answer", { detail: { question, correct, timedOut, selectedIndex, responseSeconds, index: state.index, total: state.questions.length } }));

    announce(
      `${timedOut ? "Time is up" : correct ? "Correct" : "Incorrect"}. ` +
        `The correct answer is ${question.a[question.c]}. ${question.e}. Reference ${question.ref}.`
    );
    $("nextBtn").focus();
  }

  function nextQuestion() {
    if (!state.answered) return;
    BQAudio.play("pageTurn", { volume: 0.72, duck: false });
    state.index += 1;
    if (state.index < state.questions.length) renderQuestion();
    else finishQuiz();
  }

  function updateStudyStreak(stats) {
    const current = today();
    if (stats.lastStudyDate === current) return;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    stats.studyStreak = stats.lastStudyDate === dateKey(yesterday) ? (stats.studyStreak || 0) + 1 : 1;
    stats.longestStudyStreak = Math.max(stats.longestStudyStreak || 0, stats.studyStreak);
    stats.lastStudyDate = current;
  }

  function unlockAchievements(stats) {
    const previous = new Set(stats.achievements);
    const eligible = ACHIEVEMENTS.filter((achievement) => achievement.test(stats)).map((achievement) => achievement.id);
    const newlyUnlocked = eligible.filter((id) => !previous.has(id));
    stats.achievements = [...new Set([...stats.achievements, ...eligible])];
    return newlyUnlocked;
  }

  function finishQuiz() {
    clearInterval(state.timerId);
    state.duration = Math.round((Date.now() - state.startedAt) / 1000);

    const total = state.questions.length;
    const percent = Math.round((state.score / total) * 100);
    const stats = profile.stats;

    stats.totalQuizzes += 1;
    stats.totalAnswered += total;
    stats.totalCorrect += state.score;
    stats.totalSeconds += state.duration;
    stats.bestScore = Math.max(stats.bestScore, percent);
    if (percent === 100) stats.perfectScores += 1;
    updateStudyStreak(stats);

    state.answers.forEach((answer) => {
      const testament = stats.byTestament[answer.t];
      testament.a += 1;
      testament.c += answer.ok ? 1 : 0;

      const difficulty = stats.byDifficulty[answer.d];
      difficulty.a += 1;
      difficulty.c += answer.ok ? 1 : 0;

      const bookKey = answer.book || "General Bible";
      const categoryKey = answer.category || "General Knowledge";
      stats.byBook[bookKey] = stats.byBook[bookKey] || { a: 0, c: 0, seconds: 0 };
      stats.byCategory[categoryKey] = stats.byCategory[categoryKey] || { a: 0, c: 0, seconds: 0 };
      stats.byBook[bookKey].a += 1;
      stats.byBook[bookKey].c += answer.ok ? 1 : 0;
      stats.byBook[bookKey].seconds += Number(answer.responseSeconds || 0);
      stats.byCategory[categoryKey].a += 1;
      stats.byCategory[categoryKey].c += answer.ok ? 1 : 0;
      stats.byCategory[categoryKey].seconds += Number(answer.responseSeconds || 0);
      stats.responseTimes.push(Number(answer.responseSeconds || 0));

      if (answer.ok) {
        if (stats.missed[answer.id]) stats.missed[answer.id] = Math.max(0, stats.missed[answer.id] - 1);
        if (!stats.missed[answer.id]) delete stats.missed[answer.id];
      } else {
        stats.missed[answer.id] = (stats.missed[answer.id] || 0) + 1;
      }
    });

    stats.history.unshift({
      date: new Date().toISOString(),
      mode: state.mode,
      score: percent,
      correct: state.score,
      total,
      duration: state.duration,
      focus: profile.settings.focus,
      difficulty: profile.settings.difficulty,
    });
    stats.history = stats.history.slice(0, 50);
    stats.responseTimes = stats.responseTimes.slice(-500);
    if (state.mode === "weekly") {
      const key = state.challengeLabel || today();
      stats.weeklyScores[key] = Math.max(Number(stats.weeklyScores[key] || 0), percent);
    }
    if (state.mode.startsWith("collection:")) {
      const key = state.mode.slice("collection:".length);
      const current = stats.collectionProgress[key] || { plays: 0, best: 0 };
      stats.collectionProgress[key] = { plays: current.plays + 1, best: Math.max(current.best, percent) };
    }
    state.newAchievements = unlockAchievements(stats);
    saveProfiles();

    $("resultPercent").textContent = `${percent}%`;
    $("resultRing").style.setProperty("--result-angle", `${percent * 3.6}deg`);
    $("correctStat").textContent = String(state.score);
    $("incorrectStat").textContent = String(total - state.score);
    $("bestStreakResult").textContent = String(state.bestStreak);
    $("timeStat").textContent = formatTime(state.duration);

    let title;
    let message;
    if (percent === 100) {
      title = "Outstanding mastery";
      message = "A perfect score. Your Bible knowledge is exceptional.";
    } else if (percent >= 85) {
      title = "Excellent knowledge";
      message = "You demonstrated a strong command of the Bible across this challenge.";
    } else if (percent >= 70) {
      title = "Very well done";
      message = "A strong result with only a few areas to revisit.";
    } else if (percent >= 50) {
      title = "A solid foundation";
      message = "Review the passages below and return to strengthen your knowledge.";
    } else {
      title = "Keep growing";
      message = "Every question is an opportunity to learn. Your missed questions are ready for practice.";
    }

    $("resultTitle").textContent = title;
    $("resultMessage").textContent = message;
    renderReview();
    renderNewAchievements();
    showScreen($("resultsScreen"));

    if (percent >= 85) createConfetti();
    BQAudio.play(BQAudio.performanceSound(percent), { volume: 1.12, duck: false });
    if (state.newAchievements.length) {
      window.setTimeout(() => BQAudio.play("achievement", { volume: 1.08, duck: false }), percent === 100 ? 2500 : 1600);
    }
    announce(`Quiz complete. You scored ${state.score} out of ${total}, ${percent} percent.`);
    document.dispatchEvent(new CustomEvent("bq:finish", { detail: { percent, score: state.score, total, mode: state.mode, answers: state.answers, newAchievements: state.newAchievements } }));
  }

  function renderReview() {
    const list = $("reviewList");
    list.innerHTML = "";
    state.answers.forEach((answer, index) => {
      const selected = answer.s === null ? "No answer" : answer.a[answer.s];
      const correct = answer.a[answer.c];
      const item = document.createElement("details");
      item.className = "review-item";
      item.innerHTML = `
        <summary>
          <span>${index + 1}. ${escapeHtml(answer.q)}</span>
          <strong class="${answer.ok ? "status-good" : "status-bad"}">${answer.ok ? "Correct" : "Review"}</strong>
        </summary>
        <div class="review-body">
          <p>Your answer: <b>${escapeHtml(selected)}</b></p>
          ${answer.ok ? "" : `<p>Correct answer: <b>${escapeHtml(correct)}</b></p>`}
          <p>${escapeHtml(answer.e)}</p>
          <p>Bible reference: <b>${escapeHtml(answer.ref)}</b></p>
        </div>`;
      list.appendChild(item);
    });
  }

  function renderNewAchievements() {
    const box = $("newAchievements");
    if (!state.newAchievements.length) {
      box.hidden = true;
      box.innerHTML = "";
      return;
    }

    box.hidden = false;
    const names = state.newAchievements
      .map((id) => ACHIEVEMENTS.find((achievement) => achievement.id === id)?.name)
      .filter(Boolean);
    box.innerHTML = `<strong>New achievement${names.length > 1 ? "s" : ""} unlocked</strong><p>${names.join(" • ")}</p>`;
  }

  function renderHome() {
    const stats = profile.stats;
    const accuracy = stats.totalAnswered ? Math.round((stats.totalCorrect / stats.totalAnswered) * 100) : 0;
    const otMastery = mastery(stats, "OT");
    const ntMastery = mastery(stats, "NT");

    $("profileName").textContent = profile.name;
    $("bestScoreStat").textContent = `${stats.bestScore}%`;
    $("studyStreakStat").textContent = String(stats.studyStreak);
    $("currentLengthStat").textContent = String(profile.currentQuiz.length || profile.settings.length);
    $("totalQuizzesMetric").textContent = String(stats.totalQuizzes);
    $("totalAnsweredMetric").textContent = `${stats.totalAnswered} questions answered`;
    $("accuracyMetric").textContent = `${accuracy}%`;
    $("correctMetric").textContent = `${stats.totalCorrect} correct answers`;
    $("otMasteryMetric").textContent = `${otMastery}%`;
    $("ntMasteryMetric").textContent = `${ntMastery}%`;
    $("otMasteryBar").style.width = `${otMastery}%`;
    $("ntMasteryBar").style.width = `${ntMastery}%`;
    document.body.classList.toggle("reduce-motion", profile.settings.reduceMotion);
    document.body.classList.toggle("high-contrast", profile.settings.highContrast);
    document.body.classList.toggle("dyslexia-friendly", profile.settings.dyslexiaFriendly);
    document.body.classList.toggle("left-handed", profile.settings.leftHanded);
    document.body.classList.toggle("visual-learning-off", !profile.settings.visualLearning);
    document.documentElement.style.setProperty("--user-text-scale", String((Number(profile.settings.textScale) || 100) / 100));
    renderAchievements();
    updateSoundIcon();
    document.dispatchEvent(new CustomEvent("bq:home", { detail: { profile, stats } }));
  }

  function renderAchievements() {
    const unlocked = new Set(profile.stats.achievements);
    $("achievementCount").textContent = `${unlocked.size} unlocked`;
    $("achievementGrid").innerHTML = ACHIEVEMENTS.map((achievement) => {
      return `
        <article class="achievement-card ${unlocked.has(achievement.id) ? "unlocked" : ""}">
          <span class="achievement-icon" aria-hidden="true">${achievement.icon}</span>
          <strong>${achievement.name}</strong>
          <small>${achievement.desc}</small>
        </article>`;
    }).join("");
  }

  function renderProfiles() {
    $("profileList").innerHTML = Object.values(profiles.items)
      .map((item) => {
        const active = item.id === profile.id;
        const quizCount = item.stats?.totalQuizzes || 0;
        const quizLabel = quizCount === 1 ? "quiz" : "quizzes";
        const bestScore = item.stats?.bestScore || 0;
        const profileName = escapeHtml(item.name);
        const statusControl = active
          ? `<span class="profile-status" aria-label="Current active profile">Active</span>`
          : `<button class="secondary-btn switch-profile profile-switch" type="button" data-id="${item.id}" aria-label="Switch to ${profileName}">Switch</button>`;

        return `
          <div class="profile-row ${active ? "active" : ""}">
            <div class="profile-details">
              <strong>${profileName}</strong>
              <span>${quizCount} ${quizLabel} &bull; Best score ${bestScore}%</span>
            </div>
            ${statusControl}
          </div>`;
      })
      .join("");

    document.querySelectorAll(".switch-profile").forEach((button) => {
      button.addEventListener("click", () => switchProfile(button.dataset.id));
    });
  }

  function switchProfile(id) {
    saveProfiles();
    profile = profiles.items[id];
    profile.settings = { ...defaultSettings(), ...(profile.settings || {}) };
    profile.stats = normaliseStats(profile.stats);
    profile.currentQuiz = Array.isArray(profile.currentQuiz) ? profile.currentQuiz : [];
    profiles.activeId = id;
    localStorage.setItem(ACTIVE_KEY, id);
    saveProfiles();
    BQAudio.configure(profile.settings);
    renderHome();
    renderProfiles();
    $("profileDialog").close();
    BQAudio.play("button", { volume: 0.7, duck: false });
    toast(`Switched to ${profile.name}`);
  }

  function populateSettings() {
    const settings = profile.settings;
    $("focusSelect").value = settings.focus;
    $("difficultySelect").value = settings.difficulty;
    $("lengthSelect").value = String(settings.length);
    $("timerSelect").value = String(settings.timer);
    $("bookSelect").value = settings.book;
    $("categorySelect").value = settings.category;
    $("shuffleToggle").checked = settings.shuffle;
    $("soundToggle").checked = settings.sound;
    $("masterVolume").value = String(settings.masterVolume);
    $("effectsVolume").value = String(settings.effectsVolume);
    $("countdownSoundToggle").checked = settings.countdownSound;
    updateVolumeLabels();
    $("motionToggle").checked = settings.reduceMotion;
    if ($("adaptiveToggle")) $("adaptiveToggle").checked = settings.adaptiveDifficulty;
    if ($("visualLearningToggle")) $("visualLearningToggle").checked = settings.visualLearning;
    if ($("enhancedContextToggle")) $("enhancedContextToggle").checked = settings.enhancedContext;
    if ($("highContrastToggle")) $("highContrastToggle").checked = settings.highContrast;
    if ($("textScaleSelect")) $("textScaleSelect").value = String(settings.textScale);
    if ($("dyslexiaToggle")) $("dyslexiaToggle").checked = settings.dyslexiaFriendly;
    if ($("leftHandedToggle")) $("leftHandedToggle").checked = settings.leftHanded;
  }

  function updateVolumeLabels() {
    $("masterVolumeValue").textContent = `${$("masterVolume").value}%`;
    $("effectsVolumeValue").textContent = `${$("effectsVolume").value}%`;
  }

  function previewAudioSettings() {
    BQAudio.configure({
      sound: $("soundToggle").checked,
      masterVolume: Number($("masterVolume").value),
      effectsVolume: Number($("effectsVolume").value),
      countdownSound: $("countdownSoundToggle").checked,
    });
  }

  function saveSettings() {
    profile.settings = {
      ...profile.settings,
      focus: $("focusSelect").value,
      difficulty: $("difficultySelect").value,
      length: Number($("lengthSelect").value),
      timer: Number($("timerSelect").value),
      book: $("bookSelect").value,
      category: $("categorySelect").value,
      shuffle: $("shuffleToggle").checked,
      sound: $("soundToggle").checked,
      masterVolume: Number($("masterVolume").value),
      effectsVolume: Number($("effectsVolume").value),
      countdownSound: $("countdownSoundToggle").checked,
      reduceMotion: $("motionToggle").checked,
      adaptiveDifficulty: $("adaptiveToggle") ? $("adaptiveToggle").checked : profile.settings.adaptiveDifficulty,
      visualLearning: $("visualLearningToggle") ? $("visualLearningToggle").checked : profile.settings.visualLearning,
      enhancedContext: $("enhancedContextToggle") ? $("enhancedContextToggle").checked : profile.settings.enhancedContext,
      highContrast: $("highContrastToggle") ? $("highContrastToggle").checked : profile.settings.highContrast,
      textScale: $("textScaleSelect") ? Number($("textScaleSelect").value) : profile.settings.textScale,
      dyslexiaFriendly: $("dyslexiaToggle") ? $("dyslexiaToggle").checked : profile.settings.dyslexiaFriendly,
      leftHanded: $("leftHandedToggle") ? $("leftHandedToggle").checked : profile.settings.leftHanded,
    };
    saveProfiles();
    BQAudio.configure(profile.settings);
    renderHome();
  }

  function populateFilters() {
    BQData.BOOKS.forEach((book) => $("bookSelect").add(new Option(book, book)));
    [
      "Books & Order",
      "Miracles & Signs",
      "Parables",
      "Prophets & Prophecy",
      "Kings & Leadership",
      "Jesus & the Gospels",
      "Early Church & Apostles",
      "Law, Covenant & Worship",
      "Wisdom & Poetry",
      "Places & Geography",
      "People & Relationships",
      "Letters & Teaching",
      "General Knowledge",
    ].forEach((category) => $("categorySelect").add(new Option(category, category)));
  }

  function updateSoundIcon() {
    BQAudio.configure(profile.settings);
    $("soundBtn").textContent = profile.settings.sound ? "🔊" : "🔇";
    $("soundBtn").setAttribute("aria-label", profile.settings.sound ? "Turn sound off" : "Turn sound on");
  }

  function renderHistory() {
    const history = profile.stats.history;
    const average = history.length ? Math.round(history.reduce((sum, item) => sum + item.score, 0) / history.length) : 0;
    $("historySummary").innerHTML = `
      <div><strong>${history.length}</strong><small>Recorded quizzes</small></div>
      <div><strong>${average}%</strong><small>Average score</small></div>
      <div><strong>${formatTime(profile.stats.totalSeconds)}</strong><small>Total study time</small></div>`;

    $("historyList").innerHTML = history.length
      ? history
          .map((item) => {
            const date = new Date(item.date).toLocaleDateString(appLocale(), { day: "numeric", month: "short", year: "numeric" });
            return `
              <article class="history-row">
                <div><strong>${date}</strong><small>${escapeHtml(item.mode)} • ${item.total} questions</small></div>
                <strong>${item.score}%</strong><small>${item.correct}/${item.total}</small>
              </article>`;
          })
          .join("")
      : "<p>No quizzes completed yet.</p>";
  }

  async function exportBackup() {
    const data = {
      site: "bible-quiz-international",
      version: VERSION,
      exportedAt: new Date().toISOString(),
      profiles,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `bible-quiz-backup-${today()}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  async function importBackup(file) {
    try {
      const data = JSON.parse(await file.text());
      if (data.site !== "bible-quiz-international" || !data.profiles?.items) throw new Error("Invalid backup");
      profiles = data.profiles;
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profiles));
      loadProfiles();
      renderHome();
      $("dataDialog").close();
      toast("Backup restored successfully");
    } catch (_) {
      toast("The selected backup could not be validated");
    }
  }

  async function shareResult() {
    const total = state.questions.length;
    const percent = Math.round((state.score / total) * 100);
    const text = tr(`I scored ${state.score}/${total} (${percent}%) in The Ultimate Bible Challenge.`);
    try {
      await navigator.clipboard.writeText(text);
      toast("Result copied to clipboard");
    } catch (_) {
      toast("Unable to copy result");
    }
  }

  function createConfetti() {
    if (profile.settings.reduceMotion) return;
    const colours = ["#f4c86b", "#718dff", "#5bd7a6", "#ff7c8c", "#fff"];
    for (let index = 0; index < 60; index += 1) {
      const piece = document.createElement("i");
      piece.className = "confetti";
      piece.style.left = `${Math.random() * 100}vw`;
      piece.style.background = colours[Math.floor(Math.random() * colours.length)];
      piece.style.setProperty("--drift", `${(Math.random() - 0.5) * 240}px`);
      piece.style.animationDelay = `${Math.random() * 0.8}s`;
      document.body.appendChild(piece);
      window.setTimeout(() => piece.remove(), 4300);
    }
  }

  function openExitQuizDialog() {
    if ($("quizScreen").hidden) return;
    exitTimerWasRunning = !state.answered && Boolean(state.timerId);
    if (exitTimerWasRunning) {
      clearInterval(state.timerId);
      state.timerId = null;
    }
    $("exitQuizDialog").showModal();
    window.setTimeout(() => $("continueQuizBtn").focus(), 0);
  }

  function closeExitQuizDialogAndContinue() {
    if ($("exitQuizDialog").open) $("exitQuizDialog").close();
    if (exitTimerWasRunning && !state.answered && state.remaining > 0) {
      runTimerInterval(Number(profile.settings.timer));
    }
    exitTimerWasRunning = false;
  }

  function confirmExitQuiz() {
    if ($("exitQuizDialog").open) $("exitQuizDialog").close();
    clearInterval(state.timerId);
    state.timerId = null;
    exitTimerWasRunning = false;
    returnHome();
    toast("Quiz attempt ended. Your saved quiz is still available.");
  }

  function returnHome() {
    clearInterval(state.timerId);
    state.timerId = null;
    renderHome();
    showScreen($("welcomeScreen"));
  }

  window.BQApp = {
    getProfile: () => profile,
    getProfiles: () => profiles,
    getState: () => state,
    saveProfiles,
    loadFullBank,
    startCustomQuiz: (mode, questions, label = "") => { state.challengeLabel = label; startQuiz(mode, questions); state.challengeLabel = label; },
    shuffle,
    seededRandom,
    selectQuestions,
    today,
    toast,
    returnHome,
    renderHome,
  };

  function bindEvents() {
    document.addEventListener("click", (event) => {
      const button = event.target.closest("button, .file-label");
      if (!button || button.classList.contains("answer-btn") || button.id === "soundBtn") return;
      BQAudio.play("button", { volume: 0.48, duck: false });
    });

    $("brandHome").addEventListener("click", (event) => {
      event.preventDefault();
      if (!$("quizScreen").hidden) openExitQuizDialog();
      else returnHome();
    });
    $("startBtn").addEventListener("click", startCurrentQuiz);
    $("newQuizBtn").addEventListener("click", createNewQuiz);
    $("dailyBtn").addEventListener("click", startDailyChallenge);
    $("missedBtn").addEventListener("click", () => startMissedQuestions());
    $("nextBtn").addEventListener("click", nextQuestion);
    $("retakeBtn").addEventListener("click", startCurrentQuiz);
    $("newQuizResultBtn").addEventListener("click", createNewQuiz);
    $("practiceWrongBtn").addEventListener("click", () => startMissedQuestions(state.wrongIds));
    $("shareBtn").addEventListener("click", shareResult);
    $("homeBtn").addEventListener("click", returnHome);
    $("exitQuizBtn").addEventListener("click", openExitQuizDialog);
    $("continueQuizBtn").addEventListener("click", closeExitQuizDialogAndContinue);
    $("closeExitQuizBtn").addEventListener("click", closeExitQuizDialogAndContinue);
    $("confirmExitQuizBtn").addEventListener("click", confirmExitQuiz);
    $("exitQuizDialog").addEventListener("cancel", (event) => {
      event.preventDefault();
      closeExitQuizDialogAndContinue();
    });

    $("settingsBtn").addEventListener("click", () => {
      populateSettings();
      $("settingsDialog").showModal();
    });
    ["masterVolume", "effectsVolume"].forEach((id) => {
      $(id).addEventListener("input", () => {
        updateVolumeLabels();
        previewAudioSettings();
      });
    });
    ["soundToggle", "countdownSoundToggle"].forEach((id) => {
      $(id).addEventListener("change", previewAudioSettings);
    });
    $("effectsVolume").addEventListener("change", () => BQAudio.play("correct", { volume: 0.9 }));
    $("settingsForm").addEventListener("submit", (event) => {
      event.preventDefault();
      saveSettings();
      $("settingsDialog").close();
      toast("Settings saved");
    });
    const closeSettingsWithoutSaving = () => {
      BQAudio.configure(profile.settings);
      $("settingsDialog").close();
    };
    $("closeSettingsBtn").addEventListener("click", closeSettingsWithoutSaving);
    $("cancelSettingsBtn").addEventListener("click", closeSettingsWithoutSaving);

    $("soundBtn").addEventListener("click", () => {
      profile.settings.sound = !profile.settings.sound;
      saveProfiles();
      updateSoundIcon();
      if (profile.settings.sound) {
        BQAudio.play("correct", { volume: 0.86 });
      }
    });

    $("bookmarkBtn").addEventListener("click", () => {
      const question = state.questions[state.index];
      const bookmarks = new Set(profile.stats.bookmarks);
      if (bookmarks.has(question.id)) bookmarks.delete(question.id);
      else bookmarks.add(question.id);
      profile.stats.bookmarks = [...bookmarks];
      saveProfiles();
      const saved = bookmarks.has(question.id);
      $("bookmarkBtn").setAttribute("aria-pressed", String(saved));
      $("bookmarkBtn").textContent = saved ? "★ Saved for study" : "☆ Save for study";
      BQAudio.play("bookmark", { volume: 0.86 });
    });

    $("profileBtn").addEventListener("click", () => {
      renderProfiles();
      $("profileDialog").showModal();
    });
    $("closeProfileBtn").addEventListener("click", () => $("profileDialog").close());
    $("newProfileForm").addEventListener("submit", (event) => {
      event.preventDefault();
      const name = $("newProfileName").value.trim();
      if (!name) return;
      const id = `p_${Date.now()}`;
      profiles.items[id] = createProfile(name, id);
      $("newProfileName").value = "";
      switchProfile(id);
    });

    $("historyBtn").addEventListener("click", () => {
      renderHistory();
      $("historyDialog").showModal();
    });
    $("closeHistoryBtn").addEventListener("click", () => $("historyDialog").close());

    $("dataBtn").addEventListener("click", () => $("dataDialog").showModal());
    $("closeDataBtn").addEventListener("click", () => $("dataDialog").close());
    $("exportDataBtn").addEventListener("click", exportBackup);
    $("importDataInput").addEventListener("change", (event) => {
      const file = event.target.files[0];
      if (file) importBackup(file);
    });

    $("privacyBtn").addEventListener("click", () => $("privacyDialog").showModal());
    $("closePrivacyBtn").addEventListener("click", () => $("privacyDialog").close());

    document.addEventListener("keydown", (event) => {
      if (!$("quizScreen").hidden && !state.answered) {
        const keys = { "1": 0, "2": 1, "3": 2, "4": 3, a: 0, b: 1, c: 2, d: 3 };
        const key = event.key.toLowerCase();
        if (key in keys) selectAnswer(keys[key]);
      }
    });

    window.addEventListener("resize", () => {
      if (!state.answered && !$("quizScreen").hidden) fitQuizToViewport();
    });
    window.addEventListener("orientationchange", () => {
      window.setTimeout(() => {
        if (!state.answered && !$("quizScreen").hidden) fitQuizToViewport();
      }, 180);
    });
  }

  async function startRequestedLearningQuiz(params) {
    const requestedBook = params.get("book");
    const requestedTestament = params.get("testament");
    const requestedTopic = params.get("topic");
    if (!requestedBook && !requestedTestament && !requestedTopic) return false;

    const all = await loadFullBank();
    const normalise = (value) => String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
    const textFor = (q) => normalise(`${q.q} ${q.e} ${(q.a || []).join(" ")} ${q.ref} ${q.book} ${q.category}`);
    const escapePattern = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const containsAny = (text, terms) => terms.some((term) =>
      new RegExp(`(^|[^a-z0-9])${escapePattern(term)}(?=$|[^a-z0-9])`).test(text)
    );
    const terms = {
      noah: ["noah", "noe", "ark", "arca", "flood", "diluvio", "rainbow", "arco iris"],
      moses: ["moses", "moises", "pharaoh", "faraon", "egypt", "egipto", "exodus", "exodo", "sinai", "red sea", "mar rojo", "wilderness", "desierto"],
      david: ["david", "goliath", "goliat", "jonathan", "jonatan", "saul"],
      esther: ["esther", "ester", "mordecai", "mardoqueo", "haman", "aman", "susa", "persia"],
      daniel: ["daniel", "babylon", "babilonia", "lion", "leon", "nebuchadnezzar", "nabucodonosor", "belshazzar", "belsasar"],
      jesus: ["jesus", "christ", "cristo", "messiah", "mesias", "gospel", "evangelio", "resurrection", "resurreccion"],
      paul: ["paul", "pablo", "saul", "saulo", "damascus", "damasco", "barnabas", "bernabe", "silas", "timothy", "timoteo"],
      women: ["woman", "women", "mujer", "mujeres", "wife", "esposa", "mother", "madre", "daughter", "hija", "sarah", "sara", "rebekah", "rebeca", "rachel", "raquel", "deborah", "debora", "ruth", "rut", "esther", "ester", "mary", "maria", "lydia", "lidia", "priscilla", "priscila"],
      parables: ["parable", "parabola", "sower", "sembrador", "samaritan", "samaritano", "prodigal", "prodigo", "talents", "talentos"],
      apostles: ["apostle", "apostol", "disciple", "discipulo", "peter", "pedro", "andrew", "andres", "james", "santiago", "john", "juan", "thomas", "tomas", "judas", "matthew", "mateo"]
    };
    const topicMatches = {
      noah: (q, text) => containsAny(text, terms.noah),
      moses: (q, text) => containsAny(text, terms.moses),
      david: (q, text) => containsAny(text, terms.david),
      esther: (q, text) => containsAny(text, terms.esther),
      daniel: (q, text) => containsAny(text, terms.daniel),
      jesus: (q, text) => containsAny(text, terms.jesus),
      paul: (q, text) => containsAny(text, terms.paul),
      women: (q, text) => containsAny(text, terms.women),
      miracles: (q, text) =>
        (["Matthew", "Mark", "Luke", "John"].includes(q.book) || containsAny(text, ["jesus", "gospel", "evangelio"])) &&
        (q.category === "Miracles & Signs" || containsAny(text, [
          "miracle", "miracles", "milagro", "milagros", "heal", "healed", "healing", "sano", "sanidad", "curo",
          "blind", "ciego", "leper", "leproso", "storm", "tormenta", "raised", "resucito", "resurrection", "resurreccion",
          "sign", "senal", "loaves", "panes", "walked on water", "camino sobre el agua", "water into wine", "agua en vino",
          "lazarus", "lazaro", "demon", "demonio", "deaf", "sordo", "mute", "mudo", "feeding", "fed", "alimento"
        ])),
      parables: (q, text) => q.category === "Parables" || containsAny(text, terms.parables),
      apostles: (q, text) => containsAny(text, ["apostle", "apostles", "apostol", "apostoles", "disciple", "disciples", "discipulo", "discipulos", "the twelve", "los doce"]),
      geography: (q, text) => q.category === "Places & Geography" || containsAny(text, ["city", "ciudad", "river", "rio", "sea", "mar", "mount", "monte", "land", "tierra", "country", "pais", "jerusalem", "jerusalen", "bethlehem", "belen", "egypt", "egipto", "rome", "roma", "galilee", "galilea", "jordan"]),
      kings: (q, text) => q.category === "Kings & Leadership" || containsAny(text, ["king", "rey", "reign", "reinado", "throne", "trono", "saul", "david", "solomon", "salomon", "hezekiah", "ezequias", "josiah", "josias", "ahab", "acab"]),
      prophets: (q, text) => q.category === "Prophets & Prophecy" || containsAny(text, ["prophet", "profeta", "prophecy", "profecia", "elijah", "elias", "elisha", "eliseo", "isaiah", "isaias", "jeremiah", "jeremias", "ezekiel", "ezequiel", "hosea", "oseas", "amos"]),
      wisdom: (q, text) => q.category === "Wisdom & Poetry" || ["Job", "Psalms", "Proverbs", "Ecclesiastes", "Song of Solomon"].includes(q.book) || containsAny(text, ["psalm", "salmo", "proverb", "proverbio", "wisdom", "sabiduria"]),
      "early-church": (q, text) => q.book === "Acts" || q.category === "Early Church & Apostles" || containsAny(text, ["pentecost", "pentecostes", "early church", "iglesia primitiva", "stephen", "esteban", "philip", "felipe"])
    };

    let pool = all;
    let label = "";
    if (requestedBook) {
      pool = pool.filter((q) => q.book === requestedBook);
      label = requestedBook;
    }
    if (requestedTestament === "OT" || requestedTestament === "NT") {
      pool = pool.filter((q) => q.t === requestedTestament);
      label = requestedTestament;
    }
    if (requestedTopic && topicMatches[requestedTopic]) {
      pool = pool.filter((q) => topicMatches[requestedTopic](q, textFor(q)));
      label = requestedTopic;
    }
    if (pool.length < 5) return false;

    const requestedLength = Number(params.get("length"));
    const length = Math.min(Number.isFinite(requestedLength) && requestedLength > 0 ? requestedLength : 20, pool.length);
    state.challengeLabel = label;
    startQuiz("web", shuffle(pool).slice(0, length));
    return true;
  }

  async function initialise() {
    try {
      loadProfiles();
      populateFilters();
      bindEvents();
      renderHome();
      showScreen($("welcomeScreen"));

      await ensureCurrentQuiz();
      renderHome();

      const requestedParams = new URLSearchParams(location.search);
      const requestedMode = requestedParams.get("mode");
      if (requestedMode === "daily") startDailyChallenge();
      else await startRequestedLearningQuiz(requestedParams);
    } finally {
      hideSplash();
    }
  }

  document.addEventListener("pointerdown", () => BQAudio.unlock(), { once: true });
  document.addEventListener("keydown", () => BQAudio.unlock(), { once: true });
  document.addEventListener("DOMContentLoaded", initialise);
})();
