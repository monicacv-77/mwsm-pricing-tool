const { getSheets, SHEET_ID } = require("./_sheets");

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const sheets = getSheets();

    if (req.method === "POST") {
      const { markup, laborRate } = req.body;
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: "Settings!B2:B3",
        valueInputOption: "RAW",
        requestBody: { values: [[markup], [laborRate]] },
      });
      return res.status(200).json({ success: true });
    }

    // GET
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "Settings!A2:B10",
    });

    const rows = response.data.values || [];
    const settings = {};
    rows.forEach(r => {
      if (r[0] === "Markup") settings.markup = parseFloat(r[1]) || 1.20;
      if (r[0] === "LaborRate") settings.laborRate = parseFloat(r[1]) || 25;
    });

    res.status(200).json(settings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
