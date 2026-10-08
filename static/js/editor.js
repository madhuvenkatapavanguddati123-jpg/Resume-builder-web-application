(function () {
    const form = document.getElementById('resume-editor-form');
    const previewRoot = document.getElementById('resume-preview-root');
    if (!form || !previewRoot) return;

    const autosaveStatus = document.getElementById('autosave-status');
    const saveDraftBtn = document.getElementById('save-draft-btn');
    const printBtn = document.getElementById('print-resume-btn');
    const templateSelector = document.getElementById('templateSelector');
    const accentColorInput = document.getElementById('accentColor');
    const fontSizeSelect = document.getElementById('fontSize');
    const sectionSpacingSelect = document.getElementById('sectionSpacing');
    const selectedTemplateName = document.getElementById('selected-template-name');
    const validationBox = document.getElementById('preview-validation');
    const zoomLabel = document.getElementById('zoom-level');
    const scaleWrap = document.getElementById('preview-scale-wrap');
    const mobileViewButtons = document.querySelectorAll('[data-mobile-view-btn]');
    const mobilePanels = document.querySelectorAll('[data-mobile-panel]');
    const dataMap = {
        education: document.getElementById('education-list'),
        projects: document.getElementById('projects-list'),
        experience: document.getElementById('experience-list'),
        certifications: document.getElementById('certifications-list'),
        languages: document.getElementById('languages-list'),
        achievements: document.getElementById('achievements-list'),
    };
    const templateNames = {
        template1: 'Classic Blue',
        template2: 'Modern Slate',
        template3: 'Minimal Mono'
    };

    let resumeState = createEmptyState();
    let zoomLevel = 1;
    let autosaveTimer;
    let unsavedChanges = false;

    function createEmptyState() {
        return {
            personal: {
                fullName: '', email: '', phone: '', location: '', linkedin: '', github: '', portfolio: '', otherLink: ''
            },
            summary: '',
            education: [],
            skills: [],
            projects: [],
            experience: [],
            certifications: [],
            languages: [],
            achievements: [],
            coverLetter: { company: '', role: '' },
            settings: {
                template: document.getElementById('selected-template-input')?.value || 'template1',
                templateName: 'Classic Blue',
                accentColor: '#365cff',
                fontSize: 'comfortable',
                sectionSpacing: 'balanced'
            }
        };
    }

    function debounce(callback, delay) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => callback(...args), delay);
        };
    }

    function escapeHtml(value) {
        return String(value || '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '\'': '&#39;', '"': '&quot;' }[char] || char));
    }

    function validUrl(value) {
        if (!value) return false;
        try {
            const url = new URL(value);
            return ['http:', 'https:'].includes(url.protocol);
        } catch (error) {
            return false;
        }
    }

    function setStatus(text) {
        if (autosaveStatus) autosaveStatus.textContent = text;
    }

    function addDynamicItem(type, values = {}) {
        const container = dataMap[type];
        if (!container) return;
        const item = document.createElement('div');
        item.className = 'dynamic-item';
        item.dataset.type = type;
        item.dataset.id = values.id || crypto.randomUUID();

        const header = document.createElement('div');
        header.className = 'dynamic-item-header';
        header.innerHTML = `<strong>${type.charAt(0).toUpperCase() + type.slice(1, -1 || type.length)} item</strong>`;

        const actions = document.createElement('div');
        actions.className = 'item-action-group';
        const collapseBtn = document.createElement('button');
        collapseBtn.type = 'button';
        collapseBtn.className = 'item-action-btn';
        collapseBtn.textContent = 'Collapse';

        const upBtn = document.createElement('button');
        upBtn.type = 'button';
        upBtn.className = 'item-action-btn';
        upBtn.textContent = 'Move Up';

        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'item-action-btn';
        removeBtn.textContent = 'Remove';

        actions.append(collapseBtn, upBtn, removeBtn);
        header.appendChild(actions);
        item.appendChild(header);

        const body = document.createElement('div');
        body.className = 'dynamic-item-body';
        body.appendChild(buildFields(type, values));
        item.appendChild(body);
        container.appendChild(item);

        collapseBtn.addEventListener('click', () => {
            const hidden = body.classList.toggle('hidden');
            collapseBtn.textContent = hidden ? 'Expand' : 'Collapse';
        });

        upBtn.addEventListener('click', () => {
            const previous = item.previousElementSibling;
            if (previous) container.insertBefore(item, previous);
            handleStateChange();
        });

        removeBtn.addEventListener('click', () => {
            if (!window.confirm('Remove this item?')) return;
            item.remove();
            handleStateChange();
        });
    }

    function field(name, label, value = '', type = 'text', required = false, placeholder = '') {
        const wrap = document.createElement('div');
        wrap.className = 'form-field';
        const inputId = `${name}-${crypto.randomUUID()}`;
        const star = required ? ' <span class="required">*</span>' : '';
        wrap.innerHTML = `<label for="${inputId}">${label}${star}</label>`;
        let input;
        if (type === 'textarea') {
            input = document.createElement('textarea');
            input.rows = 4;
        } else if (type === 'checkbox') {
            const checkboxWrap = document.createElement('label');
            checkboxWrap.className = 'checkbox-row';
            input = document.createElement('input');
            input.type = 'checkbox';
            input.checked = Boolean(value);
            input.name = name;
            input.dataset.field = name;
            checkboxWrap.append(input, document.createTextNode(label));
            wrap.innerHTML = '';
            wrap.appendChild(checkboxWrap);
            return wrap;
        } else {
            input = document.createElement('input');
            input.type = type;
        }
        input.id = inputId;
        input.name = name;
        input.dataset.field = name;
        input.placeholder = placeholder;
        input.value = value || '';
        wrap.appendChild(input);
        if (required) {
            const error = document.createElement('small');
            error.className = 'field-error';
            wrap.appendChild(error);
        }
        return wrap;
    }

    function buildFields(type, values) {
        const grid = document.createElement('div');
        grid.className = 'field-grid two-col';
        if (type === 'education') {
            grid.append(
                field('qualification', 'Qualification', values.qualification, 'text', false, 'B.Tech Computer Science'),
                field('institute', 'Institute', values.institute, 'text', false, 'ABC Engineering College'),
                field('from', 'From', values.from, 'text', false, '2022'),
                field('to', 'To', values.to, 'text', false, '2026'),
                field('grade', 'Grade / CGPA / Percentage', values.grade, 'text', false, '8.4 CGPA')
            );
        }
        if (type === 'projects') {
            grid.append(
                field('name', 'Project Name', values.name, 'text', true, 'Resume Builder'),
                field('tech', 'Technologies / Tech Stack', values.tech, 'text', false, 'Flask, JavaScript, CSS'),
                field('start', 'Start Date', values.start, 'text', false, 'Jan 2025'),
                field('end', 'End Date', values.end, 'text', false, 'Mar 2025'),
                field('projectUrl', 'Project URL', values.projectUrl, 'url', false, 'https://example.com'),
                field('githubUrl', 'GitHub URL', values.githubUrl, 'url', false, 'https://github.com/user/repo'),
                field('description', 'Description', values.description, 'textarea', false, 'Describe the problem solved and your contribution.')
            );
        }
        if (type === 'experience') {
            grid.append(
                field('role', 'Job Title / Role', values.role),
                field('company', 'Company', values.company),
                field('location', 'Location', values.location),
                field('from', 'From', values.from),
                field('to', 'To', values.to),
                field('current', 'Currently working here', values.current, 'checkbox'),
                field('description', 'Description', values.description, 'textarea')
            );
        }
        if (type === 'certifications') {
            grid.append(
                field('name', 'Certification Name', values.name),
                field('organization', 'Issuing Organization', values.organization),
                field('date', 'Date', values.date),
                field('url', 'Credential URL', values.url, 'url')
            );
        }
        if (type === 'languages') {
            grid.append(
                field('language', 'Language', values.language),
                field('proficiency', 'Proficiency', values.proficiency)
            );
        }
        if (type === 'achievements') {
            grid.className = 'field-grid';
            grid.append(field('description', 'Achievement Description', values.description, 'textarea'));
        }
        return grid;
    }

    function collectDynamicItems(type) {
        const container = dataMap[type];
        return Array.from(container.querySelectorAll('.dynamic-item')).map((item) => {
            const result = { id: item.dataset.id };
            item.querySelectorAll('[data-field]').forEach((input) => {
                result[input.dataset.field] = input.type === 'checkbox' ? input.checked : input.value.trim();
            });
            return result;
        }).filter((entry) => Object.values(entry).some((value) => value && value !== entry.id));
    }

    function collectResumeData() {
        resumeState.personal = {
            fullName: form.fullName.value.trim(),
            email: form.email.value.trim(),
            phone: form.phone.value.trim(),
            location: form.location.value.trim(),
            linkedin: form.linkedin.value.trim(),
            github: form.github.value.trim(),
            portfolio: form.portfolio.value.trim(),
            otherLink: form.otherLink.value.trim(),
        };
        resumeState.summary = form.summary.value.trim();
        resumeState.education = collectDynamicItems('education');
        resumeState.projects = collectDynamicItems('projects');
        resumeState.experience = collectDynamicItems('experience');
        resumeState.certifications = collectDynamicItems('certifications');
        resumeState.languages = collectDynamicItems('languages');
        resumeState.achievements = collectDynamicItems('achievements');
        resumeState.coverLetter = {
            company: document.getElementById('coverCompany').value.trim(),
            role: document.getElementById('coverRole').value.trim(),
        };
        resumeState.settings = {
            template: templateSelector.value,
            templateName: templateNames[templateSelector.value],
            accentColor: accentColorInput.value,
            fontSize: fontSizeSelect.value,
            sectionSpacing: sectionSpacingSelect.value,
        };
        return resumeState;
    }

    function sortEducation(items) {
        return [...items].sort((a, b) => (parseInt(b.to, 10) || parseInt(b.from, 10) || 0) - (parseInt(a.to, 10) || parseInt(a.from, 10) || 0));
    }

    function sortExperience(items) {
        return [...items].sort((a, b) => (parseInt((b.current ? '9999' : b.to), 10) || parseInt(b.from, 10) || 0) - (parseInt((a.current ? '9999' : a.to), 10) || parseInt(a.from, 10) || 0));
    }

    function renderLinks(personal) {
        const links = [
            ['LinkedIn', personal.linkedin],
            ['GitHub', personal.github],
            ['Portfolio', personal.portfolio],
            ['Other', personal.otherLink],
        ].filter(([, url]) => validUrl(url));
        if (!links.length) return '';
        return `<div class="resume-links">${links.map(([label, url]) => `<span>${label}: ${escapeHtml(url)}</span>`).join('')}</div>`;
    }

    function renderSection(title, content) {
        if (!content) return '';
        return `<section class="resume-section"><h2 class="resume-section-title">${title}</h2>${content}</section>`;
    }

    function renderListCards(items, mapper) {
        return `<div class="resume-list">${items.map(mapper).join('')}</div>`;
    }

    function validateState(state) {
        const errors = {};
        if (!state.personal.fullName) errors.fullName = 'Please enter your full name.';
        if (!state.personal.email) errors.email = 'Please enter your email address.';
        else if (!/^\S+@\S+\.\S+$/.test(state.personal.email)) errors.email = 'Please enter a valid email address.';

        form.querySelectorAll('[data-error-for]').forEach((node) => node.textContent = errors[node.dataset.errorFor] || '');
        validationBox.textContent = Object.keys(errors).length ? 'Required fields are missing or invalid. The preview still updates while you continue editing.' : '';
        return errors;
    }

    function renderResume() {
        const state = collectResumeData();
        validateState(state);
        selectedTemplateName.textContent = state.settings.templateName;
        previewRoot.className = `resume-paper ${state.settings.template}`;
        previewRoot.style.setProperty('--resume-accent', state.settings.accentColor);
        previewRoot.style.setProperty('--resume-font-scale', state.settings.fontSize === 'compact' ? '0.95' : state.settings.fontSize === 'spacious' ? '1.04' : '1');
        previewRoot.style.setProperty('--resume-gap', state.settings.sectionSpacing === 'compact' ? '0.85rem' : state.settings.sectionSpacing === 'airy' ? '1.55rem' : '1.2rem');

        const stateEducation = sortEducation(state.education).filter((item) => item.qualification || item.institute || item.grade);
        const stateExperience = sortExperience(state.experience).filter((item) => item.role || item.company || item.description);
        const skills = state.skills.filter(Boolean);
        const projects = state.projects.filter((item) => item.name);
        const certifications = state.certifications.filter((item) => item.name || item.organization);
        const languages = state.languages.filter((item) => item.language || item.proficiency);
        const achievements = state.achievements.filter((item) => item.description);

        const header = `
            <header class="resume-header">
                <h1>${escapeHtml(state.personal.fullName || 'Your Name')}</h1>
                <div class="resume-contact">
                    ${[state.personal.email, state.personal.phone, state.personal.location].filter(Boolean).map((item) => `<span>${escapeHtml(item)}</span>`).join('')}
                </div>
                ${renderLinks(state.personal)}
            </header>
        `;

        const summary = state.summary ? `<p class="resume-summary">${escapeHtml(state.summary)}</p>` : '';
        const education = stateEducation.length ? `
            <div class="resume-education-table">
                <table>
                    <thead><tr><th>Qualification</th><th>Institute</th><th>From - To / Year</th><th>Grade / CGPA / Percentage</th></tr></thead>
                    <tbody>${stateEducation.map((item) => `<tr><td>${escapeHtml(item.qualification)}</td><td>${escapeHtml(item.institute)}</td><td>${escapeHtml([item.from, item.to].filter(Boolean).join(' - '))}</td><td>${escapeHtml(item.grade)}</td></tr>`).join('')}</tbody>
                </table>
            </div>
        ` : '';
        const skillsSection = skills.length ? `<div class="resume-skill-list">${skills.map((skill) => `<span class="resume-skill-tag">${escapeHtml(skill)}</span>`).join('')}</div>` : '';
        const projectsSection = projects.length ? renderListCards(projects, (item) => `
            <article class="resume-card-item">
                <div class="resume-line-title"><span>${escapeHtml(item.name)}</span><span>${escapeHtml([item.start, item.end].filter(Boolean).join(' - '))}</span></div>
                ${item.tech ? `<div class="resume-line-sub">Tech Stack: ${escapeHtml(item.tech)}</div>` : ''}
                ${item.description ? `<p class="resume-line-sub">${escapeHtml(item.description)}</p>` : ''}
                ${[item.projectUrl, item.githubUrl].filter(validUrl).length ? `<div class="resume-line-sub">${[item.projectUrl, item.githubUrl].filter(validUrl).map((url) => escapeHtml(url)).join(' | ')}</div>` : ''}
            </article>
        `) : '';
        const experienceSection = stateExperience.length ? renderListCards(stateExperience, (item) => `
            <article class="resume-card-item">
                <div class="resume-line-title"><span>${escapeHtml(item.role || 'Role')}</span><span>${escapeHtml([item.from, item.current ? 'Present' : item.to].filter(Boolean).join(' - '))}</span></div>
                <div class="resume-line-sub">${escapeHtml([item.company, item.location].filter(Boolean).join(' · '))}</div>
                ${item.description ? `<p class="resume-line-sub">${escapeHtml(item.description)}</p>` : ''}
            </article>
        `) : '';
        const certificationSection = certifications.length ? renderListCards(certifications, (item) => `
            <article class="resume-card-item">
                <div class="resume-line-title"><span>${escapeHtml(item.name || '')}</span><span>${escapeHtml(item.date || '')}</span></div>
                <div class="resume-line-sub">${escapeHtml(item.organization || '')}</div>
                ${validUrl(item.url) ? `<div class="resume-line-sub">${escapeHtml(item.url)}</div>` : ''}
            </article>
        `) : '';
        const languageSection = languages.length ? `<div class="resume-bullets">${languages.map((item) => `<div class="resume-line-sub">${escapeHtml(item.language)} — ${escapeHtml(item.proficiency)}</div>`).join('')}</div>` : '';
        const achievementSection = achievements.length ? `<ul class="resume-achievement-list">${achievements.map((item) => `<li>${escapeHtml(item.description)}</li>`).join('')}</ul>` : '';

        previewRoot.innerHTML = [
            header,
            renderSection('Professional Summary', summary),
            renderSection('Education', education),
            renderSection('Skills', skillsSection),
            renderSection('Projects', projectsSection),
            renderSection('Experience', experienceSection),
            renderSection('Certifications', certificationSection),
            renderSection('Languages', languageSection),
            renderSection('Achievements', achievementSection)
        ].join('');
    }

    function saveWorkingState() {
        collectResumeData();
        localStorage.setItem('resumeWorkingDraft', JSON.stringify(resumeState));
        setStatus('Saved');
        unsavedChanges = false;
    }

    const debouncedAutosave = debounce(() => {
        setStatus('Saving...');
        saveWorkingState();
    }, 500);

    function handleStateChange() {
        unsavedChanges = true;
        setStatus('Unsaved changes');
        renderResume();
        debouncedAutosave();
    }

    function saveDraft() {
        const name = window.prompt('Draft name', resumeState.personal.fullName ? `${resumeState.personal.fullName} Resume` : 'My Resume Draft');
        if (!name) return;
        collectResumeData();
        const drafts = JSON.parse(localStorage.getItem('resumeDrafts') || '[]');
        const draft = {
            id: crypto.randomUUID(),
            name: name.trim(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            resumeData: JSON.parse(JSON.stringify(resumeState))
        };
        drafts.unshift(draft);
        localStorage.setItem('resumeDrafts', JSON.stringify(drafts));
        localStorage.setItem('resumeWorkingDraft', JSON.stringify(resumeState));
        setStatus('Saved');
        unsavedChanges = false;
    }

    function hydrateFromState(state) {
        if (!state) return;
        resumeState = { ...createEmptyState(), ...state, settings: { ...createEmptyState().settings, ...(state.settings || {}) } };
        Object.entries(resumeState.personal || {}).forEach(([key, value]) => {
            if (form[key]) form[key].value = value || '';
        });
        form.summary.value = resumeState.summary || '';
        document.getElementById('coverCompany').value = resumeState.coverLetter?.company || '';
        document.getElementById('coverRole').value = resumeState.coverLetter?.role || '';
        templateSelector.value = resumeState.settings.template || 'template1';
        accentColorInput.value = resumeState.settings.accentColor || '#365cff';
        fontSizeSelect.value = resumeState.settings.fontSize || 'comfortable';
        sectionSpacingSelect.value = resumeState.settings.sectionSpacing || 'balanced';
        Object.keys(dataMap).forEach((type) => {
            dataMap[type].innerHTML = '';
            (resumeState[type] || []).forEach((item) => addDynamicItem(type, item));
        });
        resumeState.skills = Array.isArray(resumeState.skills) ? resumeState.skills : [];
        renderSkills();
    }

    function renderSkills() {
        const skillTags = document.getElementById('skill-tags');
        skillTags.innerHTML = '';
        resumeState.skills.forEach((skill, index) => {
            const chip = document.createElement('span');
            chip.className = 'tag-chip';
            chip.textContent = skill;
            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.setAttribute('aria-label', `Remove ${skill}`);
            removeBtn.textContent = '×';
            removeBtn.addEventListener('click', () => {
                resumeState.skills.splice(index, 1);
                handleStateChange();
                renderSkills();
            });
            chip.appendChild(removeBtn);
            skillTags.appendChild(chip);
        });
    }

    function addSkillsFromInput() {
        const input = document.getElementById('skill-input');
        const values = input.value.split(',').map((item) => item.trim()).filter(Boolean);
        if (!values.length) return;
        const unique = new Set(resumeState.skills);
        values.forEach((value) => unique.add(value));
        resumeState.skills = Array.from(unique);
        input.value = '';
        renderSkills();
        handleStateChange();
    }

    function toggleEditorCards() {
        document.querySelectorAll('[data-section-card]').forEach((card) => {
            const button = card.querySelector('.editor-card-toggle');
            const body = card.querySelector('.editor-card-body');
            button.addEventListener('click', () => {
                const expanded = button.getAttribute('aria-expanded') === 'true';
                button.setAttribute('aria-expanded', String(!expanded));
                body.classList.toggle('hidden', expanded);
                card.classList.toggle('expanded', !expanded);
            });
        });
    }

    function setMobileView(view) {
        mobileViewButtons.forEach((button) => button.classList.toggle('active', button.dataset.view === view));
        mobilePanels.forEach((panel) => panel.classList.toggle('active-mobile', panel.dataset.mobilePanel === view));
    }

    function applyZoom(nextZoom) {
        zoomLevel = Math.min(1.4, Math.max(0.7, nextZoom));
        scaleWrap.style.transform = `scale(${zoomLevel})`;
        zoomLabel.textContent = `${Math.round(zoomLevel * 100)}%`;
    }

    document.querySelectorAll('[data-add-item]').forEach((button) => {
        button.addEventListener('click', () => {
            addDynamicItem(button.dataset.addItem);
            handleStateChange();
        });
    });

    document.getElementById('add-skill-btn').addEventListener('click', addSkillsFromInput);
    document.getElementById('skill-input').addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            addSkillsFromInput();
        }
    });

    form.addEventListener('input', handleStateChange);
    form.addEventListener('change', handleStateChange);
    saveDraftBtn.addEventListener('click', saveDraft);
    printBtn.addEventListener('click', () => window.print());
    document.getElementById('zoom-in-btn').addEventListener('click', () => applyZoom(zoomLevel + 0.1));
    document.getElementById('zoom-out-btn').addEventListener('click', () => applyZoom(zoomLevel - 0.1));
    document.getElementById('reset-zoom-btn').addEventListener('click', () => applyZoom(1));
    document.getElementById('fullscreen-preview-btn').addEventListener('click', async () => {
        const panel = document.querySelector('.preview-panel');
        if (!document.fullscreenElement) await panel.requestFullscreen?.(); else await document.exitFullscreen?.();
    });
    mobileViewButtons.forEach((button) => button.addEventListener('click', () => setMobileView(button.dataset.view)));

    window.addEventListener('beforeunload', (event) => {
        if (!unsavedChanges) return;
        event.preventDefault();
        event.returnValue = '';
    });

    const initialWorkingDraft = localStorage.getItem('resumeWorkingDraft');
    if (initialWorkingDraft) {
        hydrateFromState(JSON.parse(initialWorkingDraft));
    } else {
        addDynamicItem('education');
        addDynamicItem('projects');
        addDynamicItem('experience');
    }

    toggleEditorCards();
    setMobileView('editor');
    renderSkills();
    renderResume();
    applyZoom(1);
})();
