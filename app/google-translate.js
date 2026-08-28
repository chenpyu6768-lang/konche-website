/* Google Translate widget — language switcher for international visitors.
   Languages: en, zh-CN, ar, id, fil, ms, vi, th, ja, ko, pt-BR, es (CL), ru.
   Loaded after DOM ready; the Google script is injected on first open of the
   dropdown (keeps initial page load clean). */
(function () {
  "use strict";

  var LANGS = [
    { code: "en",    label: "English" },
    { code: "zh-CN", label: "中文（简体）" },
    { code: "ar",    label: "العربية" },
    { code: "id",    label: "Bahasa Indonesia" },
    { code: "fil",   label: "Filipino" },
    { code: "ms",    label: "Bahasa Melayu" },
    { code: "vi",    label: "Tiếng Việt" },
    { code: "th",    label: "ไทย" },
    { code: "ja",    label: "日本語" },
    { code: "ko",    label: "한국어" },
    { code: "pt-BR", label: "Português (Brasil)" },
    { code: "es-419", label: "Español (LatAm)" },
    { code: "ru",    label: "Русский" }
  ];

  var injected = false;
  var loading = false;
  var loadTimer = null;

  function setStatus(message, state) {
    var status = document.querySelector(".lang-status");
    if (!status) return;
    status.textContent = message || "";
    status.hidden = !message;
    status.dataset.state = state || "";
  }

  function closeLanguageMenu(wrap, btn) {
    wrap.classList.remove("is-open");
    btn.setAttribute("aria-expanded", "false");
  }

  function closeMainNavigation() {
    var mainNav = document.getElementById("mainNav");
    var menuToggle = document.getElementById("menuToggle");
    if (mainNav) mainNav.classList.remove("is-open");
    if (menuToggle) menuToggle.setAttribute("aria-expanded", "false");
  }

  function injectGoogleScript() {
    if (window.google && window.google.translate) {
      window.googleTranslateElementInit();
      return;
    }
    if (loading || injected) return;
    injected = true;
    loading = true;
    setStatus("Loading translation service\u2026", "loading");
    var s = document.createElement("script");
    s.id = "google-translate-element-script";
    s.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    s.async = true;
    s.onload = function () {
      loading = false;
    };
    s.onerror = function () {
      loading = false;
      injected = false;
      window.clearTimeout(loadTimer);
      s.remove();
      setStatus("Translation service is temporarily unavailable. Please try again.", "error");
    };
    document.head.appendChild(s);
    loadTimer = window.setTimeout(function () {
      if (!document.querySelector(".goog-te-combo")) {
        loading = false;
        injected = false;
        s.remove();
        setStatus("Translation service is taking too long to respond. Please try again.", "error");
      }
    }, 12000);
  }

  // Called by the Google script once loaded.
  window.googleTranslateElementInit = function () {
    var host = document.getElementById("gt-host");
    if (!host || typeof window.google === "undefined" || !window.google.translate) return;
    if (document.querySelector(".goog-te-combo")) {
      window.clearTimeout(loadTimer);
      setStatus("", "ready");
      return;
    }
    new window.google.translate.TranslateElement({
      pageLanguage: "en",
      includedLanguages: LANGS.map(function (l) { return l.code; }).join(","),
      layout: window.google.translate.TranslateElement.InlineLayout.VERTICAL,
      autoDisplay: false
    }, "gt-host");
    window.clearTimeout(loadTimer);
    setStatus("", "ready");
  };

  function currentLabel() {
    var combo = document.querySelector(".goog-te-combo");
    if (combo && combo.value && combo.value !== "en") {
      for (var i = 0; i < LANGS.length; i++) {
        if (LANGS[i].code === combo.value) return LANGS[i].label;
      }
    }
    return "Language";
  }

  function build() {
    if (document.querySelector(".lang-switch")) return;
    var header = document.querySelector(".site-header .header-inner, .site-header .header-shell");
    if (!header) return;

    var wrap = document.createElement("div");
    wrap.className = "lang-switch";
    wrap.innerHTML =
      '<button class="lang-btn" type="button" aria-haspopup="true" aria-expanded="false">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 2.6 3.9 5.7 3.9 9S14.6 18.4 12 21M12 3C9.4 5.6 8.1 8.7 8.1 12s1.3 6.4 3.9 9"/></svg>' +
      "<span class=\"lang-current\">Language</span><i class=\"lang-caret\"></i>" +
      "</button>" +
      '<div class="lang-menu" role="menu"><p class="lang-status" aria-live="polite" hidden></p></div>';
    header.insertBefore(wrap, header.firstChild);

    // Hidden host required by the Google Translate element.
    if (!document.getElementById("gt-host")) {
      var gtHost = document.createElement("div");
      gtHost.id = "gt-host";
      gtHost.setAttribute("style", "position:absolute;left:-9999px;top:-9999px;width:10px;height:10px;overflow:hidden;");
      document.body.appendChild(gtHost);
    }

    var menu = wrap.querySelector(".lang-menu");
    LANGS.forEach(function (l) {
      var b = document.createElement("button");
      b.type = "button";
      b.setAttribute("role", "menuitem");
      b.dataset.lang = l.code;
      b.textContent = l.label;
      menu.appendChild(b);
    });

    var btn = wrap.querySelector(".lang-btn");
    var open = false;
    btn.addEventListener("click", function () {
      open = !open;
      wrap.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", String(open));
      if (open) {
        closeMainNavigation();
        injectGoogleScript();
      }
    });
    document.addEventListener("click", function (e) {
      if (open && !wrap.contains(e.target)) {
        open = false;
        closeLanguageMenu(wrap, btn);
      }
    });
    document.addEventListener("keydown", function (e) {
      if (open && e.key === "Escape") {
        open = false;
        closeLanguageMenu(wrap, btn);
        btn.focus();
      }
    });
    var menuToggle = document.getElementById("menuToggle");
    if (menuToggle) {
      menuToggle.addEventListener("click", function () {
        if (open) {
          open = false;
          closeLanguageMenu(wrap, btn);
        }
      });
    }

    // Picking a language drives the hidden Google combobox.
    menu.addEventListener("click", function (e) {
      var item = e.target.closest("button[data-lang]");
      if (!item) return;
      setStatus("Loading translation\u2026", "loading");
      var tryDrive = function (tries) {
        var combo = document.querySelector(".goog-te-combo");
        if (combo) {
          combo.value = item.dataset.lang;
          combo.dispatchEvent(new Event("change"));
          wrap.querySelector(".lang-current").textContent = item.textContent;
          open = false;
          closeLanguageMenu(wrap, btn);
          setStatus("", "ready");
        } else if (tries > 0) {
          setTimeout(function () { tryDrive(tries - 1); }, 400);
        } else {
          setStatus("Translation service is unavailable. Please try again.", "error");
        }
      };
      tryDrive(25);
    });

    // Keep the label in sync if the user changes language via Google's own banner.
    setInterval(function () {
      var span = wrap.querySelector(".lang-current");
      if (span) span.textContent = currentLabel();
    }, 1500);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", build);
  } else {
    build();
  }
})();
