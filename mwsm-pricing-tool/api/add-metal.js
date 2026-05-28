const { getSheets, SHEET_ID } = require("./_sheets");

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const { name, group, sheetCost } = req.body;
    if (!name || !group || !sheetCost) return res.status(400).json({ error: "Missing fields" });

    const sheets = getSheets();

    // Get existing to generate next ID
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "Metals!A2:A1000",
    });
    const rows = response.data.values || [];
    const nextId = rows.length > 0
      ? Math.max(...rows.map(r => parseInt(r[0]) || 0)) + 1
      : 1;

    const costPerSqIn = parseFloat(sheetCost) / (48 * 96);
    const dateUpdated = new Date().toLocaleDateString("en-US");

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: "Metals!A:F",
      valueInputOption: "RAW",
      requestBody: {
        values: [[nextId, name, group, parseFloat(sheetCost).toFixed(2), costPerSqIn.toFixed(6), dateUpdated]],
      },
    });

    res.status(200).json({ success: true, id: nextId, costPerSqIn, dateUpdated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
