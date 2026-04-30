const API =
  "https://script.google.com/macros/s/AKfycbw7p1V-elYlP31gkOAInnpmuYWFxGC08RWcrA0e5h8PHVPvC3C3AB4lfRrjwxBpCO8o/exec";

async function enviar() {
  const data = {
    descricao: document.getElementById("desc").value,
    tipoPagamento: document.getElementById("pagamento").value,
    categoria: document.getElementById("categoria").value,
    valor: parseFloat(document.getElementById("valor").value)
  };

  await fetch(API, {
    method: "POST",
    body: JSON.stringify(data)
  });

  // 🔥 LIMPAR CAMPOS
  document.getElementById("desc").value = "";
  document.getElementById("valor").value = "";

  carregar();
}

async function carregar() {
  const res = await fetch(API + "?mode=web");
  const dados = await res.json();

  const lancamentos = dados.filter(i => i.ID && i.Valor);

  renderGrafico(lancamentos);
  renderHistorico(lancamentos);
}

function renderGrafico(lista) {
  let resumo = {};

  lista.forEach(i => {
    const cat = i.Categoria || "Outros";
    const val = parseFloat(i.Valor) || 0;

    if (!resumo[cat]) resumo[cat] = 0;
    resumo[cat] += val;
  });

  if (window.chart) window.chart.destroy();

  const ctx = document.getElementById("grafico");

  window.chart = new Chart(ctx, {
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

function renderHistorico(lista) {
  const el = document.getElementById("historico");

  const ultimos = lista.slice(-10).reverse();

  el.innerHTML = ultimos.map(item => `
    <div class="item">
      <strong>${item.Descrição}</strong>
      R$ ${item.Valor} • ${item.Categoria}

      <div class="actions">
        <button class="edit" onclick="editar(${item.ID})">Editar</button>
        <button class="delete" onclick="deletar(${item.ID})">Deletar</button>
      </div>
    </div>
  `).join("");
}

// EDITAR
function editar(id) {
  const novaDesc = prompt("Nova descrição:");
  const novoValor = prompt("Novo valor:");

  fetch(API, {
    method: "POST",
    body: JSON.stringify({
      action: "edit",
      id,
      descricao: novaDesc,
      valor: parseFloat(novoValor)
    })
  }).then(carregar);
}

// DELETAR
function deletar(id) {
  if (!confirm("Deseja excluir?")) return;

  fetch(API, {
    method: "POST",
    body: JSON.stringify({
      action: "delete",
      id
    })
  }).then(carregar);
}

carregar();