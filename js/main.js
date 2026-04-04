    (function () {
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      const heroLines = Array.from(document.querySelectorAll(".hero-line"));
      const heroEyebrow = document.getElementById("hero-eyebrow");
      const heroStats = document.getElementById("hero-stats");
      const heroCopy = document.getElementById("hero-copy");
      const scrollIndicator = document.getElementById("scroll-indicator");

      function easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
      }

      function formatNumber(value) {
        return value.toLocaleString("en-US");
      }

      function animateCounter(el, duration) {
        const target = Number(el.dataset.counter || 0);
        const prefix = el.dataset.prefix || "";
        const suffix = el.dataset.suffix || "";
        const format = el.dataset.format || "int";
        const start = performance.now();

        function tick(now) {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased = easeOutCubic(progress);
          const current = Math.round(target * eased);
          const value = format === "number" ? formatNumber(current) : current;
          el.textContent = prefix + value + suffix;
          if (progress < 1) requestAnimationFrame(tick);
        }

        requestAnimationFrame(tick);
      }

      function runHeroSequence() {
        if (prefersReducedMotion) {
          heroEyebrow.classList.add("is-visible");
          heroLines.forEach(line => line.classList.add("is-visible"));
          heroStats.classList.add("is-visible");
          heroCopy.classList.add("is-visible");
          scrollIndicator.classList.add("is-visible");
          document.querySelectorAll("[data-counter]").forEach(el => {
            const prefix = el.dataset.prefix || "";
            const suffix = el.dataset.suffix || "";
            const target = Number(el.dataset.counter || 0);
            const formatted = el.dataset.format === "number" ? formatNumber(target) : target;
            el.textContent = prefix + formatted + suffix;
          });
          return;
        }

        setTimeout(() => heroEyebrow.classList.add("is-visible"), 100);
        heroLines.forEach((line, idx) => {
          setTimeout(() => line.classList.add("is-visible"), 200 + idx * 100);
        });
        setTimeout(() => {
          heroStats.classList.add("is-visible");
          document.querySelectorAll("[data-counter]").forEach(el => animateCounter(el, 1800));
        }, 200 + heroLines.length * 100 + 100);
        setTimeout(() => heroCopy.classList.add("is-visible"), 200 + heroLines.length * 100 + 220);
        setTimeout(() => scrollIndicator.classList.add("is-visible"), 200 + heroLines.length * 100 + 340);
      }

      const revealTargets = Array.from(document.querySelectorAll(".reveal, .report-figure"));
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const target = entry.target;
          const siblings = target.parentElement ? Array.from(target.parentElement.children) : [target];
          const idx = siblings.indexOf(target);
          const stagger = Math.max(0, idx) * 100;
          setTimeout(() => target.classList.add("is-visible"), prefersReducedMotion ? 0 : stagger);
          observer.unobserve(target);
        });
      }, { threshold: 0.14, rootMargin: "0px 0px -6% 0px" });
      revealTargets.forEach(el => observer.observe(el));

      let lastScrollY = window.scrollY;
      const nav = document.querySelector(".site-nav");
      let ticking = false;

      function updateNav() {
        const currentY = window.scrollY;
        if (currentY > lastScrollY && currentY > 90) nav.classList.add("is-hidden");
        else nav.classList.remove("is-hidden");
        lastScrollY = currentY;
        ticking = false;
      }
      window.addEventListener("scroll", () => {
        if (!ticking) {
          window.requestAnimationFrame(updateNav);
          ticking = true;
        }
      }, { passive: true });

      const heroBgWord = document.querySelector(".hero-bg-word");
      window.addEventListener("scroll", () => {
        const offset = window.scrollY * 0.3;
        heroBgWord.style.transform = "translateY(calc(-50% + " + offset.toFixed(2) + "px))";
      }, { passive: true });

      if (window.matchMedia("(pointer: fine)").matches) {
        const dot = document.querySelector(".cursor-dot");
        const ring = document.querySelector(".cursor-ring");
        const hoverables = document.querySelectorAll("a, button, .work-card, .fact-card, .class-card, .report-figure, .impact-stat");

        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let ringX = mouseX;
        let ringY = mouseY;

        window.addEventListener("mousemove", (e) => {
          mouseX = e.clientX;
          mouseY = e.clientY;
          dot.style.transform = "translate(" + mouseX + "px," + mouseY + "px)";
        });

        hoverables.forEach(el => {
          el.addEventListener("mouseenter", () => ring.classList.add("is-hover"));
          el.addEventListener("mouseleave", () => ring.classList.remove("is-hover"));
        });

        function animateRing() {
          ringX += (mouseX - ringX) * 0.2;
          ringY += (mouseY - ringY) * 0.2;
          ring.style.transform = "translate(" + ringX + "px," + ringY + "px)";
          requestAnimationFrame(animateRing);
        }
        requestAnimationFrame(animateRing);
      }

      const flipStats = document.querySelectorAll(".js-flip-stat");
      flipStats.forEach((card) => {
        card.addEventListener("click", () => {
          card.classList.toggle("is-flipped");
        });
        card.addEventListener("keydown", (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            card.classList.toggle("is-flipped");
          }
        });
      });

      const raceTrack = document.getElementById("race-track");
      const raceStart = document.getElementById("race-start");
      const raceReset = document.getElementById("race-reset");
      const raceData = [
        { country: "Japan", flag: "🇯🇵", intensity: 6 },
        { country: "Australia", flag: "🇦🇺", intensity: 14 },
        { country: "UK", flag: "🇬🇧", intensity: 23 },
        { country: "USA", flag: "🇺🇸", intensity: 27 },
        { country: "France", flag: "🇫🇷", intensity: 35 },
        { country: "Mexico", flag: "🇲🇽", intensity: 38 },
        { country: "Germany", flag: "🇩🇪", intensity: 45 },
        { country: "Brazil", flag: "🇧🇷", intensity: 56 }
      ];
      let raceRunning = false;
      let raceStartTime = 0;
      let raceRafId = null;
      const raceDuration = 5000;
      const raceMax = Math.max(...raceData.map(r => r.intensity));

      function renderRaceRows() {
        if (!raceTrack) return;
        raceTrack.innerHTML = raceData.map((item, idx) => (
          "<div class=\"race-row\" data-race-row=\"" + idx + "\">" +
            "<div class=\"race-country\">" + item.flag + " " + item.country + "</div>" +
            "<div class=\"race-bar-wrap\"><div class=\"race-bar\" data-race-bar=\"" + idx + "\"></div></div>" +
            "<div class=\"race-value\" data-race-value=\"" + idx + "\">0</div>" +
          "</div>"
        )).join("");
      }

      function setRaceProgress(progress) {
        raceData.forEach((item, idx) => {
          const current = Math.round(item.intensity * progress);
          const width = (current / raceMax) * 100;
          const bar = document.querySelector("[data-race-bar=\"" + idx + "\"]");
          const val = document.querySelector("[data-race-value=\"" + idx + "\"]");
          if (bar) bar.style.width = width + "%";
          if (val) val.textContent = String(current);
        });
      }

      function finishRace() {
        raceRunning = false;
        if (raceStart) raceStart.disabled = false;
        if (raceRafId) cancelAnimationFrame(raceRafId);
      }

      function animateRace(now) {
        const elapsed = now - raceStartTime;
        const progress = Math.min(elapsed / raceDuration, 1);
        setRaceProgress(easeOutCubic(progress));
        if (progress < 1) raceRafId = requestAnimationFrame(animateRace);
        else finishRace();
      }

      function startRace() {
        if (raceRunning) return;
        raceRunning = true;
        if (raceStart) raceStart.disabled = true;
        raceStartTime = performance.now();
        raceRafId = requestAnimationFrame(animateRace);
      }

      function resetRace() {
        finishRace();
        setRaceProgress(0);
      }

      if (raceTrack) {
        renderRaceRows();
        setRaceProgress(0);
        if (raceStart) raceStart.addEventListener("click", startRace);
        if (raceReset) raceReset.addEventListener("click", resetRace);
      }

      runHeroSequence();
    })();
  
