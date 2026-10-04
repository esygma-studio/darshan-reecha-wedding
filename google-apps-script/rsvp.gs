/**
 * RSVP form → Google Sheets backend.
 *
 * SETUP
 * 1. Open (or create) the Google Sheet you want RSVP responses to land in.
 * 2. In the Sheet menu: Extensions > Apps Script.
 * 3. Delete whatever placeholder code is there, paste this whole file in.
 * 4. Click Deploy > New deployment.
 *    - Click the gear icon next to "Select type" and choose "Web app".
 *    - Description: anything, e.g. "RSVP endpoint".
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Click Deploy. The first time, Google will ask you to authorize the
 *    script — approve it (it's your own script, acting on your own sheet).
 * 6. Copy the "Web app URL" shown after deploying (it ends in /exec).
 * 7. Paste that URL as RSVP_ENDPOINT in src/data/wedding.ts on the website.
 *
 * If you edit this script later, you must create a NEW deployment (or use
 * Deploy > Manage deployments > Edit > New version) for changes to take
 * effect — saving the script alone does not update the live /exec URL.
 *
 * The admin dashboard (site.com/admin) reads responses back via a GET
 * request to this same /exec URL (see doGet below) — no separate setup
 * needed beyond the one deployment above.
 *
 * Two site variants (the full wedding site and the reception-only invite
 * link) both POST here into this same 'RSVP' tab — data.inviteType tags
 * each row so the couple can tell them apart in one unified sheet/dashboard
 * instead of needing separate tabs.
 */
function doPost(e) {
  var data = JSON.parse(e.postData.contents);

  var sheet =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName('RSVP') ||
    SpreadsheetApp.getActiveSpreadsheet().insertSheet('RSVP');

  var headers = [
    'Timestamp',
    'Name',
    'Phone',
    'Attending',
    'Guest Count',
    'Rooting For',
    'Excitement',
    'Most Excited Event',
    'Attending Events',
    'Wish',
    'Invited To',
  ];

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  } else if (sheet.getLastColumn() < headers.length) {
    // Sheet already has rows from an earlier column layout — extend the
    // header rather than losing that data.
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }

  var rowValues = [
    new Date(),
    data.name || '',
    data.phone || '',
    data.attending || '',
    data.guestCount || '',
    data.rootingFor || '',
    data.excitement || '',
    data.mostExcited || '',
    data.attendingEvents || '',
    data.wish || '',
    data.inviteType || 'Full Wedding',
  ];

  var rowIndex = sheet.getLastRow() + 1;
  // Force every column except Timestamp to plain-text format BEFORE writing
  // — otherwise Sheets auto-interprets a value starting with +, -, =, or @
  // as a formula (an international phone number like "+61 400 000 000"
  // came back as #ERROR! before this fix).
  sheet.getRange(rowIndex, 2, 1, rowValues.length - 1).setNumberFormat('@');
  sheet.getRange(rowIndex, 1, 1, rowValues.length).setValues([rowValues]);

  return ContentService.createTextOutput(
    JSON.stringify({ result: 'success' }),
  ).setMimeType(ContentService.MimeType.JSON);
}

/** Returns every RSVP row as JSON, for the admin dashboard to read. */
function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('RSVP');

  if (!sheet || sheet.getLastRow() < 2) {
    return ContentService.createTextOutput(
      JSON.stringify({ rows: [] }),
    ).setMimeType(ContentService.MimeType.JSON);
  }

  var values = sheet.getDataRange().getValues();
  var headers = values[0];
  var rows = values.slice(1).map(function (row) {
    var obj = {};
    headers.forEach(function (header, i) {
      var cell = row[i];
      obj[header] = cell instanceof Date ? cell.toISOString() : cell;
    });
    return obj;
  });

  return ContentService.createTextOutput(
    JSON.stringify({ rows: rows }),
  ).setMimeType(ContentService.MimeType.JSON);
}
