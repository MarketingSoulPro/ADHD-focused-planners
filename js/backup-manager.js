// Backup Manager: app-level persistence, backups, import/export, autosave
(function(){
  const STORAGE_KEY = 'dopamineMenuData';
  const BACKUP_KEY = 'dopamineMenuBackups';
  const AUTO_SAVE_DELAY = 600;
  let saveTimer = null;

  function queryFields(){
    return Array.from(document.querySelectorAll('.dopamine-text'));
  }

  function saveAll(){
    try{
      const arr = queryFields().map(el=>el.innerText || '');
      localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
    }catch(e){/*ignore*/}
  }

  function loadAll(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      if(!raw) return;
      const arr = JSON.parse(raw);
      const els = queryFields();
      els.forEach((el,i)=>{ if(typeof arr[i] === 'string') el.innerText = arr[i]; });
    }catch(e){/*ignore*/}
  }

  function scheduleSave(indicatorEl){
    if(indicatorEl) indicatorEl.innerText = 'Autosave: typing...';
    clearTimeout(saveTimer);
    saveTimer = setTimeout(()=>{ saveAll(); if(indicatorEl) indicatorEl.innerText = 'Autosave: saved'; setTimeout(()=>{ if(indicatorEl) indicatorEl.innerText = 'Autosave: idle'; },1000); }, AUTO_SAVE_DELAY);
  }

  function getBackups(){ try{ return JSON.parse(localStorage.getItem(BACKUP_KEY)||'[]'); }catch(e){return []} }
  function setBackups(arr){ try{ localStorage.setItem(BACKUP_KEY, JSON.stringify(arr)); }catch(e){} }

  function makeBackup(){
    const data = queryFields().map(el=>el.innerText||'');
    const backups = getBackups();
    backups.push({ts: Date.now(), data});
    setBackups(backups);
    // ensure latest persisted
    try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }catch(e){}
  }

  function restoreLatest(){
    const backups = getBackups();
    if(!backups || backups.length===0) return false;
    const latest = backups[backups.length-1];
    if(latest && latest.data){
      const els = queryFields();
      els.forEach((el,i)=>{ el.innerText = latest.data[i]||''; });
      saveAll();
      return true;
    }
    return false;
  }

  function exportJSON(){
    try{
      const arr = queryFields().map(el=>el.innerText||'');
      const raw = JSON.stringify(arr, null, 2);
      const blob = new Blob([raw], {type:'application/json'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dopamine-menu-backup-${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.json`;
      document.body.appendChild(a);
      a.click(); a.remove(); URL.revokeObjectURL(url);
      return true;
    }catch(e){ return false; }
  }

  function importJSONFromFile(file, indicatorEl){
    const reader = new FileReader();
    reader.onload = function(evt){
      try{
        const arr = JSON.parse(evt.target.result);
        if(Array.isArray(arr)){
          const els = queryFields();
          els.forEach((el,i)=>{ el.innerText = arr[i]||''; });
          saveAll();
          if(indicatorEl) indicatorEl.innerText = 'Imported JSON';
        } else {
          if(indicatorEl) indicatorEl.innerText = 'Import: invalid format';
        }
      }catch(e){ if(indicatorEl) indicatorEl.innerText = 'Import failed'; }
      setTimeout(()=>{ if(indicatorEl) indicatorEl.innerText = 'Autosave: idle'; },1000);
    };
    reader.readAsText(file);
  }

  // Wire UI if present on page
  document.addEventListener('DOMContentLoaded', function(){
    // load persisted values onto page fields
    loadAll();

    const indicatorEl = document.getElementById('autosave-indicator');

    // delegate input events
    document.addEventListener('input', function(ev){
      if(ev.target && ev.target.classList && ev.target.classList.contains('dopamine-text')){
        scheduleSave(indicatorEl);
      }
    }, true);

    // wire select shortcuts (so selects in pages still populate fields)
    document.addEventListener('change', function(ev){
      if(ev.target && ev.target.classList && ev.target.classList.contains('dopamine-select')){
        const sel = ev.target;
        const row = sel.closest('.dopamine-row');
        if(!row) return;
        const text = row.querySelector('.dopamine-text');
        const opt = sel.options[sel.selectedIndex];
        if(!opt) return;
        const label = (opt.text || '').trim();
        if(/clear/i.test(label)){ if(text) text.innerText = ''; }
        else if(label){ if(text) text.innerText = label; }
        try{ sel.selectedIndex = 0; }catch(e){}
        if(text) text.focus();
        saveAll();
        if(indicatorEl) indicatorEl.innerText = 'Autosave: saved';
        setTimeout(()=>{ if(indicatorEl) indicatorEl.innerText = 'Autosave: idle'; },1000);
      }
    }, true);

    // wire control buttons if present
    const backupBtn = document.getElementById('backup-now');
    const restoreBtn = document.getElementById('restore-latest');
    const exportBtn = document.getElementById('export-json');
    const importBtn = document.getElementById('import-json');
    const importFile = document.getElementById('import-file');

    if(backupBtn) backupBtn.addEventListener('click', function(){ makeBackup(); if(indicatorEl) indicatorEl.innerText='Backup saved'; setTimeout(()=>indicatorEl && (indicatorEl.innerText='Autosave: idle'),1000); });
    if(restoreBtn) restoreBtn.addEventListener('click', function(){ const ok = restoreLatest(); if(indicatorEl) indicatorEl.innerText = ok ? 'Restored latest backup' : 'No backups'; setTimeout(()=>indicatorEl && (indicatorEl.innerText='Autosave: idle'),1000); });
    if(exportBtn) exportBtn.addEventListener('click', function(){ const ok = exportJSON(); if(indicatorEl) indicatorEl.innerText = ok ? 'Exported JSON' : 'Export failed'; setTimeout(()=>indicatorEl && (indicatorEl.innerText='Autosave: idle'),1000); });
    if(importBtn && importFile) importBtn.addEventListener('click', function(){ importFile.click(); });
    if(importFile) importFile.addEventListener('change', function(ev){ const f = ev.target.files && ev.target.files[0]; if(f) importJSONFromFile(f, indicatorEl); importFile.value=''; });

    // expose API
    window.BackupManager = {
      saveAll, loadAll, makeBackup, restoreLatest, exportJSON
    };
  });

})();
