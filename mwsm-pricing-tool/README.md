# MWSM Shop Pricing Tool

Standalone pricing calculator for Paul to use for bids and estimates.
Connects to Google Sheets for live metal prices and product types.

---

## Setup Instructions

### 1. GitHub
Push this folder to a new GitHub repo named `mwsm-shop-pricing` under monicacv-77.

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/monicacv-77/mwsm-shop-pricing.git
git push -u origin main
```

### 2. Google Sheet
The Sheet ID is already configured: `14ekojokBLx1W2MC2vkZkLPYTR2FTqeGd2Qw3TvH-kmA`

Make sure the sheet is shared with:
`mwsm-timecard@mwsm-time-card.iam.gserviceaccount.com` (Editor)

### 3. Populate the Sheet (run once)
After setting up your .env file locally:

```bash
npm install
node setup-sheet.js
```

This creates the Metals, ProductTypes, and Settings tabs and populates all data.

### 4. Vercel Deployment
Create a new Vercel project linked to the `mwsm-shop-pricing` GitHub repo.

Add these Environment Variables in Vercel:

| Variable | Value |
|----------|-------|
| `REACT_APP_GOOGLE_SHEET_ID` | `14ekojokBLx1W2MC2vkZkLPYTR2FTqeGd2Qw3TvH-kmA` |
| `REACT_APP_SERVICE_ACCOUNT_EMAIL` | `mwsm-timecard@mwsm-time-card.iam.gserviceaccount.com` |
| `REACT_APP_PRIVATE_KEY` | (same private key as Timecard app) |

Deploy — done.

---

## Google Sheet Structure

### Metals tab
| Column | Description |
|--------|-------------|
| A — ID | Unique number |
| B — Name | e.g. "Galvanized — 26 ga" |
| C — Group | e.g. "Galvanized" |
| D — SheetCost | Price paid per sheet (48"×96") |
| E — CostPerSqIn | Auto-calculated (SheetCost ÷ 4608) |
| F — DateUpdated | Auto-stamped when price is updated |

### ProductTypes tab
| Column | Description |
|--------|-------------|
| A — ID | Unique number |
| B — Name | e.g. "Z-Bar" |
| C — DefaultMethod | "linear" or "piece" |

### Settings tab
| Row | Description |
|-----|-------------|
| Markup | COB/markup multiplier (default 1.20) |
| LaborRate | Labor rate for own metal ($/ft) |

---

## Updating Metal Prices
1. Open the app → Manage Metals tab
2. Click "Update Price" next to the metal
3. Enter the new sheet cost (what you paid per sheet)
4. Click Save — cost per sq inch and date updated automatically

When the supplier invoice agent is built, it will update prices automatically
by writing to the SheetCost column in the Metals tab.
