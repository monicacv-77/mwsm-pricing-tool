const { google } = require("googleapis");

function getSheets() {
    const privateKey = (process.env.REACT_APP_PRIVATE_KEY || "").replace(/\\n/g, "\n");
    const auth = new google.auth.GoogleAuth({
          credentials: {
                  client_email: process.env.REACT_APP_SERVICE_ACCOUNT_EMAIL,
                  private_key: privateKey,
          },
          scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    return google.sheets({ version: "v4", auth });
}

const SHEET_ID = process.env.REACT_APP_GOOGLE_SHEET_ID;

module.exports = async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, PUT, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") return res.status(200).end();

    try {
          const sheets = getSheets();

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

      if (req.method === "PUT") {
              const { name, defaultPricingMethod } = req.body;
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
          console.error("product-types error:", err.message);
          return res.status(500).json({ error: err.message });
    }
};
