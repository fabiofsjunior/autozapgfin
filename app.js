const API = "https://script.google.com/macros/s/AKfycbw7p1V-elYlP31gkOAInnpmuYWFxGC08RWcrA0e5h8PHVPvC3C3AB4lfRrjwxBpCO8o/exec";

let telefone = localStorage.getItem("telefone");

// =======================
// 🔐 LOGIN
// =======================
function entrar() {

  let input = document.getElementById("telefone").value;

  telefone = normalizarTelefone(input);

  if (!telefone || telefone.length < 10) {
    alert("Digite um número válido com DDD + 9 + número");
    return;
  }

  localStorage.setItem("telefone", telefone);

  console.log("LOGIN OK:", telefone);

  window.location.href = "dashboard.html";
}

// =======================
// 📊 DASHBOARD LOAD
// =======================
async function carregar() {

  telefone = localStorage.getItem("telefone");

  if (!telefone) {
    console.log("SEM TELEFONE → REDIRECIONANDO");
    window.location.href = "index.html";
    return;
  }

  try {

    const res = await fetch(API + "?phone=" + telefone); // 🔥 CORREÇÃO AQUI
    const dados = await res.json();

    console.log("DADOS:", dados);

    // 🔥 VALIDAÇÃO REAL
    if (!Array.isArray(dados)) {
      console.log("RESPOSTA INVÁLIDA → LOGOUT");
      localStorage.removeItem("telefone");
      window.location.href = "index.html";
      return;
    }

    const validos = dados.filter(i => i.ID && i.Valor);

    renderHistorico(validos);
    renderGrafico(validos);

  } catch (err) {

    console.log("ERRO API:", err);
    alert("Erro ao conectar com servidor");
  }
}

// =======================
// 📊 GRÁFICO PIZZA
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

  if (!lista || lista.length === 0) {
    el.innerHTML = "<p>Sem transações ainda</p>";
    return;
  }

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

  const novo = prompt("Novo valor:");

  if (!novo) return;

  fetch(API, {
    method: "POST",
    body: JSON.stringify({
      phone: telefone, // 🔥 CORREÇÃO
      action: "update",
      id,
      data: { valor: parseFloat(novo) }
    })
  }).then(carregar);
}

// =======================
// 🗑 DELETE
// =======================
function deletar(id) {

  fetch(API, {
    method: "POST",
    body: JSON.stringify({
      phone: telefone, // 🔥 CORREÇÃO
      action: "delete",
      id
    })
  }).then(carregar);
}

// =======================
// 📞 NORMALIZA TELEFONE
// =======================
function normalizarTelefone(num) {

  num = num.replace(/\D/g, "");

  if (num.startsWith("55")) num = num.substring(2);

  if (num.length === 10) {
    num = num.substring(0,2) + "9" + num.substring(2);
  }

  return num;
}

// =======================
// 🚀 AUTO LOAD
// =======================
if (window.location.pathname.includes("dashboard")) {
  carregar();
  setInterval(carregar, 5000);
}