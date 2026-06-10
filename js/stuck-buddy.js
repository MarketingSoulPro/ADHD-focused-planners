/**
 * Buddy ADHD Planner — ⚡ I'M STUCK (Emergency Dopamine Button)
 * Helps users break executive dysfunction and analysis paralysis.
 */

(function () {
  const defaultSuggestions = [
    "Drink a glass of cold water 💧",
    "Step outside for 2 minutes ☀️",
    "Listen to one favorite song 🎵",
    "Do 10 jumping jacks 🤸",
    "Stretch your neck and shoulders 🧘",
    "Pet your pet or look at a cute animal 🐾",
    "Clean your desk for exactly 2 minutes 🧹",
    "Take 5 deep, slow breaths 🌬️",
    "Make a fresh cup of tea or coffee ☕",
    "Write down just ONE tiny thing to do 📝",
    "Stand up and do a 30-second silly dance 💃",
    "Eat a high-protein snack 🥜",
  ];

  const affirmations = [
    "Small actions create momentum.",
    "Action is the antidote to anxiety.",
    "Done is better than perfect.",
    "You don't have to see the whole staircase, just the first step.",
    "Be gentle with yourself. You're doing your best.",
    "One tiny win is still a win.",
  ];

  function getUserDopamineItems() {
    const items = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.includes("planner-text-dopamine-menu")) {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          Object.values(data).forEach((val) => {
            const div = document.createElement("div");
            div.innerHTML = val;
            const text = div.textContent || div.innerText || "";
            const lines = text
              .split(/\n/)
              .map((s) => s.trim())
              .filter((s) => s.length > 5);
            items.push(...lines);
          });
        } catch (e) {}
      }
    }
    return items.length > 0 ? items : null;
  }

  function createStuckUI() {
    // 1. Create Modal
    const modalOverlay = document.createElement("div");
    modalOverlay.className = "stuck-modal-overlay";
    modalOverlay.innerHTML = `
      <div class="stuck-modal">
        <div class="stuck-modal-header-container">
          <span class="stuck-sparkle-icon">✨</span>
          <h2 class="stuck-modal-title">Buddy Suggests</h2>
        </div>
        <p class="stuck-modal-subtitle">Small steps break the freeze.</p>
        <div class="stuck-suggestion-box">
          <div class="stuck-suggestion-text" id="stuck-text"></div>
        </div>
        <div class="stuck-modal-actions">
          <button class="stuck-action-btn stuck-another-btn" id="stuck-another">🔄 Another Idea</button>
          <button class="stuck-action-btn stuck-done-btn" id="stuck-done">✅ I'll Do This!</button>
        </div>
        <p class="stuck-affirmation" id="stuck-affirmation"></p>
      </div>
    `;
    document.body.appendChild(modalOverlay);

    const stuckText = modalOverlay.querySelector("#stuck-text");
    const stuckAffirmation = modalOverlay.querySelector("#stuck-affirmation");
    const anotherBtn = modalOverlay.querySelector("#stuck-another");
    const doneBtn = modalOverlay.querySelector("#stuck-done");

    function getRandomSuggestion() {
      const userItems = getUserDopamineItems();
      const source = userItems || defaultSuggestions;
      return source[Math.floor(Math.random() * source.length)];
    }

    function showNewSuggestion() {
      stuckText.classList.add("shuffling");
      stuckText.innerText = "Choosing...";

      // Try to reuse global sound if available
      if (window.playPopSound) {
        window.playPopSound(false);
      }

      setTimeout(() => {
        stuckText.classList.remove("shuffling");
        stuckText.innerText = getRandomSuggestion();
        stuckAffirmation.innerText =
          affirmations[Math.floor(Math.random() * affirmations.length)];
      }, 600);
    }

    anotherBtn.onclick = (e) => {
      e.stopPropagation();
      showNewSuggestion();
    };

    doneBtn.onclick = (e) => {
      e.stopPropagation();
      if (window.playPopSound) window.playPopSound(true);
      modalOverlay.classList.remove("active");
    };

    modalOverlay.onclick = () => modalOverlay.classList.remove("active");
    modalOverlay.querySelector(".stuck-modal").onclick = (e) =>
      e.stopPropagation();

    // 2. Create Float Button
    const stuckBtn = document.createElement("button");
    stuckBtn.className = "stuck-btn";
    stuckBtn.innerHTML = `<span>⚡</span> I'M STUCK`;
    stuckBtn.onclick = () => {
      modalOverlay.classList.add("active");
      showNewSuggestion();
    };
    document.body.appendChild(stuckBtn);
  }

  // Initialize
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", createStuckUI);
  } else {
    createStuckUI();
  }
})();
