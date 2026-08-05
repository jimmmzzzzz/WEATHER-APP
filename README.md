# SYPHER — Editorial Weather Observatory
> A human-crafted, bespoke digital weather publication engineered for atmospheric precision.

SYPHER rejects generic modern web design templates—such as repetitive glassmorphism cards, default Inter typography, and saturated sky-blue gradients—in favor of a high-contrast, tactile editorial experience. Built with pure vanilla technologies, it translates raw meteorological metrics into an atmospheric magazine layout anchored by dramatic serif hero readouts, granular monospace field data, and dynamic solar math.

---
link: https://jimmmzzzzz.github.io/WEATHER-APP/
---

## 🎨 Design System & Editorial Rationale

### 1. Palette Strategy: Tactile Slate & Solar Ink
Rather than standard saturated blue backgrounds or generic AI-generated cream/terracotta defaults, ATMOS uses two atmospheric color systems tailored for daylight and nocturnal observations:

- **Daylight (Light Mode):** Tactile slate paper (`#ECE8F0`) with deep maritime ink (`#12161A`) and warm burnt amber accents (`#D96B27`).
- **Nocturnal (Dark Mode):** Deep void obsidian (`#0B0E11`) with high-density carbon tiles (`#14181D`), starlight frost white (`#EEF3F8`), and glowing phosphor ember (`#F28F3B`).

### 2. Editorial Typography Scale
- **Hero & Primary Metrics:** `Instrument Serif` — Dramatic, humanistic serif display numbers with extreme stroke contrast.
- **Data Markers & Coordinates:** `Space Mono` — Technical, sharp monospace for field notes, coordinates, and solar timestamps.
- **Interface & Narrative Body:** `Plus Jakarta Sans` — Clean, highly readable geometric sans-serif for labels and descriptions.

### 3. Signature Element: The Solar Elevation Arc
Integrated directly into the hero panel, the Solar Elevation Arc is a real-time SVG visualization that plots the sun's trajectory across a quadratic Bézier curve based on local sunrise and sunset times.

---

## 🛠️ Tech Stack & Architecture

- **Markup:** Semantic, accessible HTML5 with standard ARIA roles and screen-reader utilities (`.sr-only`).
- **Styling:** Modular CSS3 using native CSS Custom Properties (Variables), CSS Grid, Flexbox, custom focus states, and zero utility frameworks (Pure Vanilla CSS).
- **Scripting:** Vanilla ES6+ JavaScript using `async/await`, native `fetch`, state management, and SVG curve math.
- **Dependencies:** **Zero external NPM packages or UI frameworks.**

---

## ⚙️ Feature Overview

1. **Global City Search:** Instant query handling with submission via keyboard `Enter` or UI click.
2. **Built-In Mock Data Fallback:** Works out-of-the-box without an API key by generating realistic meteorological telemetry for any requested city.
3. **Hero Temperature & Condition Display:** Oversized serif readout, dynamic weather condition text, and bespoke inline vector icons.
4. **Atmospheric Metrics Grid:** Real-time data tiles for Humidity (with visual progress indicator), Wind Speed & Cardinal Direction, Barometric Pressure, and Visibility clarity.
5. **5-Day Synoptic Outlook:** Horizontal scannable forecast grid with condition highlights and daily high/low range scales.
6. **Geolocation (📍):** Instant location detection via `navigator.geolocation` with coordinate rendering.
7. **Theme Persistence (🌙/☀️):** Smooth color palette transition saved directly to `localStorage`.

---

## 📁 File Structure

```text
atmos-weather-app/
├── index.html     # Semantic HTML structure & SVG definitions
├── styles.css     # CSS Custom properties, grid layout & animations
├── style.js         # State management, API handling & solar arc math
└── README.md      # Project documentation
