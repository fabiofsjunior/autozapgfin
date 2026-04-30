// =======================
// 🔧 CONFIG
// =======================
const VERIFY_TOKEN = "autozapfinapp";
const WHATSAPP_TOKEN = "SEU_WHATSAPP_TOKEN";
const PHONE_NUMBER_ID = "SEU_PHONE_ID";
const GEMINI_API_KEY = "AIzaSyAbafJd_ZIFhI_nNe_FQk8p1iMpaA-6UPE";

// =======================
// 🔐 WEBHOOK META
// =======================
function doGet(e) {

  // validação META
  if (
    e.parameter["hub.mode"] === "subscribe" &&
    e.parameter["hub.verify_token"] === VERIFY_TOKEN
  ) {
    return ContentService.createTextOutput(e.parameter["hub.challenge"]);
  }

  // 🔥 API WEB (HTML)
  if (e.parameter.mode === "web") {
    const sheet = getOrCreateMonthlySheet();
    const data = sheet.getDataRange().getValues();

    const headers = data[0];

    const json = data.slice(1).map(row => {
      let obj = {};
      headers.forEach((h, i) => obj[h] = row[i]);
      return obj;
    });

    return jsonResponse(json);
  }

  return ContentService.createTextOutput("OK");
}

// =======================
// 📩 POST (WEB + CRUD)
// =======================
function doPost(e) {

  const sheet = getOrCreateMonthlySheet();
  const data = JSON.parse(e.postData.contents);

  // 🔥 DELETE
  if (data.action === "delete") {
    deletarPorId(sheet, data.id);
    return jsonResponse({ status: "deleted" });
  }

  // 🔥 EDIT
  if (data.action === "edit") {
    editarPorId(sheet, data);
    return jsonResponse({ status: "edited" });
  }

  // 🔥 CREATE
  const now = new Date();

  sheet.appendRow([
    getNextID(sheet),
    formatarData(now),
    formatarHora(now),
    data.descricao,
    "Despesa",
    data.tipoPagamento,
    data.categoria,
    data.valor
  ]);

  return jsonResponse({ status: "created" });
}

// =======================
// ✏️ EDITAR
// =======================
function editarPorId(sheet, data) {
  const values = sheet.getDataRange().getValues();

  for (let i = 1; i < values.length; i++) {
    if (values[i][0] == data.id) {

      sheet.getRange(i + 1, 4).setValue(data.descricao);
      sheet.getRange(i + 1, 8).setValue(data.valor);

      return;
    }
  }
}

// =======================
// 🗑️ DELETAR
// =======================
function deletarPorId(sheet, id) {
  const values = sheet.getDataRange().getValues();

  for (let i = 1; i < values.length; i++) {
    if (values[i][0] == id) {
      sheet.deleteRow(i + 1);
      return;
    }
  }
}

// =======================
// 📦 PLANILHA MENSAL
// =======================
function getOrCreateMonthlySheet() {

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const name = getMonthName(new Date());

  let sheet = ss.getSheetByName(name);

  if (!sheet) {
    sheet = ss.insertSheet(name);

    sheet.appendRow([
      "ID","Data","Hora","Descrição","Tipo","Pagamento","Categoria","Valor"
    ]);

    // formatação
    sheet.getRange("A:H").setHorizontalAlignment("center");
    sheet.getRange("H:H").setNumberFormat('"R$" #,##0.00');
    sheet.autoResizeColumns(1, 8);
  }

  return sheet;
}

// =======================
// 📅 NOME DA ABA
// =======================
function getMonthName(d) {
  const meses = ["JAN","FEV","MAR","ABR","MAI","JUN","JUL","AGO","SET","OUT","NOV","DEZ"];
  return meses[d.getMonth()] + String(d.getFullYear()).slice(-2);
}

// =======================
// 🔢 ID
// =======================
function getNextID(sheet) {
  const last = sheet.getLastRow();
  return last <= 1 ? 1 : sheet.getRange(last,1).getValue() + 1;
}

// =======================
function formatarData(d){
  return Utilities.formatDate(d, Session.getScriptTimeZone(), "dd/MM/yyyy");
}

function formatarHora(d){
  return Utilities.formatDate(d, Session.getScriptTimeZone(), "HH:mm:ss");
}

function jsonResponse(obj){
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}