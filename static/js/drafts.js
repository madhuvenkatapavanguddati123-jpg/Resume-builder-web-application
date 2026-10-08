(function () {
    const draftsGrid = document.getElementById('drafts-grid');
    const emptyState = document.getElementById('drafts-empty-state');
    if (!draftsGrid || !emptyState) return;

    function getDrafts() {
        return JSON.parse(localStorage.getItem('resumeDrafts') || '[]');
    }

    function saveDrafts(drafts) {
        localStorage.setItem('resumeDrafts', JSON.stringify(drafts));
    }

    function formatDate(value) {
        return new Date(value).toLocaleString();
    }

    function openDraft(draft) {
        localStorage.setItem('resumeWorkingDraft', JSON.stringify(draft.resumeData));
        window.location.href = `/editor?template=${encodeURIComponent(draft.resumeData.settings?.template || 'template1')}`;
    }

    function renameDraft(draftId) {
        const drafts = getDrafts();
        const target = drafts.find((draft) => draft.id === draftId);
        if (!target) return;
        const nextName = window.prompt('Rename draft', target.name);
        if (!nextName) return;
        target.name = nextName.trim();
        target.updatedAt = new Date().toISOString();
        saveDrafts(drafts);
        renderDrafts();
    }

    function duplicateDraft(draftId) {
        const drafts = getDrafts();
        const target = drafts.find((draft) => draft.id === draftId);
        if (!target) return;
        drafts.unshift({
            ...target,
            id: crypto.randomUUID(),
            name: `${target.name} Copy`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });
        saveDrafts(drafts);
        renderDrafts();
    }

    function deleteDraft(draftId) {
        if (!window.confirm('Delete this draft?')) return;
        const drafts = getDrafts().filter((draft) => draft.id !== draftId);
        saveDrafts(drafts);
        renderDrafts();
    }

    function createCard(draft) {
        const card = document.createElement('article');
        card.className = 'draft-card';

        const title = document.createElement('h2');
        title.textContent = draft.name;

        const meta = document.createElement('div');
        meta.className = 'draft-meta';
        meta.innerHTML = `
            <span>Template: ${draft.resumeData.settings?.templateName || 'Classic Blue'}</span>
            <span>Updated: ${formatDate(draft.updatedAt)}</span>
            <span>Created: ${formatDate(draft.createdAt)}</span>
        `;

        const actions = document.createElement('div');
        actions.className = 'draft-card-actions';

        const openBtn = document.createElement('button');
        openBtn.className = 'btn btn-primary';
        openBtn.textContent = 'Open';
        openBtn.addEventListener('click', () => openDraft(draft));

        const duplicateBtn = document.createElement('button');
        duplicateBtn.className = 'btn btn-secondary';
        duplicateBtn.textContent = 'Duplicate';
        duplicateBtn.addEventListener('click', () => duplicateDraft(draft.id));

        const renameBtn = document.createElement('button');
        renameBtn.className = 'btn btn-secondary';
        renameBtn.textContent = 'Rename';
        renameBtn.addEventListener('click', () => renameDraft(draft.id));

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-danger';
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', () => deleteDraft(draft.id));

        actions.append(openBtn, duplicateBtn, renameBtn, deleteBtn);
        card.append(title, meta, actions);
        return card;
    }

    function renderDrafts() {
        const drafts = getDrafts();
        draftsGrid.innerHTML = '';
        emptyState.classList.toggle('hidden', drafts.length !== 0);
        if (!drafts.length) return;
        drafts.forEach((draft) => draftsGrid.appendChild(createCard(draft)));
    }

    renderDrafts();
})();
