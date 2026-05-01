const API = "https://script.google.com/macros/s/AKfycbw7p1V-elYlP31gkOAInnpmuYWFxGC08RWcrA0e5h8PHVPvC3C3AB4lfRrjwxBpCO8o/exec";

const TOKEN = "MEU_TOKEN_SEGURO_123";

// =======================
// 🔐 LOGIN (SEM PROMPT)
// =======================
function login() {

  let telefone = document.getElementById("telefone").value;

  telefone = normalizarTelefone(telefone);

  if (!telefone || telefone.length < 10) {
    alert("Digite um telefone válido com DDD");
    return;
  }

  localStorage.setItem("user_tel", telefone);

  window.location.href = "dashboard.html";
}

// =======================
// 📱 NORMALIZAR TELEFONE
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
// 📥 CARREGAR DADOS
// =======================
async function carregar() {

  const telefone = localStorage.getItem("user_tel");

  if (!telefone) {
    window.location.href = "index.html";
    return;
  }

  const res = await fetch(`${API}?token=${TOKEN}&telefone=${telefone}`);
  const dados = await res.json();

  console.log("DADOS:", dados);

  const lancamentos = dados.filter(i => i.ID && i.Valor);

  renderHistorico(lancamentos);
  renderGrafico(lancamentos);
  gerarAnalise(lancamentos);
}

// =======================
// 📊 GRÁFICO PIZZA
// =======================
function renderGrafico(lista) {

  let resumo = {};

  lista.forEach(i => {
    const cat = i.Categoria || "Outros";
    const val = parseFloat(i.Valor) || 0;

    if (!resumo[cat]) resumo[cat] = 0;
    resumo[cat] += val;
  });

  const labels = Object.keys(resumo);
  const valores = Object.values(resumo);

  if (window.chart) window.chart.destroy();

  const ctx = document.getElementById("grafico");

  window.chart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels,
      datasets: [{
        data: valores
      }]
    }
  });
}

// =======================
// 📄 HISTÓRICO
// =======================
function renderHistorico(lista) {

  const el = document.getElementById("historico");

  const validos = lista.filter(i => i.ID);

  el.innerHTML = validos.slice(-50).reverse().map(i => `
    <div class="item">
      
      <div class="info">
        <strong>${i.Descrição}</strong>
        <span>R$ ${parseFloat(i.Valor).toFixed(2)}</span>
      </div>

      <div class="acoes">
        <button onclick="editar(${i.ID})">✏️</button>
        <button onclick="deletar(${i.ID})">🗑️</button>
      </div>

    </div>
  `).join("");
}

// =======================
// ✏️ EDITAR
// =======================
async function editar(id) {

  const telefone = localStorage.getItem("user_tel");

  const novo = prompt("Novo valor:");
  if (!novo) return;

  await fetch(API, {
    method: "POST",
    body: JSON.stringify({
      token: TOKEN,
      telefone,
      action: "update",
      id,
      data: { valor: parseFloat(novo) }
    })
  });

  carregar();
}

// =======================
// 🗑️ DELETAR
// =======================
async function deletar(id) {

  const telefone = localStorage.getItem("user_tel");

  await fetch(API, {
    method: "POST",
    body: JSON.stringify({
      token: TOKEN,
      telefone,
      action: "delete",
      id
    })
  });

  carregar();
}

// =======================
// 🧠 ANALISE IA (LOCAL)
// =======================
function gerarAnalise(lista) {

  let total = 0;
  let categorias = {};

  lista.forEach(i => {
    const v = parseFloat(i.Valor) || 0;
    total += v;

    if (!categorias[i.Categoria]) categorias[i.Categoria] = 0;
    categorias[i.Categoria] += v;
  });

  const maior = Object.keys(categorias).reduce((a, b) =>
    categorias[a] > categorias[b] ? a : b
  , "Outros");

  document.getElementById("analise").innerHTML = `
    💸 Total gasto: <b>R$ ${total.toFixed(2)}</b><br>
    📊 Maior categoria: <b>${maior}</b><br>
    ⚠️ Dica: reduzir ${maior}
  `;
}

// =======================
carregar();
setInterval(carregar, 5000);