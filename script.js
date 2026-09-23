/* =========================================================
   PrioNudge — landing page behaviour
   No dependencies. Progressive enhancement only: every link
   already works with JavaScript disabled.
   ========================================================= */
(function () {
  "use strict";

  var RELEASES_REPO = "https://github.com/IzzaldinSamir/prionudge-releases";
  var LATEST_API = "https://api.github.com/repos/IzzaldinSamir/prionudge-releases/releases/latest";
  var FALLBACK_VERSION = "0.1.11";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(pointer: fine)").matches;

  /* ---------------------------------------------------------
     1. Nav backdrop once the page has scrolled
     --------------------------------------------------------- */
  var nav = document.getElementById("nav");
  if (nav) {
    var ticking = false;
    var sync = function () {
      nav.classList.toggle("is-scrolled", window.scrollY > 8);
      ticking = false;
    };
    var onScroll = function () {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(sync);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    sync();
  }

  /* ---------------------------------------------------------
     2. Reveal on scroll
     --------------------------------------------------------- */
  var revealables = document.querySelectorAll("[data-reveal]");
  if (revealables.length) {
    if (reduceMotion || !("IntersectionObserver" in window)) {
      revealables.forEach(function (el) { el.classList.add("is-visible"); });
    } else {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer.unobserve(entry.target);
            }
          });
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
      );
      revealables.forEach(function (el) { observer.observe(el); });
    }
  }

  /* ---------------------------------------------------------
     3. Sticky mobile CTA
        Show once the hero is scrolled past, hide when the
        final CTA is visible.
     --------------------------------------------------------- */
  var sticky = document.getElementById("sticky-cta");
  var hero = document.getElementById("top");
  var finalCta = document.getElementById("cta-final");
  if (sticky && hero && finalCta && "IntersectionObserver" in window) {
    sticky.removeAttribute("hidden");

    var setSticky = function (show) {
      sticky.classList.toggle("is-visible", show);
      document.body.classList.toggle("sticky-cta-active", show);
    };

    var heroObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          // hide when hero is visible, show otherwise
          setSticky(!entry.isIntersecting);
        });
      },
      { rootMargin: "0px", threshold: 0.05 }
    );

    var ctaObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) setSticky(false);
        });
      },
      { rootMargin: "0px", threshold: 0.25 }
    );

    heroObserver.observe(hero);
    ctaObserver.observe(finalCta);
  }

  /* ---------------------------------------------------------
     4. Subtle hero parallax + cursor lighting
        Only on fine-pointer devices and when reduced motion
        is not requested.
     --------------------------------------------------------- */
  var heroSection = document.querySelector(".hero");
  var shotFrame = document.querySelector(".shot__frame");
  if (heroSection && shotFrame && finePointer && !reduceMotion) {
    heroSection.classList.add("hero--parallax");

    var bounds = heroSection.getBoundingClientRect();
    var targetX = 0;
    var targetY = 0;
    var currentX = 0;
    var currentY = 0;
    var raf = null;
    var isActive = true;

    var updateBounds = function () {
      bounds = heroSection.getBoundingClientRect();
    };

    var apply = function () {
      currentX += (targetX - currentX) * 0.12;
      currentY += (targetY - currentY) * 0.12;

      // tiny tilt: max 1.5deg
      var rx = currentY * -1.5;
      var ry = currentX * 1.5;
      shotFrame.style.setProperty("--rx", rx.toFixed(3) + "deg");
      shotFrame.style.setProperty("--ry", ry.toFixed(3) + "deg");

      // cursor glow position relative to frame
      var px = ((currentX + 1) / 2) * bounds.width;
      var py = ((currentY + 1) / 2) * bounds.height;
      shotFrame.style.setProperty("--px", px.toFixed(1));
      shotFrame.style.setProperty("--py", py.toFixed(1));

      if (Math.abs(targetX - currentX) > 0.001 || Math.abs(targetY - currentY) > 0.001) {
        raf = window.requestAnimationFrame(apply);
      } else {
        raf = null;
      }
    };

    var onMove = function (event) {
      if (!isActive) return;
      updateBounds();
      var x = (event.clientX - bounds.left) / bounds.width;
      var y = (event.clientY - bounds.top) / bounds.height;
      targetX = Math.max(-1, Math.min(1, x * 2 - 1));
      targetY = Math.max(-1, Math.min(1, y * 2 - 1));
      if (!raf) raf = window.requestAnimationFrame(apply);
    };

    var onLeave = function () {
      targetX = 0;
      targetY = 0;
      if (!raf) raf = window.requestAnimationFrame(apply);
    };

    // pause when not visible to avoid wasted work
    var visObserver = new IntersectionObserver(
      function (entries) {
        isActive = entries[0].isIntersecting;
        if (!isActive) onLeave();
      },
      { threshold: 0.05 }
    );
    visObserver.observe(heroSection);

    window.addEventListener("resize", updateBounds, { passive: true });
    heroSection.addEventListener("mousemove", onMove, { passive: true });
    heroSection.addEventListener("mouseleave", onLeave, { passive: true });
  }

  /* ---------------------------------------------------------
     5. Resolve the latest release so the download links keep
        working after v0.1.11. Falls back to the pinned URLs.
     --------------------------------------------------------- */
  function setDownload(kind, url) {
    if (!url) return;
    document.querySelectorAll('[data-dl="' + kind + '"]').forEach(function (el) {
      el.setAttribute("href", url);
    });
  }

  function setVersion(version) {
    if (!version) return;
    document.querySelectorAll("[data-version]").forEach(function (el) {
      el.textContent = "v" + version;
    });
  }

  function upgradeDownloadLinks() {
    if (typeof fetch !== "function" || !("AbortController" in window)) return;

    var controller = new AbortController();
    var timer = window.setTimeout(function () { controller.abort(); }, 6000);

    fetch(LATEST_API, {
      headers: { Accept: "application/vnd.github+json" },
      signal: controller.signal
    })
      .then(function (response) {
        if (!response.ok) throw new Error("HTTP " + response.status);
        return response.json();
      })
      .then(function (release) {
        var assets = (release && release.assets) || [];
        var exe = null;
        var msi = null;

        assets.forEach(function (asset) {
          var name = (asset && asset.name) || "";
          if (!exe && /_x64-setup\.exe$/i.test(name)) exe = asset.browser_download_url;
          else if (!msi && /_x64(?:_en-US)?\.msi$/i.test(name)) msi = asset.browser_download_url;
        });

        if (!exe) return; // keep the pinned links

        setDownload("exe", exe);
        setDownload("msi", msi);
        setVersion((release.tag_name || "").replace(/^v/i, "") || FALLBACK_VERSION);
      })
      .catch(function () {
        /* Offline, rate-limited or blocked: the pinned v0.1.11 URLs stand. */
      })
      .then(function () { window.clearTimeout(timer); });
  }

  upgradeDownloadLinks();
})();
