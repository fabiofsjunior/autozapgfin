const API = "https://script.google.com/macros/s/AKfycbw7p1V-elYlP31gkOAInnpmuYWFxGC08RWcrA0e5h8PHVPvC3C3AB4lfRrjwxBpCO8o/exec";


let telefone = localStorage.getItem("tel");

// =======================
// 🔐 LOGIN
// =======================
if (!telefone) {
  telefone = prompt("Digite seu telefone (ex: 81999999999)");
  localStorage.setItem("tel", telefone);
}

// 🔐 GERAR TOKEN
function gerarToken(tel) {
  return btoa(tel + "AUTOZAP_CHAVE_SECRETA_2026");
}

const TOKEN = gerarToken(telefone);

// =======================
// 💾 ENVIAR
// =======================
async function enviar() {

  const data = {
    descricao: desc.value,
    tipoPagamento: pagamento.value,
    categoria: categoria.value,
    valor: parseFloat(valor.value)
  };

  await fetch(API, {
    method: "POST",
    body: JSON.stringify({
      telefone,
      token: TOKEN,
      action: "create",
      data
    })
  });

  limpar();
  carregar();
}

// =======================
// 📊 CARREGAR
// =======================
async function carregar() {

  const res = await fetch(`${API}?telefone=${telefone}&token=${TOKEN}`);
  const dados = await res.json();

  renderHistorico(dados);
  renderGrafico(dados);
}

// =======================
// ✏️ EDITAR
// =======================
function editar(id) {

  const novo = prompt("Novo valor:");
  if (!novo) return;

  fetch(API, {
    method: "POST",
    body: JSON.stringify({
      telefone,
      token: TOKEN,
      action: "update",
      id,
      data: { valor: parseFloat(novo) }
    })
  }).then(carregar);
}

// =======================
// 🗑️ DELETAR
// =======================
function deletar(id) {

  fetch(API, {
    method: "POST",
    body: JSON.stringify({
      telefone,
      token: TOKEN,
      action: "delete",
      id
    })
  }).then(carregar);
}

// =======================
// 📄 HISTÓRICO
// =======================
function renderHistorico(lista) {

  const el = document.getElementById("historico");

  el.innerHTML = lista.slice(-50).reverse().map(i => `
    <div class="item">
      <strong>${i.Descrição}</strong>
      R$ ${i.Valor}
      <div class="acoes">
        <button onclick="editar(${i.ID})">✏️</button>
        <button onclick="deletar(${i.ID})">🗑️</button>
      </div>
    </div>
  `).join("");
}

// =======================
// 📊 GRÁFICO (PIZZA)
// =======================
function renderGrafico(lista) {

  let resumo = {};

  lista.forEach(i => {
    const cat = i.Categoria || "Outros";
    resumo[cat] = (resumo[cat] || 0) + Number(i.Valor);
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
function limpar(){
  desc.value = "";
  valor.value = "";
}

// =======================
carregar();
setInterval(carregar, 5000);