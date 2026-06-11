// Backup Manager: app-level persistence, backups, import/export, autosave
(function () {
  const STORAGE_SNAPSHOT_KEY = 'plannerBackupSnapshot';
  const BACKUP_LIST_KEY = 'plannerBackupSnapshots';
  const AUTO_SAVE_DELAY = 600;
  const IGNORED_KEYS = [
    STORAGE_SNAPSHOT_KEY,
    BACKUP_LIST_KEY,
    'dopamineMenuBackups',
    'dopamineMenuData',
  ];
  let saveTimer = null;

  function safeSetItem(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.error('Backup storage save failed:', e);
    }
  }

  function getSnapshot() {
    const snapshot = {};
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (!key || IGNORED_KEYS.includes(key)) continue;
      const value = localStorage.getItem(key);
      if (value !== null) snapshot[key] = value;
    }
    return snapshot;
  }

  function restoreSnapshot(snapshot) {
    if (!snapshot || typeof snapshot !== 'object') return;
    Object.keys(snapshot).forEach((key) => {
      if (!key || IGNORED_KEYS.includes(key)) return;
      localStorage.setItem(key, snapshot[key]);
    });
  }

  function saveAll() {
    const snapshot = getSnapshot();
    safeSetItem(STORAGE_SNAPSHOT_KEY, JSON.stringify(snapshot));
  }

  function loadAll() {
    // No fields are expected on the landing page, but keep compatibility
    // with page-level calls and preserve the last snapshot if present.
    const raw = localStorage.getItem(STORAGE_SNAPSHOT_KEY);
    if (!raw) return;
    try {
      const snapshot = JSON.parse(raw);
      if (snapshot && typeof snapshot === 'object') {
        Object.keys(snapshot).forEach((key) => {
          if (!key || IGNORED_KEYS.includes(key)) return;
          if (localStorage.getItem(key) === null) {
            localStorage.setItem(key, snapshot[key]);
          }
        });
      }
    } catch (e) {
      console.error('Failed to restore saved planner snapshot:', e);
    }
  }

  function getBackups() {
    try {
      return JSON.parse(localStorage.getItem(BACKUP_LIST_KEY) || '[]');
    } catch (e) {
      return [];
    }
  }

  function setBackups(backups) {
    safeSetItem(BACKUP_LIST_KEY, JSON.stringify(backups));
  }

  function makeBackup() {
    const snapshot = getSnapshot();
    const backups = getBackups();
    backups.push({ ts: Date.now(), data: snapshot });
    setBackups(backups);
    saveAll();
    return true;
  }

  function restoreLatest() {
    const backups = getBackups();
    if (!backups.length) return false;
    const latest = backups[backups.length - 1];
    if (!latest || !latest.data) return false;
    restoreSnapshot(latest.data);
    return true;
  }

  function restoreByIndex(idx) {
    const backups = getBackups();
    if (!backups || idx < 0 || idx >= backups.length) return false;
    const target = backups[idx];
    if (!target || !target.data) return false;
    restoreSnapshot(target.data);
    return true;
  }

  function clearBackupsAndData() {
    try {
      const keys = [];
      for (let i = 0; i < localStorage.length; i += 1) {
        const key = localStorage.key(i);
        if (key) keys.push(key);
      }
      keys.forEach((key) => localStorage.removeItem(key));
    } catch (e) {
      console.error('Failed to clear backup data:', e);
    }
  }

  function exportJSON() {
    try {
      const snapshot = getSnapshot();
      const raw = JSON.stringify(snapshot, null, 2);
      const blob = new Blob([raw], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `planner-backup-${new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/[:T]/g, '-')}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      return true;
    } catch (e) {
      console.error('Export failed:', e);
      return false;
    }
  }

  function importJSONFromFile(file, indicatorEl) {
    const reader = new FileReader();
    reader.onload = function (evt) {
      try {
        const parsed = JSON.parse(evt.target.result);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          Object.keys(parsed).forEach((key) => {
            if (!key || IGNORED_KEYS.includes(key)) return;
            localStorage.setItem(key, parsed[key]);
          });
          saveAll();
          if (indicatorEl) indicatorEl.innerText = 'Imported JSON';
        } else {
          if (indicatorEl) indicatorEl.innerText = 'Import: invalid format';
        }
      } catch (e) {
        if (indicatorEl) indicatorEl.innerText = 'Import failed';
      }
      setTimeout(() => {
        if (indicatorEl) indicatorEl.innerText = 'Autosave: idle';
      }, 1000);
    };
    reader.readAsText(file);
  }

  function scheduleSave(indicatorEl) {
    if (indicatorEl) indicatorEl.innerText = 'Autosave: typing...';
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      saveAll();
      if (indicatorEl) indicatorEl.innerText = 'Autosave: saved';
      setTimeout(() => {
        if (indicatorEl) indicatorEl.innerText = 'Autosave: idle';
      }, 1000);
    }, AUTO_SAVE_DELAY);
  }

  document.addEventListener('DOMContentLoaded', function () {
    loadAll();

    const indicatorEl = document.getElementById('autosave-indicator');
    const importFile = document.getElementById('import-file');

    document.addEventListener(
      'input',
      function (ev) {
        const target = ev.target;
        if (
          target &&
          target.matches &&
          target.matches('input,textarea,select,[contenteditable="true"]')
        ) {
          scheduleSave(indicatorEl);
        }
      },
      true,
    );

    document.addEventListener(
      'change',
      function (ev) {
        const target = ev.target;
        if (
          target &&
          target.matches &&
          target.matches('input,textarea,select,[contenteditable="true"]')
        ) {
          scheduleSave(indicatorEl);
        }
      },
      true,
    );

    const backupBtn = document.getElementById('backup-now');
    const restoreBtn = document.getElementById('restore-latest');
    const exportBtn = document.getElementById('export-json');
    const importBtn = document.getElementById('import-json');
    const clearAll = document.getElementById('clear-all');

    if (backupBtn)
      backupBtn.addEventListener('click', function () {
        makeBackup();
        if (indicatorEl) indicatorEl.innerText = 'Backup saved';
        setTimeout(() => indicatorEl && (indicatorEl.innerText = 'Autosave: idle'), 1000);
      });

    if (restoreBtn)
      restoreBtn.addEventListener('click', function () {
        const ok = restoreLatest();
        if (indicatorEl)
          indicatorEl.innerText = ok ? 'Restored latest backup' : 'No backups';
        setTimeout(() => indicatorEl && (indicatorEl.innerText = 'Autosave: idle'), 1000);
      });

    if (exportBtn)
      exportBtn.addEventListener('click', function () {
        const ok = exportJSON();
        if (indicatorEl) indicatorEl.innerText = ok ? 'Exported JSON' : 'Export failed';
        setTimeout(() => indicatorEl && (indicatorEl.innerText = 'Autosave: idle'), 1000);
      });

    if (importBtn && importFile)
      importBtn.addEventListener('click', function () {
        importFile.click();
      });

    if (importFile)
      importFile.addEventListener('change', function (ev) {
        const f = ev.target.files && ev.target.files[0];
        if (f) importJSONFromFile(f, indicatorEl);
        importFile.value = '';
      });

    if (clearAll)
      clearAll.addEventListener('click', function () {
        clearBackupsAndData();
        if (indicatorEl) indicatorEl.innerText = 'Cleared all saved data';
        setTimeout(() => indicatorEl && (indicatorEl.innerText = 'Autosave: idle'), 1000);
      });

    function renderBackupList() {
      const listEl = document.getElementById('backup-list');
      if (!listEl) return;
      listEl.innerHTML = '';

      const backups = getBackups();
      if (!backups.length) {
        listEl.innerHTML =
          '<div class="backup-empty-msg">📭 No backups yet — click "Backup Now" to create your first snapshot.</div>';
        return;
      }

      backups
        .slice()
        .reverse()
        .forEach((backup, reverseIndex) => {
          const index = backups.length - 1 - reverseIndex;
          const item = document.createElement('div');
          item.className = 'backup-item';
          item.setAttribute('role', 'listitem');

          const date = new Date(backup.ts);
          const dateStr = date.toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          });
          const timeStr = date.toLocaleTimeString(undefined, {
            hour: '2-digit',
            minute: '2-digit',
          });

          item.innerHTML = `
            <div class="backup-item-info">
              <span class="backup-item-date">📅 ${dateStr} at ${timeStr}</span>
              <span class="backup-item-meta">${Object.keys(backup.data || {}).length} keys saved</span>
            </div>
            <button class="backup-restore-btn" aria-label="Restore backup ${index + 1}">↺ Restore</button>
          `;

          const restoreBtn = item.querySelector('.backup-restore-btn');
          if (restoreBtn) {
            restoreBtn.addEventListener('click', function () {
              const ok = restoreByIndex(index);
              if (indicatorEl) indicatorEl.innerText = ok ? 'Restored backup' : 'Restore failed';
              setTimeout(() => indicatorEl && (indicatorEl.innerText = 'Autosave: idle'), 1000);
            });
          }

          listEl.appendChild(item);
        });
    }

    renderBackupList();

    window.BackupManager = {
      saveAll,
      loadAll,
      makeBackup,
      restoreLatest,
      restoreByIndex,
      exportJSON,
      clearBackupsAndData,
      listBackups: getBackups,
    };
  });
})();
