# 🛒 JK Store — Inventory Management Web App

> **AMET University | Build-to-Learn Summer Internship 2026**  
> 2nd Year BSc AI & ML | Web App Project

---

## 🎯 Problem Statement

**Stakeholder:** JK Store (family grocery / kirana business)  
**Problem:** Stock is tracked manually in a paper register. Items run out unexpectedly causing lost sales. The owner has no way to see which items are running low or which items sell most.

---

## 💡 Solution

A fully working web-based inventory management system built with pure HTML, CSS, and JavaScript — no backend needed, runs entirely in the browser.

### Features
- 📊 **Dashboard** — KPI cards, stock alerts, stock level bars, top sellers
- 📦 **Inventory** — Full item list with category filters, search, and edit/delete
- 🧾 **Record Sale** — Log a sale, auto-deducts stock, calculates total
- 🔄 **Restock** — Shows all low/critical items, enter quantity to restock
- 📋 **Activity Log** — Full history of sales, restocks, edits
- 📈 **Sales Report** — Total revenue, units sold, top selling items
- ⚙️ **Settings** — Store name, alert thresholds

### Data persistence
All data is saved to `localStorage` — works offline, no server needed.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Structure | HTML5 |
| Styling | CSS3 (custom, no frameworks) |
| Logic | Vanilla JavaScript (ES6+) |
| Fonts | Google Fonts (Inter + Space Grotesk) |
| Data | localStorage (browser-based persistence) |
| Deployment | GitHub Pages (free, no server) |

### AI Tools Used
- **Claude** — architecture, code review, debugging
- **GitHub Copilot** — boilerplate, autocomplete
- **ChatGPT** — CSS layout debugging

---

## 🚀 Running Locally

Just open `index.html` in any browser — no install, no server needed.

```bash
git clone https://github.com/YOUR_USERNAME/jkstore.git
cd jkstore
# Open index.html in browser
```

---

## ☁️ Deployment (GitHub Pages)

1. Push to GitHub
2. Go to repo **Settings → Pages**
3. Source: **Deploy from a branch** → `main` → `/ (root)`
4. Click **Save**
5. Live in ~1 minute at `https://YOUR_USERNAME.github.io/jkstore`

---

## 📈 Real-World Impact

| Before | After |
|--------|-------|
| Paper register, manual checking | Live dashboard, instant view |
| No stock alerts | Color-coded alerts (critical / low / ok) |
| No sales tracking | Every sale logged with totals |
| No visibility into top sellers | Top selling items chart |

---

## 📁 Project Structure

```
jkstore/
├── index.html       ← Complete app (single file)
├── README.md        ← This file
└── R0_PROPOSAL.md   ← Internship R0 submission
```

---

*Built by [Your Name] | 2nd Year BSc AI & ML | AMET University | June 2026*
