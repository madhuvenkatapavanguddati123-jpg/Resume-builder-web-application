(function () {
    const form = document.getElementById('cover-letter-form');
    const preview = document.getElementById('cover-letter-preview');
    const printBtn = document.getElementById('cover-letter-print-btn');
    if (!form || !preview) return;

    function escapeHtml(value) {
        return value.replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '\'': '&#39;', '"': '&quot;' }[char] || char));
    }

    function getData() {
        const data = Object.fromEntries(new FormData(form).entries());
        return Object.fromEntries(Object.entries(data).map(([key, value]) => [key, String(value || '').trim()]));
    }

    function validate(data) {
        const errors = {};
        if (!data.name) errors.name = 'Please enter your full name.';
        if (!data.email) errors.email = 'Please enter your email address.';
        else if (!/^\S+@\S+\.\S+$/.test(data.email)) errors.email = 'Please enter a valid email address.';
        form.querySelectorAll('[data-error-for]').forEach((node) => { node.textContent = errors[node.dataset.errorFor] || ''; });
        return Object.keys(errors).length === 0;
    }

    function render() {
        const data = getData();
        validate(data);
        const today = new Date().toLocaleDateString();
        const safeContent = (data.content || 'Introduce yourself, explain why you are interested in the role, connect your relevant strengths, and close with confidence.')
            .split('\n')
            .filter(Boolean)
            .map((line) => `<p>${escapeHtml(line)}</p>`)
            .join('');

        preview.innerHTML = `
            <div class="cl-header">
                <h1 style="margin-bottom:0.4rem; font-size:2rem;">${escapeHtml(data.name || 'Your Name')}</h1>
                <p>${escapeHtml([data.email, data.phone, data.address].filter(Boolean).join(' • '))}</p>
                <p>${today}</p>
            </div>
            <div class="cl-body">
                <p><strong>${escapeHtml(data.company || 'Hiring Manager')}</strong></p>
                ${data.role ? `<p>Application for ${escapeHtml(data.role)}</p>` : ''}
                <p>Dear Hiring Team,</p>
                ${safeContent}
                <p>Sincerely,</p>
                <p><strong>${escapeHtml(data.name || 'Your Name')}</strong></p>
            </div>
        `;
    }

    form.addEventListener('input', render);
    form.addEventListener('change', render);
    if (printBtn) printBtn.addEventListener('click', () => window.print());
    render();
})();
