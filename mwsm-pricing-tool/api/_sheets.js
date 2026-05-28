const { google } = require("googleapis");

function getAuth() {
  const privateKey = process.env.REACT_APP_PRIVATE_KEY
    ? process.env.REACT_APP_PRIVATE_KEY.replace(/\\n/g, "\n")
    : "";

  return new google.auth.JWT(
    process.env.REACT_APP_SERVICE_ACCOUNT_EMAIL,
    null,
    privateKey,
    ["https://www.googleapis.com/auth/spreadsheets"]
  );
}

function getSheets() {
  return google.sheets({ version: "v4", auth: getAuth() });
}

const SHEET_ID = process.env.REACT_APP_GOOGLE_SHEET_ID;

module.exports = { getAuth, getSheets, SHEET_ID };
