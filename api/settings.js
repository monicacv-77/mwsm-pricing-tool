const { google } = require("googleapis");

function getSheets() {
  const privateKey = (process.env.REACT_APP_PRIVATE_KEY || "").replace(/\\n/g, "\n");
  const auth = new google.auth.JWT(
    process.env.REACT_APP_SERVICE_ACCOUNT_EMAIL,
    null,
    privateKey,
    ["https://www.googleapis.com/auth/spreadsheets"]
  );
  return google.sheets({ version: "v4", auth });
}

const SHEET_ID = process.env.REACT_APP_GOOGLE_SHEET_ID;

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const sheets = getSheets();

    if (req.method === "GET") {
      const result = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: "Settings!A2:B10",
      });
      const rows = result.data.values || [];
      const settings = {};
      rows.forEach(r => { if (r[0]) settings[r[0]] = isNaN(r[1]) ? r[1] : parseFloat(r[1]); });
      return res.status(200).json(settings);
    }

    if (req.method === "POST") {
      const { key, value } = req.body;
      const result = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: "Settings!A2:B10",
      });
      const rows = result.data.values || [];
      const rowIndex = rows.findIndex(r => r[0] === key);
      if (rowIndex === -1) return res.status(404).json({ error: "Setting not found" });
      const sheetRow = rowIndex + 2;
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Settings!B${sheetRow}`,
        valueInputOption: "RAW",
        requestBody: { values: [[value]] },
      });
      return res.status(200).json({ success: true });
    }

  } catch (err) {
    console.error("settings error:", err.message);
    return res.status(500).json({ error: err.message });
  }
};
