/**
 * Buddy ADHD Planner — ⚡ I'M STUCK (Emergency Dopamine Button)
 * Helps users break executive dysfunction and analysis paralysis.
 */

(function () {
  const defaultSuggestions = [
    "Drink a glass of water 💧",
    "Wash your face with cool water 💦",
    "Take 5 slow, deep breaths 🌬️",
    "Stretch for 2 minutes 🙆",
    "Roll your shoulders 10 times 🔄",
    "Stand up and shake out your arms and legs 🕺",
    "Eat a healthy snack 🍎",
    "Make a cup of tea or coffee ☕",
    "Step into fresh air for 2 minutes 🌿",
    "Open a window and take a few deep breaths 🪟",
    "Set a 5-minute timer ⏱️",
    "Work for just 2 minutes ⏳",
    "Open the task you've been avoiding 📂",
    "Write the very first sentence ✍️",
    "Break your task into three smaller steps 📋",
    "Delete one old email 📧",
    "Reply to one message 💬",
    "Put one item back where it belongs 📦",
    "Clear your desk for 2 minutes 🧹",
    "Close unnecessary browser tabs 🖥️",
    "Listen to your favorite song 🎵",
    "Dance to one song 💃",
    "Watch a funny 2-minute video 😂",
    "Read an inspiring quote 🌟",
    "Look at photos that make you smile 📸",
    "Play with your pet 🐶🐱",
    "Hug someone or cuddle a pet 🤗",
    "Light a scented candle 🕯️",
    "Diffuse your favorite essential oil 🌸",
    "Enjoy a piece of chocolate 🍫",
    "Do a quick brain dump 📝",
    "Write down what's blocking you 🤔",
    "Cross off one completed task ✅",
    "Pick the easiest task first 🎯",
    "Change your workspace 🪑",
    "Switch to a different task for 10 minutes 🔄",
    "Write one thing you're grateful for 🙏",
    "Visualize finishing your task 🌈",
    "Review today's priorities 📌",
    "Ask yourself: \"What's the next tiny step?\" ❓",
    "Do 10 jumping jacks 🤸",
    "Walk around the room 🚶",
    "Walk outside for 2 minutes 🌳",
    "Do 10 squats 🏋️",
    "Climb a flight of stairs 🪜",
    "Do a quick yoga stretch 🧘",
    "Stretch your neck and wrists 🤲",
    "Toss a ball or fidget for 2 minutes 🎾",
    "March in place for 1 minute 🚶‍♂️",
    "Take a brisk walk around the house 🏡",
    "Tell yourself, \"Progress over perfection.\" 💙",
    "Celebrate one thing you've already done 🎉",
    "Put your phone on Do Not Disturb 📵",
    "Turn on focus music 🎧",
    "Silence unnecessary notifications 🔕",
    "Tidy one small area 🧺",
    "Water a plant 🌱",
    "Change into comfortable clothes 👕",
    "Sit in sunlight for a few minutes ☀️",
    "Smile—you've already started. 😊",
    "Flip a coin: Heads = Start now, Tails = 2-minute break 🪙",
    "Pick one task without overthinking 🎯",
    "Move for one minute, then come back 🏃",
    "Count backward from 20 🔢",
    "High-five yourself ✋",
    "Play one focus song 🎶",
    "Write one word related to your task ✏️",
    "Stand while working for 5 minutes 🧍",
    "Turn on Focus Mode 🖥️",
    "Start before you feel ready 🚀"
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
            div.textContent = val;
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
      return defaultSuggestions[Math.floor(Math.random() * defaultSuggestions.length)];
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
