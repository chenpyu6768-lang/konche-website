(function () {
  "use strict";

  // Contact details now live in the HTML source and llms.txt (see
  // tools/refactor_20260821.mjs); no runtime rewriting is performed here.
  const CONTACT_EMAIL = "Konche.China3143@outlook.com";
  const LINKEDIN_URL = "https://www.linkedin.com/company/143362929/";
  const FACEBOOK_URL = "https://www.facebook.com/profile.php?id=61593311157410";
  const WHATSAPP_URL = "https://wa.me/8618814456813?text=Hello%20KONCHE%2C%20I%20would%20like%20to%20discuss%20a%20water%20treatment%20requirement.";
  const MAILTO_LIMIT = 1800; // mailto URLs beyond this get truncated by many clients

  function pageIsHome() {
    const path = window.location.pathname.replace(/\\/g, "/").toLowerCase();
    return path.endsWith("/index.html") || path.endsWith("/");
  }

  function pageIsProductOrSolution() {
    const path = window.location.pathname.replace(/\\/g, "/").toLowerCase();
    return path.includes("/products/") && path.endsWith(".html");
  }

  function pageIsContact() {
    const path = window.location.pathname.replace(/\\/g, "/").toLowerCase();
    return path.endsWith("/contact.html");
  }

  function addSocialDock() {
    if (document.querySelector(".social-dock")) return;
    const dock = document.createElement("nav");
    dock.className = "social-dock";
    dock.setAttribute("aria-label", "Contact KONCHE");
    dock.innerHTML = `
      <a class="social-dock-whatsapp" href="${WHATSAPP_URL}" target="_blank" rel="noopener noreferrer" aria-label="Contact KONCHE on WhatsApp at +86 188 1445 6813">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 3.5A11.8 11.8 0 0 0 12.1 0C5.6 0 .3 5.3.3 11.8c0 2.1.6 4.1 1.6 5.9L.2 24l6.5-1.7a11.8 11.8 0 0 0 5.4 1.4h.1c6.5 0 11.8-5.3 11.8-11.8 0-3.2-1.2-6.1-3.5-8.4Zm-8.4 18.2a9.8 9.8 0 0 1-5-1.4l-.4-.2-3.9 1 1-3.8-.2-.4a9.8 9.8 0 1 1 8.5 4.8Zm5.4-7.3c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.2-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-1.7-.8-2.8-1.5-3.9-3.5-.3-.5.3-.5.8-1.6.1-.2 0-.4 0-.6L9.3 7c-.2-.6-.5-.5-.7-.5H8c-.2 0-.6.1-.9.4-.3.3-1.2 1.2-1.2 2.9s1.2 3.3 1.4 3.5c.1.2 2.4 3.7 5.9 5.2 2.2.9 3.1 1 4.2.8.7-.1 1.7-.7 1.9-1.3.2-.6.2-1.2.2-1.3-.1-.1-.3-.2-.6-.3l-1.4-.7Z"/></svg>
        <span>WhatsApp</span>
      </a>
      <a class="social-dock-linkedin" href="${LINKEDIN_URL}" target="_blank" rel="noopener noreferrer" aria-label="Visit KONCHE on LinkedIn">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5.2 7.4H1.6V22h3.6V7.4ZM3.4 2A2.1 2.1 0 1 0 3.4 6.2 2.1 2.1 0 0 0 3.4 2ZM22.4 13.6c0-4.4-2.3-6.5-5.5-6.5a4.8 4.8 0 0 0-4.4 2.4h-.1V7.4H9V22h3.6v-7.2c0-1.9.4-3.8 2.8-3.8s2.4 2.2 2.4 3.9V22h3.6l1-8.4Z"/></svg>
        <span>LinkedIn</span>
      </a>
      <a class="social-dock-facebook" href="${FACEBOOK_URL}" target="_blank" rel="noopener noreferrer" aria-label="Visit KONCHE on Facebook">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.2 8.1V6.3c0-.8.6-1 1.1-1h2.8V1.1L14.3 1C10.5 1 9.6 3.9 9.6 5.8v2.3H7v4.8h2.6V23h4.6V12.9h3.5l.6-4.8h-4.1Z"/></svg>
        <span>Facebook</span>
      </a>
      <a class="social-dock-email" href="mailto:${CONTACT_EMAIL}" aria-label="Email KONCHE at ${CONTACT_EMAIL}">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 4h20v16H2V4Zm2 2v.5l8 5.3 8-5.3V6H4Zm16 12V8.9l-8 5.2-8-5.2V18h16Z"/></svg>
        <span>Email us</span>
      </a>`;
    document.body.appendChild(dock);
  }

  function rotateClientLogos() {
    const grid = document.querySelector(".client-logo-grid");
    if (!grid) return;
    const cards = Array.from(grid.children);
    if (cards.length < 2) return;
    // Deterministic daily rotation: same order within a day (stable CLS and
    // testable), fresh order each following day.
    const offset = Math.floor(Date.now() / 86400000) % cards.length;
    cards.forEach((_, i) => grid.appendChild(cards[(i + offset) % cards.length]));
  }

  function initServiceCarousel() {
    const carousel = document.querySelector(".service-carousel");
    const rows = Array.from(document.querySelectorAll(".service-row[data-service-image]"));
    if (!carousel || !rows.length) return;

    const image = carousel.querySelector("#serviceCarouselImage");
    const title = carousel.querySelector("#serviceCarouselTitle");
    const copy = carousel.querySelector("#serviceCarouselCopy");
    const count = carousel.querySelector("#serviceCarouselCount");
    const previous = carousel.querySelector(".service-carousel-prev");
    const next = carousel.querySelector(".service-carousel-next");
    if (!image || !title || !copy || !count || !previous || !next) return;

    let activeIndex = 0;
    let touchStartX = 0;
    let generation = 0; // invalidates preload callbacks from superseded clicks

    const activate = (index) => {
      activeIndex = (index + rows.length) % rows.length;
      const token = ++generation;
      const row = rows[activeIndex];
      rows.forEach((item, itemIndex) => {
        const isActive = itemIndex === activeIndex;
        item.classList.toggle("is-active", isActive);
        if (isActive) item.setAttribute("aria-current", "true");
        else item.removeAttribute("aria-current");
      });
      const nextSource = row.dataset.serviceImage;
      const updatePreview = () => {
        if (token !== generation) return;
        image.src = nextSource;
        image.alt = row.dataset.serviceAlt || "KONCHE water treatment equipment";
        title.textContent = row.dataset.serviceTitle || row.querySelector("strong")?.textContent || "";
        copy.textContent = row.dataset.serviceCopy || "";
        count.textContent = `${String(activeIndex + 1).padStart(2, "0")} / ${String(rows.length).padStart(2, "0")}`;
        carousel.classList.remove("is-switching");
      };

      if (image.getAttribute("src") === nextSource) {
        updatePreview();
        return;
      }

      carousel.classList.add("is-switching");
      const preload = new Image();
      preload.addEventListener("load", updatePreview, { once: true });
      preload.addEventListener("error", () => {
        if (token !== generation) return;
        // Keep title/copy/count in sync even when the photo fails, so the
        // highlighted row and the preview never tell different stories.
        title.textContent = row.dataset.serviceTitle || row.querySelector("strong")?.textContent || "";
        copy.textContent = row.dataset.serviceCopy || "";
        count.textContent = `${String(activeIndex + 1).padStart(2, "0")} / ${String(rows.length).padStart(2, "0")}`;
        image.alt = row.dataset.serviceAlt || "";
        carousel.classList.remove("is-switching");
      }, { once: true });
      preload.src = nextSource;
    };

    previous.addEventListener("click", () => activate(activeIndex - 1));
    next.addEventListener("click", () => activate(activeIndex + 1));
    carousel.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        activate(activeIndex - 1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        activate(activeIndex + 1);
      }
    });
    carousel.addEventListener("touchstart", (event) => {
      touchStartX = event.changedTouches[0]?.clientX || 0;
    }, { passive: true });
    carousel.addEventListener("touchend", (event) => {
      const distance = (event.changedTouches[0]?.clientX || 0) - touchStartX;
      if (Math.abs(distance) < 50) return;
      activate(activeIndex + (distance < 0 ? 1 : -1));
    }, { passive: true });
    activate(0);
  }

  function inquiryMarkup() {
    return `
      <section class="inquiry-section section" id="project-inquiry" aria-labelledby="project-inquiry-title">
        <div class="container inquiry-shell">
          <div class="inquiry-intro">
            <div class="eyebrow light"><span></span> PROJECT INQUIRY</div>
            <h2 id="project-inquiry-title">Tell us what your<br><em>water system must achieve.</em></h2>
            <p>Share the application, available feed-water information and target capacity. KONCHE will use these inputs to prepare the right technical direction.</p>
            <div class="inquiry-contact-card">
              <span>DIRECT EMAIL</span>
              <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>
              <small>Technical and commercial inquiries</small>
            </div>
          </div>
          <form class="inquiry-form" novalidate>
            <div class="inquiry-field inquiry-field-wide">
              <label for="inquiry-application">Equipment Application <b>*</b></label>
              <textarea id="inquiry-application" name="equipment_application" rows="3" required maxlength="2000" placeholder="e.g. pharmaceutical purified water, PCB rinsing, drinking water"></textarea>
            </div>
            <div class="inquiry-field inquiry-field-wide">
              <label for="inquiry-feed-water">Feed Water Quality <span>Optional</span></label>
              <textarea id="inquiry-feed-water" name="feed_water_quality" rows="3" maxlength="2000" placeholder="Water source, TDS, hardness, turbidity or available analysis"></textarea>
            </div>
            <div class="inquiry-field inquiry-field-wide">
              <label for="inquiry-product-water">Required Product Water Quality <span>Optional</span></label>
              <textarea id="inquiry-product-water" name="product_water_quality" rows="3" maxlength="2000" placeholder="Conductivity, resistivity, TOC or applicable standard"></textarea>
            </div>
            <div class="inquiry-field">
              <label for="inquiry-capacity">Required Capacity <span>Optional</span></label>
              <input id="inquiry-capacity" name="required_capacity" type="text" maxlength="200" placeholder="e.g. 10 m³/h">
            </div>
            <div class="inquiry-field">
              <label for="inquiry-company">Company Name <b>*</b></label>
              <input id="inquiry-company" name="company_name" type="text" autocomplete="organization" required maxlength="200" placeholder="Your company">
            </div>
            <div class="inquiry-field">
              <label for="inquiry-title">Job Title <b>*</b></label>
              <input id="inquiry-title" name="job_title" type="text" autocomplete="organization-title" required maxlength="200" placeholder="Your role">
            </div>
            <div class="inquiry-field">
              <label for="inquiry-email">Email <b>*</b></label>
              <input id="inquiry-email" name="email" type="email" autocomplete="email" required maxlength="200" placeholder="name@company.com">
            </div>
            <div class="inquiry-field">
              <label for="inquiry-country">Country / Region <span>Optional</span></label>
              <input id="inquiry-country" name="country_region" type="text" autocomplete="country-name" maxlength="120" placeholder="Project location">
            </div>
            <div class="inquiry-field">
              <label for="inquiry-role">You Are A <span>Optional</span></label>
              <select id="inquiry-role" name="inquiry_role">
                <option value="">Select…</option>
                <option>EPC contractor / engineering integrator</option>
                <option>Distributor / importer / wholesaler</option>
                <option>Direct end-user (factory, lab, hotel…)</option>
                <option>Other</option>
              </select>
            </div>
            <div class="inquiry-field inquiry-field-wide inquiry-upload">
              <label for="inquiry-report">Water Quality Report <span>Optional · max 10 MB</span></label>
              <input class="inquiry-file-input" id="inquiry-report" name="water_quality_report" type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png" aria-describedby="inquiry-report-formats">
              <label class="inquiry-file-control" for="inquiry-report">
                <span class="inquiry-file-button">Choose File</span>
                <span class="inquiry-file-name">No file selected</span>
              </label>
              <small id="inquiry-report-formats" class="inquiry-file-formats">Accepted formats: PDF, Word, Excel, JPG or PNG</small>
            </div>
            <p class="inquiry-consent">By submitting this inquiry, you agree that KONCHE may use the information provided to respond to your request.</p>
            <div class="inquiry-actions">
              <button class="button button-primary" type="submit">Send Project Inquiry <span>↗</span></button>
              <p class="inquiry-status" role="status" aria-live="polite"></p>
            </div>
            <p class="inquiry-note">Your email application will open with the inquiry details. If you selected a report, please attach it in the email before sending.</p>
          </form>
        </div>
      </section>`;
  }

  function addInquiryForm() {
    if (!pageIsHome() && !pageIsProductOrSolution() && !pageIsContact()) return;
    if (document.querySelector(".inquiry-section")) return;
    // contact.html carries a richer static form in the HTML source; binding
    // happens in initRfqForm instead of injecting a second form here.
    if (pageIsContact() && document.getElementById("rfqForm")) return;

    if (pageIsContact()) {
      const footer = document.querySelector(".site-footer");
      if (!footer) return;
      footer.insertAdjacentHTML("beforebegin", inquiryMarkup());
    } else {
      const existingCta = document.querySelector(".product-cta, .contact-cta");
      if (!existingCta) return;
      existingCta.insertAdjacentHTML("beforebegin", inquiryMarkup());
      existingCta.remove();
    }

    // homepage-heading-consolidation: keep one H2 and remove the duplicate eyebrow.
    if (document.querySelector("main > .hero#top") && document.querySelector("main > #services")) {
      const homepageInquiry = document.querySelector("#project-inquiry");
      const homepageInquiryEyebrow = homepageInquiry?.querySelector(".inquiry-intro > .eyebrow");
      const homepageInquiryTitle = homepageInquiry?.querySelector(".inquiry-intro > h2");
      homepageInquiryEyebrow?.remove();
      if (homepageInquiryTitle) homepageInquiryTitle.textContent = "PROJECT INQUIRY";
    }
    const form = document.querySelector(".inquiry-form");
    const fileInput = form?.querySelector('input[type="file"]');
    const fileName = form?.querySelector(".inquiry-file-name");
    const status = form?.querySelector(".inquiry-status");
    if (!form || !fileInput || !fileName || !status) return;

    fileInput.addEventListener("change", () => {
      const file = fileInput.files[0];
      if (!file) {
        fileName.textContent = "No file selected";
        fileName.classList.remove("is-error");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        fileInput.value = "";
        fileName.textContent = "The selected file is larger than 10 MB.";
        fileName.classList.add("is-error");
        return;
      }
      fileName.classList.remove("is-error");
      fileName.textContent = file.name;
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      status.textContent = "";
      status.classList.remove("is-error");
      if (!form.checkValidity()) {
        form.reportValidity();
        status.textContent = "Please complete all required fields.";
        status.classList.add("is-error");
        return;
      }

      const values = new FormData(form);
      const report = fileInput.files[0];
      const subject = `KONCHE Website Inquiry - ${values.get("company_name")}`;
      const body = [
        "KONCHE Website Project Inquiry",
        "",
        `Page: ${document.title}`,
        `Page URL: ${window.location.href}`,
        "",
        `Equipment Application: ${values.get("equipment_application")}`,
        `Feed Water Quality: ${values.get("feed_water_quality")}`,
        `Required Product Water Quality: ${values.get("product_water_quality")}`,
        `Required Capacity: ${values.get("required_capacity")}`,
        `Company Name: ${values.get("company_name")}`,
        `Job Title: ${values.get("job_title")}`,
        `Customer Email: ${values.get("email")}`,
        `Country / Region: ${values.get("country_region") || "-"}`,
        `You Are A: ${values.get("inquiry_role") || "-"}`,
        `Selected Report: ${report ? report.name + " (please attach to this email)" : "None"}`
      ].join("\n");

      const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      if (mailto.length > MAILTO_LIMIT && navigator.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(`${subject}\n\n${body}`);
          status.textContent = `Your inquiry is too long for an email link. It was copied to the clipboard — paste it into an email to ${CONTACT_EMAIL}.`;
          return;
        } catch {
          // clipboard denied: fall through to mailto truncation
        }
      }
      status.textContent = report
        ? "Your email application is opening. Please attach the selected report before sending."
        : "Your email application is opening with the inquiry details.";
      window.location.href = mailto;
    });
  }

  // Consolidated page behavior (2026-08-22 code review): the menu toggle,
  // product quicknav, homepage solution tabs and parts form previously lived
  // in products/nav.js and per-page inline scripts. They are self-guarding —
  // each no-ops when its markup is absent — so one file serves every page.

  function initNavMenu() {
    const menuToggle = document.getElementById("menuToggle");
    const mainNav = document.getElementById("mainNav");
    if (!menuToggle || !mainNav) return;
    menuToggle.addEventListener("click", () => {
      const open = mainNav.classList.toggle("is-open");
      menuToggle.setAttribute("aria-expanded", String(open));
    });
    mainNav.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
      mainNav.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
    }));
    // #navCatRow = homepage category directory bar (desktop header row 2)
    document.querySelectorAll("#mainNav .nav-submenu-toggle, #navCatRow .nav-submenu-toggle").forEach((toggle) => toggle.addEventListener("click", () => {
      const category = toggle.closest(".nav-category");
      if (!category) return;
      const open = category.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    }));
  }

  function initProductQuicknav() {
    const root = document.querySelector(".product-quicknav");
    if (!root || root.dataset.qnInit) return;
    root.dataset.qnInit = "1";
    const btn = root.querySelector(".pq-toggle");
    const closeBtn = root.querySelector(".pq-close");
    if (!btn) return;
    const setOpen = (open) => {
      root.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", String(open));
    };
    btn.addEventListener("click", (event) => {
      event.stopPropagation();
      setOpen(!root.classList.contains("is-open"));
    });
    if (closeBtn) closeBtn.addEventListener("click", () => setOpen(false));
    document.addEventListener("click", (event) => {
      if (root.classList.contains("is-open") && !root.contains(event.target)) setOpen(false);
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setOpen(false);
    });
  }

  function initHomeSolutions() {
    const tabs = Array.from(document.querySelectorAll(".industry-tab"));
    const solutionImage = document.getElementById("solutionImage");
    const solutionImageLabel = document.getElementById("solutionImageLabel");
    const solutionDescription = document.getElementById("solutionDescription");
    if (!tabs.length || !solutionImage || !solutionImageLabel || !solutionDescription) return;

    const industrySolutions = [
      { key: "food-beverage", label: "INGREDIENT & PROCESS WATER", description: "Stable water for ingredients, production processes, cleaning and bottled-water support, with treatment configured around source-water quality and production requirements." },
      { key: "drinking-water", label: "PURIFICATION & DISINFECTION", description: "Practical purification for bottled-water plants, commercial drinking-water projects and community supply, with final treatment selected for the applicable water-quality standard." },
      { key: "industrial-pure-water", label: "PROCESS & UTILITY WATER", description: "Pure water systems for manufacturing, cleaning, rinsing and utility processes, engineered around capacity, conductivity and the production line's operating conditions." },
      { key: "desalination", label: "COASTAL & REMOTE SUPPLY", description: "Desalination for coastal facilities, islands, remote sites, aquaculture and supplemental supply, with containerized options available for faster deployment." },
      { key: "electronics-ultrapure", label: "ELECTRONIC-GRADE ULTRAPURE WATER", description: "Ultrapure water for semiconductor, PCB, display, photovoltaic and battery manufacturing, polished to 18.2 MΩ·cm resistivity with TOC control and a circulating distribution loop." }
    ];
    const indPhotoMap = {
      "food-beverage": { src: "app/images/products/food-beverage-2t-ro-system.webp", w: 1086, h: 813 },
      "drinking-water": { src: "app/images/products/direct-drinking-water-system.webp", w: 1448, h: 1084 },
      "industrial-pure-water": { src: "app/images/products/pcb-ultrapure-ro-system.webp", w: 1038, h: 783 },
      "desalination": { src: "app/images/products/containerized-ro-system.webp", w: 1448, h: 1088 },
      "electronics-ultrapure": { src: "app/images/products/industrial-ultrapure-system.webp", w: 1448, h: 1086 }
    };

    tabs.forEach((tab) => tab.addEventListener("click", () => {
      const solution = industrySolutions[Number(tab.dataset.index)];
      if (!solution) return;
      tabs.forEach((item) => {
        const active = item === tab;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-selected", String(active));
      });
      solutionImage.className = `solution-image solution-image-${solution.key}`;
      const indPhoto = document.getElementById("indSolutionPhoto");
      const photo = indPhotoMap[solution.key];
      if (indPhoto && photo) {
        indPhoto.src = photo.src;
        indPhoto.width = photo.w;
        indPhoto.height = photo.h;
      }
      solutionImage.setAttribute("aria-label", `Representative treatment train for ${tab.querySelector(".industry-tab-title")?.textContent ?? ""}`);
      solutionImageLabel.textContent = solution.label;
      solutionDescription.textContent = solution.description;
    }));
  }

  function initPartsForm() {
    const form = document.getElementById("partsForm");
    if (!form) return;
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const values = new FormData(form);
      const body = [
        `Customer type: ${values.get("buyerType") || "-"}`,
        `Product category: ${values.get("category") || "-"}`,
        `Component: ${values.get("component") || "-"}`,
        `Quantity / annual volume: ${values.get("quantity") || "-"}`,
        `Packaging: ${values.get("packaging") || "-"}`,
        `Special requirement: ${values.get("requirement") || "-"}`,
        `Project info: ${values.get("project") || "-"}`,
        `Contact: ${values.get("contact") || "-"}`
      ].join("\n");
      window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Spare Parts Requirement - KONCHE")}&body=${encodeURIComponent(body)}`;
      const note = document.getElementById("partsFormNote");
      if (note) note.textContent = "Your email application is opening with the requirement details. Please send the email to complete the inquiry.";
    });
  }

  // Static RFQ form on contact.html (#rfqForm). Same mailto contract as the
  // injected inquiry form: opens the visitor's email client pre-filled, with a
  // clipboard fallback when the composed link exceeds MAILTO_LIMIT.
  function initRfqForm() {
    const form = document.getElementById("rfqForm");
    if (!form || form.dataset.rfqInit) return;
    form.dataset.rfqInit = "1";
    const roleParam = new URLSearchParams(window.location.search).get("role");
    const roleSelect = form.querySelector('[name="role"]');
    const roleMap = {
      epc: "EPC contractor",
      integrator: "Engineering integrator",
      oem: "OEM / private-label buyer",
      distributor: "Distributor / wholesale buyer"
    };
    if (roleSelect && roleMap[roleParam]) roleSelect.value = roleMap[roleParam];
    const status = form.querySelector(".rfq-status");
    const fileInput = form.querySelector('input[type="file"]');
    const fileName = form.querySelector(".rfq-file-name");
    fileInput?.addEventListener("change", () => {
      const file = fileInput.files[0];
      if (!file) { if (fileName) fileName.textContent = "No file selected"; return; }
      if (file.size > 10 * 1024 * 1024) {
        fileInput.value = "";
        if (fileName) fileName.textContent = "The selected file is larger than 10 MB.";
        return;
      }
      if (fileName) fileName.textContent = file.name;
    });
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      const values = new FormData(form);
      const report = fileInput?.files[0];
      const subject = `KONCHE Website Inquiry - ${values.get("company") || values.get("name")}`;
      const body = [
        "KONCHE Website Project Inquiry",
        "",
        `Page URL: ${window.location.href}`,
        "",
        `Name: ${values.get("name")}`,
        `Company: ${values.get("company") || "-"}`,
        `Email: ${values.get("email")}`,
        `Country / Region: ${values.get("country") || "-"}`,
        `You Are A: ${values.get("role") || "-"}`,
        `Application / Industry: ${values.get("application") || "-"}`,
        `Required Capacity: ${values.get("capacity") || "-"}`,
        `Target Water Quality / Standard: ${values.get("quality") || "-"}`,
        `Source Water: ${values.get("source") || "-"}`,
        `Additional Details: ${values.get("message") || "-"}`,
        `Selected Report: ${report ? report.name + " (please attach to this email)" : "None"}`
      ].join("\n");
      const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      const finish = (text) => { if (status) status.textContent = text; };
      if (mailto.length > MAILTO_LIMIT && navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(`${subject}\n\n${body}`).then(
          () => finish(`Your inquiry is too long for an email link. It was copied to the clipboard — paste it into an email to ${CONTACT_EMAIL}.`),
          () => { finish("Your email application is opening with the inquiry details."); window.location.href = mailto; }
        );
        return;
      }
      finish(report
        ? "Your email application is opening. Please attach the selected report before sending."
        : "Your email application is opening with the inquiry details.");
      window.location.href = mailto;
    });
  }

  function addProjectScopeStrip() {
    const page = window.location.pathname.split("/").pop() || "";
    const excluded = new Set([
      "industry-solutions.html",
      "spare-parts.html",
      "spare-parts-sourcing-service.html",
      "general-water-treatment-consumables.html",
      "uv-disinfection-consumables.html"
    ]);
    if (!window.location.pathname.includes("/products/") || excluded.has(page)) return;
    const hero = document.querySelector(".product-hero");
    if (!hero || document.querySelector(".project-scope-strip")) return;
    const scope = document.createElement("section");
    scope.className = "project-scope-strip";
    scope.setAttribute("aria-label", "Project fit and delivery scope");
    scope.innerHTML = `
      <div class="container project-scope-grid">
        <article><span>BEST FIT</span><p>EPC contractors, engineering integrators and industrial clients.</p></article>
        <article><span>DESIGN INPUTS</span><p>Feed-water report, capacity, target quality and operating conditions.</p></article>
        <article><span>KONCHE SCOPE</span><p>Process configuration, equipment engineering, manufacturing, FAT and documentation.</p></article>
        <article><span>SUPPLY BOUNDARY</span><p>KONCHE's supply ends at documented equipment delivery. Manuals, drawings and remote technical clarification are provided; destination setup is handled independently by the buyer.</p></article>
      </div>`;
    hero.insertAdjacentElement("afterend", scope);
  }

  // Feature isolation: one failing enhancement must not take down the rest.
  const safe = (name, fn) => {
    try {
      fn();
    } catch (error) {
      console.warn(`[site-enhancements] ${name} failed:`, error);
    }
  };
  safe("nav-menu", initNavMenu);
  safe("product-quicknav", initProductQuicknav);
  safe("social-dock", addSocialDock);
  safe("client-logos", rotateClientLogos);
  safe("service-carousel", initServiceCarousel);
  safe("inquiry-form", addInquiryForm);
  safe("rfq-form", initRfqForm);
  safe("home-solutions", initHomeSolutions);
  safe("parts-form", initPartsForm);
  safe("project-scope", addProjectScopeStrip);
})();
