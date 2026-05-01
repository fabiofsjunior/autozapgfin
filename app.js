const API = "https://script.google.com/macros/s/AKfycbw7p1V-elYlP31gkOAInnpmuYWFxGC08RWcrA0e5h8PHVPvC3C3AB4lfRrjwxBpCO8o/exec";

let telefone = localStorage.getItem("telefone");

// =======================
// 🔐 LOGIN SEGURO
// =======================
async function entrar() {

  let input = document.getElementById("telefone").value;
  let tel = normalizarTelefone(input);

  if (!tel || tel.length < 10) {
    alert("Digite um número válido");
    return;
  }

  try {

    // 🔥 VALIDA NO BACKEND ANTES DE ENTRAR
    const res = await fetch(API + "?phone=" + tel);
    const dados = await res.json();

    if (!Array.isArray(dados)) {
      alert("Erro ao validar login");
      return;
    }

    // ✅ LOGIN OK
    localStorage.setItem("telefone", tel);

    console.log("LOGIN VALIDADO:", tel);

    window.location.href = "dashboard.html";

  } catch (e) {
    alert("Erro de conexão");
  }
}

// =======================
// 📊 DASHBOARD LOAD
// =======================
async function carregar() {

  telefone = localStorage.getItem("telefone");

  // 🔥 NÃO REDIRECIONA DIRETO
  if (!telefone) {
    console.log("Sem sessão");
    return;
  }

  try {

    const res = await fetch(API + "?phone=" + telefone);
    const dados = await res.json();

    console.log("API:", dados);

    // 🔥 SE DER ERRO → LIMPA SESSÃO
    if (!Array.isArray(dados)) {
      console.log("Sessão inválida");
      localStorage.removeItem("telefone");
      return;
    }

    const validos = dados.filter(i => i.ID && i.Valor);

    renderHistorico(validos);
    renderGrafico(validos);

  } catch (err) {
    console.log("Erro API:", err);
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

  if (!lista || lista.length === 0) {
    el.innerHTML = "<p>Sem transações</p>";
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
      phone: telefone,
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
      phone: telefone,
      action: "delete",
      id
    })
  }).then(carregar);
}

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
// 🚀 LOAD CONTROLADO
// =======================
if (window.location.pathname.includes("dashboard")) {

  if (!localStorage.getItem("telefone")) {
    window.location.href = "index.html";
  } else {
    carregar();
    setInterval(carregar, 5000);
  }
}