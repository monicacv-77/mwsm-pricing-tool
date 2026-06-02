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
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const sheets = getSheets();
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "FixedItems!A2:C100",
    });
    const rows = result.data.values || [];
    const items = rows
      .filter(r => r[0] && r[1])
      .map(r => ({
        id: Number(r[0]),
        name: r[1],
        price: parseFloat(r[2]) || 0,
      }));
    return res.status(200).json(items);
  } catch (err) {
    console.error("fixed-items error:", err.message);
    return res.status(500).json({ error: err.message });
  }
};
