const { google } = require("googleapis");

// QB OAuth2 configuration
const QB_CLIENT_ID = process.env.QB_CLIENT_ID;
const QB_CLIENT_SECRET = process.env.QB_CLIENT_SECRET;
const QB_REDIRECT_URI = process.env.QB_REDIRECT_URI;
const QB_ENVIRONMENT = process.env.QB_ENVIRONMENT || "production";
const SHEET_ID = process.env.REACT_APP_GOOGLE_SHEET_ID;

const QB_AUTH_URL = "https://appcenter.intuit.com/connect/oauth2";
const QB_TOKEN_URL = "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer";
const QB_SCOPES = "com.intuit.quickbooks.accounting";

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

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { action } = req.query;

  // Generate OAuth URL for connecting to QB
  if (action === "connect") {
    const state = Math.random().toString(36).substring(2);
    const params = new URLSearchParams({
      client_id: QB_CLIENT_ID,
      scope: QB_SCOPES,
      redirect_uri: QB_REDIRECT_URI,
      response_type: "code",
      state,
    });
    return res.status(200).json({ url: `${QB_AUTH_URL}?${params.toString()}` });
  }

  // Check if QB is connected (tokens exist in Settings sheet)
  if (action === "status") {
    try {
      const sheets = getSheets();
      const result = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: "Settings!A2:B20",
      });
      const rows = result.data.values || [];
      const tokenRow = rows.find(r => r[0] === "QB_ACCESS_TOKEN");
      return res.status(200).json({ connected: !!tokenRow && !!tokenRow[1] });
    } catch (err) {
      return res.status(200).json({ connected: false });
    }
  }

  // Disconnect - clear tokens
  if (action === "disconnect") {
    try {
      const sheets = getSheets();
      const result = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: "Settings!A2:B20",
      });
      const rows = result.data.values || [];
      const updated = rows.map(r =>
        ["QB_ACCESS_TOKEN", "QB_REFRESH_TOKEN", "QB_EXPIRY"].includes(r[0])
          ? [r[0], ""]
          : r
      );
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: "Settings!A2",
        valueInputOption: "RAW",
        requestBody: { values: updated },
      });
      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(400).json({ error: "Invalid action" });
};
