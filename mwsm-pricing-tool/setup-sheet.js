// Run this once to set up the Google Sheet structure and populate initial metal data
// node setup-sheet.js

const { google } = require("googleapis");
require("dotenv").config();

const SHEET_ID = "14ekojokBLx1W2MC2vkZkLPYTR2FTqeGd2Qw3TvH-kmA";

const auth = new google.auth.JWT(
  process.env.REACT_APP_SERVICE_ACCOUNT_EMAIL,
  null,
  process.env.REACT_APP_PRIVATE_KEY.replace(/\\n/g, "\n"),
  ["https://www.googleapis.com/auth/spreadsheets"]
);

const sheets = google.sheets({ version: "v4", auth });

const METALS = [
  [1,"Stainless 316 — 26 ga","Stainless 316",480.68,0.104314,""],
  [2,"Stainless 316 — 24 ga","Stainless 316",265.81,0.057717,""],
  [3,"Stainless 316 — 22 ga","Stainless 316",142.78,0.030977,""],
  [4,"Stainless 304 — 26 ga","Stainless 304",97.58,0.021181,""],
  [5,"Stainless 304 — 24 ga","Stainless 304",99.00,0.021484,""],
  [6,"Stainless 304 — 22 ga","Stainless 304",244.00,0.052951,""],
  [7,"Stainless 304 — 20 ga","Stainless 304",195.30,0.042361,""],
  [8,"Stainless 304 — 18 ga","Stainless 304",214.55,0.046549,""],
  [9,"Stainless 304 — 16 ga","Stainless 304",194.80,0.042253,""],
  [10,"SS 304 Brushed — 24 ga","SS 304 Brushed",137.55,0.029839,""],
  [11,"SS 304 Brushed — 22 ga","SS 304 Brushed",280.72,0.060894,""],
  [12,"SS 304 Brushed — 20 ga","SS 304 Brushed",165.12,0.035807,""],
  [13,"SS 304 Brushed — 18 ga","SS 304 Brushed",354.08,0.076780,""],
  [14,"Aluminum — 16 ga","Aluminum",134.33,0.029123,""],
  [15,"Aluminum — 14 ga","Aluminum",134.33,0.029123,""],
  [16,"Aluminum — 16 ga (heavy)","Aluminum",197.73,0.042891,""],
  [17,"Painted Aluminum — 20 ga","Aluminum",101.33,0.021975,""],
  [18,"Anodized — Dark Bronze","Anodized Aluminum",238.11,0.051628,""],
  [19,"Anodized — Clear","Anodized Aluminum",274.68,0.059570,""],
  [20,"Anodized — Mill Finish","Anodized Aluminum",138.00,0.029918,""],
  [21,"Anodized — Mill Finish 8'","Anodized Aluminum",113.55,0.024622,""],
  [22,"Anodized — Mill Finish 10'","Anodized Aluminum",138.00,0.029918,""],
  [23,"Galvanized — 28 ga","Galvanized",32.96,0.007148,""],
  [24,"Galvanized — 26 ga","Galvanized",42.73,0.009266,""],
  [25,"Galvanized — 24 ga","Galvanized",48.83,0.010590,""],
  [26,"Galvanized — 22 ga","Galvanized",46.71,0.010127,""],
  [27,"Galvanized — 20 ga","Galvanized",103.82,0.022504,""],
  [28,"Galvanized — 18 ga","Galvanized",77.07,0.016710,""],
  [29,"Galvanized — 16 ga","Galvanized",128.21,0.027799,""],
  [30,"Galvanized — 14 ga","Galvanized",128.21,0.027799,""],
  [31,"Galvanized — 28 ga (3' sheet)","Galvanized",35.81,0.007766,""],
  [32,"Galvanized — 26 ga (5' sheet)","Galvanized",26.38,0.005719,""],
  [33,"Galvanized — 24 ga (5' sheet)","Galvanized",44.93,0.009743,""],
  [34,"Cold Rolled Steel — 22 ga","Cold Rolled Steel",64.70,0.014032,""],
  [35,"Cold Rolled Steel — 18 ga","Cold Rolled Steel",101.33,0.021975,""],
  [36,"Cold Rolled Steel — 16 ga","Cold Rolled Steel",113.55,0.024622,""],
  [37,"Painted — 26 ga","Painted & Coated",40.03,0.008681,""],
  [38,"Painted Steel","Painted & Coated",43.96,0.009531,""],
  [39,"Bonderized — 26 ga","Painted & Coated",36.63,0.007943,""],
  [40,"Bonderized — 24 ga","Painted & Coated",48.83,0.010590,""],
  [41,"Bonderized — 22 ga","Painted & Coated",73.26,0.015885,""],
  [42,"Corten — 22 ga","Painted & Coated",115.98,0.025152,""],
  [43,"Kynar — 24 ga (Taylor)","Kynar & Specialty",76.36,0.016547,""],
  [44,"Kynar — 24 ga (Metal Sales)","Kynar & Specialty",127.02,0.027535,""],
  [45,"Kynar — 22 ga","Kynar & Specialty",84.84,0.018391,""],
  [46,"Galvalume — 22 ga","Kynar & Specialty",70.84,0.015356,""],
  [47,"Galvalume — 24 ga","Kynar & Specialty",85.49,0.018533,""],
  [48,"Zincalume — 24 ga","Kynar & Specialty",36.63,0.007943,""],
  [49,"Zinc — 24 ga","Kynar & Specialty",280.72,0.060894,""],
  [50,"Copper 12 oz (3' sheet)","Copper",184.03,0.039890,""],
  [51,"Copper 16 oz (3' sheet)","Copper",330.28,0.071615,""],
  [52,"Copper 16 oz (4' sheet)","Copper",448.38,0.097222,""],
  [53,"Copper 20 oz (3' sheet)","Copper",433.01,0.093895,""],
  [54,"Copper 20 oz (4' sheet)","Copper",488.57,0.105903,""],
  [55,"Diamond Floor Plate","Other",348.10,0.075456,""],
  [56,"PVC — 24 ga","Other",231.24,0.050130,""],
];

