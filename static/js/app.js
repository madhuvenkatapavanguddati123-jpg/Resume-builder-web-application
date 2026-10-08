(function () {
    const root = document.documentElement;
    const themeToggle = document.querySelector('[data-theme-toggle]');
    const mobileToggle = document.querySelector('[data-mobile-toggle]');
    const mobileMenu = document.querySelector('[data-mobile-menu]');
    const savedTheme = localStorage.getItem('rb-theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    function applyTheme(theme) {
        root.setAttribute('data-theme', theme);
        localStorage.setItem('rb-theme', theme);
    }

    applyTheme(savedTheme || (systemDark ? 'dark' : 'light'));

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const nextTheme = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            applyTheme(nextTheme);
        });
    }

    if (mobileToggle && mobileMenu) {
        mobileToggle.addEventListener('click', () => {
            const expanded = mobileToggle.getAttribute('aria-expanded') === 'true';
            mobileToggle.setAttribute('aria-expanded', String(!expanded));
            mobileMenu.classList.toggle('open');
        });

        mobileMenu.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('open');
                mobileToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }
})();
