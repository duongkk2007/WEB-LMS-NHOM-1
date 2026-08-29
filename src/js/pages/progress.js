/**
 * EduPress – Learning Progress Dashboard (Chart.js + localStorage)
 */
(function () {
  "use strict";

  const S = window.EduPressStorage;

  document.addEventListener("DOMContentLoaded", async () => {
    const menuToggle = document.getElementById("menuToggle");
    const mainNav = document.getElementById("mainNav");
    if (menuToggle && mainNav) {
      menuToggle.addEventListener("click", () => mainNav.classList.toggle("open"));
    }

    let courses = [];
    try {
      const res = await fetch("../data/courses.json");
      const data = await res.json();
      courses = data.courses || data;
    } catch (e) {
      console.error(e);
    }

    const progress = S ? S.getAllProgress() : {};
    const favorites = S ? S.getFavorites() : [];
    const enrolled = S ? S.getEnrolled() : [];

    // Collect courses that have any progress or are enrolled
    const progressIds = Object.keys(progress).map(Number).filter((id) => (progress[String(id)] || []).length > 0);
    const relevantIds = [...new Set([...enrolled, ...progressIds, ...favorites])];

    function totalLessonsOf(course) {
      if (!course.curriculum) return course.lessons || 0;
      return course.curriculum.reduce((n, s) => n + (s.lessons ? s.lessons.length : 0), 0);
    }

    let totalDone = 0;
    let pctSum = 0;
    let pctCount = 0;
    const barLabels = [];
    const barData = [];
    const pieLabels = [];
    const pieData = [];

    const listEl = document.getElementById("progressList");
    const items = [];

    relevantIds.forEach((id) => {
      const course = courses.find((c) => c.id === id);
      if (!course) return;
      const total = totalLessonsOf(course) || 1;
      const done = (progress[String(id)] || []).length;
      const pct = Math.min(100, Math.round((done / total) * 100));
      totalDone += done;
      if (done > 0 || enrolled.includes(id)) {
        pctSum += pct;
        pctCount++;
        barLabels.push(course.title.length > 22 ? course.title.slice(0, 20) + "…" : course.title);
        barData.push(pct);
        pieLabels.push(course.title.length > 18 ? course.title.slice(0, 16) + "…" : course.title);
        pieData.push(done);
        items.push({ course, done, total, pct });
      }
    });

    document.getElementById("statEnrolled").textContent = enrolled.length || progressIds.length;
    document.getElementById("statFav").textContent = favorites.length;
    document.getElementById("statLessons").textContent = totalDone;
    document.getElementById("statAvg").textContent = (pctCount ? Math.round(pctSum / pctCount) : 0) + "%";

    if (items.length && listEl) {
      listEl.innerHTML = items
        .map(
          ({ course, done, total, pct }) => `
        <div class="cp-item">
          <img src="${course.image}" alt="${course.title}">
          <div class="info">
            <a href="./course-single.html?id=${course.id}">${course.title}</a>
            <div style="font-size:13px;color:#888;margin-top:2px;">${done}/${total} lessons · ${course.author}</div>
            <div class="cp-bar-bg"><div class="cp-bar-fill" style="width:${pct}%"></div></div>
          </div>
          <div class="cp-pct">${pct}%</div>
        </div>`
        )
        .join("");
    }

    // Favorites grid
    const favGrid = document.getElementById("favGrid");
    const favCourses = favorites
      .map((id) => courses.find((c) => c.id === id))
      .filter(Boolean);
    if (favCourses.length && favGrid) {
      favGrid.innerHTML = favCourses
        .map(
          (c) => `
        <article class="fav-card">
          <a href="./course-single.html?id=${c.id}"><img src="${c.image}" alt="${c.title}"></a>
          <div class="body">
            <a href="./course-single.html?id=${c.id}">${c.title}</a>
            <div style="font-size:13px;color:#888;margin-top:4px;">${c.author} · ${c.isFree ? "Free" : c.currentPrice}</div>
          </div>
        </article>`
        )
        .join("");
    }

    // Charts
    if (typeof Chart !== "undefined") {
      const ctx1 = document.getElementById("chartProgress");
      if (ctx1 && barLabels.length) {
        new Chart(ctx1, {
          type: "bar",
          data: {
            labels: barLabels,
            datasets: [
              {
                label: "Progress %",
                data: barData,
                backgroundColor: "#55BE24",
                borderRadius: 6,
              },
            ],
          },
          options: {
            responsive: true,
            scales: {
              y: { beginAtZero: true, max: 100, ticks: { callback: (v) => v + "%" } },
            },
            plugins: { legend: { display: false } },
          },
        });
      } else if (ctx1) {
        ctx1.parentElement.insertAdjacentHTML(
          "beforeend",
          '<p class="empty" style="margin-top:12px;">No data to chart yet.</p>'
        );
      }

      const ctx2 = document.getElementById("chartPie");
      if (ctx2 && pieData.some((n) => n > 0)) {
        new Chart(ctx2, {
          type: "doughnut",
          data: {
            labels: pieLabels,
            datasets: [
              {
                data: pieData,
                backgroundColor: ["#55BE24", "#3498db", "#f1c40f", "#e67e22", "#9b59b6", "#1abc9c", "#e74c3c"],
              },
            ],
          },
          options: {
            responsive: true,
            plugins: { legend: { position: "bottom" } },
          },
        });
      } else if (ctx2) {
        ctx2.parentElement.insertAdjacentHTML(
          "beforeend",
          '<p class="empty" style="margin-top:12px;">Complete some lessons to see distribution.</p>'
        );
      }
    }
  });
})();
