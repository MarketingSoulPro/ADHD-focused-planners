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
        justify-content: space-between;
        align-items: center;
        padding: 10px 24px;
        border-bottom: 1px solid rgba(255,255,255,0.05);
        width: 100%;
      }
      .switcher-bottom {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 15px;
        padding: 12px 20px;
        width: 100%;
      }
      .theme-category {
        display: flex;
        align-items: center;
        gap: 8px;
        background: #1a1a24;
        padding: 4px 10px;
        border-radius: 20px;
        border: 1px solid #2d2d3d;
      }
      .theme-cat-label {
        font-size: 9px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 1px;
        color: #8c8c9e;
        margin-right: 4px;
      }
      .theme-btn {
        padding: 4px 10px;
        border-radius: 12px;
        font-size: 10px;
        font-weight: 500;
        border: 1px solid transparent;
        background: transparent;
        color: #c0c0d0;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      .theme-btn:hover {
        background: rgba(255,255,255,0.05);
        color: #fff;
      }
      .theme-btn.active {
        background: #fff;
        color: #111116;
        font-weight: 600;
      }
      .nav-links {
        display: flex;
        gap: 10px;
        align-items: center;
      }
      .nav-link {
        font-size: 10px;
        font-weight: 600;
        text-transform: uppercase;
        color: #3a86ff;
        text-decoration: none;
        padding: 4px 8px;
        border-radius: 4px;
        background: rgba(58, 134, 255, 0.1);
        transition: background 0.2s;
      }
      .nav-link:hover {
        background: rgba(58, 134, 255, 0.2);
      }
      .print-btn {
        background: #ff006e;
        color: #fff;
        font-size: 10px;
        font-weight: 700;
        border: none;
        padding: 5px 12px;
        border-radius: 4px;
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
          gap: 10px;
          padding: 10px;
        }
        .switcher-bottom {
          padding: 8px 10px;
          gap: 8px;
        }
        .theme-category {
          flex-wrap: wrap;
          justify-content: center;
        }
        .theme-switcher-label {
          margin-bottom: 4px;
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

    // Create Top and Bottom containers
    const switcherTop = document.createElement('div');
    switcherTop.className = 'switcher-top';
    const switcherBottom = document.createElement('div');
    switcherBottom.className = 'switcher-bottom';

    // Label for switcher
    const switcherLabel = document.createElement('span');
    switcherLabel.style.color = '#fff';
    switcherLabel.style.fontSize = '12px';
    switcherLabel.style.fontWeight = '800';
    switcherLabel.style.textTransform = 'uppercase';
    switcherLabel.style.letterSpacing = '1.5px';
    switcherLabel.innerText = 'Buddy ADHD Themes:';
    switcherTop.appendChild(switcherLabel);

    categories.forEach(cat => {
      const catDiv = document.createElement('div');
      catDiv.className = 'theme-category';

      const catLabel = document.createElement('span');
      catLabel.className = 'theme-cat-label';
      catLabel.innerText = cat;
      catDiv.appendChild(catLabel);

      themes.filter(t => t.category === cat).forEach(t => {
        const btn = document.createElement('button');
        btn.className = 'theme-btn';
        btn.dataset.theme = t.id;
        btn.innerText = t.name;
        if (t.id === activeTheme) btn.classList.add('active');

        btn.addEventListener('click', () => setTheme(t.id));
        catDiv.appendChild(btn);
      });

      switcherBottom.appendChild(catDiv);
    });

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

    switcher.appendChild(switcherTop);
    switcher.appendChild(switcherBottom);

    // Inject switcher at the very top of body
    document.body.insertBefore(switcher, document.body.firstChild);

    // Add top padding to body to compensate for fixed/sticky switcher
    document.body.style.paddingTop = '0px';
  }
});
