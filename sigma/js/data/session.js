// ============================================
// SIGMA Local Session
// Simulasi login + progress via localStorage
// ============================================

(function () {
  const PROFILE_KEY = "sigma_profiles_v1";
  const ACTIVE_KEY = "sigma_active_profile_v1";

  const defaultProfiles = [
    {
      id: "rizky-8a",
      name: "Rizky Pratama",
      nickname: "Rizky",
      level: 8,
      class: "8A",
      xp: 1280,
      streak: 7,
      badges: [
        { id: "juara1", emoji: "🏆", label: "Juara 1 Kuis", color: "var(--gold-400)" },
        { id: "streak7", emoji: "🔥", label: "Streak 7 hari", color: "var(--red-500)" },
        { id: "digital", emoji: "💻", label: "Juara Digital", color: "var(--info-400)" },
      ],
      progress: {
        "inf8-1": { percent: 80, lessonsDone: 4, total: 5 },
        "inf8-2": { percent: 60, lessonsDone: 3, total: 5 },
        "inf8-5": { percent: 40, lessonsDone: 2, total: 5 },
      },
      completedLabs: ["binary"],
      completedGames: ["sort-race", "typing-binary"],
    },
    {
      id: "aisha-7b",
      name: "Aisha Kamila",
      nickname: "Aisha",
      level: 7,
      class: "7B",
      xp: 540,
      streak: 3,
      badges: [
        { id: "starter", emoji: "✨", label: "Mulai Belajar", color: "var(--ai-400)" },
      ],
      progress: {
        "inf7-1": { percent: 40, lessonsDone: 2, total: 5 },
        "inf7-3": { percent: 20, lessonsDone: 1, total: 5 },
      },
      completedLabs: [],
      completedGames: ["pattern-quiz"],
    },
    {
      id: "bima-9c",
      name: "Bima Saputra",
      nickname: "Bima",
      level: 9,
      class: "9C",
      xp: 920,
      streak: 5,
      badges: [
        { id: "project", emoji: "🚀", label: "Siap Projek", color: "var(--gold-400)" },
        { id: "secure", emoji: "🔐", label: "Aman Digital", color: "var(--green-500)" },
      ],
      progress: {
        "inf9-1": { percent: 60, lessonsDone: 3, total: 5 },
        "inf9-4": { percent: 20, lessonsDone: 1, total: 5 },
      },
      completedLabs: ["logic-gates"],
      completedGames: ["caesar-cipher"],
    },
  ];

  const clone = (value) => JSON.parse(JSON.stringify(value));

  function readProfiles() {
    try {
      const raw = localStorage.getItem(PROFILE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    localStorage.setItem(PROFILE_KEY, JSON.stringify(defaultProfiles));
    return clone(defaultProfiles);
  }

  function writeProfiles(profiles) {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profiles));
  }

  function getActiveId() {
    return localStorage.getItem(ACTIVE_KEY) || readProfiles()[0]?.id;
  }

  function setActiveUser(user) {
    window.USER = user || clone(defaultProfiles[0]);
  }

  function notify() {
    window.dispatchEvent(new CustomEvent("sigma:userchange", { detail: window.USER }));
  }

  function getProfiles() {
    return readProfiles();
  }

  function getActiveUser() {
    const profiles = readProfiles();
    const active = profiles.find(p => p.id === getActiveId()) || profiles[0];
    if (active) localStorage.setItem(ACTIVE_KEY, active.id);
    return active;
  }

  function getOrderedModulesFor(mod) {
    return window.CURRICULUM.modules
      .filter(m => m.level === mod.level && m.subject === mod.subject)
      .sort((a, b) => (a.unit || 0) - (b.unit || 0));
  }

  function getPreviousModule(moduleId) {
    const mod = window.CURRICULUM.modules.find(m => m.id === moduleId);
    if (!mod) return null;
    const ordered = getOrderedModulesFor(mod);
    const index = ordered.findIndex(m => m.id === moduleId);
    return index > 0 ? ordered[index - 1] : null;
  }

  function isModuleLearningComplete(moduleId, userInput) {
    const user = userInput || window.USER || getActiveUser();
    const mod = window.CURRICULUM.modules.find(m => m.id === moduleId);
    if (!mod) return false;
    const progress = user.progress?.[moduleId] || {};
    const lessonsDone = Number(progress.lessonsDone || 0) >= Number(mod.lessons || 0);
    const quests = Object.values(user.quests?.[moduleId] || {}).filter(q => q.completed).length;
    const missionsDone = quests >= Number(mod.lessons || 0);
    const quizDone = !!user.quizzes?.[moduleId];
    return lessonsDone && missionsDone && quizDone;
  }

  function isModuleSequenceUnlocked(moduleId, userInput) {
    const previous = getPreviousModule(moduleId);
    if (!previous) return true;
    return isModuleLearningComplete(previous.id, userInput);
  }

  function getModuleSequenceStatus(moduleId, userInput) {
    const previous = getPreviousModule(moduleId);
    return {
      unlocked: isModuleSequenceUnlocked(moduleId, userInput),
      previous,
      previousComplete: previous ? isModuleLearningComplete(previous.id, userInput) : true,
    };
  }

  function getLearningStepStatus(moduleId, userInput) {
    const user = userInput || window.USER || getActiveUser();
    const mod = window.CURRICULUM.modules.find(m => m.id === moduleId);
    const progress = user.progress?.[moduleId] || {};
    const lessonsDone = Number(progress.lessonsDone || 0);
    const missionCount = Object.values(user.quests?.[moduleId] || {}).filter(q => q.completed).length;
    return {
      materiDone: !!mod && lessonsDone >= Number(mod.lessons || 0),
      missionCount,
      misiUnlocked: !!mod && lessonsDone >= Number(mod.lessons || 0),
      misiDone: !!mod && missionCount >= Number(mod.lessons || 0),
      kuisUnlocked: !!mod && missionCount >= Number(mod.lessons || 0),
      kuisDone: !!user.quizzes?.[moduleId],
    };
  }

  function login(id) {
    const user = readProfiles().find(p => p.id === id);
    if (!user) return null;
    localStorage.setItem(ACTIVE_KEY, user.id);
    setActiveUser(user);
    notify();
    return user;
  }

  function createProfile(input) {
    const name = (input.name || "Siswa Baru").trim();
    const nickname = (input.nickname || name.split(" ")[0] || "Siswa").trim();
    const level = Number(input.level || 7);
    const kelas = (input.class || `${level}A`).trim();
    const id = `${nickname.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;
    const profile = {
      id,
      name,
      nickname,
      level,
      class: kelas,
      xp: 0,
      streak: 1,
      badges: [{ id: "starter", emoji: "✨", label: "Mulai Belajar", color: "var(--gold-400)" }],
      progress: {},
      completedLabs: [],
      completedGames: [],
    };
    const profiles = readProfiles();
    profiles.push(profile);
    writeProfiles(profiles);
    return login(id);
  }

  function saveActiveUser(nextUser) {
    const profiles = readProfiles();
    const index = profiles.findIndex(p => p.id === nextUser.id);
    if (index >= 0) profiles[index] = nextUser;
    else profiles.push(nextUser);
    writeProfiles(profiles);
    localStorage.setItem(ACTIVE_KEY, nextUser.id);
    setActiveUser(nextUser);
    notify();
  }

  function completeLesson(moduleId, lessonIndex) {
    const user = clone(window.USER || getActiveUser());
    const mod = window.CURRICULUM.modules.find(m => m.id === moduleId);
    if (!mod) return user;
    const current = user.progress[moduleId] || { lessonsDone: 0, total: mod.lessons, percent: 0 };
    const total = mod.lessons;
    const targetDone = typeof lessonIndex === "number" ? lessonIndex + 1 : (current.lessonsDone || 0) + 1;
    const lessonsDone = Math.min(total, Math.max(current.lessonsDone || 0, targetDone));
    user.progress[moduleId] = {
      ...current,
      lessonsDone,
      total,
      percent: Math.round((lessonsDone / total) * 100),
    };
    if (lessonsDone === total) awardModuleCompletion(user, mod);
    saveActiveUser(user);
    return user;
  }

  function saveReflection(moduleId, lessonIndex, text) {
    const user = clone(window.USER || getActiveUser());
    user.reflections = user.reflections || {};
    user.reflections[moduleId] = user.reflections[moduleId] || {};
    user.reflections[moduleId][lessonIndex] = {
      text,
      updatedAt: new Date().toISOString(),
    };
    saveActiveUser(user);
    return user;
  }

  function completeQuest(moduleId, lessonIndex, score = 0) {
    const user = clone(window.USER || getActiveUser());
    const mod = window.CURRICULUM.modules.find(m => m.id === moduleId);
    user.quests = user.quests || {};
    user.quests[moduleId] = user.quests[moduleId] || {};
    const previous = user.quests[moduleId][lessonIndex] || null;
    const bestScore = Math.max(Number(previous?.bestScore || 0), Number(score || 0));
    const targetXp = getQuestXpAward(bestScore);
    const alreadyAwarded = Number(previous?.xpAwarded || 0);
    const xpDelta = Math.max(0, targetXp - alreadyAwarded);
    user.xp += xpDelta;
    user.quests[moduleId][lessonIndex] = {
      completed: true,
      completedAt: previous?.completedAt || new Date().toISOString(),
      revisedAt: previous ? new Date().toISOString() : null,
      bestScore,
      xpAwarded: Math.max(alreadyAwarded, targetXp),
    };
    if (!previous) {
      const completedCount = Object.values(user.quests[moduleId]).filter(q => q.completed).length;
      if (completedCount >= 3 && !user.badges.some(b => b.id === `quest-${moduleId}`)) {
        user.badges.push({ id: `quest-${moduleId}`, emoji: "🧭", label: `Misi ${mod?.title || moduleId}`, color: "var(--ai-400)" });
      }
    }
    if (mod && user.progress?.[moduleId]?.lessonsDone >= mod.lessons) {
      awardModuleCompletion(user, mod);
    }
    saveActiveUser(user);
    return user;
  }

  function completeQuiz(moduleId, score, total) {
    const user = clone(window.USER || getActiveUser());
    const mod = window.CURRICULUM.modules.find(m => m.id === moduleId);
    if (!mod) return user;
    user.quizzes = user.quizzes || {};
    const previous = user.quizzes[moduleId] || null;
    if (previous) {
      if (!previous.locked) {
        previous.locked = true;
        user.quizzes[moduleId] = previous;
        saveActiveUser(user);
      }
      return user;
    }
    const percent = total ? Math.round((Number(score || 0) / Number(total)) * 100) : 0;
    const targetXp = getQuizXpAward(score);
    user.xp += targetXp;
    user.quizzes[moduleId] = {
      attempts: 1,
      latestScore: Number(score || 0),
      latestTotal: Number(total || 0),
      latestPercent: percent,
      bestPercent: percent,
      bestFirstPercent: percent,
      bestRemedialPercent: 0,
      xpAwarded: targetXp,
      locked: true,
      updatedAt: new Date().toISOString(),
    };
    if (percent >= 80 && !user.badges.some(b => b.id === `quiz-${moduleId}`)) {
      user.badges.push({ id: `quiz-${moduleId}`, emoji: "🧠", label: `Kuis ${mod.title}`, color: "var(--gold-400)" });
    }
    saveActiveUser(user);
    return user;
  }

  function completeGame(gameId, xp = 0) {
    const user = clone(window.USER || getActiveUser());
    const game = window.CURRICULUM.games.find(g => g.id === gameId);
    if (!game) return user;
    user.completedGames = user.completedGames || [];
    user.gameScores = user.gameScores || {};
    const previous = user.gameScores[gameId] || null;
    const bestXp = Math.max(Number(previous?.bestXp || 0), Number(xp || 0));
    const alreadyAwarded = Number(previous?.xpAwarded || 0);
    const xpDelta = Math.max(0, bestXp - alreadyAwarded);
    user.xp += xpDelta;
    user.gameScores[gameId] = {
      bestXp,
      xpAwarded: Math.max(alreadyAwarded, bestXp),
      attempts: Number(previous?.attempts || 0) + 1,
      updatedAt: new Date().toISOString(),
    };
    if (!user.completedGames.includes(gameId)) user.completedGames.push(gameId);
    const badgeId = `game-${gameId}`;
    if (bestXp > 0 && !user.badges.some(b => b.id === badgeId)) {
      user.badges.push({ id: badgeId, emoji: "🎮", label: `Tantangan ${game.title}`, color: "var(--ai-400)" });
    }
    saveActiveUser(user);
    return user;
  }

  function awardModuleCompletion(user, mod) {
    const moduleId = mod.id;
    user.progress[moduleId] = user.progress[moduleId] || { lessonsDone: mod.lessons, total: mod.lessons, percent: 100 };
    const maxQuestXp = mod.lessons * 35;
    const targetXp = Math.max(80, Number(mod.xp || 0) - maxQuestXp);
    const alreadyAwarded = Number(user.progress[moduleId].moduleXpAwarded || 0);
    const xpDelta = Math.max(0, targetXp - alreadyAwarded);
    user.xp += xpDelta;
    user.progress[moduleId].moduleXpAwarded = Math.max(alreadyAwarded, targetXp);
    const badgeId = `complete-${moduleId}`;
    if (!user.badges.some(b => b.id === badgeId)) {
      user.badges.push({ id: badgeId, emoji: "🏅", label: `Tuntas ${mod.title}`, color: mod.color || "var(--gold-400)" });
    }
  }

  function getQuestXpAward(score) {
    if (score >= 100) return 35;
    if (score >= 80) return 25;
    if (score >= 50) return 15;
    return 10;
  }

  function getQuizXpAward(score) {
    return Math.max(0, Number(score || 0) * 2);
  }

  function resetDemo() {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(defaultProfiles));
    localStorage.setItem(ACTIVE_KEY, defaultProfiles[0].id);
    setActiveUser(clone(defaultProfiles[0]));
    notify();
  }

  const activeUser = getActiveUser();
  setActiveUser(activeUser);

  window.SIGMA_AUTH = {
    getProfiles,
    getActiveUser,
    login,
    createProfile,
    saveActiveUser,
    completeLesson,
    saveReflection,
    completeQuest,
    completeQuiz,
    completeGame,
    getPreviousModule,
    isModuleLearningComplete,
    isModuleSequenceUnlocked,
    getModuleSequenceStatus,
    getLearningStepStatus,
    resetDemo,
  };
})();
