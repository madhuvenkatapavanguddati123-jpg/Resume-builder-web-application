from flask import Flask, render_template, request, url_for

app = Flask(__name__)

TEMPLATE_META = {
    "template1": {
        "name": "Classic Blue",
        "description": "Centered header, clear hierarchy, and ATS-friendly blue section headings.",
        "preview": "Clean centered header with crisp dividers and a professional blue accent."
    },
    "template2": {
        "name": "Modern Slate",
        "description": "Left-aligned layout with a bold top accent border and modern spacing.",
        "preview": "Structured slate design with confident typography and balanced whitespace."
    },
    "template3": {
        "name": "Minimal Mono",
        "description": "Compact monochrome design with strong typography and minimal styling.",
        "preview": "Minimal black and gray layout designed for concise, polished resumes."
    }
}

NAV_ITEMS = [
    ("Home", "home"),
    ("Create Resume", "editor"),
    ("Templates", "templates_page"),
    ("Drafts", "drafts"),
    ("Cover Letter", "cover_letter_page"),
    ("About", "about"),
]


def base_context(active_page=None):
    return {
        "nav_items": NAV_ITEMS,
        "active_page": active_page,
        "template_meta": TEMPLATE_META,
    }


@app.route("/")
def home():
    return render_template("home.html", **base_context("home"))


@app.route("/about")
def about():
    return render_template("about.html", **base_context("about"))


@app.route("/templates")
def templates_page():
    return render_template("templates_page.html", **base_context("templates"))


@app.route("/editor")
def editor():
    selected_template = request.args.get("template", "template1")
    if selected_template not in TEMPLATE_META:
        selected_template = "template1"
    return render_template(
        "editor.html",
        selected_template=selected_template,
        **base_context("editor")
    )


@app.route("/drafts")
def drafts():
    return render_template("drafts.html", **base_context("drafts"))


@app.route("/cover-letter-page")
def cover_letter_page():
    return render_template("cover_letter_page.html", **base_context("cover_letter"))


@app.route("/generate", methods=["POST"])
def generate():
    selected_template = request.form.get("template", "template1")
    template_name = {
        "template1": "resume.html",
        "template2": "resume_template2.html",
        "template3": "resume_template3.html",
    }.get(selected_template, "resume.html")
    return render_template(template_name, printable=True, submitted=dict(request.form), **base_context(None))


@app.route("/preview")
def preview():
    selected_template = request.args.get("template", "template1")
    if selected_template not in TEMPLATE_META:
        selected_template = "template1"
    template_name = {
        "template1": "resume.html",
        "template2": "resume_template2.html",
        "template3": "resume_template3.html",
    }[selected_template]
    return render_template(template_name, printable=False, submitted={}, selected_template=selected_template, **base_context(None))


@app.route("/cover-letter", methods=["GET", "POST"])
def cover_letter():
    return render_template("cover_letter.html", **base_context("cover_letter"))


if __name__ == "__main__":
    app.run(debug=True)
