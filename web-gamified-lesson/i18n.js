(function(){
  const dictionaries = {
    en: {
      title: 'Gamified Lesson',
      tabs: { lessons: 'Lessons', shop: 'Shop', daily: 'Daily', stats: 'Stats', settings: 'Settings', editor: 'Editor', arcade: 'Arcade', help: 'Help' },
      buttons: { start: 'Start', playMode: 'Play Mode', purchase: 'Purchase', use: 'Use', claim: 'Claim Today' },
      messages: { purchased: 'Purchased', notEnough: 'Not enough coins', saved: 'Settings saved', imported: 'Imported', importFailed: 'Import failed' }
    },
    es: {
      title: 'Lección Gamificada',
      tabs: { lessons: 'Lecciones', shop: 'Tienda', daily: 'Diario', stats: 'Estadísticas', settings: 'Ajustes', editor: 'Editor', arcade: 'Arcade', help: 'Ayuda' },
      buttons: { start: 'Comenzar', playMode: 'Modo Juego', purchase: 'Comprar', use: 'Usar', claim: 'Reclamar Hoy' },
      messages: { purchased: 'Comprado', notEnough: 'No hay suficientes monedas', saved: 'Ajustes guardados', imported: 'Importado', importFailed: 'Error al importar' }
    }
  };

  const I18N_STORAGE_KEY = 'gl_lang_v1';
  let current = localStorage.getItem(I18N_STORAGE_KEY) || 'en';

  function setLocale(lang){ if (!dictionaries[lang]) return; current = lang; localStorage.setItem(I18N_STORAGE_KEY, lang); document.documentElement.lang = lang; }
  function t(path){ const parts = path.split('.'); let obj = dictionaries[current]; for (const p of parts){ obj = obj?.[p]; if (obj==null) return path; } return obj; }
  function available(){ return Object.keys(dictionaries); }

  window.I18N = { setLocale, t, available };
})();