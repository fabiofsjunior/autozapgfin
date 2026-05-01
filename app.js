const API = "https://script.google.com/macros/s/AKfycbw7p1V-elYlP31gkOAInnpmuYWFxGC08RWcrA0e5h8PHVPvC3C3AB4lfRrjwxBpCO8o/exec";

// =======================
// 🔐 LOGIN
// =======================
function entrar() {

  let input = document.getElementById("telefone").value;

  if (!input) {
    alert("Digite seu telefone");
    return;
  }

  const telefone = normalizarTelefone(input);

  localStorage.setItem("telefone", telefone);

  // 🔥 PASSA VIA URL (ANTI LOOP)
  window.location.href = "dashboard.html?telefone=" + telefone;
}

// =======================
// 📊 LOAD DASHBOARD
// =======================
async function carregar() {

  // 🔥 PEGA DA URL PRIMEIRO
  const params = new URLSearchParams(window.location.search);
  let telefone = params.get("telefone");

  // 🔥 FALLBACK LOCALSTORAGE
  if (!telefone) {
    telefone = localStorage.getItem("telefone");
  }

  console.log("TELEFONE:", telefone);

  // 🔒 VALIDAÇÃO FORTE
  if (!telefone || telefone === "null" || telefone === "undefined") {
    window.location.href = "index.html";
    return;
  }

  // 🔥 GARANTE PERSISTÊNCIA
  localStorage.setItem("telefone", telefone);

  try {

    const res = await fetch(API + "?phone=" + telefone);
    const dados = await res.json();

    console.log("DADOS:", dados);

    const validos = (dados || []).filter(i => i.ID && i.Valor);

    renderHistorico(validos);
    renderGrafico(validos);

  } catch (e) {
    console.log("ERRO:", e);
  }
}

// =======================
// 📊 GRÁFICO
// =======================
function renderGrafico(lista) {

  let resumo = {};

  lista.forEach(i => {
    if (!resumo[i.Categoria]) resumo[i.Categoria] = 0;
    resumo[i.Categoria] += parseFloat(i.Valor);
  });

  const ctx = document.getElementById("grafico");

  if (window.chart) window.chart.destroy();

  window.chart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: Object.keys(resumo),
      datasets: [{
        data: Object.values(resumo)
      }]
    }
  });
}

// =======================
// 📄 HISTÓRICO
// =======================
function renderHistorico(lista) {

  const el = document.getElementById("historico");

  el.innerHTML = lista.slice(-50).reverse().map(i => `
    <div class="item">
      <div class="info">
        <strong>${i.Descrição}</strong>
        <span>R$ ${i.Valor}</span>
      </div>

      <div class="acoes">
        <button onclick="editar(${i.ID})">✏️</button>
        <button onclick="deletar(${i.ID})">🗑️</button>
      </div>
    </div>
  `).join("");
}

// =======================
// ✏️ EDIT
// =======================
function editar(id) {

  const telefone = localStorage.getItem("telefone");

  const novo = prompt("Novo valor:");
  if (!novo) return;

  fetch(API, {
    method: "POST",
    body: JSON.stringify({
      phone: telefone,
      action: "update",
      id,
      data: { valor: parseFloat(novo) }
    })
  }).then(() => carregar());
}

// =======================
// 🗑 DELETE
// =======================
function deletar(id) {

  const telefone = localStorage.getItem("telefone");

  fetch(API, {
    method: "POST",
    body: JSON.stringify({
      phone: telefone,
      action: "delete",
      id
    })
  }).then(() => carregar());
}

// =======================
// 📞 NORMALIZA TELEFONE
// =======================
function normalizarTelefone(num) {

  num = num.replace(/\D/g, "");

  if (num.startsWith("55")) num = num.substring(2);

  if (num.length === 10) {
    num = num.slice(0,2) + "9" + num.slice(2);
  }

  return num;
}

// =======================
// 🚀 AUTO LOAD
// =======================
if (window.location.pathname.includes("dashboard")) {

  document.addEventListener("DOMContentLoaded", () => {
    carregar();
    setInterval(carregar, 5000);
  });

}