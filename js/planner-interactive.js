/* ====================================================
   ADHD-Focused Printable Planner — Interactive Features & Stylus Engine
   ==================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const pageContainer = document.querySelector(".planner-page");
  if (!pageContainer) return; // Only run on planner subpages

  // Helper to format Date object as local YYYY-MM-DD string
  function getLocalDateString(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  // ── 1. Page, Year and Month Setup ──
  const pageId = window.location.pathname.split("/").pop().replace(".html", "");
  const monthNames = {
    jan: "January",
    feb: "February",
    mar: "March",
    apr: "April",
    may: "May",
    jun: "June",
    jul: "July",
    aug: "August",
    sep: "September",
    oct: "October",
    nov: "November",
    dec: "December",
  };

  const today = new Date();
  const currentYear = today.getFullYear();
  const monthKeys = [
    "jan",
    "feb",
    "mar",
    "apr",
    "may",
    "jun",
    "jul",
    "aug",
    "sep",
    "oct",
    "nov",
    "dec",
  ];
  let storedMonth = localStorage.getItem("selected-month");
  let storedYear = localStorage.getItem("selected-year");
  let selectedMonth =
    storedMonth && monthKeys.includes(storedMonth)
      ? storedMonth
      : today.toLocaleString("en-US", { month: "short" }).toLowerCase();
  let selectedYear = (() => {
    if (storedYear && !isNaN(Number(storedYear))) {
      const y = Number(storedYear);
      if (y >= currentYear - 1 && y <= currentYear + 4) return storedYear;
    }
    return currentYear.toString();
  })();
  let selectedDate = localStorage.getItem("selected-date");
  if (!selectedDate) {
    selectedDate = getLocalDateString(today);
  }

  // Adjust selectedYear and selectedMonth initially if on daily-focus to sync with loaded date
  if (pageId === "daily-focus") {
    const d = new Date(selectedDate + "T00:00:00");
    if (!isNaN(d.getTime())) {
      selectedYear = d.getFullYear().toString();
      const monthShort = d
        .toLocaleString("en-US", { month: "short" })
        .toLowerCase();
      selectedMonth = monthShort;
    }
  }
  if (pageId === "monthly-calendar") {
    const d = new Date(selectedDate + "T00:00:00");
    if (!isNaN(d.getTime())) {
      selectedYear = d.getFullYear().toString();
      const monthShort = d
        .toLocaleString("en-US", { month: "short" })
        .toLowerCase();
      selectedMonth = monthShort;
    }
  }

  // Storage key helper with backwards compatibility fallback for default year (2026)
  function getStorageKey(type) {
    if (pageId === "daily-focus") {
      const newKey = `planner-${type}-${pageId}-${selectedDate}`;
      const oldKey = `planner-${type}-${pageId}-${selectedMonth}`;
      return { newKey, oldKey };
    } else {
      const newKey = `planner-${type}-${pageId}-${selectedYear}-${selectedMonth}`;
      const oldKey = `planner-${type}-${pageId}-${selectedMonth}`;
      return { newKey, oldKey };
    }
  }

  function setupResponsiveNavigation() {
    const navGroups = document.querySelectorAll(".nav-icons");
    if (!navGroups.length) return;

    const activeHrefByPage = {
      "daily-focus": "daily-focus.html",
      "weekly-overview": "weekly-overview.html",
      "monthly-calendar": "monthly-calendar.html",
      "brain-dump": "brain-dump.html",
      "habit-tracker": "habit-tracker.html",
      "dopamine-menu": "dopamine-menu.html",
      "expense-tracker": "expense-tracker.html",
      "quick-reminder": "quick-reminder.html",
    };

    const mobileQuery = window.matchMedia("(max-width: 860px)");

    navGroups.forEach((nav, index) => {
      const navLinks = Array.from(nav.querySelectorAll(".nav-icon"));
      if (!navLinks.length) return;

      nav.setAttribute("role", "navigation");
      nav.setAttribute("aria-label", "Planner pages");
      nav.id = nav.id || `planner-nav-${index + 1}`;

      navLinks.forEach((link) => {
        const tooltip = link.getAttribute("data-tooltip");
        if (tooltip && !link.getAttribute("aria-label")) {
          link.setAttribute("aria-label", tooltip);
        }

        const href = link.getAttribute("href") || "";
        if (href.endsWith(activeHrefByPage[pageId])) {
          link.setAttribute("aria-current", "page");
        } else {
          link.removeAttribute("aria-current");
        }
      });

      const existingToggle = nav.previousElementSibling;
      if (
        existingToggle &&
        existingToggle.classList.contains("nav-menu-toggle")
      ) {
        existingToggle.remove();
      }

      const syncMenuState = () => {
        nav.classList.add("is-open");
      };

      mobileQuery.addEventListener("change", syncMenuState);
      syncMenuState();
    });
  }

  // Inject year selector dropdown above month tabs if month tabs exist
  const monthTabsContainer = document.querySelector(".month-tabs");
  if (monthTabsContainer) {
    const yearWrapper = document.createElement("div");
    yearWrapper.className = "year-select-wrapper";
    const yearSelect = document.createElement("select");
    yearSelect.className = "year-select";
    yearSelect.id = "year-select";
    const currentYear = new Date().getFullYear();
    for (let y = currentYear - 1; y <= currentYear + 4; y++) {
      const opt = document.createElement("option");
      opt.value = y.toString();
      opt.textContent = y.toString();
      if (y.toString() === selectedYear) {
        opt.selected = true;
      }
      yearSelect.appendChild(opt);
    }
    yearWrapper.appendChild(yearSelect);
    monthTabsContainer.insertBefore(yearWrapper, monthTabsContainer.firstChild);
    yearSelect.addEventListener("change", (e) => {
      saveAllData();
      selectedYear = e.target.value;
      localStorage.setItem("selected-year", selectedYear);
      updateMonthLabels();
      if (pageId === "daily-focus") {
        syncDateFromMonthYear();
      } else if (pageId === "monthly-calendar") {
        const monthIndex = getMonthIndex(selectedMonth);
        const currentSelected = new Date(selectedDate + "T00:00:00");
        if (
          currentSelected.getMonth() !== monthIndex ||
          currentSelected.getFullYear() !== Number(selectedYear)
        ) {
          const firstDate = new Date(Number(selectedYear), monthIndex, 1);
          selectedDate = getLocalDateString(firstDate);
          localStorage.setItem("selected-date", selectedDate);
        }
        renderMonthlyCalendar();
      } else {
        loadAllData();
      }
    });
  }

  // Make tabs interactive
  const monthTabs = document.querySelectorAll(".month-tab");
  // Create a popup calendar anchored to month tabs (used when clicking tabs)
  let monthPopup = null;
  let popupTimeout = null;
  function ensureMonthPopup() {
    if (monthPopup) return monthPopup;
    const container = document.body;
    monthPopup = document.createElement("div");
    monthPopup.className = "month-calendar-popup";
    monthPopup.innerHTML = `
      <div class="popup-month-title"></div>
      <div class="popup-calendar-grid">
        ${Array.from({ length: 35 })
          .map(
            () =>
              '<div class="popup-cell"><div class="popup-date"></div></div>',
          )
          .join("")}
      </div>
    `;
    // Close when clicking outside
    document.addEventListener("click", (ev) => {
      if (!monthPopup) return;
      if (monthPopup.contains(ev.target)) return;
      if (Array.from(monthTabs).some((t) => t.contains(ev.target))) return;
      monthPopup.classList.remove("open");
    });

    // Keep popup open when hovering over it
    monthPopup.addEventListener("mouseenter", () => clearTimeout(popupTimeout));
    monthPopup.addEventListener("mouseleave", () => {
      popupTimeout = setTimeout(() => {
        if (monthPopup) monthPopup.classList.remove("open");
      }, 300);
    });

    container.appendChild(monthPopup);
    return monthPopup;
  }
  monthTabs.forEach((tab) => {
    // Show calendar popup on hover
    tab.addEventListener("mouseenter", () => {
      clearTimeout(popupTimeout);
      const monthId = Array.from(tab.classList).find((c) => monthNames[c]);
      if (monthId) {
        const popup = ensureMonthPopup();
        const monthIndex = getMonthIndex(monthId);

        // ALWAYS show the popup calendar anchored to the hovered tab
        renderPopupCalendar(popup, Number(selectedYear), monthIndex);

        popup.classList.add("open");

        // Position popup relative to hovered tab using page coordinates
        const rect = tab.getBoundingClientRect();
        const top = rect.top + window.scrollY;
        const popupWidth = popup.offsetWidth || 220; // Fallback to 220 if not rendered yet
        const left = rect.left + window.scrollX - popupWidth - 12; // place left of tab
        popup.style.top = `${Math.max(12, top)}px`;
        popup.style.left = `${Math.max(12, left)}px`;
      }
    });

    // Hide popup when mouse leaves tab
    tab.addEventListener("mouseleave", () => {
      popupTimeout = setTimeout(() => {
        if (monthPopup) monthPopup.classList.remove("open");
      }, 300);
    });

    // Add click event (iOS hover double-tap is now fully bypassed in CSS)
    tab.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const monthId = Array.from(tab.classList).find((c) => monthNames[c]);
      if (monthId) {
        const popup = ensureMonthPopup();
        const isNewMonth = monthId !== selectedMonth;
        if (isNewMonth) {
          saveAllData(); // Save current month data before switching
          selectedMonth = monthId;
          localStorage.setItem("selected-month", selectedMonth);
          updateActiveMonthTab();
          updateMonthLabels();
        }

        const monthIndex = getMonthIndex(selectedMonth);

        // Adjust selectedDate if the month changed
        if (isNewMonth) {
          if (pageId === "daily-focus" || pageId === "monthly-calendar") {
            const currentSelected = new Date(selectedDate + "T00:00:00");
            if (
              currentSelected.getMonth() !== monthIndex ||
              currentSelected.getFullYear() !== Number(selectedYear)
            ) {
              const firstDate = new Date(Number(selectedYear), monthIndex, 1);
              selectedDate = getLocalDateString(firstDate);
              localStorage.setItem("selected-date", selectedDate);
            }
          }
        }

        // If it's a daily-focus page and month changed, sync date
        if (isNewMonth && pageId === "daily-focus") {
          syncDateFromMonthYear();
        }

        // Render monthly calendar if on monthly-calendar page
        if (pageId === "monthly-calendar") {
          renderMonthlyCalendar();
        } else if (isNewMonth) {
          // If month changed on other pages, load new month data
          loadAllData();
        }

        // ALWAYS show the popup calendar anchored to the clicked tab on any page!
        renderPopupCalendar(popup, Number(selectedYear), monthIndex);

        popup.classList.add("open");

        // Position popup relative to clicked tab using page coordinates
        const rect = tab.getBoundingClientRect();
        const top = rect.top + window.scrollY;
        const popupWidth = popup.offsetWidth || 220; // Fallback to 220 if not rendered yet
        const left = rect.left + window.scrollX - popupWidth - 12; // place left of tab
        popup.style.top = `${Math.max(12, top)}px`;
        popup.style.left = `${Math.max(12, left)}px`;

        console.debug(
          "Month popup opened for",
          selectedMonth,
          selectedYear,
          "at",
          popup.style.left,
          popup.style.top,
        );
      }
    });
  });

  // Render the small popup calendar into the popup element
  function renderPopupCalendar(popupEl, year, monthIndex) {
    const title = popupEl.querySelector(".popup-month-title");
    const grid = popupEl.querySelector(".popup-calendar-grid");
    const cells = Array.from(grid.querySelectorAll(".popup-cell"));
    title.textContent = `${monthNames[["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"][monthIndex]]} ${year}`;
    const firstDay = new Date(year, monthIndex, 1);
    const startIndex = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const holidayMap = getUSHolidayMap(year);
    cells.forEach((cell, idx) => {
      const dayNumber = idx - startIndex + 1;
      const dateDiv = cell.querySelector(".popup-date");
      cell.classList.remove("disabled", "selected", "today", "holiday");
      cell.dataset.date = "";
      if (dayNumber > 0 && dayNumber <= daysInMonth) {
        dateDiv.textContent = dayNumber;
        const cellDate = new Date(year, monthIndex, dayNumber);
        cell.dataset.date = getLocalDateString(cellDate);
        if (cell.dataset.date === selectedDate) cell.classList.add("selected");
        if (cellDate.toDateString() === new Date().toDateString())
          cell.classList.add("today");
        if (holidayMap[cell.dataset.date]) {
          cell.classList.add("holiday");
        }
      } else {
        dateDiv.textContent = "";
        cell.classList.add("disabled");
      }
    });
    // Wire clicks
    cells.forEach((cell) => {
      cell.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const d = cell.dataset.date;
        if (!d) return;

        if (d !== selectedDate) {
          saveAllData(); // save current data before switching
          selectedDate = d;
          localStorage.setItem("selected-date", selectedDate);

          // Sync year and month from the selected date
          const dateObj = new Date(selectedDate + "T00:00:00");
          if (!isNaN(dateObj.getTime())) {
            const newYear = dateObj.getFullYear().toString();
            const newMonth = monthKeys[dateObj.getMonth()];

            let changedMonthOrYear = false;
            if (newYear !== selectedYear) {
              selectedYear = newYear;
              localStorage.setItem("selected-year", selectedYear);
              const yearSelect = document.getElementById("year-select");
              if (yearSelect) {
                yearSelect.value = selectedYear;
              }
              changedMonthOrYear = true;
            }
            if (newMonth !== selectedMonth) {
              selectedMonth = newMonth;
              localStorage.setItem("selected-month", selectedMonth);
              updateActiveMonthTab();
              changedMonthOrYear = true;
            }
            if (changedMonthOrYear) {
              updateMonthLabels();
            }
          }

          updateAllDateDisplays();

          // Load new day/month data
          loadAllData();

          // sync main calendar
          if (pageId === "monthly-calendar") {
            renderMonthlyCalendar();
          }
        }

        popupEl.classList.remove("open");
      };
    });
  }

  function updateActiveMonthTab() {
    monthTabs.forEach((tab) => {
      if (tab.classList.contains(selectedMonth)) {
        tab.classList.add("active");
      } else {
        tab.classList.remove("active");
      }
    });
  }

  function updateMonthLabels() {
    const fullMonthName = monthNames[selectedMonth];

    // 1. Update Monthly Calendar Title
    const monthlyTitle = document.querySelector(".monthly-title");
    if (monthlyTitle) {
      monthlyTitle.innerHTML = `Month of ${fullMonthName}`;
    }

    // 2. Update Habit Tracker Month
    const habitTrackerMonth = document.querySelector(".habit-tracker-month");
    if (habitTrackerMonth) {
      habitTrackerMonth.innerHTML = `Month of: ${fullMonthName}`;
    }

    // 4. Update Monthly Calendar Year
    const monthlyYear = document.querySelector(".monthly-year");
    if (monthlyYear) {
      monthlyYear.innerHTML = `Year: ${selectedYear}`;
    }
  }

  function getMonthIndex(monthKey) {
    return [
      "jan",
      "feb",
      "mar",
      "apr",
      "may",
      "jun",
      "jul",
      "aug",
      "sep",
      "oct",
      "nov",
      "dec",
    ].indexOf(monthKey);
  }

  function getNthWeekdayOfMonth(year, month, weekday, n) {
    const first = new Date(year, month, 1);
    let count = 0;
    for (let day = 1; day <= 31; day++) {
      const date = new Date(year, month, day);
      if (date.getMonth() !== month) break;
      if (date.getDay() === weekday) {
        count += 1;
        if (count === n) return date;
      }
    }
    return null;
  }

  function getLastWeekdayOfMonth(year, month, weekday) {
    const last = new Date(year, month + 1, 0);
    for (let day = last.getDate(); day > 0; day--) {
      const date = new Date(year, month, day);
      if (date.getDay() === weekday) return date;
    }
    return null;
  }

  function getObservedDate(year, month, day) {
    const date = new Date(year, month, day);
    if (date.getDay() === 0) {
      date.setDate(date.getDate() + 1);
    } else if (date.getDay() === 6) {
      date.setDate(date.getDate() - 1);
    }
    return date;
  }

  function getUSHolidayMap(year) {
    const holidays = {};
    const add = (date, label) => {
      holidays[getLocalDateString(date)] = label;
    };

    add(getObservedDate(year, 0, 1), "New Year's Day");
    const mlk = getNthWeekdayOfMonth(year, 0, 1, 3);
    if (mlk) add(mlk, "MLK Jr. Day");
    const presidents = getNthWeekdayOfMonth(year, 1, 1, 3);
    if (presidents) add(presidents, "Presidents' Day");
    const memorial = getLastWeekdayOfMonth(year, 4, 1);
    if (memorial) add(memorial, "Memorial Day");
    add(getObservedDate(year, 5, 19), "Juneteenth");
    add(getObservedDate(year, 6, 4), "Independence Day");
    const labor = getNthWeekdayOfMonth(year, 8, 1, 1);
    if (labor) add(labor, "Labor Day");
    const columbus = getNthWeekdayOfMonth(year, 9, 1, 2);
    if (columbus) add(columbus, "Columbus Day");
    add(getObservedDate(year, 10, 11), "Veterans Day");
    const thanksgiving = getNthWeekdayOfMonth(year, 10, 4, 4);
    if (thanksgiving) add(thanksgiving, "Thanksgiving");
    add(getObservedDate(year, 11, 25), "Christmas Day");
    return holidays;
  }

  function syncDateFromMonthYear() {
    const monthIndex = getMonthIndex(selectedMonth);
    if (monthIndex < 0) return;
    const d = new Date(
      `${selectedYear}-${String(monthIndex + 1).padStart(2, "0")}-01T00:00:00`,
    );
    selectedDate = getLocalDateString(d);
    localStorage.setItem("selected-date", selectedDate);
    updateDailyFocusDateDisplay();
  }

  function updateAllDateDisplays() {
    const weekNumberEl = document.getElementById("week-number");
    const dateStringEl = document.getElementById("date-string");
    const d = new Date(selectedDate + "T00:00:00");
    if (isNaN(d.getTime())) return;

    if (weekNumberEl) {
      weekNumberEl.textContent = getWeekNumber(d);
    }

    const weekdaysShort = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const monthsShort = [
      "JAN",
      "FEB",
      "MAR",
      "APR",
      "MAY",
      "JUN",
      "JUL",
      "AUG",
      "SEP",
      "OCT",
      "NOV",
      "DEC",
    ];

    if (dateStringEl) {
      if (pageId === "weekly-overview") {
        // Find Monday of the week
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(d.getFullYear(), d.getMonth(), diff);
        const wday = weekdaysShort[monday.getDay()];
        const mday = monday.getDate();
        const mname = monthsShort[monday.getMonth()];
        const year = monday.getFullYear();
        dateStringEl.textContent = `${wday}, ${mday} ${mname} ${year}`;
      } else {
        const wday = weekdaysShort[d.getDay()];
        const mday = d.getDate();
        const mname = monthsShort[d.getMonth()];
        const year = d.getFullYear();
        dateStringEl.textContent = `${wday}, ${mday} ${mname} ${year}`;
      }
    }

    const selectedDateDisplay = document.getElementById(
      "selected-date-display",
    );
    if (selectedDateDisplay) {
      const wday = weekdaysShort[d.getDay()];
      const mday = d.getDate();
      const mname = monthsShort[d.getMonth()];
      const year = d.getFullYear();
      selectedDateDisplay.textContent = `SELECTED DATE: ${wday}, ${mday} ${mname} ${year}`;
    }
  }

  function renderMonthlyCalendar() {
    if (pageId !== "monthly-calendar") return;
    const calendarGrid = document.querySelector(".calendar-grid");
    if (!calendarGrid) return;
    const monthIndex = getMonthIndex(selectedMonth);
    if (monthIndex < 0) return;
    const year = Number(selectedYear);
    const firstDay = new Date(year, monthIndex, 1);
    const startIndex = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const cells = Array.from(calendarGrid.querySelectorAll(".cal-cell"));
    const holidayMap = getUSHolidayMap(year);
    cells.forEach((cell, idx) => {
      const dayNumber = idx - startIndex + 1;
      const dateDiv = cell.querySelector(".cal-date");
      let holidayLabel = cell.querySelector(".cal-holiday-label");
      if (!holidayLabel) {
        holidayLabel = document.createElement("div");
        holidayLabel.className = "cal-holiday-label";
        if (dateDiv) {
          dateDiv.insertAdjacentElement("afterend", holidayLabel);
        } else {
          cell.appendChild(holidayLabel);
        }
      }
      cell.classList.remove(
        "disabled",
        "selected",
        "today",
        "active-day",
        "holiday",
      );
      cell.dataset.date = "";
      holidayLabel.textContent = "";
      if (dateDiv) {
        if (dayNumber > 0 && dayNumber <= daysInMonth) {
          dateDiv.textContent = dayNumber;
          const cellDate = new Date(year, monthIndex, dayNumber);
          cell.dataset.date = getLocalDateString(cellDate);
          cell.classList.add("active-day");
          if (cellDate.toDateString() === new Date().toDateString()) {
            cell.classList.add("today");
          }
          if (cell.dataset.date === selectedDate) {
            cell.classList.add("selected");
          }
          const holidayName = holidayMap[cell.dataset.date];
          if (holidayName) {
            holidayLabel.textContent = holidayName;
            cell.classList.add("holiday");
          }
        } else {
          dateDiv.textContent = "";
          cell.classList.add("disabled");
        }
      }
    });
    updateAllDateDisplays();
  }

  function setupMonthlyCalendar() {
    if (pageId !== "monthly-calendar") return;
    const calendarGrid = document.querySelector(".calendar-grid");
    if (!calendarGrid) return;
    const cells = Array.from(calendarGrid.querySelectorAll(".cal-cell"));
    cells.forEach((cell) => {
      cell.addEventListener("click", () => {
        const selected = cell.dataset.date;
        if (!selected) return;
        selectedDate = selected;
        localStorage.setItem("selected-date", selectedDate);
        updateAllDateDisplays();
        renderMonthlyCalendar();
      });
    });
    renderMonthlyCalendar();
  }

  function getWeekNumber(dateValue) {
    const d = new Date(dateValue);
    if (isNaN(d.getTime())) return "";
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  }

  // ── 2. Input Fields and Contenteditables ──

  // Make lines and empty areas contenteditable
  const editSelectors = [
    ".time-line",
    ".task-line",
    ".checkbox-line",
    ".reward-line",
    ".braindump-area",
    ".day-content",
    ".habit-label-cell",
    ".monthly-notes",
    ".lined-area",
    ".habit-name-cell",
    ".summary-lines",
    ".emergency-slot",
    ".cal-date",
    ".matrix-cell",
  ];

  editSelectors.forEach((selector) => {
    document.querySelectorAll(selector).forEach((el) => {
      el.setAttribute("contenteditable", "true");
      el.setAttribute("spellcheck", "false");
    });
  });

  // Special cases for quote box and calendar cell text
  const quoteBox = document.querySelector(".focus-quote-box");
  if (quoteBox) {
    let quoteText = quoteBox.querySelector(".quote-text-input");
    if (!quoteText) {
      quoteText = document.createElement("div");
      quoteText.className = "quote-text-input";
      quoteText.style.minHeight = "18px";
      quoteText.style.width = "100%";
      quoteText.style.marginTop = "4px";
      quoteText.setAttribute("contenteditable", "true");
      quoteText.setAttribute("spellcheck", "false");
      quoteBox.appendChild(quoteText);
    }
  }

  const calCells = document.querySelectorAll(".cal-cell");
  calCells.forEach((cell) => {
    let textDiv = cell.querySelector(".cal-cell-text");
    if (!textDiv) {
      textDiv = document.createElement("div");
      textDiv.className = "cal-cell-text";
      textDiv.style.minHeight = "35px";
      textDiv.style.width = "100%";
      textDiv.setAttribute("contenteditable", "true");
      textDiv.setAttribute("spellcheck", "false");
      cell.appendChild(textDiv);
    }
  });

  // Calculate subtotals and grand total for Expense Tracker
  function calculateExpenses() {
    if (pageId !== "expense-tracker") return;

    let grandTotal = 0;
    const sections = document.querySelectorAll(".expense-section");

    sections.forEach((section) => {
      let sectionTotal = 0;
      const amts = section.querySelectorAll(".ex-amt");

      amts.forEach((amt) => {
        const val = parseFloat(amt.textContent.replace(/[^0-9.-]/g, "")) || 0;
        sectionTotal += val;
      });

      const subtotalEl = section.querySelector(".ex-subtotal");
      if (subtotalEl) {
        subtotalEl.textContent =
          sectionTotal > 0
            ? sectionTotal % 1 === 0
              ? sectionTotal.toString()
              : sectionTotal.toFixed(2)
            : "";
      }

      grandTotal += sectionTotal;
    });

    const grandTotalEl = document.querySelector(".summary-total");
    if (grandTotalEl) {
      grandTotalEl.textContent =
        grandTotal > 0
          ? grandTotal % 1 === 0
            ? grandTotal.toString()
            : grandTotal.toFixed(2)
          : "";
    }
  }

  function debounce(func, wait) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  // Index all contenteditable elements for persistence mapping
  const editables = document.querySelectorAll('[contenteditable="true"]');
  const debouncedSaveTextData = debounce(saveTextData, 500);
  editables.forEach((el, idx) => {
    el.dataset.persistId = `editable-${idx}`;

    // Auto-save on typing (blur or input)
    el.addEventListener("input", () => {
      if (pageId === "expense-tracker" && el.classList.contains("ex-amt")) {
        calculateExpenses();
      }
      debouncedSaveTextData();
    });
  });

  // Index all click-toggleable inputs
  const togglesList = [];
  const toggleSelectors = [
    ".checkbox",
    ".selfcare-icon",
    ".done-badge",
    ".habit-check-cell",
    "tbody td:not(.habit-name-cell)",
  ];

  toggleSelectors.forEach((selector) => {
    document.querySelectorAll(selector).forEach((el) => {
      togglesList.push(el);
    });
  });

  // Audio context for satisfying pop/click sound
  let audioCtx = null;
  let lastGlobalClickSoundAt = 0;
  function playPopSound(isChecking) {
    try {
      if (!audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        audioCtx = new AudioContext();
      }
      if (audioCtx.state === "suspended") {
        audioCtx.resume();
      }

      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      osc.type = "sine";
      // Softer, gentler click profile
      const startFreq = isChecking ? 620 : 240;
      const endFreq = isChecking ? 260 : 160;
      const duration = 0.065;

      osc.frequency.setValueAtTime(startFreq, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(
        endFreq,
        audioCtx.currentTime + duration,
      );

      gainNode.gain.setValueAtTime(0.028, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        audioCtx.currentTime + duration,
      );

      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // Silently fail if audio is not supported
    }
  }

  togglesList.forEach((el, idx) => {
    el.dataset.toggleId = `toggle-${idx}`;
    el.addEventListener("click", () => {
      const isCheckboxLike =
        el.classList.contains("checkbox") ||
        el.classList.contains("habit-check-cell") ||
        el.tagName.toLowerCase() === "td";

      const currentlyChecked = el.classList.contains(
        isCheckboxLike ? "checked" : "active",
      );
      playPopSound(!currentlyChecked); // Trigger dynamic sound!
      lastGlobalClickSoundAt = Date.now();

      if (isCheckboxLike) {
        el.classList.toggle("checked");
      } else {
        el.classList.toggle("active");
      }
      saveToggleData();
    });
  });

  document.addEventListener("click", (event) => {
    const interactiveTarget = event.target.closest(
      "button, a, .month-tab, .nav-icon, .mobile-tab, .category-summary, .theme-btn, .theme-card, .pen-tool-btn, .pen-action-btn, .pen-color-btn, .pen-size-btn, .sticker-btn, .nav-link, .print-btn, select",
    );

    if (!interactiveTarget) return;
    if (Date.now() - lastGlobalClickSoundAt < 80) return;

    playPopSound(false);
    lastGlobalClickSoundAt = Date.now();
  });

  // Safe LocalStorage wrapper to handle QuotaExceeded errors safely
  function safeSetItem(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.error("Storage save failed:", e);
      if (
        e.name === "QuotaExceededError" ||
        e.name === "NS_ERROR_DOM_QUOTA_REACHED"
      ) {
        alert(
          "Planner storage is full! Please clear some drawings or old text to save new changes.",
        );
      }
    }
  }

  // Data persistence helper functions
  function saveTextData() {
    const textData = {};
    editables.forEach((el) => {
      if (el.id === "global-deadlines-list") {
        safeSetItem("planner-global-deadlines", el.innerHTML);
        return;
      }
      textData[el.dataset.persistId] = el.innerHTML;
    });
    const keys = getStorageKey("text");
    safeSetItem(keys.newKey, JSON.stringify(textData));
  }

  function saveToggleData() {
    const toggleData = {};
    togglesList.forEach((el) => {
      const isChecked =
        el.classList.contains("checked") || el.classList.contains("active");
      toggleData[el.dataset.toggleId] = isChecked;
    });
    const keys = getStorageKey("toggles");
    safeSetItem(keys.newKey, JSON.stringify(toggleData));
  }

  function loadTextData() {
    const keys = getStorageKey("text");
    let dataStr = localStorage.getItem(keys.newKey);
    if (dataStr === null && selectedYear === "2026") {
      dataStr = localStorage.getItem(keys.oldKey);
    }
    const textData = JSON.parse(dataStr || "{}");
    editables.forEach((el) => {
      if (el.id === "global-deadlines-list") {
        el.innerHTML = localStorage.getItem("planner-global-deadlines") || "";
        return;
      }
      el.innerHTML = textData[el.dataset.persistId] || "";
    });
  }

  function loadToggleData() {
    const keys = getStorageKey("toggles");
    let dataStr = localStorage.getItem(keys.newKey);
    if (dataStr === null && selectedYear === "2026") {
      dataStr = localStorage.getItem(keys.oldKey);
    }
    const toggleData = JSON.parse(dataStr || "{}");
    togglesList.forEach((el) => {
      const isChecked = !!toggleData[el.dataset.toggleId];
      const isCheckboxLike =
        el.classList.contains("checkbox") ||
        el.classList.contains("habit-check-cell") ||
        el.tagName.toLowerCase() === "td";
      if (isCheckboxLike) {
        if (isChecked) el.classList.add("checked");
        else el.classList.remove("checked");
      } else {
        if (isChecked) el.classList.add("active");
        else el.classList.remove("active");
      }
    });
  }

  function saveAllData() {
    saveTextData();
    saveToggleData();
    saveStrokes();
  }

  function loadAllData() {
    loadTextData();
    loadToggleData();
    loadStrokes();
  }

  // ── 3. Stylus Pen & Drawing Engine ──

  // Inject drawing canvas container
  const canvasContainer = document.createElement("div");
  canvasContainer.className = "canvas-container";
  const canvas = document.createElement("canvas");
  canvas.className = "canvas-overlay";
  canvasContainer.appendChild(canvas);
  pageContainer.appendChild(canvasContainer);

  const ctx = canvas.getContext("2d");
  let strokes = [];
  let isDrawing = false;
  let activeTool = "cursor"; // 'cursor', 'pen', 'eraser', 'sticker'
  let activeColor = "#2b2621"; // Default charcoal color
  let activeSize = 2; // Default size
  let currentStroke = null;
  let points = [];

  let activeEmoji = "⭐"; // Default sticker emoji
  const emojiList = [
    "⭐",
    "🌟",
    "✅",
    "✔️",
    "🎯",
    "📌",
    "📍",
    "⚠️",
    "💡",
    "🔔",
    "📅",
    "😊",
    "🤩",
    "😴",
    "🧠",
    "🚶",
    "🥑",
    "☕",
    "❤️",
    "🔥",
  ];

  // Mobile Responsiveness handler
  function handleMobileResponsiveness() {
    pageContainer.style.transform = "";
    pageContainer.style.transformOrigin = "";
    pageContainer.style.marginBottom = "";
  }

  // Initialize canvas sizing
  function resizeCanvas() {
    handleMobileResponsiveness();

    // Use offsetWidth/Height because the canvas is INSIDE the scaled container
    const width = pageContainer.offsetWidth;
    const height = pageContainer.offsetHeight;

    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    canvas.style.width = "100%";
    canvas.style.height = "100%";

    ctx.restore();
    ctx.save();
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    redraw();
  }

  window.addEventListener("resize", resizeCanvas);

  // Get pointer coordinates normalized (0 to 1) relative to display size
  function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    };
  }

  function drawSegment(p1, p2, color, size) {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctx.moveTo(
      p1.x * (canvas.width / window.devicePixelRatio),
      p1.y * (canvas.height / window.devicePixelRatio),
    );
    ctx.lineTo(
      p2.x * (canvas.width / window.devicePixelRatio),
      p2.y * (canvas.height / window.devicePixelRatio),
    );
    ctx.stroke();
  }

  function redraw() {
    ctx.clearRect(
      0,
      0,
      canvas.width / window.devicePixelRatio,
      canvas.height / window.devicePixelRatio,
    );

    strokes.forEach((stroke) => {
      if (stroke.type === "sticker") {
        ctx.font = `${stroke.size || 20}px "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const cx = stroke.x * (canvas.width / window.devicePixelRatio);
        const cy = stroke.y * (canvas.height / window.devicePixelRatio);
        ctx.fillText(stroke.emoji, cx, cy);
        return;
      }

      if (stroke.points.length < 2) return;
      ctx.beginPath();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.size;

      const p0 = stroke.points[0];
      ctx.moveTo(
        p0.x * (canvas.width / window.devicePixelRatio),
        p0.y * (canvas.height / window.devicePixelRatio),
      );

      for (let i = 1; i < stroke.points.length; i++) {
        const p = stroke.points[i];
        ctx.lineTo(
          p.x * (canvas.width / window.devicePixelRatio),
          p.y * (canvas.height / window.devicePixelRatio),
        );
      }
      ctx.stroke();
    });
  }

  function eraseAt(pos) {
    let changed = false;
    const eraserRadius = 15; // px

    for (let i = strokes.length - 1; i >= 0; i--) {
      const stroke = strokes[i];
      let collided = false;

      if (stroke.type === "sticker") {
        const dx =
          (stroke.x - pos.x) * (canvas.width / window.devicePixelRatio);
        const dy =
          (stroke.y - pos.y) * (canvas.height / window.devicePixelRatio);
        collided =
          Math.sqrt(dx * dx + dy * dy) < eraserRadius + (stroke.size || 20) / 2;
      } else {
        collided = stroke.points.some((p) => {
          const dx = (p.x - pos.x) * (canvas.width / window.devicePixelRatio);
          const dy = (p.y - pos.y) * (canvas.height / window.devicePixelRatio);
          return Math.sqrt(dx * dx + dy * dy) < eraserRadius;
        });
      }

      if (collided) {
        strokes.splice(i, 1);
        changed = true;
      }
    }

    if (changed) {
      saveStrokes();
      redraw();
    }
  }

  // Pointer event listeners for drawing
  canvas.addEventListener("pointerdown", (e) => {
    if (activeTool === "cursor") return;
    isDrawing = true;
    canvas.setPointerCapture(e.pointerId);

    const pos = getPos(e);
    points = [pos];

    if (activeTool === "eraser") {
      eraseAt(pos);
    } else if (activeTool === "sticker") {
      // Stamp selected emoji
      const normalizedX = pos.x;
      const normalizedY = pos.y;

      let emojiSize = 20;
      if (activeSize === 1.5) emojiSize = 16;
      else if (activeSize === 3.5) emojiSize = 24;
      else if (activeSize === 7.0) emojiSize = 36;

      // Check if clicking on an existing sticker to delete it
      let clickedExisting = false;
      for (let i = strokes.length - 1; i >= 0; i--) {
        const stroke = strokes[i];
        if (stroke.type === "sticker") {
          const dx =
            (stroke.x - pos.x) * (canvas.width / window.devicePixelRatio);
          const dy =
            (stroke.y - pos.y) * (canvas.height / window.devicePixelRatio);
          // Collision radius is half the emoji size
          if (Math.sqrt(dx * dx + dy * dy) < (stroke.size || 20) / 2) {
            strokes.splice(i, 1);
            clickedExisting = true;
            break; // Delete only the top one
          }
        }
      }

      if (clickedExisting) {
        saveStrokes();
        redraw();
        isDrawing = false;
        return;
      }

      const stickerStroke = {
        type: "sticker",
        x: normalizedX,
        y: normalizedY,
        emoji: activeEmoji,
        size: emojiSize,
      };
      strokes.push(stickerStroke);
      saveStrokes();
      redraw();
      isDrawing = false; // complete immediately
    } else {
      // Create new stroke
      currentStroke = {
        color: activeColor,
        size: activeSize,
        points: points,
      };
    }
  });

  canvas.addEventListener("pointermove", (e) => {
    if (!isDrawing || activeTool === "cursor" || activeTool === "sticker")
      return;
    const pos = getPos(e);

    if (activeTool === "eraser") {
      eraseAt(pos);
    } else if (currentStroke) {
      points.push(pos);
      drawSegment(points[points.length - 2], pos, activeColor, activeSize);
    }
  });

  canvas.addEventListener("pointerup", (e) => {
    if (!isDrawing) return;
    isDrawing = false;
    canvas.releasePointerCapture(e.pointerId);

    if (activeTool === "pen" && currentStroke && points.length > 1) {
      strokes.push(currentStroke);
      saveStrokes();
    }
    currentStroke = null;
    redraw();
  });

  canvas.addEventListener("pointercancel", () => {
    isDrawing = false;
    currentStroke = null;
    redraw();
  });

  function saveStrokes() {
    const keys = getStorageKey("strokes");
    safeSetItem(keys.newKey, JSON.stringify(strokes));
  }

  function loadStrokes() {
    const keys = getStorageKey("strokes");
    let dataStr = localStorage.getItem(keys.newKey);
    if (dataStr === null && selectedYear === "2026") {
      dataStr = localStorage.getItem(keys.oldKey);
    }
    strokes = JSON.parse(dataStr || "[]");
    redraw();
  }

  // ── 4. Inject Pen Toolbar ──
  function injectPenToolbar() {
    const toolbar = document.createElement("div");
    toolbar.className = "pen-toolbar";

    // Drag Handle Grip
    const dragHandle = document.createElement("div");
    dragHandle.className = "pen-toolbar-drag-handle";
    dragHandle.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><circle cx="9" cy="5" r="1.5"/><circle cx="15" cy="5" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="19" r="1.5"/><circle cx="15" cy="19" r="1.5"/></svg>`;
    toolbar.appendChild(dragHandle);

    // Toolbar toggle (Minimize/Expand)
    const minimizeBtn = document.createElement("button");
    minimizeBtn.className = "pen-toolbar-toggle";
    minimizeBtn.dataset.tooltip = "Hide Toolbar";
    minimizeBtn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M20 12H4" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`;
    const setToolbarMinimized = (isMinimized) => {
      toolbar.classList.toggle("minimized", isMinimized);
      if (toolbar.classList.contains("minimized")) {
        minimizeBtn.dataset.tooltip = "Show Toolbar";
        minimizeBtn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
        const sPanel = document.querySelector(".sticker-panel");
        if (sPanel) sPanel.style.display = "none";
      } else {
        minimizeBtn.dataset.tooltip = "Hide Toolbar";
        minimizeBtn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M20 12H4" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`;
      }
      syncMobileToolPanels();
    };

    minimizeBtn.onclick = () => {
      playPopSound(false);
      setToolbarMinimized(!toolbar.classList.contains("minimized"));
    };
    toolbar.appendChild(minimizeBtn);

    // 1. Tool Selection
    const toolsRow = document.createElement("div");
    toolsRow.className = "pen-toolbar-row";
    const labelTools = document.createElement("span");
    labelTools.className = "pen-toolbar-label";
    labelTools.innerText = "Tool";
    toolsRow.appendChild(labelTools);

    // Cursor (Type)
    const btnCursor = document.createElement("button");
    btnCursor.className = "pen-tool-btn active";
    btnCursor.dataset.tooltip = "Type Mode (Cursor)";
    btnCursor.innerHTML = `<svg viewBox="0 0 24 24"><path d="M22 14.86l-7.72 7.72a2.38 2.38 0 01-3.37 0l-7.72-7.72a2.38 2.38 0 010-3.37L10.91 3.77a2.38 2.38 0 013.37 0L22 11.49a2.38 2.38 0 010 3.37zM6 13h12M12 7v10" stroke="currentColor"/></svg>`;
    btnCursor.onclick = () => {
      playPopSound(true);
      setTool("cursor");
    };
    toolsRow.appendChild(btnCursor);

    // Pen
    const btnPen = document.createElement("button");
    btnPen.className = "pen-tool-btn";
    btnPen.dataset.tooltip = "Pen Mode";
    btnPen.innerHTML = `<svg viewBox="0 0 24 24"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" stroke="currentColor"/></svg>`;
    btnPen.onclick = () => {
      playPopSound(true);
      setTool("pen");
    };
    toolsRow.appendChild(btnPen);

    // Eraser
    const btnEraser = document.createElement("button");
    btnEraser.className = "pen-tool-btn";
    btnEraser.dataset.tooltip = "Eraser Mode";
    btnEraser.innerHTML = `<svg viewBox="0 0 24 24"><path d="M20 20H7L3 16c-1.5-1.5-1.5-3.5 0-5l8.5-8.5c1.5-1.5 3.5-1.5 5 0l4.5 4.5c1.5 1.5 1.5 3.5 0 5L13 20" stroke="currentColor"/></svg>`;
    btnEraser.onclick = () => {
      playPopSound(true);
      setTool("eraser");
    };
    toolsRow.appendChild(btnEraser);

    // Sticker (Emoji Stamp)
    const btnSticker = document.createElement("button");
    btnSticker.className = "pen-tool-btn";
    btnSticker.dataset.tooltip = "Stickers / Emojis";
    btnSticker.innerHTML = `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" stroke="currentColor" stroke-linecap="round"/></svg>`;
    btnSticker.onclick = () => {
      playPopSound(true);
      setTool("sticker");
    };
    toolsRow.appendChild(btnSticker);

    toolbar.appendChild(toolsRow);

    // Inject Sticker subpanel to the body next to the toolbar
    const stickerPanel = document.createElement("div");
    stickerPanel.className = "sticker-panel";

    const labelStickers = document.createElement("span");
    labelStickers.className = "pen-toolbar-label";
    labelStickers.innerText = "Emojis";
    stickerPanel.appendChild(labelStickers);

    const stickerGrid = document.createElement("div");
    stickerGrid.className = "sticker-grid";

    emojiList.forEach((emoji) => {
      const emojiBtn = document.createElement("button");
      emojiBtn.className = "sticker-btn";
      emojiBtn.innerText = emoji;
      emojiBtn.dataset.tooltip = `Stamp ${emoji}`;
      if (emoji === activeEmoji) emojiBtn.classList.add("active");

      emojiBtn.onclick = () => {
        playPopSound(true);
        document
          .querySelectorAll(".sticker-btn")
          .forEach((b) => b.classList.remove("active"));
        emojiBtn.classList.add("active");
        activeEmoji = emoji;
        setTool("sticker");
      };
      stickerGrid.appendChild(emojiBtn);
    });

    // Add "Clear All Emojis" button
    const clearEmojisBtn = document.createElement("button");
    clearEmojisBtn.className = "sticker-btn clear-emojis-btn";
    clearEmojisBtn.style.gridColumn = "span 4";
    clearEmojisBtn.style.width = "100%";
    clearEmojisBtn.style.marginTop = "4px";
    clearEmojisBtn.style.padding = "4px 0";
    clearEmojisBtn.style.fontSize = "9px";
    clearEmojisBtn.style.fontWeight = "700";
    clearEmojisBtn.style.textTransform = "uppercase";
    clearEmojisBtn.style.color = "#ff4d6d";
    clearEmojisBtn.style.background = "rgba(255, 77, 109, 0.1)";
    clearEmojisBtn.style.border = "1px solid rgba(255, 77, 109, 0.2)";
    clearEmojisBtn.innerText = "🗑️ Clear All Emojis";
    clearEmojisBtn.dataset.tooltip = "Clear All Emojis";
    clearEmojisBtn.onclick = () => {
      playPopSound(false);
      if (confirm("Remove all emojis from this page?")) {
        strokes = strokes.filter((s) => s.type !== "sticker");
        saveStrokes();
        redraw();
      }
    };
    stickerGrid.appendChild(clearEmojisBtn);

    stickerPanel.appendChild(stickerGrid);
    document.body.appendChild(stickerPanel);

    const mobileQuery = window.matchMedia("(max-width: 860px)");
    const syncMobileToolPanels = (panel = null) => {
      const activePanel =
        panel ||
        (document.body.classList.contains("mobile-themes-active")
          ? "themes"
          : "tools");
      const showTools = !mobileQuery.matches || activePanel === "tools";
      toolbar.style.display = showTools ? "flex" : "none";
      if (stickerPanel) {
        const stickerActive =
          stickerPanel.classList.contains("active") &&
          showTools &&
          activeTool === "sticker";
        stickerPanel.style.display = stickerActive ? "flex" : "none";
      }
    };

    document.addEventListener("mobileSwitcherTabChanged", (event) => {
      syncMobileToolPanels(event.detail?.panel);
    });

    mobileQuery.addEventListener("change", () => syncMobileToolPanels());

    // 2. Colors Selection
    const colorsRow = document.createElement("div");
    colorsRow.className = "pen-toolbar-row";
    const labelColors = document.createElement("span");
    labelColors.className = "pen-toolbar-label";
    labelColors.innerText = "Color";
    colorsRow.appendChild(labelColors);

    const colorsGrid = document.createElement("div");
    colorsGrid.className = "pen-colors-grid";

    // Set theme accent color dynamically
    const themeAccent =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--accent-1")
        .trim() || "#3a86ff";

    const colors = [
      { hex: "#2b2621", name: "Charcoal" },
      { hex: "#1e3a8a", name: "Midnight" },
      { hex: "#ef4444", name: "Red" },
      { hex: "#10b981", name: "Emerald" },
      { hex: themeAccent, name: "Accent", custom: true },
    ];

    colors.forEach((c) => {
      const colorBtn = document.createElement("button");
      colorBtn.className = "pen-color-btn";
      if (c.hex === activeColor) colorBtn.classList.add("active");
      colorBtn.style.backgroundColor = c.hex;
      colorBtn.dataset.tooltip = c.name;

      // Update accent color if theme dynamically switches in the switcher
      if (c.custom) {
        document.addEventListener("themeChanged", (e) => {
          const newAccent = getComputedStyle(document.documentElement)
            .getPropertyValue("--accent-1")
            .trim();
          if (newAccent) {
            colorBtn.style.backgroundColor = newAccent;
            c.hex = newAccent;
            if (colorBtn.classList.contains("active")) {
              activeColor = newAccent;
            }
          }
        });
      }

      colorBtn.onpointerdown = (e) => e.preventDefault(); // keep text selected
      colorBtn.onclick = () => {
        playPopSound(true);
        document
          .querySelectorAll(".pen-color-btn")
          .forEach((b) => b.classList.remove("active"));
        colorBtn.classList.add("active");
        activeColor = c.hex;

        if (activeTool === "cursor") {
          // Format highlighted text using CSS spans to prevent theme overrides
          document.execCommand("styleWithCSS", false, true);
          document.execCommand("foreColor", false, c.hex);
        } else {
          setTool("pen"); // Force switch to pen mode if coloring
        }
      };
      colorsGrid.appendChild(colorBtn);
    });
    colorsRow.appendChild(colorsGrid);
    toolbar.appendChild(colorsRow);

    // 3. Size selection
    const sizeRow = document.createElement("div");
    sizeRow.className = "pen-toolbar-row";
    const labelSize = document.createElement("span");
    labelSize.className = "pen-toolbar-label";
    labelSize.innerText = "Size";
    sizeRow.appendChild(labelSize);

    const sizesCol = document.createElement("div");
    sizesCol.className = "pen-sizes-col";

    const sizes = [
      { val: 1.5, label: "Thn" },
      { val: 3.5, label: "Med" },
      { val: 7.0, label: "Bld" },
    ];

    sizes.forEach((s) => {
      const sizeBtn = document.createElement("button");
      sizeBtn.className = "pen-size-btn";
      if (s.val === activeSize) sizeBtn.classList.add("active");
      sizeBtn.innerText = s.label;
      sizeBtn.onpointerdown = (e) => e.preventDefault(); // keep text selected
      sizeBtn.onclick = () => {
        playPopSound(true);
        document
          .querySelectorAll(".pen-size-btn")
          .forEach((b) => b.classList.remove("active"));
        sizeBtn.classList.add("active");
        activeSize = s.val;

        if (activeTool === "cursor") {
          // Use CSS for precise font sizing
          document.execCommand("styleWithCSS", false, true);

          let htmlSize = 3;
          if (s.label === "Thn") htmlSize = 2; // ~13px
          if (s.label === "Med") htmlSize = 3; // ~16px (fits standard planner lines perfectly)
          if (s.label === "Bld") htmlSize = 5; // ~24px (for large headers)
          document.execCommand("fontSize", false, htmlSize);
        } else {
          setTool("pen"); // Force pen mode
        }
      };
      sizesCol.appendChild(sizeBtn);
    });
    sizeRow.appendChild(sizesCol);
    toolbar.appendChild(sizeRow);

    // 4. Actions
    const actionsRow = document.createElement("div");
    actionsRow.className = "pen-toolbar-row";
    const labelActions = document.createElement("span");
    labelActions.className = "pen-toolbar-label";
    labelActions.innerText = "Action";
    actionsRow.appendChild(labelActions);

    // Undo
    const btnUndo = document.createElement("button");
    btnUndo.className = "pen-action-btn";
    btnUndo.dataset.tooltip = "Undo Stroke";
    btnUndo.innerHTML = `<svg viewBox="0 0 24 24"><path d="M9 14L4 9l5-5M4 9h10a5 5 0 015 5v2" stroke="currentColor"/></svg>`;
    btnUndo.onclick = () => {
      playPopSound(false);
      if (strokes.length > 0) {
        strokes.pop();
        saveStrokes();
        redraw();
      }
    };
    actionsRow.appendChild(btnUndo);

    // Clear Page
    const btnClear = document.createElement("button");
    btnClear.className = "pen-action-btn clear-btn";
    btnClear.dataset.tooltip = "Clear Page";
    btnClear.innerHTML = `<svg viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke="currentColor"/></svg>`;
    btnClear.onclick = () => {
      playPopSound(false);
      if (confirm("Clear all drawings on this page?")) {
        strokes = [];
        saveStrokes();
        redraw();
      }
    };
    actionsRow.appendChild(btnClear);

    toolbar.appendChild(actionsRow);

    document.body.appendChild(toolbar);

    // Make toolbar draggable
    let isDragging = false;
    let dragOffsetX = 0;
    let dragOffsetY = 0;

    toolbar.addEventListener("pointerdown", (e) => {
      // Don't drag if clicking a button or color circle
      if (e.target.closest("button") || e.target.closest(".pen-color-btn"))
        return;

      isDragging = true;
      toolbar.setPointerCapture(e.pointerId);
      const rect = toolbar.getBoundingClientRect();
      dragOffsetX = e.clientX - rect.left;
      dragOffsetY = e.clientY - rect.top;
    });

    toolbar.addEventListener("pointermove", (e) => {
      if (!isDragging) return;
      const x = e.clientX - dragOffsetX;
      const y = e.clientY - dragOffsetY;
      toolbar.style.left = `${x}px`;
      toolbar.style.top = `${y}px`;
      toolbar.style.bottom = "auto";
      toolbar.style.right = "auto";

      // Also move the sticker panel alongside it
      if (stickerPanel) {
        stickerPanel.style.left = `${x + 60}px`;
        stickerPanel.style.top = `${y}px`;
      }
    });

    toolbar.addEventListener("pointerup", (e) => {
      isDragging = false;
      toolbar.releasePointerCapture(e.pointerId);
    });

    // Mode helper
    function setTool(toolName) {
      activeTool = toolName;
      document
        .querySelectorAll(".pen-tool-btn")
        .forEach((btn) => btn.classList.remove("active"));

      // Toggle sticker panel active class
      if (stickerPanel) {
        if (toolName === "sticker") stickerPanel.classList.add("active");
        else stickerPanel.classList.remove("active");
      }

      syncMobileToolPanels();

      if (toolName === "cursor") {
        btnCursor.classList.add("active");
        canvasContainer.classList.remove("drawing-active");
      } else {
        canvasContainer.classList.add("drawing-active");
        if (toolName === "pen") btnPen.classList.add("active");
        if (toolName === "eraser") btnEraser.classList.add("active");
        if (toolName === "sticker") btnSticker.classList.add("active");
      }
    }

    setToolbarMinimized(true);
    syncMobileToolPanels();
  }

  // ── 5. Dynamic Topographic Background Generator ──
  function updateThemeSpecificBackground() {
    const page = document.querySelector(".planner-page");
    if (!page) return;

    // Get the computed primary accent color from CSS variables
    const style = getComputedStyle(document.body);
    const accentColor =
      style.getPropertyValue("--accent-1").trim() || "#7c6fa0";

    // SVG topographic pattern using the theme-specific accent color
    const svgPattern = `
<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'>
  <g fill='none' stroke='${accentColor}' stroke-width='1.2' opacity='0.08'>
    <!-- Top-Left Corner Waves -->
    <path d='M-50,50 Q20,30 30,120 T150,150 T200,300' />
    <path d='M-50,90 Q40,70 50,160 T190,190 T240,340' />
    <path d='M-50,130 Q60,110 70,200 T230,230 T280,380' />
    <path d='M-50,170 Q80,150 90,240 T270,270 T320,420' />

    <!-- Concentric Center Island -->
    <path d='M180,180 C190,150 230,150 240,180 C250,210 210,240 180,220 C160,200 170,210 180,180 Z' />
    <path d='M160,170 C180,120 250,120 270,170 C290,220 230,270 190,240 C150,210 140,220 160,170 Z' />
    <path d='M140,160 C170,90 270,90 300,160 C330,230 250,300 200,260 C150,220 110,230 140,160 Z' />
    <path d='M120,150 C160,60 290,60 330,150 C370,240 270,330 210,280 C150,230 80,240 120,150 Z' />

    <!-- Bottom-Left / Top-Right Waves -->
    <path d='M300,-50 Q280,20 370,30 T400,150' />
    <path d='M260,-50 Q240,40 330,50 T380,190' />
    <path d='M220,-50 Q200,60 290,70 T340,230' />

    <!-- Bottom-Right Corner Waves -->
    <path d='M200,450 Q300,350 320,280 T450,200' />
    <path d='M240,450 Q330,370 350,310 T450,240' />
    <path d='M280,450 Q360,390 380,340 T450,280' />

    <!-- Random Organic Ridge Lines for Texture -->
    <path d='M-20,300 C50,280 80,330 120,310 C160,290 200,350 250,320' />
    <path d='M-20,340 C50,320 80,370 120,350 C160,330 200,390 250,360' />
    <path d='M150,50 C220,30 240,80 290,60 C340,40 360,100 420,80' />
    <path d='M130,90 C200,70 220,120 270,100 C320,80 340,140 400,120' />
  </g>
</svg>
`;

    // Convert SVG to data URI
    const svgBase64 = btoa(svgPattern.trim());
    const dataUri = `url("data:image/svg+xml;base64,${svgBase64}")`;

    // Set variable --bg-pattern on body so it propagates to .planner-page
    document.body.style.setProperty("--bg-pattern", dataUri);
  }

  // Update background pattern on theme change
  document.addEventListener("themeChanged", () => {
    setTimeout(updateThemeSpecificBackground, 50);
  });

  // ── 6. Page Load and Initialize ──
  setupResponsiveNavigation();
  updateActiveMonthTab();
  updateMonthLabels();
  setupMonthlyCalendar();
  loadAllData();
  updateAllDateDisplays();
  updateThemeSpecificBackground();

  // Sizing Canvas delay to ensure page sizing has finished rendering
  setTimeout(() => {
    resizeCanvas();
  }, 100);

  injectPenToolbar();
});
