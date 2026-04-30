
const VERIFY_TOKEN = "autozapfinapp";
const WHATSAPP_TOKEN = "SEU_WHATSAPP_TOKEN";
const PHONE_NUMBER_ID = "SEU_PHONE_ID";
const GEMINI_API_KEY = "AIzaSyAbafJd_ZIFhI_nNe_FQk8p1iMpaA-6UPE";

// =======================
// 🔐 WEBHOOK META
// =======================
function doGet(e) {
  if (
    e.parameter["hub.mode"] === "subscribe" &&
    e.parameter["hub.verify_token"] === VERIFY_TOKEN
  ) {
    return ContentService.createTextOutput(e.parameter["hub.challenge"]);
  }
  return ContentService.createTextOutput("OK");
}

// =======================
// 📩 WHATSAPP RECEIVER
// =======================
function doPost(e) {
  try {

    const body = JSON.parse(e.postData.contents);

    const value = body?.entry?.[0]?.changes?.[0]?.value;

    const msg =
      value?.messages?.[0]?.text?.body ||
      value?.messages?.[0]?.interactive?.button_reply?.title;

    if (!msg) return jsonResponse({ status: "no message" });

    const sheet = getOrCreateMonthlySheet();

    const linhas = msg
      .replace(/\r/g, "")
      .split("\n")
      .map(l => l.trim())
      .filter(l => l);

    let respostas = [];

    linhas.forEach(linha => {

      let lancamento = parseSimples(linha);

      if (!lancamento && GEMINI_API_KEY) {
        lancamento = chamarGemini(linha);
      }

      if (!lancamento) {
        respostas.push("⚠️ Não entendi: " + linha);
        return;
      }

      const now = new Date();

      sheet.appendRow([
        getNextID(sheet),
        formatarData(now),
        formatarHora(now),
        lancamento.descricao,
        lancamento.tipo,
        lancamento.forma_pagamento,
        lancamento.categoria,
        lancamento.valor
      ]);

      respostas.push("💰 OK: " + lancamento.descricao);
    });

    enviarWhats(respostas.join("\n"), body);

    return jsonResponse({ status: "ok" });

  } catch (err) {
    return jsonResponse({ status: "erro", msg: err.message });
  }
}

// =======================
// 🧠 PARSER MANUAL
// =======================
function parseSimples(msg) {

  const regex = /(\d+[.,]?\d*)\s*\$\s*(.*)/i;
  const match = msg.match(regex);

  if (!match) return null;

  const valor = parseFloat(match[1].replace(",", "."));

  const partes = match[2].split(",");

  return {
    valor,
    descricao: (partes[0] || "").trim(),
    forma_pagamento: (partes[1] || "pix").trim(),
    categoria: (partes[2] || "outros").trim(),
    tipo: "Despesa"
  };
}

// =======================
// 🤖 GEMINI
// =======================
function chamarGemini(texto) {

  try {

    const url =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" +
      GEMINI_API_KEY;

    const payload = {
      contents: [{
        parts: [{
          text: `
Extraia JSON financeiro:

"${texto}"

Formato:
{
  "valor": 0,
  "descricao": "",
  "forma_pagamento": "",
  "categoria": "",
  "tipo": "Despesa ou Receita"
}
`
        }]
      }]
    };

    const res = UrlFetchApp.fetch(url, {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(payload)
    });

    const json = JSON.parse(res.getContentText());
    const text = json.candidates[0].content.parts[0].text;

    return JSON.parse(text);

  } catch (e) {
    return null;
  }
}

// =======================
// 📦 PLANILHA MENSAL + FORMATAÇÃO (FIX PRINCIPAL)
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

    // 🔥 FORMATAÇÃO AUTOMÁTICA (CORREÇÃO QUE VOCÊ QUERIA)
      // 🔥 AUTO AJUSTE DE COLUNAS (AQUI)
    sheet.autoResizeColumns(1, sheet.getLastColumn());
    const range = sheet.getRange(1, 1, 1, 8);

    range.setHorizontalAlignment("center");
    range.setFontWeight("bold");

    sheet.setColumnWidths(1, 8, 140);

    // coluna valor (R$)
    sheet.getRange("H:H").setNumberFormat('"R$" #,##0.00');
    sheet.getRange("H:H").setHorizontalAlignment("center");

    // centralizar geral
    sheet.getDataRange().setHorizontalAlignment("center");


  }

  return sheet;
}

// =======================
// 📅 NOME DA ABA (ABR26)
// =======================
function getMonthName(d) {

  const meses = [
    "JAN","FEV","MAR","ABR","MAI","JUN",
    "JUL","AGO","SET","OUT","NOV","DEZ"
  ];

  return meses[d.getMonth()] + String(d.getFullYear()).slice(-2);
}

// =======================
// 🔢 ID
// =======================
function getNextID(sheet) {
  const last = sheet.getLastRow();
  return last <= 1 ? 1 : sheet.getRange(last, 1).getValue() + 1;
}

// =======================
// ⏱ FORMATADORES
// =======================
function formatarData(d) {
  return Utilities.formatDate(d, Session.getScriptTimeZone(), "dd/MM/yyyy");
}

function formatarHora(d) {
  return Utilities.formatDate(d, Session.getScriptTimeZone(), "HH:mm:ss");
}

// =======================
// 📲 WHATSAPP SEND
// =======================
function enviarWhats(msg, body) {

  const to = body.entry[0].changes[0].value.messages[0].from;

  const url = `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`;

  UrlFetchApp.fetch(url, {
    method: "post",
    headers: {
      Authorization: "Bearer " + WHATSAPP_TOKEN
    },
    contentType: "application/json",
    payload: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: msg }
    })
  });
}

// =======================
// 📦 RESPONSE
// =======================
function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}