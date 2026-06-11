/* ====================================================
   ADHD-Focused Printable Planner — Dynamic Theme Switcher
   ==================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const themes = [
    {
      id: "blush-calligraphy",
      name: "Blush Calligraphy",
      category: "Feminine",
    },
    {
      id: "watercolor-florals",
      name: "Watercolor Florals",
      category: "Feminine",
    },
    { id: "botanical-garden", name: "Botanical Garden", category: "Feminine" },
    {
      id: "rose-gold-abstract",
      name: "Rose Gold Abstract",
      category: "Feminine",
    },
    { id: "peach-bloom", name: "Peach Bloom", category: "Feminine" },
    { id: "lavender-mist", name: "Lavender Mist", category: "Feminine" },

    { id: "dark-slate", name: "Dark Slate", category: "Masculine" },
    {
      id: "midnight-blueprint",
      name: "Midnight Blueprint",
      category: "Masculine",
    },
    { id: "carbon-fiber", name: "Carbon Fiber", category: "Masculine" },
    {
      id: "concrete-industrial",
      name: "Concrete Industrial",
      category: "Masculine",
    },
    { id: "smoke-and-steel", name: "Smoke & Steel", category: "Masculine" },
    { id: "rustic-urban", name: "Rustic Urban", category: "Masculine" },

    {
      id: "abstract-brushstrokes",
      name: "Abstract Brushstrokes",
      category: "Universal",
    },
    { id: "geometric-zen", name: "Geometric Zen", category: "Universal" },
    { id: "sunset-gradient", name: "Sunset Gradient", category: "Universal" },
    {
      id: "classic-calligraphy",
      name: "Classic Calligraphy",
      category: "Universal",
    },
    { id: "opal-skyline", name: "Opal Skyline", category: "Universal" },
    { id: "sunrise-echo", name: "Sunrise Echo", category: "Universal" },
  ];

  // Get current active theme or default to first
  let activeTheme =
    localStorage.getItem("selected-theme") || "blush-calligraphy";

  // Set body class
  setTheme(activeTheme);

  // If switcher container doesn't exist, create it
  if (!document.querySelector(".theme-switcher")) {
    injectSwitcher();
  }

  function setTheme(themeId) {
    // Remove any previous theme class
    themes.forEach((t) => {
      document.body.classList.remove(`theme-${t.id}`);
    });
    // Add new theme class
    document.body.classList.add(`theme-${themeId}`);
    localStorage.setItem("selected-theme", themeId);
    activeTheme = themeId;

    // Update button states
    document.querySelectorAll(".theme-btn").forEach((btn) => {
      if (btn.dataset.theme === themeId) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });

    // Fire custom event so pages can respond if they need to update styling dynamically
    const event = new CustomEvent("themeChanged", {
      detail: { theme: themeId },
    });
    document.dispatchEvent(event);
  }

  function injectSwitcher() {
    const switcher = document.createElement("div");
    switcher.className = "theme-switcher";

    // Style the switcher bar to look modern and premium
    const style = document.createElement("style");
    style.innerHTML = `
      .theme-switcher {
        display: flex;
        flex-direction: column;
        background: rgba(17, 17, 22, 0.65);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        position: sticky;
        top: 0;
        z-index: 9999;
        width: 100%;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      }
      .switcher-top {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 10px 24px;
        border-bottom: 1px solid rgba(255,255,255,0.15);
        width: 100%;
        gap: 10px;
      }
      .switcher-middle {
        display: none;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 10px 24px;
        border-bottom: 1px solid rgba(255,255,255,0.05);
        width: 100%;
        gap: 10px;
        text-align: center;
      }
      .theme-switcher-label,
      .theme-switcher-subtitle {
        color: #fff;
        font-size: 12px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 1.5px;
        margin-top: 6px;
        width: 100%;
        text-align: center;
        display: block;
        flex-basis: 100%;
      }
      .theme-switcher-subtitle {
        width: 100%;
      }
      .mobile-tab-row {
        display: none;
        gap: 10px;
      }
      .mobile-tab {
        padding: 7px 14px;
        border-radius: 999px;
        background: rgba(255,255,255,0.08);
        color: #c0c0d0;
        border: 1px solid transparent;
        cursor: pointer;
        font-size: 10px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        transition: all 0.2s ease;
      }
      .mobile-tab:hover,
      .mobile-tab.active {
        background: rgba(255,255,255,0.16);
        color: #fff;
        border-color: rgba(255,255,255,0.14);
      }
      .switcher-bottom {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        align-items: flex-start;
        gap: 12px;
        padding: 12px 20px;
        width: 100%;
      }
      .switcher-bottom.mobile-tools-hidden {
        display: none;
      }
      .category-card {
        position: relative;
        flex: 0 1 220px;
        min-width: 190px;
        max-width: 240px;
      }
      .category-summary {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 10px;
        width: 100%;
        padding: 14px 16px;
        cursor: pointer;
        background: rgba(26, 28, 40, 0.92);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 18px;
        font-size: 12px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 1px;
        color: #f5f5f7;
        transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
        box-shadow: 0 10px 24px rgba(0, 0, 0, 0.14);
      }
      .category-summary:hover {
        background: rgba(38, 41, 57, 0.98);
        border-color: rgba(255, 255, 255, 0.14);
      }
      .category-card.open .category-summary {
        background: rgba(56, 59, 78, 0.98);
        border-color: rgba(255, 255, 255, 0.18);
        color: #fff;
        box-shadow: 0 14px 28px rgba(0, 0, 0, 0.18);
      }
      .category-summary::after {
        content: '⌄';
        font-size: 12px;
        color: #a8a8b8;
        transform: rotate(0deg);
        transition: transform 0.2s ease;
      }
      .category-card.open .category-summary::after {
        transform: rotate(180deg);
      }
      .category-note {
        display: none;
      }
      .category-content {
        display: none;
        position: absolute;
        top: calc(100% + 8px);
        left: 0;
        right: 0;
        flex-direction: column;
        align-items: stretch;
        gap: 8px;
        padding: 12px;
        border-radius: 18px;
        background: rgba(18, 20, 30, 0.98);
        border: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: 0 18px 40px rgba(0, 0, 0, 0.22);
        z-index: 20;
      }
      .category-card.open .category-content {
        display: flex;
      }
      .theme-category {
        display: none;
      }
      .theme-btn {
        width: 100%;
        padding: 9px 12px;
        border-radius: 999px;
        font-size: 11px;
        font-weight: 600;
        border: 1px solid rgba(255,255,255,0.08);
        background: rgba(255,255,255,0.04);
        color: #c0c0d0;
        cursor: pointer;
        transition: all 0.2s ease;
        white-space: nowrap;
      }
      .theme-btn:hover {
        background: rgba(255,255,255,0.12);
        color: #fff;
      }
      .theme-btn.active {
        background: #fff;
        color: #111116;
        font-weight: 600;
        border-color: rgba(255,255,255,0.16);
      }
      .nav-links {
        display: flex;
        gap: 10px;
        align-items: center;
        flex-wrap: wrap;
        justify-content: center;
        width: 100%;
      }
      .nav-link {
        font-size: 10px;
        font-weight: 600;
        text-transform: uppercase;
        color: #3a86ff;
        text-decoration: none;
        padding: 6px 12px;
        border-radius: 999px;
        background: rgba(58, 134, 255, 0.12);
        transition: background 0.2s;
      }
      .nav-link:hover {
        background: rgba(58, 134, 255, 0.22);
      }
      .print-btn {
        background: #ff006e;
        color: #fff;
        font-size: 10px;
        font-weight: 700;
        border: none;
        padding: 6px 14px;
        border-radius: 999px;
        cursor: pointer;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        transition: background 0.2s;
      }
      .print-btn:hover {
        background: #e00062;
      }

      @media screen and (max-width: 860px) {
        .switcher-top {
          flex-direction: column;
          align-items: center;
          gap: 10px;
          padding: 10px;
        }
        .switcher-top .nav-links {
          justify-content: center;
          width: 100%;
        }
        .switcher-top .theme-switcher-label {
          display: none;
        }
        .switcher-middle {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 10px 20px;
          text-align: center;
        }
        .theme-switcher-subtitle {
          display: block;
          width: 100%;
        }
        .mobile-tab-row {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          width: 100%;
        }
        .switcher-bottom {
          padding: 10px 12px;
          gap: 8px;
          display: none;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          align-items: start;
          width: 100%;
        }
        .switcher-bottom > .theme-switcher-label {
          display: none;
        }
        .switcher-bottom.mobile-theme-active {
          display: grid;
        }
        .category-card {
          min-width: 0;
          max-width: none;
          width: 100%;
        }
        .category-summary {
          justify-content: center;
          text-align: center;
          padding: 12px 8px;
          border-radius: 16px;
          font-size: 10px;
          letter-spacing: 0.6px;
          min-height: 50px;
          overflow: hidden;
        }
        .category-summary::after {
          margin-left: 4px;
          font-size: 10px;
          flex-shrink: 0;
        }
        .category-content {
          position: absolute;
          left: 0;
          right: auto;
          min-width: 160px;
          width: max-content;
          max-width: min(220px, 80vw);
          margin-top: 0;
        }
        .category-card:nth-child(2) .category-content {
          left: 50%;
          transform: translateX(-50%);
        }
        .category-card:nth-child(4) .category-content,
        .category-card:last-child .category-content {
          left: auto;
          right: 0;
        }
      }

      @media print {
        .theme-switcher {
          display: none !important;
        }
        body {
          padding-top: 0 !important;
        }
      }
    `;
    document.head.appendChild(style);

    // Group buttons by category
    const categories = ["Feminine", "Masculine", "Universal"];

    // Create Top, Middle and Bottom containers
    const switcherTop = document.createElement("div");
    switcherTop.className = "switcher-top";
    const switcherMiddle = document.createElement("div");
    switcherMiddle.className = "switcher-middle";
    const switcherBottom = document.createElement("div");
    switcherBottom.className = "switcher-bottom";

    // Label for desktop
    const switcherLabel = document.createElement("span");
    switcherLabel.className = "theme-switcher-label";
    switcherLabel.innerText = "Buddy ADHD Themes:";

    // Add navigation and print buttons
    const navDiv = document.createElement("div");
    navDiv.className = "nav-links";

    const indexLink = document.createElement("a");
    indexLink.className = "nav-link";
    indexLink.href = "../index.html";
    indexLink.innerText = "Dashboard";
    navDiv.appendChild(indexLink);

    const prBtn = document.createElement("button");
    prBtn.className = "print-btn";
    prBtn.innerText = "Print Page";
    prBtn.onclick = () => window.print();
    navDiv.appendChild(prBtn);

    switcherTop.appendChild(navDiv);

    // Mobile-only subtitle and tabs
    const switcherSubLabel = document.createElement("span");
    switcherSubLabel.className = "theme-switcher-subtitle";
    switcherSubLabel.innerText = "Buddy ADHD Themes:";
    const mobileTabRow = document.createElement("div");
    mobileTabRow.className = "mobile-tab-row";

    const toolsTab = document.createElement("button");
    toolsTab.className = "mobile-tab active";
    toolsTab.type = "button";
    toolsTab.innerText = "Tools";

    const themeTab = document.createElement("button");
    themeTab.className = "mobile-tab";
    themeTab.type = "button";
    themeTab.innerText = "Select Themes";

    mobileTabRow.appendChild(toolsTab);
    mobileTabRow.appendChild(themeTab);
    switcherMiddle.appendChild(switcherSubLabel);
    switcherMiddle.appendChild(mobileTabRow);

    // Add heading to switcherBottom before categories
    switcherBottom.appendChild(switcherLabel);

    categories.forEach((cat) => {
      const card = document.createElement("div");
      card.className = "category-card";

      const summary = document.createElement("div");
      summary.className = "category-summary";
      const shortCategoryLabels = {
        Feminine: "Fem",
        Masculine: "Masc",
        Universal: "Uni",
      };
      summary.innerText = shortCategoryLabels[cat] || cat;
      summary.setAttribute("data-full-label", cat);

      const note = document.createElement("span");
      note.className = "category-note";
      note.innerText = "";
      summary.appendChild(note);

      const content = document.createElement("div");
      content.className = "category-content";

      themes
        .filter((t) => t.category === cat)
        .forEach((t) => {
          const btn = document.createElement("button");
          btn.className = "theme-btn";
          btn.dataset.theme = t.id;
          btn.innerText = t.name;
          if (t.id === activeTheme) btn.classList.add("active");

          btn.addEventListener("click", () => setTheme(t.id));
          content.appendChild(btn);
        });

      const closeOtherCategories = () => {
        switcherBottom
          .querySelectorAll(".category-card")
          .forEach((otherCard) => {
            if (otherCard !== card) {
              otherCard.classList.remove("open");
              otherCard
                .querySelector(".category-summary")
                ?.setAttribute("aria-expanded", "false");
            }
          });
      };

      summary.setAttribute("role", "button");
      summary.setAttribute("tabindex", "0");
      summary.setAttribute("aria-expanded", "false");

      const toggleCategory = () => {
        const isOpen = card.classList.contains("open");
        closeOtherCategories();
        card.classList.toggle("open", !isOpen);
        summary.setAttribute("aria-expanded", String(!isOpen));
      };

      summary.addEventListener("click", toggleCategory);
      summary.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          toggleCategory();
        }
      });

      card.appendChild(summary);
      card.appendChild(content);
      switcherBottom.appendChild(card);
    });

    switcherBottom.querySelectorAll(".category-card").forEach((card) => {
      card.classList.remove("open");
    });

    const mobileQuery = window.matchMedia("(max-width: 860px)");
    const setMobilePanel = (panel) => {
      const showThemes = panel === "themes";
      toolsTab.classList.toggle("active", !showThemes);
      themeTab.classList.toggle("active", showThemes);
      switcherBottom.classList.toggle(
        "mobile-theme-active",
        showThemes || !mobileQuery.matches,
      );
      document.body.classList.toggle(
        "mobile-tools-active",
        !showThemes && mobileQuery.matches,
      );
      document.body.classList.toggle(
        "mobile-themes-active",
        showThemes && mobileQuery.matches,
      );
      if (!showThemes) {
        switcherBottom.querySelectorAll(".category-card").forEach((card) => {
          card.classList.remove("open");
          card
            .querySelector(".category-summary")
            ?.setAttribute("aria-expanded", "false");
        });
      }
      document.dispatchEvent(
        new CustomEvent("mobileSwitcherTabChanged", { detail: { panel } }),
      );
    };

    toolsTab.addEventListener("click", () => {
      if (
        mobileQuery.matches &&
        document.body.classList.contains("mobile-tools-active")
      ) {
        toolsTab.classList.remove("active");
        themeTab.classList.remove("active");
        switcherBottom.classList.remove("mobile-theme-active");
        document.body.classList.remove(
          "mobile-tools-active",
          "mobile-themes-active",
        );
        document.dispatchEvent(
          new CustomEvent("mobileSwitcherTabChanged", {
            detail: { panel: "closed" },
          }),
        );
      } else {
        setMobilePanel("tools");
      }
    });
    themeTab.addEventListener("click", () => {
      if (
        mobileQuery.matches &&
        document.body.classList.contains("mobile-themes-active")
      ) {
        toolsTab.classList.remove("active");
        themeTab.classList.remove("active");
        switcherBottom.classList.remove("mobile-theme-active");
        document.body.classList.remove(
          "mobile-tools-active",
          "mobile-themes-active",
        );
        switcherBottom.querySelectorAll(".category-card").forEach((card) => {
          card.classList.remove("open");
          card
            .querySelector(".category-summary")
            ?.setAttribute("aria-expanded", "false");
        });
        document.dispatchEvent(
          new CustomEvent("mobileSwitcherTabChanged", {
            detail: { panel: "closed" },
          }),
        );
      } else {
        setMobilePanel("themes");
      }
    });

    mobileQuery.addEventListener("change", () => {
      if (mobileQuery.matches) {
        setMobilePanel(
          document.body.classList.contains("mobile-themes-active")
            ? "themes"
            : "tools",
        );
      } else {
        switcherBottom.classList.add("mobile-theme-active");
        document.body.classList.remove(
          "mobile-tools-active",
          "mobile-themes-active",
        );
      }
    });

    if (mobileQuery.matches) {
      toolsTab.classList.remove("active");
      themeTab.classList.remove("active");
      switcherBottom.classList.remove("mobile-theme-active");
      document.body.classList.remove(
        "mobile-tools-active",
        "mobile-themes-active",
      );
      document.dispatchEvent(
        new CustomEvent("mobileSwitcherTabChanged", {
          detail: { panel: "closed" },
        }),
      );
    } else {
      switcherBottom.classList.add("mobile-theme-active");
    }

    document.addEventListener("click", (event) => {
      if (!switcherBottom.contains(event.target)) {
        switcherBottom.querySelectorAll(".category-card").forEach((card) => {
          card.classList.remove("open");
          card
            .querySelector(".category-summary")
            ?.setAttribute("aria-expanded", "false");
        });
      }
    });

    switcher.appendChild(switcherTop);
    switcher.appendChild(switcherMiddle);
    switcher.appendChild(switcherBottom);

    // Inject switcher at the very top of body
    document.body.insertBefore(switcher, document.body.firstChild);

    // Add top padding to body to compensate for fixed/sticky switcher
    document.body.style.paddingTop = "0px";
  }
});
