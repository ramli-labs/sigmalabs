// ============================================
// SIGMA Local Session
// Profil siswa lokal + progress via localStorage
// ============================================

(function () {
  const PROFILE_KEY = "sigma_profiles_v2";
  const ACTIVE_KEY = "sigma_active_profile_v2";

  const defaultProfiles = [];
  const guestProfile = {
    id: "guest",
    name: "Siswa",
    nickname: "Siswa",
    level: 7,
    class: "7A",
    xp: 0,
    streak: 0,
    badges: [],
    progress: {},
    completedLabs: [],
    completedGames: [],
    quests: {},
    quizzes: {},
    reflections: {},
    gameScores: {},
    isGuest: true,
  };

  const clone = (value) => JSON.parse(JSON.stringify(value));

  function normalizeProgressMap(progress) {
    const source = progress && typeof progress === "object" ? progress : {};
    const normalized = {};
    Object.entries(source).forEach(([moduleId, value]) => {
      const mod = window.CURRICULUM?.modules?.find(m => m.id === moduleId);
      const total = Number(mod?.lessons || value?.total || 1);
      const lessonsDone = Math.max(0, Math.min(total, Number(value?.lessonsDone || 0)));
      normalized[moduleId] = {
        ...value,
        lessonsDone,
        total,
        percent: total ? Math.round((lessonsDone / total) * 100) : 0,
      };
    });
    return normalized;
  }

  function normalizeProfile(profile) {
    const safe = profile && typeof profile === "object" ? profile : {};
    const level = Number(safe.level || 7);
    const name = String(safe.name || "Siswa").trim() || "Siswa";
    const nickname = String(safe.nickname || name.split(" ")[0] || "Siswa").trim() || "Siswa";
    return {
      id: safe.id || `${nickname.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`,
      user_id: safe.user_id || safe.id || null,
      role: safe.role || "student",
      name,
      nickname,
      level,
      class: String(safe.class || `${level}A`).trim() || `${level}A`,
      xp: Number(safe.xp || 0),
      streak: Number(safe.streak || 1),
      badges: Array.isArray(safe.badges) ? safe.badges : [],
      progress: normalizeProgressMap(safe.progress),
      completedLabs: Array.isArray(safe.completedLabs) ? safe.completedLabs : [],
      completedGames: Array.isArray(safe.completedGames) ? safe.completedGames : [],
      quests: safe.quests && typeof safe.quests === "object" ? safe.quests : {},
      quizzes: safe.quizzes && typeof safe.quizzes === "object" ? safe.quizzes : {},
      reflections: safe.reflections && typeof safe.reflections === "object" ? safe.reflections : {},
      gameScores: safe.gameScores && typeof safe.gameScores === "object" ? safe.gameScores : {},
      isGuest: safe.isGuest === true,
    };
  }

  function readProfiles() {
    try {
      const raw = localStorage.getItem(PROFILE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) return parsed.map(normalizeProfile);
      }
    } catch (e) {}
    return clone(defaultProfiles);
  }

  function writeProfiles(profiles) {
    const normalized = (profiles || []).map(normalizeProfile);
    localStorage.setItem(PROFILE_KEY, JSON.stringify(normalized));
    syncProfilesToSupabase(normalized);
  }

  function writeProfilesLocalOnly(profiles) {
    localStorage.setItem(PROFILE_KEY, JSON.stringify((profiles || []).map(normalizeProfile)));
  }

  // Status sinkron ke cloud: "idle" | "saving" | "saved" | "error".
  // "idle" juga dipakai saat cloud tidak relevan (Supabase belum diset / guest).
  let syncStatus = "idle";
  let pendingProfile = null;
  let retryTimer = null;

  function setSyncStatus(status) {
    syncStatus = status;
    window.dispatchEvent(new CustomEvent("sigma:syncstatus", { detail: status }));
  }

  function getSyncStatus() {
    return syncStatus;
  }

  function pushProfileToSupabase(profile) {
    setSyncStatus("saving");
    window.SIGMA_SUPABASE.upsertProfile(profile, profile.role || "student")
      .then(() => {
        pendingProfile = null;
        setSyncStatus("saved");
      })
      .catch(error => {
        console.warn("SIGMA Supabase sync failed", error);
        pendingProfile = profile;
        setSyncStatus("error");
        scheduleRetry();
      });
  }

  function scheduleRetry() {
    if (retryTimer || !pendingProfile) return;
    retryTimer = setTimeout(() => {
      retryTimer = null;
      if (pendingProfile && window.SIGMA_SUPABASE?.isConfigured()) {
        pushProfileToSupabase(pendingProfile);
      }
    }, 15000);
  }

  function syncProfilesToSupabase(profiles) {
    if (!window.SIGMA_SUPABASE?.isConfigured()) return;
    const activeId = getActiveId();
    const activeProfile = (profiles || []).find(profile => profile.id === activeId) || (profiles || [])[0];
    if (!activeProfile || activeProfile.isGuest) return;
    pushProfileToSupabase(activeProfile);
  }

  async function hydrateProfilesFromSupabase() {
    if (!window.SIGMA_SUPABASE?.isConfigured()) return;
    try {
      const remoteProfile = await window.SIGMA_SUPABASE.fetchOwnProfile();
      const remoteProfiles = remoteProfile ? [remoteProfile] : [];
      const localProfiles = readProfiles();
      if (remoteProfiles.length) {
        writeProfilesLocalOnly(remoteProfiles);
        localStorage.setItem(ACTIVE_KEY, remoteProfiles[0].id);
        const active = getActiveUser();
        setActiveUser(active);
        notify();
        return;
      }
      if (localProfiles.length) syncProfilesToSupabase(localProfiles);
    } catch (error) {
      console.warn("SIGMA Supabase hydrate failed", error);
    }
  }

  function getActiveId() {
    return localStorage.getItem(ACTIVE_KEY) || readProfiles()[0]?.id || null;
  }

  function setActiveUser(user) {
    const nextUser = normalizeProfile(user || clone(guestProfile));
    if (nextUser.progress && window.CURRICULUM) {
      window.CURRICULUM.modules.forEach(mod => {
        if (nextUser.progress[mod.id]) {
          const p = nextUser.progress[mod.id];
          p.total = mod.lessons;
          p.percent = p.lessonsDone ? Math.round((p.lessonsDone / mod.lessons) * 100) : 0;
        }
      });
    }
    window.USER = nextUser;
  }

  function notify() {
    window.dispatchEvent(new CustomEvent("sigma:userchange", { detail: window.USER }));
  }

  function getProfiles() {
    return readProfiles();
  }

  function hasProfiles() {
    return readProfiles().length > 0;
  }

  function getActiveUser() {
    const profiles = readProfiles();
    const active = profiles.find(p => p.id === getActiveId()) || profiles[0] || null;
    if (!active) {
      localStorage.removeItem(ACTIVE_KEY);
      return clone(guestProfile);
    }
    localStorage.setItem(ACTIVE_KEY, active.id);
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

  async function signInWithSupabase(email, password) {
    if (!window.SIGMA_SUPABASE?.isConfigured()) throw new Error("Supabase belum dikonfigurasi.");
    await window.SIGMA_SUPABASE.signIn(email, password);
    const remoteProfile = await window.SIGMA_SUPABASE.fetchOwnProfile();
    if (!remoteProfile) throw new Error("Akun berhasil masuk, tetapi profil SIGMA belum ditemukan.");
    writeProfilesLocalOnly([remoteProfile]);
    localStorage.setItem(ACTIVE_KEY, remoteProfile.id);
    setActiveUser(remoteProfile);
    notify();
    return remoteProfile;
  }

  async function signUpWithSupabase(input) {
    if (!window.SIGMA_SUPABASE?.isConfigured()) throw new Error("Supabase belum dikonfigurasi.");
    const name = (input.name || "Siswa Baru").trim();
    const nickname = (input.nickname || name.split(" ")[0] || "Siswa").trim();
    const level = Number(input.level || 7);
    const kelas = (input.class || `${level}A`).trim();
    const role = input.role || "student";
    const user = await window.SIGMA_SUPABASE.signUp(input.email, input.password, {
      name,
      nickname,
      level,
      class: kelas,
      role,
    });
    if (!user?.id) throw new Error("Akun Supabase belum aktif. Cek pengaturan konfirmasi email.");
    const profile = normalizeProfile({
      id: user.id,
      user_id: user.id,
      role,
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
    });
    const saved = await window.SIGMA_SUPABASE.upsertProfile(profile, role);
    const nextProfile = saved || profile;
    writeProfilesLocalOnly([nextProfile]);
    localStorage.setItem(ACTIVE_KEY, nextProfile.id);
    setActiveUser(nextProfile);
    notify();
    return nextProfile;
  }

  async function signOutSupabase() {
    if (window.SIGMA_SUPABASE?.isConfigured()) {
      await window.SIGMA_SUPABASE.signOut();
    }
    localStorage.removeItem(ACTIVE_KEY);
    setActiveUser(clone(guestProfile));
    notify();
  }

  async function getTeacherProfiles() {
    if (!window.SIGMA_SUPABASE?.isConfigured()) return readProfiles();
    try {
      const profiles = await window.SIGMA_SUPABASE.fetchVisibleProfiles();
      return profiles.length ? profiles : readProfiles();
    } catch (error) {
      console.warn("SIGMA Supabase teacher fetch failed", error);
      return readProfiles();
    }
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

  function saveActiveUserLocalOnly(nextUser) {
    const profiles = readProfiles();
    const index = profiles.findIndex(p => p.id === nextUser.id);
    if (index >= 0) profiles[index] = nextUser;
    else profiles.push(nextUser);
    writeProfilesLocalOnly(profiles);
    localStorage.setItem(ACTIVE_KEY, nextUser.id);
    setActiveUser(nextUser);
    notify();
  }

  // Terapkan profil otoritatif (blob data) yang dikembalikan Edge Function award-xp.
  function applyServerProfile(blob) {
    if (!blob || typeof blob !== "object") return;
    const current = window.USER || {};
    const merged = normalizeProfile({
      ...blob,
      id: blob.id || current.id,
      user_id: blob.user_id || current.user_id,
      role: blob.role || current.role || "student",
      name: blob.name || current.name,
      nickname: blob.nickname || current.nickname,
      level: blob.level || current.level,
      class: blob.class || current.class,
    });
    writeProfilesLocalOnly([merged]);
    localStorage.setItem(ACTIVE_KEY, merged.id);
    setActiveUser(merged);
    notify();
  }

  // Kirim aksi ke server (penentu XP otoritatif). Optimistik lokal sudah
  // disimpan; saat respons tiba, profil lokal disinkronkan ke versi server.
  function sendAwardToServer(action, payload) {
    setSyncStatus("saving");
    window.SIGMA_SUPABASE.awardXp(action, payload)
      .then(resp => {
        if (resp && resp.profile) applyServerProfile(resp.profile);
        setSyncStatus("saved");
      })
      .catch(error => {
        console.warn("SIGMA award-xp gagal", error);
        // Fallback: simpan blob biasa (xp di-clamp server, progres lain tetap tersimpan).
        syncProfilesToSupabase(readProfiles());
      });
  }

  // Simpan hasil award. Mode lokal: simpan + sync biasa. Mode cloud:
  // optimistik lokal (tanpa blob-upsert agar tidak balapan dengan award-xp),
  // lalu server yang menentukan XP otoritatif.
  function commitAward(user, action, payload) {
    if (!window.SIGMA_SUPABASE?.isConfigured() || user.isGuest) {
      saveActiveUser(user);
      return;
    }
    saveActiveUserLocalOnly(user);
    sendAwardToServer(action, payload);
  }

  function completeLesson(moduleId, lessonIndex) {
    const user = clone(window.USER || getActiveUser());
    const mod = window.CURRICULUM.modules.find(m => m.id === moduleId);
    if (!mod) return user;
    const current = user.progress[moduleId] || { lessonsDone: 0, total: mod.lessons, percent: 0 };
    const total = mod.lessons;
    const targetDone = typeof lessonIndex === "number" ? lessonIndex + 1 : (current.lessonsDone || 0) + 1;
    const lessonsDone = Math.min(total, Math.max(current.lessonsDone || 0, targetDone));
    const completedLessons = [...new Set([...(current.completedLessons || []), ...(typeof lessonIndex === "number" ? [lessonIndex] : [])])];
    user.progress[moduleId] = {
      ...current,
      lessonsDone,
      total,
      percent: Math.round((lessonsDone / total) * 100),
      completedLessons,
    };
    if (lessonsDone === total) awardModuleCompletion(user, mod);
    commitAward(user, "lesson", { moduleId, lessonIndex });
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
    commitAward(user, "quest", { moduleId, lessonIndex, score });
    return user;
  }

  // Kuis dinilai SERVER (kunci jawaban tidak ada di klien). Async:
  // mengembalikan { score, total, percent, xpAwarded, review } atau { error }.
  function normalizeQuizRecord(rec) {
    rec = rec || {};
    return {
      score: rec.latestScore || 0,
      total: rec.latestTotal || 0,
      percent: rec.latestPercent || 0,
      xpAwarded: rec.xpAwarded || 0,
      review: rec.review || [],
    };
  }

  async function completeQuiz(moduleId, responses) {
    if (!window.SIGMA_SUPABASE?.isConfigured() || (window.USER && window.USER.isGuest)) {
      return { error: "offline" };
    }
    const existing = window.USER?.quizzes?.[moduleId];
    if (existing) return { alreadyDone: true, ...normalizeQuizRecord(existing) };

    setSyncStatus("saving");
    try {
      const resp = await window.SIGMA_SUPABASE.awardXp("quiz", { moduleId, responses: responses || [] });
      if (resp?.profile) applyServerProfile(resp.profile);
      setSyncStatus("saved");
      const r = resp?.result || {};
      if (r.alreadyDone) {
        return { alreadyDone: true, ...normalizeQuizRecord(window.USER?.quizzes?.[moduleId]) };
      }
      return {
        score: r.score || 0,
        total: r.total || 0,
        percent: r.percent || 0,
        xpAwarded: r.xpAwarded || 0,
        review: r.review || [],
      };
    } catch (e) {
      setSyncStatus("error");
      return { error: e.message || "gagal" };
    }
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
    commitAward(user, "game", { gameId, xp });
    return user;
  }

  function completeLab(labId) {
    const user = clone(window.USER || getActiveUser());
    const lab = window.CURRICULUM.labs.find(l => l.id === labId);
    if (!lab) return user;
    user.completedLabs = user.completedLabs || [];
    if (!user.completedLabs.includes(labId)) {
      user.completedLabs.push(labId);
      user.xp += 50;
      const badgeId = `lab-${labId}`;
      if (!user.badges.some(b => b.id === badgeId)) {
        user.badges.push({ id: badgeId, emoji: "🔬", label: `Lab ${lab.title}`, color: "var(--info-400)" });
      }
      commitAward(user, "lab", { labId });
    }
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

  function resetLocalData() {
    localStorage.removeItem(PROFILE_KEY);
    localStorage.removeItem(ACTIVE_KEY);
    if (window.SIGMA_SUPABASE?.isConfigured()) {
      window.SIGMA_SUPABASE.clearOwnProfile().catch(error => {
        console.warn("SIGMA Supabase reset failed", error);
      });
    }
    setActiveUser(clone(guestProfile));
    notify();
  }

  // Saat koneksi kembali, langsung coba sinkron ulang data yang tertunda.
  window.addEventListener("online", () => {
    if (pendingProfile && window.SIGMA_SUPABASE?.isConfigured()) {
      pushProfileToSupabase(pendingProfile);
    }
  });

  const activeUser = getActiveUser();
  setActiveUser(activeUser);
  hydrateProfilesFromSupabase();

  window.SIGMA_AUTH = {
    getProfiles,
    hasProfiles,
    getActiveUser,
    login,
    createProfile,
    signInWithSupabase,
    signUpWithSupabase,
    signOutSupabase,
    getTeacherProfiles,
    getSyncStatus,
    saveActiveUser,
    completeLesson,
    saveReflection,
    completeQuest,
    completeQuiz,
    completeGame,
    completeLab,
    getPreviousModule,
    isModuleLearningComplete,
    isModuleSequenceUnlocked,
    getModuleSequenceStatus,
    getLearningStepStatus,
    resetLocalData,
    resetDemo: resetLocalData,
  };
})();
