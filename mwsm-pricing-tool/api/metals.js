const { getSheets, SHEET_ID } = require("./_sheets");

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const sheets = getSheets();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "Metals!A2:G1000",
    });

    const rows = response.data.values || [];
    const metals = rows
      .filter(r => r[0] && r[1])
      .map(r => ({
        id: r[0],
        name: r[1],
        group: r[2] || "Other",
        sheetCost: parseFloat(r[3]) || 0,
        costPerSqIn: parseFloat(r[4]) || 0,
        dateUpdated: r[5] || "",
      }));

    res.status(200).json({ metals });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
