const { getSheets, SHEET_ID } = require("./_sheets");

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    if (req.method === "POST") {
      // Add new product type
      const { name, defaultMethod } = req.body;
      if (!name) return res.status(400).json({ error: "Missing name" });

      const sheets = getSheets();
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: "ProductTypes!A2:A1000",
      });
      const rows = response.data.values || [];
      const nextId = rows.length > 0
        ? Math.max(...rows.map(r => parseInt(r[0]) || 0)) + 1
        : 1;

      await sheets.spreadsheets.values.append({
        spreadsheetId: SHEET_ID,
        range: "ProductTypes!A:C",
        valueInputOption: "RAW",
        requestBody: { values: [[nextId, name, defaultMethod || "linear"]] },
      });

      return res.status(200).json({ success: true, id: nextId });
    }

    // GET - return all product types
    const sheets = getSheets();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "ProductTypes!A2:C1000",
    });

    const rows = response.data.values || [];
    const productTypes = rows
      .filter(r => r[0] && r[1])
      .map(r => ({
        id: r[0],
        name: r[1],
        defaultMethod: r[2] || "linear",
      }));

    res.status(200).json({ productTypes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
