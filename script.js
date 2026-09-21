/* =========================================================
   PrioNudge — landing page behaviour
   No dependencies. Progressive enhancement only: every link
   already works with JavaScript disabled.
   ========================================================= */
(function () {
  "use strict";

  var RELEASES_REPO = "https://github.com/IzzaldinSamir/prionudge-releases";
  var LATEST_API = "https://api.github.com/repos/IzzaldinSamir/prionudge-releases/releases/latest";
  var FALLBACK_VERSION = "0.1.7";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
     3. Resolve the latest release so the download links keep
        working after v0.1.7. Falls back to the pinned URLs.
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
        /* Offline, rate-limited or blocked: the pinned v0.1.7 URLs stand. */
      })
      .then(function () { window.clearTimeout(timer); });
  }

  upgradeDownloadLinks();
})();
