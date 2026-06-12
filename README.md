# Solar Plant Planner

A clean, browser-based solar project planning tool for estimating solar plant capacity, cost, energy output, savings, payback period, seasonal sunlight, and location suitability.

This project is built as a single static HTML file, so it can be published directly with GitHub Pages.

## Live Demo

After publishing with GitHub Pages, your site will be available at:

```text
https://your-username.github.io/your-repository-name/
```

## Features

- Location search using place name or latitude/longitude
- Solar plant capacity estimation
- Panel count calculation
- Daily and yearly energy output estimate
- Investment and equipment cost breakdown
- Payback period calculation
- Electricity savings estimate
- CO2 savings estimate
- Seasonal solar resource summary
- OpenStreetMap location preview
- Responsive design for mobile and desktop

## Tech Stack

- HTML
- CSS
- JavaScript
- OpenStreetMap
- NASA POWER API
- Open-Meteo API

## How It Works

The planner uses your selected location and project details to estimate:

- Available usable area
- Number of solar panels
- Plant capacity in kW
- Peak sun hours
- Daily generation
- Yearly savings
- Total installation cost
- Payback period
- Long-term environmental impact

## Project Inputs

You can enter:

- Location name, such as `NIT Warangal, Telangana`
- Or latitude and longitude
- Usable area in square meters
- Panel type
- Project type

## How To Publish On GitHub Pages

1. Create a new repository on GitHub.
2. Upload these files:
   - `index.html`
   - `README.md`
3. Go to repository **Settings**.
4. Open **Pages**.
5. Set source to **Deploy from a branch**.
6. Select the `main` branch.
7. Select `/root`.
8. Click **Save**.

GitHub will generate a live website link after a short wait.

## Local Preview

You can open `index.html` directly in your browser.

For the best preview, you can also run a small local server:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Important Note

This is the GitHub Pages version of the project. GitHub Pages only supports static websites, so backend features from the original Python Flask version, such as server-side scraping, Groq AI responses, and feedback storage, are not included.

Instead, this version uses browser-friendly public APIs and built-in calculations so it can run live on GitHub Pages without a server.

## Disclaimer

This tool provides estimated solar planning values for educational and early planning purposes. Before purchasing or installing a solar plant, always consult certified solar installers, compare multiple quotations, and confirm local electricity tariff and subsidy rules.

## Author

Made for solar project planning and feasibility estimation.