const PRODUCT_TYPES = [
  [1,"Z-Bar","linear"],
  [2,"L-Metal","linear"],
  [3,"J-Channel","linear"],
  [4,"U-Channel","linear"],
  [5,"Drip Edge","linear"],
  [6,"Coping","linear"],
  [7,"Flat Pan","piece"],
  [8,"Custom","linear"],
];

const SETTINGS = [
  ["Markup", 1.20],
  ["LaborRate", 25],
];

async function setup() {
  console.log("Setting up Google Sheet...");

  // Create sheets if they don't exist, then write headers + data
  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
  const existingSheets = spreadsheet.data.sheets.map(s => s.properties.title);
  console.log("Existing sheets:", existingSheets);

  // Add missing sheets
  const needed = ["Metals", "ProductTypes", "Settings"];
  const toAdd = needed.filter(n => !existingSheets.includes(n));
  if (toAdd.length > 0) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        requests: toAdd.map(title => ({
          addSheet: { properties: { title } }
        }))
      }
    });
    console.log("Created sheets:", toAdd);
  }

  // Write Metals
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: "Metals!A1:F1",
    valueInputOption: "RAW",
    requestBody: { values: [["ID","Name","Group","SheetCost","CostPerSqIn","DateUpdated"]] }
  });
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `Metals!A2:F${METALS.length + 1}`,
    valueInputOption: "RAW",
    requestBody: { values: METALS }
  });
  console.log(`✓ Metals: ${METALS.length} rows written`);

  // Write ProductTypes
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: "ProductTypes!A1:C1",
    valueInputOption: "RAW",
    requestBody: { values: [["ID","Name","DefaultMethod"]] }
  });
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `ProductTypes!A2:C${PRODUCT_TYPES.length + 1}`,
    valueInputOption: "RAW",
    requestBody: { values: PRODUCT_TYPES }
  });
  console.log(`✓ ProductTypes: ${PRODUCT_TYPES.length} rows written`);

  // Write Settings
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: "Settings!A1:B1",
    valueInputOption: "RAW",
    requestBody: { values: [["Setting","Value"]] }
  });
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `Settings!A2:B${SETTINGS.length + 1}`,
    valueInputOption: "RAW",
    requestBody: { values: SETTINGS }
  });
  console.log(`✓ Settings written`);

  console.log("\n✅ Google Sheet setup complete!");
  console.log("Sheet URL: https://docs.google.com/spreadsheets/d/" + SHEET_ID);
}

setup().catch(console.error);
