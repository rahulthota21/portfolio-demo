/**
 * Runs before paint so the saved theme is applied with no flash.
 * Dark is opt-in via the toggle; a stored preference always wins.
 */
export const themeScript = `(function(){try{var t=localStorage.getItem('theme');if(t==='dark')document.documentElement.classList.add('dark')}catch(e){}})();`;
