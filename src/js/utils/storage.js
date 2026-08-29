/**
 * EduPress – shared localStorage helpers
 * Keys:
 *  - edupress_favorites: number[]
 *  - edupress_progress: { [courseId]: string[] }  // completed lesson ids
 *  - edupress_search_history: string[]
 *  - edupress_enrolled: number[]
 */

(function (global) {
  "use strict";

  const KEYS = {
    favorites: "edupress_favorites",
    progress: "edupress_progress",
    searchHistory: "edupress_search_history",
    enrolled: "edupress_enrolled",
  };

  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (raw == null) return fallback;
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  }

  function write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn("localStorage write failed", e);
    }
  }

  // ---- Favorites ----
  function getFavorites() {
    return read(KEYS.favorites, []);
  }

  function isFavorite(courseId) {
    return getFavorites().includes(Number(courseId));
  }

  function toggleFavorite(courseId) {
    const id = Number(courseId);
    let list = getFavorites();
    if (list.includes(id)) {
      list = list.filter((x) => x !== id);
    } else {
      list.push(id);
    }
    write(KEYS.favorites, list);
    return list.includes(id);
  }

  // ---- Progress ----
  function getAllProgress() {
    return read(KEYS.progress, {});
  }

  function getCourseProgress(courseId) {
    const all = getAllProgress();
    return all[String(courseId)] || [];
  }

  function isLessonDone(courseId, lessonId) {
    return getCourseProgress(courseId).includes(String(lessonId));
  }

  function toggleLesson(courseId, lessonId) {
    const cid = String(courseId);
    const lid = String(lessonId);
    const all = getAllProgress();
    let list = all[cid] || [];
    if (list.includes(lid)) {
      list = list.filter((x) => x !== lid);
    } else {
      list = [...list, lid];
    }
    all[cid] = list;
    write(KEYS.progress, all);
    return list.includes(lid);
  }

  function setLessonDone(courseId, lessonId, done) {
    const cid = String(courseId);
    const lid = String(lessonId);
    const all = getAllProgress();
    let list = all[cid] || [];
    if (done && !list.includes(lid)) list = [...list, lid];
    if (!done) list = list.filter((x) => x !== lid);
    all[cid] = list;
    write(KEYS.progress, all);
  }

  function progressPercent(courseId, totalLessons) {
    if (!totalLessons) return 0;
    const done = getCourseProgress(courseId).length;
    return Math.min(100, Math.round((done / totalLessons) * 100));
  }

  // ---- Search history ----
  function getSearchHistory() {
    return read(KEYS.searchHistory, []);
  }

  function addSearchTerm(term) {
    const t = String(term || "").trim().toLowerCase();
    if (!t || t.length < 2) return;
    let hist = getSearchHistory().filter((x) => x !== t);
    hist.unshift(t);
    hist = hist.slice(0, 8);
    write(KEYS.searchHistory, hist);
  }

  // ---- Enrolled ----
  function getEnrolled() {
    return read(KEYS.enrolled, []);
  }

  function enroll(courseId) {
    const id = Number(courseId);
    const list = getEnrolled();
    if (!list.includes(id)) {
      list.push(id);
      write(KEYS.enrolled, list);
    }
    return list;
  }

  function isEnrolled(courseId) {
    return getEnrolled().includes(Number(courseId));
  }

  global.EduPressStorage = {
    getFavorites,
    isFavorite,
    toggleFavorite,
    getAllProgress,
    getCourseProgress,
    isLessonDone,
    toggleLesson,
    setLessonDone,
    progressPercent,
    getSearchHistory,
    addSearchTerm,
    getEnrolled,
    enroll,
    isEnrolled,
  };
})(window);
