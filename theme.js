// ============================================================
//  THEME.JS — Gestion du thème clair / sombre
//  Le Royaume de Givre
//
//  Priorité :
//    1. Choix explicite de l'utilisateur (localStorage)
//    2. Thème du système (prefers-color-scheme)
//    3. Thème sombre par défaut
// ============================================================

const THEME_KEY = 'royaume_theme';

// Applique le thème et met à jour le bouton
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const btn = document.querySelector('.theme-toggle, .theme-btn');
  if (btn) btn.textContent = theme === 'light' ? '☾ Thème sombre' : '☀ Thème clair';
}

// Bascule et sauvegarde le choix de l'utilisateur
function toggleTheme() {
  const current = document.documentElement.dataset.theme;
  const next = current === 'dark' ? 'light' : 'dark';
  localStorage.setItem(THEME_KEY, next);
  applyTheme(next);
}

// Chargement initial : préférence sauvegardée ou thème système
function loadTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved) {
    applyTheme(saved);
  } else {
    // Détection automatique du thème système
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(prefersDark ? 'dark' : 'light');
  }
}

// Écoute les changements de thème système (si aucun choix explicite enregistré)
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
  if (!localStorage.getItem(THEME_KEY)) {
    applyTheme(e.matches ? 'dark' : 'light');
  }
});

// Exécution immédiate pour éviter le flash de thème au chargement
loadTheme();
