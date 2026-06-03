const { google } = require("googleapis");

const QB_CLIENT_ID = process.env.QB_CLIENT_ID;
const QB_CLIENT_SECRET = process.env.QB_CLIENT_SECRET;
const QB_TOKEN_URL = "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer";
const SHEET_ID = process.env.REACT_APP_GOOGLE_SHEET_ID;
const REALM_ID = "9130357658852256";
const QB_BASE = "https://quickbooks.api.intuit.com";

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

async function getTokens() {
  const sheets = getSheets();
  const result = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: "Settings!A2:B20",
  });
  const rows = result.data.values || [];
  const get = (key) => (rows.find(r => r[0] === key) || [])[1] || "";
  return {
    accessToken: get("QB_ACCESS_TOKEN"),
    refreshToken: get("QB_REFRESH_TOKEN"),
    expiry: parseInt(get("QB_EXPIRY") || "0"),
  };
}

async function refreshAccessToken(refreshToken) {
  const credentials = Buffer.from(`${QB_CLIENT_ID}:${QB_CLIENT_SECRET}`).toString("base64");
  const res = await fetch(QB_TOKEN_URL, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });
  const tokens = await res.json();
  if (!tokens.access_token) throw new Error("Failed to refresh token");

  const sheets = getSheets();
  const result = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: "Settings!A2:B20",
  });
  const rows = result.data.values || [];
  const expiry = Date.now() + (tokens.expires_in * 1000);

  for (const [key, value] of [["QB_ACCESS_TOKEN", tokens.access_token], ["QB_EXPIRY", expiry.toString()]]) {
    const rowIndex = rows.findIndex(r => r[0] === key);
    if (rowIndex >= 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Settings!B${rowIndex + 2}`,
        valueInputOption: "RAW",
        requestBody: { values: [[value]] },
      });
    }
  }
  return tokens.access_token;
}

async function getValidToken() {
  const { accessToken, refreshToken, expiry } = await getTokens();
  if (!accessToken) throw new Error("Not connected to QuickBooks");
  if (Date.now() > expiry - 60000) {
    return await refreshAccessToken(refreshToken);
  }
  return accessToken;
}

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { customerId, customerName, lines, total } = req.body;
  if (!customerId || !lines || !lines.length) {
    return res.status(400).json({ error: "Customer and line items required" });
  }

  try {
    const token = await getValidToken();

    // Build QB invoice payload
    const invoice = {
      CustomerRef: { value: customerId, name: customerName },
      Line: lines.map((line, i) => ({
        LineNum: i + 1,
        Description: line.desc,
        Amount: parseFloat(line.price.toFixed(2)),
        DetailType: "SalesItemLineDetail",
        SalesItemLineDetail: {
          Qty: 1,
          UnitPrice: parseFloat(line.price.toFixed(2)),
        },
      })),
    };

    const url = `${QB_BASE}/v3/company/${REALM_ID}/invoice?minorversion=65`;
    const qbRes = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(invoice),
    });

    const data = await qbRes.json();
    if (data.Fault) {
      throw new Error(data.Fault.Error?.[0]?.Message || "QB API error");
    }

    const invoiceId = data.Invoice?.Id;
    const invoiceNum = data.Invoice?.DocNumber;
    return res.status(200).json({ success: true, invoiceId, invoiceNum });
  } catch (err) {
    console.error("QB invoice error:", err.message);
    return res.status(500).json({ error: err.message });
  }
};
