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

  function injectGoogleScript() {
    if (injected) return;
    injected = true;
    var s = document.createElement("script");
    s.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    s.async = true;
    document.head.appendChild(s);
  }

  // Called by the Google script once loaded.
  window.googleTranslateElementInit = function () {
    var host = document.getElementById("gt-host");
    if (!host || typeof window.google === "undefined" || !window.google.translate) return;
    new window.google.translate.TranslateElement({
      pageLanguage: "en",
      includedLanguages: LANGS.map(function (l) { return l.code; }).join(","),
      layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
      autoDisplay: false
    }, "gt-host");
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
      '<div class="lang-menu" role="menu"></div>';
    header.appendChild(wrap);

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
      if (open) injectGoogleScript();
    });
    document.addEventListener("click", function (e) {
      if (open && !wrap.contains(e.target)) {
        open = false;
        wrap.classList.remove("is-open");
        btn.setAttribute("aria-expanded", "false");
      }
    });

    // Picking a language drives the hidden Google combobox.
    menu.addEventListener("click", function (e) {
      var item = e.target.closest("button[data-lang]");
      if (!item) return;
      var tryDrive = function (tries) {
        var combo = document.querySelector(".goog-te-combo");
        if (combo) {
          combo.value = item.dataset.lang;
          combo.dispatchEvent(new Event("change"));
          wrap.querySelector(".lang-current").textContent = item.textContent;
          open = false;
          wrap.classList.remove("is-open");
        } else if (tries > 0) {
          setTimeout(function () { tryDrive(tries - 1); }, 400);
        }
      };
      tryDrive(10);
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
