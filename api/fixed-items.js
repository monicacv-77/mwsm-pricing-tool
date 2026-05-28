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
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const auth = getAuth();
  const sheets = google.sheets({ version: "v4", auth });

  try {
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
    console.error("FixedItems API error:", err);
    return res.status(500).json({ error: err.message });
  }
};
