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
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const sheets = getSheets();

    // GET — fetch all metals
    if (req.method === "GET") {
      const result = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: "Metals!A2:F200",
      });
      const rows = result.data.values || [];
      const metals = rows
        .filter(r => r[0] && r[1])
        .map(r => ({
          id: Number(r[0]),
          name: r[1],
          group: r[2] || "",
          sheetCost: parseFloat(r[3]) || 0,
          sheetWidth: parseInt(r[4]) || 48,
          dateUpdated: r[5] || "",
        }));
      return res.status(200).json(metals);
    }

    // POST — update sheet cost (when Paul gets new invoice)
    if (req.method === "POST") {
      const { id, sheetCost } = req.body;
      const result = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: "Metals!A2:F200",
      });
      const rows = result.data.values || [];
      const rowIndex = rows.findIndex(r => Number(r[0]) === Number(id));
      if (rowIndex === -1) return res.status(404).json({ error: "Metal not found" });
      const sheetRow = rowIndex + 2;
      const today = new Date().toISOString().split("T")[0];
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Metals!D${sheetRow}:F${sheetRow}`,
        valueInputOption: "RAW",
        requestBody: { values: [[sheetCost, rows[rowIndex][4] || 48, today]] },
      });
      return res.status(200).json({ success: true, dateUpdated: today });
    }

    // PUT — add a new metal
    if (req.method === "PUT") {
      const { name, group, sheetCost, sheetWidth } = req.body;
      if (!name || isNaN(sheetCost)) return res.status(400).json({ error: "Invalid data" });
      const result = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: "Metals!A2:A200",
      });
      const rows = result.data.values || [];
      const maxId = rows.reduce((max, r) => Math.max(max, Number(r[0]) || 0), 0);
      const newId = maxId + 1;
      const today = new Date().toISOString().split("T")[0];
      await sheets.spreadsheets.values.append({
        spreadsheetId: SHEET_ID,
        range: "Metals!A:F",
        valueInputOption: "RAW",
        requestBody: { values: [[newId, name, group, sheetCost, sheetWidth || 48, today]] },
      });
      return res.status(200).json({ success: true, id: newId, dateUpdated: today });
    }

    // DELETE — remove a metal
    if (req.method === "DELETE") {
      const { id } = req.body;
      const result = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: "Metals!A2:F200",
      });
      const rows = result.data.values || [];
      const filtered = rows.filter(r => Number(r[0]) !== Number(id));
      await sheets.spreadsheets.values.clear({ spreadsheetId: SHEET_ID, range: "Metals!A2:F200" });
      if (filtered.length > 0) {
        await sheets.spreadsheets.values.update({
          spreadsheetId: SHEET_ID, range: "Metals!A2",
          valueInputOption: "RAW", requestBody: { values: filtered },
        });
      }
      return res.status(200).json({ success: true });
    }

  } catch (err) {
    console.error("metals error:", err.message);
    return res.status(500).json({ error: err.message });
  }
};
