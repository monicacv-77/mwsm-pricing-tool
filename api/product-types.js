const { google } = require("googleapis");

const SHEET_ID = process.env.REACT_APP_GOOGLE_SHEET_ID;

function getAuth() {
  const privateKey = process.env.REACT_APP_PRIVATE_KEY?.replace(/\\n/g, "\n");
  return new google.auth.JWT(
    process.env.REACT_APP_SERVICE_ACCOUNT_EMAIL,
    null,
    privateKey,
    ["https://www.googleapis.com/auth/spreadsheets"]
  );
}

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, PUT, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const auth = getAuth();
  const sheets = google.sheets({ version: "v4", auth });

  try {
    if (req.method === "GET") {
      const result = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: "ProductTypes!A2:C100",
      });
      const rows = result.data.values || [];
      const types = rows
        .filter(r => r[0] && r[1])
        .map(r => ({
          id: Number(r[0]),
          name: r[1],
          defaultPricingMethod: r[2] || "linear",
        }));
      return res.status(200).json(types);
    }

    // PUT — add a new product type
    if (req.method === "PUT") {
      const { name, defaultPricingMethod } = req.body;
      if (!name) return res.status(400).json({ error: "Name required" });

      const result = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: "ProductTypes!A2:A100",
      });
      const rows = result.data.values || [];
      const maxId = rows.reduce((max, r) => Math.max(max, Number(r[0]) || 0), 0);
      const newId = maxId + 1;

      await sheets.spreadsheets.values.append({
        spreadsheetId: SHEET_ID,
        range: "ProductTypes!A:C",
        valueInputOption: "RAW",
        requestBody: { values: [[newId, name, defaultPricingMethod || "linear"]] },
      });

      return res.status(200).json({ success: true, id: newId });
    }

  } catch (err) {
    console.error("ProductTypes API error:", err);
    return res.status(500).json({ error: err.message });
  }
};
