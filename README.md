# ResumeBuilder Pro

ResumeBuilder Pro is a polished Flask-based resume builder rebuilt as a complete production-style web application. It includes a landing page, template selection, a powerful two-panel editor with live preview, LocalStorage-based draft management, cover letter generation, theme switching, and print/PDF support.

## Features

- Modern multi-page Flask application using Jinja2 templates
- Professional landing page and about page
- Three resume templates: Classic Blue, Modern Slate, and Minimal Mono
- Two-panel editor with independently scrollable editor and preview panels
- Instant live resume preview with LIVE indicator and subtle pulse animation
- Expandable editor cards for personal info, summary, education, skills, projects, experience, certifications, languages, achievements, links, settings, and cover letter
- Minimal required fields: Full Name and Email
- Education rendered as a clean, ATS-friendly table and sorted newest to oldest
- Skills as removable chips/tags
- LocalStorage draft system with save, load, rename, duplicate, and delete
- Debounced autosave and save status indicator
- Cover letter page with live preview and print support
- Light and dark theme support stored in LocalStorage
- Print/PDF export using the browser print dialog
- Clean JavaScript architecture split across focused files
- Structure prepared for future migration from LocalStorage to a backend database

## Technologies

- Python
- Flask
- HTML5
- CSS3
- Vanilla JavaScript
- Jinja2 templates
- LocalStorage

## Folder Structure

```text
ResumeBuilder/
├── app.py
├── requirements.txt
├── README.md
├── templates/
│   ├── base.html
│   ├── home.html
│   ├── about.html
│   ├── templates_page.html
│   ├── editor.html
│   ├── drafts.html
│   ├── cover_letter_page.html
│   ├── cover_letter.html
│   ├── resume.html
│   ├── resume_template2.html
│   ├── resume_template3.html
│   └── preview.html
├── static/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── app.js
│   │   ├── editor.js
│   │   ├── drafts.js
│   │   └── cover_letter.js
│   └── assets/
└── screenshots/
```

## Installation

1. Create a virtual environment:

```bash
python -m venv venv
```

2. Activate it on Windows:

```bash
venv\Scripts\activate
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Run the Flask app:

```bash
python app.py
```

5. Open the browser at:

[http://127.0.0.1:5000](http://127.0.0.1:5000)

## How It Works

### LocalStorage usage

The current version stores drafts, theme preference, autosave state, and the active working resume in LocalStorage only. This keeps the backend simple while still supporting a realistic end-to-end workflow.

### Draft system

Drafts are stored under a `resumeDrafts` key. Each draft contains:

- `id`
- `name`
- `createdAt`
- `updatedAt`
- `resumeData`

The app also stores a working draft for autosave so users can continue editing without manually saving every change.

### Live preview

The editor listens to user input events, collects the current resume state, validates the minimal required fields, and updates the preview immediately without reloading the page.

### Template system

All three templates use the same resume data model. Switching templates updates the preview instantly without deleting or resetting user-entered data.

### Future database migration

The frontend state is organized around a normalized resume data object. To replace LocalStorage later, you can introduce API endpoints and swap the storage helpers in JavaScript with backend persistence while keeping the same page structure and template rendering logic.

## Commands Summary

```bash
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

## Notes

- The app uses browser printing for PDF export.
- Empty resume sections stay hidden in the final preview.
- The resume paper remains print-friendly in both light and dark UI modes.
