const API =
  "https://script.google.com/macros/s/AKfycbw7p1V-elYlP31gkOAInnpmuYWFxGC08RWcrA0e5h8PHVPvC3C3AB4lfRrjwxBpCO8o/exec";


let ultimaVersao = null;

// =======================
// ➕ CRIAR
// =======================
async function enviar() {

  const data = {
    action: "create",
    descricao: desc.value,
    pagamento: pagamento.value,
    categoria: categoria.value,
    valor: parseFloat(valor.value)
  };

  await fetch(API, {
    method: "POST",
    body: JSON.stringify(data)
  });

  limparCampos();
  carregar();
}

// =======================
// 🔄 CARREGAR
// =======================
async function carregar() {

  const res = await fetch(API + "?mode=web");
  const dados = await res.json();

  const lista = dados.slice(-50).reverse();

  renderHistorico(lista);
  renderGrafico(lista);
}

// =======================
// ⚡ TEMPO REAL (FAKE)
// =======================
setInterval(async () => {

  try {
    const res = await fetch(API + "?mode=check");
    const data = await res.json();

    if (ultimaVersao !== data.version) {
      ultimaVersao = data.version;
      carregar();
    }

  } catch (e) {
    console.log("Erro check:", e);
  }

}, 5000);

// =======================
// 📄 HISTÓRICO
// =======================
function renderHistorico(lista) {

  historico.innerHTML = lista.map(item => `
    <div class="item">
      <div>
        <strong>${item.Descrição}</strong>
        <br>R$ ${item.Valor} • ${item.Categoria}
      </div>

      <div class="acoes">
        <button class="btn edit" onclick="editar(${item.ID})">✏️</button>
        <button class="btn del" onclick="deletar(${item.ID})">🗑</button>
      </div>
    </div>
  `).join("");
}

// =======================
// ✏️ EDITAR
// =======================
async function editar(id) {

  const descricao = prompt("Nova descrição:");
  const valor = prompt("Novo valor:");

  await fetch(API, {
    method: "POST",
    body: JSON.stringify({
      action: "update",
      id,
      descricao,
      valor
    })
  });

  carregar();
}

// =======================
// 🗑 DELETE
// =======================
async function deletar(id) {

  if (!confirm("Deseja deletar?")) return;

  await fetch(API, {
    method: "POST",
    body: JSON.stringify({
      action: "delete",
      id
    })
  });

  carregar();
}

// =======================
function limparCampos() {
  desc.value = "";
  valor.value = "";
}

// =======================
// 📊 GRÁFICO
// =======================
function renderGrafico(lista) {

  let resumo = {};

  lista.forEach(item => {
    const cat = item.Categoria;
    resumo[cat] = (resumo[cat] || 0) + Number(item.Valor);
  });

  if (window.chart) window.chart.destroy();

  window.chart = new Chart(grafico, {
    type: "bar",
    data: {
      labels: Object.keys(resumo),
      datasets: [{
        label: "Gastos",
        data: Object.values(resumo)
      }]
    }
  });
}

// =======================
carregar();