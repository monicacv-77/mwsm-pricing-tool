const { google } = require("googleapis");

const QB_CLIENT_ID = process.env.QB_CLIENT_ID;
const QB_CLIENT_SECRET = process.env.QB_CLIENT_SECRET;
const QB_REDIRECT_URI = process.env.QB_REDIRECT_URI;
const QB_TOKEN_URL = "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer";
const SHEET_ID = process.env.REACT_APP_GOOGLE_SHEET_ID;

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
  const { code, realmId } = req.query;

  if (!code) return res.status(400).send("Missing authorization code");

  try {
    // Exchange code for tokens
    const credentials = Buffer.from(`${QB_CLIENT_ID}:${QB_CLIENT_SECRET}`).toString("base64");
    const tokenRes = await fetch(QB_TOKEN_URL, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: QB_REDIRECT_URI,
      }),
    });

    const tokens = await tokenRes.json();
    if (!tokens.access_token) throw new Error("Failed to get access token");

    const expiry = Date.now() + (tokens.expires_in * 1000);

    // Store tokens in Settings sheet
    const sheets = getSheets();
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "Settings!A2:B20",
    });
    const rows = result.data.values || [];

    const tokenData = {
      QB_ACCESS_TOKEN: tokens.access_token,
      QB_REFRESH_TOKEN: tokens.refresh_token,
      QB_EXPIRY: expiry.toString(),
      QB_REALM_ID: realmId || "9130357658852256",
    };

    // Update or append each token setting
    for (const [key, value] of Object.entries(tokenData)) {
      const rowIndex = rows.findIndex(r => r[0] === key);
      if (rowIndex >= 0) {
        await sheets.spreadsheets.values.update({
          spreadsheetId: SHEET_ID,
          range: `Settings!B${rowIndex + 2}`,
          valueInputOption: "RAW",
          requestBody: { values: [[value]] },
        });
      } else {
        await sheets.spreadsheets.values.append({
          spreadsheetId: SHEET_ID,
          range: "Settings!A:B",
          valueInputOption: "RAW",
          requestBody: { values: [[key, value]] },
        });
      }
    }

    // Redirect back to app with success
    res.writeHead(302, { Location: "https://mwsm-pricing-tool.vercel.app?qb=connected" });
    res.end();
  } catch (err) {
    console.error("QB callback error:", err.message);
    res.writeHead(302, { Location: "https://mwsm-pricing-tool.vercel.app?qb=error" });
    res.end();
  }
};
