const { getSheets, SHEET_ID } = require("./_sheets");

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const { id, sheetCost } = req.body;
    if (!id || !sheetCost) return res.status(400).json({ error: "Missing id or sheetCost" });

    const sheets = getSheets();

    // Find the row with this ID
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "Metals!A2:A1000",
    });

    const rows = response.data.values || [];
    const rowIndex = rows.findIndex(r => r[0] === String(id));
    if (rowIndex === -1) return res.status(404).json({ error: "Metal not found" });

    const sheetRow = rowIndex + 2; // +2 for header and 0-index
    const costPerSqIn = parseFloat(sheetCost) / (48 * 96);
    const dateUpdated = new Date().toLocaleDateString("en-US");

    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `Metals!D${sheetRow}:F${sheetRow}`,
      valueInputOption: "RAW",
      requestBody: {
        values: [[parseFloat(sheetCost).toFixed(2), costPerSqIn.toFixed(6), dateUpdated]],
      },
    });

    res.status(200).json({ success: true, costPerSqIn, dateUpdated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
