# CRMS-OPTO - A Classroom Management System Build By Muhammad Asim Shakir

A lightweight, browser-based class management system for teachers and small academies. Track students, attendance, lectures, timetables, and fees — all in one dashboard, with zero backend required.

Built with a soft-UI **neumorphic "chalkboard"** design: deep graphite-green surfaces molded by light, with a single warm chalk-yellow accent.

![Made with HTML, CSS, JS]()
![No backend required]()
![License]()

---

## ✨ Features

- **Dashboard** — live stats (students, lectures, attendance, fees collected), today's lecture, quick attendance summary, and a recent-activity feed.
- **Students** — add, edit, delete, and search students. See fee status and attendance % at a glance.
- **Attendance** — mark Present / Absent / Leave per student, "mark all present" shortcut, and a full attendance history table.
- **Lecture Log** — log daily lectures (subject, topic, status, notes) plus a monthly calendar view showing conducted / not-conducted / holiday days.
- **Timetable** — click-to-edit weekly grid, supports class slots and break/free periods.
- **Fee Management** — per-student monthly fee tracking, a receipt generator with a live preview, and a collections summary.
- **Reports** — one-click PDF export for daily reports, monthly calendars, attendance reports, fee submission lists, timetables, and the full student roster (powered by [jsPDF](https://github.com/parallax/jsPDF)).
- **Offline-first** — all data is saved to the browser's `localStorage`. No sign-up, no server, no database.
- **Responsive** — collapsible sidebar and adaptive layout for mobile and tablet screens.

---

## 🗂️ Project Structure 

```txt
opto-workplace/
├── index.html   # App structure — sidebar, pages, modals
├── style.css    # Neumorphic design system (variables, components, responsive rules)
├── script.js    # App state, rendering, CRUD logic, and PDF export
└── README.md
```

The project is intentionally split into three plain files with no build step, bundler, or framework — open `index.html` and it runs.

---

## 🚀 Getting Started

### Option 1 — Open directly
Clone the repo and open `index.html` in any modern browser:

```bash
git clone https://github.com/<your-username>/opto-workplace.git
cd opto-workplace
open index.html   # or double-click the file
```

### Option 2 — Serve locally (recommended)
Some browsers restrict `localStorage` on `file://` URLs, so a local server is safer:

```bash
# Python
python3 -m http.server 8000

# Node
npx serve .
```

Then visit `http://localhost:8000`.

### Option 3 — GitHub Pages
Enable GitHub Pages on this repo (Settings → Pages → deploy from `main`), and the app will be live at:
`https://<your-username>.github.io/opto-workplace/`

No environment variables, API keys, or configuration are required.

---

## 🖱️ Usage

1. **Add students** from the *Students* page.
2. **Mark attendance** daily from the *Attendance* page — select a date, toggle each student, and save.
3. **Log lectures** as you teach; switch to the *Monthly Calendar* tab to see the month at a glance.
4. **Build your timetable** by clicking any empty cell on the *Timetable* page.
5. **Track fees** per student per month, and generate a printable PDF receipt from the *Fee Management* page.
6. **Export reports** anytime from the *Reports* page — everything downloads as a PDF.

All changes save automatically to your browser's local storage under the key `Opto Workplace State v1`. Clearing your browser data will erase the records, so export reports regularly if you need backups.

---

## 🎨 Design System

The UI uses CSS custom properties defined at the top of `style.css`, making it easy to re-theme:

| Token | Purpose |
|---|---|
| `--bg` / `--surface` | Base neumorphic surface color |
| `--sh-light` / `--sh-dark` | Light and dark shadow sources for the raised/inset effect |
| `--accent` | Primary chalk-yellow accent |
| `--danger` / `--warning` / `--success` / `--info` | Status colors for badges and states |
| `--radius`, `--radius-lg`, `--radius-sm` | Corner rounding scale |

Two reusable shadow patterns power the whole interface:
- `--neu-out*` — raised elements (cards, buttons, stat tiles)
- `--neu-in*` — pressed/inset elements (inputs, active nav items, toggled buttons)

---

## 🛠️ Built With

- **HTML5** — semantic structure, no framework
- **CSS3** — custom properties, neumorphic shadow system, responsive grid/flexbox
- **Vanilla JavaScript** — state management and rendering, no dependencies
- **[jsPDF](https://github.com/parallax/jsPDF)** — client-side PDF generation (loaded via CDN)
- **Google Fonts** — Space Grotesk (headings) & Plus Jakarta Sans (body)

---

## 🤝 Contributing

Issues and pull requests are welcome. If you're proposing a UI change, please keep it consistent with the neumorphic design tokens in `style.css` rather than introducing new shadow/border styles.

1. Fork the repo
2. Create a branch (`git checkout -b feature/your-feature`)
3. Commit your changes
4. Open a pull request

---

## 📄 License

Released under the [MIT License](LICENSE). Free to use, modify, and distribute.

---

## 👤 Author

**Muhammad Asim Shakir**
