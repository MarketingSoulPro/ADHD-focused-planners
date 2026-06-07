/* ====================================================
   ADHD-Focused Printable Planner — Dynamic Theme Switcher
   ==================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const themes = [
    { id: 'blush-calligraphy', name: 'Blush Calligraphy', category: 'Feminine' },
    { id: 'watercolor-florals', name: 'Watercolor Florals', category: 'Feminine' },
    { id: 'botanical-garden', name: 'Botanical Garden', category: 'Feminine' },
    { id: 'rose-gold-abstract', name: 'Rose Gold Abstract', category: 'Feminine' },

    { id: 'dark-slate', name: 'Dark Slate', category: 'Masculine' },
    { id: 'midnight-blueprint', name: 'Midnight Blueprint', category: 'Masculine' },
    { id: 'carbon-fiber', name: 'Carbon Fiber', category: 'Masculine' },
    { id: 'concrete-industrial', name: 'Concrete Industrial', category: 'Masculine' },

    { id: 'abstract-brushstrokes', name: 'Abstract Brushstrokes', category: 'Universal' },
    { id: 'geometric-zen', name: 'Geometric Zen', category: 'Universal' },
    { id: 'sunset-gradient', name: 'Sunset Gradient', category: 'Universal' },
    { id: 'classic-calligraphy', name: 'Classic Calligraphy', category: 'Universal' }
  ];

  // Get current active theme or default to first
  let activeTheme = localStorage.getItem('selected-theme') || 'blush-calligraphy';

  // Set body class
  setTheme(activeTheme);

  // If switcher container doesn't exist, create it
  if (!document.querySelector('.theme-switcher')) {
    injectSwitcher();
  }

  function setTheme(themeId) {
    // Remove any previous theme class
    themes.forEach(t => {
      document.body.classList.remove(`theme-${t.id}`);
    });
    // Add new theme class
    document.body.classList.add(`theme-${themeId}`);
    localStorage.setItem('selected-theme', themeId);
    activeTheme = themeId;

    // Update button states
    document.querySelectorAll('.theme-btn').forEach(btn => {
      if (btn.dataset.theme === themeId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Fire custom event so pages can respond if they need to update styling dynamically
    const event = new CustomEvent('themeChanged', { detail: { theme: themeId } });
    document.dispatchEvent(event);
  }

  function injectSwitcher() {
    const switcher = document.createElement('div');
    switcher.className = 'theme-switcher';

    // Style the switcher bar to look modern and premium
    const style = document.createElement('style');
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
        gap: 12px;
        padding: 12px 20px;
        width: 100%;
      }
      .category-card {
        flex: 1 1 calc(30% - 12px);
        min-width: 160px;
        max-width: 200px;
        border-radius: 18px;
        overflow: hidden;
        background: rgba(18, 20, 30, 0.95);
        border: 1px solid rgba(255, 255, 255, 0.08);
        box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.03);
      }
      .category-card summary {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 14px 16px;
        cursor: pointer;
        background: rgba(255, 255, 255, 0.04);
        list-style: none;
        font-size: 12px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 1px;
        color: #f5f5f7;
      }
      .category-card summary::-webkit-details-marker {
        display: none;
      }
      .category-card summary::after {
        content: '⌄';
        font-size: 12px;
        color: #a8a8b8;
        transform: rotate(0deg);
        transition: transform 0.2s ease;
      }
      .category-card[open] summary::after {
        transform: rotate(180deg);
      }
      .category-note {
        font-size: 10px;
        color: #9fa0b3;
      }
      .category-content {
        display: none;
        flex-wrap: wrap;
        gap: 8px;
        justify-content: center;
        padding: 12px 16px 16px;
      }
      .category-card[open] .category-content {
        display: flex;
      }
      .theme-category {
        display: none;
      }
      .theme-btn {
        padding: 6px 12px;
        border-radius: 999px;
        font-size: 10px;
        font-weight: 500;
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
          padding: 10px 16px;
          gap: 10px;
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
    const categories = ['Feminine', 'Masculine', 'Universal'];

    // Create Top, Middle and Bottom containers
    const switcherTop = document.createElement('div');
    switcherTop.className = 'switcher-top';
    const switcherMiddle = document.createElement('div');
    switcherMiddle.className = 'switcher-middle';
    const switcherBottom = document.createElement('div');
    switcherBottom.className = 'switcher-bottom';

    // Label for desktop
    const switcherLabel = document.createElement('span');
    switcherLabel.className = 'theme-switcher-label';
    switcherLabel.innerText = 'Buddy ADHD Themes:';

    // Add navigation and print buttons
    const navDiv = document.createElement('div');
    navDiv.className = 'nav-links';

    const indexLink = document.createElement('a');
    indexLink.className = 'nav-link';
    indexLink.href = '../index.html';
    indexLink.innerText = 'Dashboard';
    navDiv.appendChild(indexLink);

    const prBtn = document.createElement('button');
    prBtn.className = 'print-btn';
    prBtn.innerText = 'Print Page';
    prBtn.onclick = () => window.print();
    navDiv.appendChild(prBtn);

    switcherTop.appendChild(navDiv);

    // Mobile-only subtitle and tabs
    const switcherSubLabel = document.createElement('span');
    switcherSubLabel.className = 'theme-switcher-subtitle';
    switcherSubLabel.innerText = 'Buddy ADHD Themes:';
    const mobileTabRow = document.createElement('div');
    mobileTabRow.className = 'mobile-tab-row';

    const toolsTab = document.createElement('button');
    toolsTab.className = 'mobile-tab active';
    toolsTab.type = 'button';
    toolsTab.innerText = 'Tools';

    const themeTab = document.createElement('button');
    themeTab.className = 'mobile-tab';
    themeTab.type = 'button';
    themeTab.innerText = 'Theme';

    mobileTabRow.appendChild(toolsTab);
    mobileTabRow.appendChild(themeTab);
    switcherMiddle.appendChild(switcherSubLabel);
    switcherMiddle.appendChild(mobileTabRow);

    // Add heading to switcherBottom before categories
    switcherBottom.appendChild(switcherLabel);

    categories.forEach(cat => {
      const card = document.createElement('details');
      card.className = 'category-card';

      const summary = document.createElement('summary');
      summary.innerText = cat;

      const note = document.createElement('span');
      note.className = 'category-note';
      note.innerText = `${themes.filter(t => t.category === cat).length} themes`;
      summary.appendChild(note);

      const content = document.createElement('div');
      content.className = 'category-content';

      themes.filter(t => t.category === cat).forEach(t => {
        const btn = document.createElement('button');
        btn.className = 'theme-btn';
        btn.dataset.theme = t.id;
        btn.innerText = t.name;
        if (t.id === activeTheme) btn.classList.add('active');

        btn.addEventListener('click', () => setTheme(t.id));
        content.appendChild(btn);
      });

      const closeOtherCategories = () => {
        switcherBottom.querySelectorAll('details.category-card').forEach(otherCard => {
          if (otherCard !== card) {
            otherCard.open = false;
          }
        });
      };

      card.appendChild(summary);
      card.appendChild(content);
      switcherBottom.appendChild(card);
    });

    switcherBottom.addEventListener('toggle', event => {
      const opened = event.target.closest('details.category-card');
      if (!opened || !opened.open) return;
      switcherBottom.querySelectorAll('details.category-card').forEach(otherCard => {
        if (otherCard !== opened) {
          otherCard.open = false;
        }
      });
    });

    switcher.appendChild(switcherTop);
    switcher.appendChild(switcherMiddle);
    switcher.appendChild(switcherBottom);

    // Inject switcher at the very top of body
    document.body.insertBefore(switcher, document.body.firstChild);

    // Add top padding to body to compensate for fixed/sticky switcher
    document.body.style.paddingTop = '0px';
  }
});
