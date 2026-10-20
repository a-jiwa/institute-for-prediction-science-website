# Institute for Prediction Science

Website for [Institute for Prediction Science](https://a-jiwa.github.io/forecasting-institute/), built with React, Vite, and Tailwind CSS.

**Live site:** [https://a-jiwa.github.io/forecasting-institute/](https://a-jiwa.github.io/forecasting-institute/)

## Stack

- **React 19** with TypeScript
- **Vite** for dev/build
- **Tailwind CSS v4** for styling
- **React Router** for client-side routing
- **Lenis** for smooth scrolling
- **Splide** for the featured work carousel

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Build

```bash
npm run build
npm run preview
```

`npm run preview` serves the production build at `/forecasting-institute/`, matching GitHub Pages.

## Deploy to GitHub Pages

This repo is configured for a GitHub project site:

- **Repository:** [github.com/a-jiwa/forecasting-institute](https://github.com/a-jiwa/forecasting-institute)
- **URL:** `https://a-jiwa.github.io/forecasting-institute/`

### One-time GitHub setup

1. Create a public repository named `forecasting-institute` under [@a-jiwa](https://github.com/a-jiwa).
2. Push this project to the `main` branch.
3. In the repo, go to **Settings → Pages**.
4. Under **Build and deployment**, set **Source** to **GitHub Actions**.

### Automatic deploys

Every push to `main` runs `.github/workflows/deploy.yml`, which builds the site and publishes the `dist` folder to GitHub Pages.

You can also trigger a deploy manually from the **Actions** tab.

## Pages

| Route | Description |
|-------|-------------|
| `/` | Homepage |
| `/research` | Research projects and papers |
| `/about` | About page with team sections |
| `/careers` | Open positions |
| `/privacy-policy` | Privacy & cookie policy |
| `/research/:slug` | Research detail pages |
| `/careers/:slug` | Job detail pages |
| `/team/:slug` | Team member pages |

## Assets

Fonts, hero videos, and icons are bundled locally under `public/assets/`. Some research images are still hosted on an external CDN.

## Notes

Detail pages cover research articles, careers, and team members for Institute for Prediction Science.
