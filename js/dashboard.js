let telefone = localStorage.getItem("telefone");

// =======================
async function carregar() {

  if (!telefone) {
    window.location.href = "index.html";
    return;
  }

  const dados = await apiGet(telefone);

  const validos = dados.filter(i => i.ID && i.Valor);

  renderGrafico(validos);
  renderHistorico(validos);
}

// =======================
function criar() {

  const data = {
    descricao: desc.value,
    forma_pagamento: pagamento.value,
    categoria: categoria.value,
    valor: parseFloat(valor.value),
    tipo: "Despesa"
  };

  apiPost({
    phone: telefone,
    action: "create",
    data
  }).then(() => {
    limpar();
    carregar();
  });
}

// =======================
function editar(id) {

  const novo = prompt("Novo valor:");

  if (!novo) return;

  apiPost({
    phone: telefone,
    action: "update",
    id,
    data: { valor: parseFloat(novo) }
  }).then(carregar);
}

// =======================
function deletar(id) {

  apiPost({
    phone: telefone,
    action: "delete",
    id
  }).then(carregar);
}

// =======================
function renderHistorico(lista) {

  historico.innerHTML = lista.slice(-50).reverse().map(i => `
    <div class="item">
      <div>
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
function renderGrafico(lista) {

  let resumo = {};

  lista.forEach(i => {
    resumo[i.Categoria] = (resumo[i.Categoria] || 0) + parseFloat(i.Valor);
  });

  if (window.chart) window.chart.destroy();

  window.chart = new Chart(grafico, {
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
function limpar() {
  desc.value = "";
  valor.value = "";
}

// =======================
carregar();
setInterval(carregar, 5000);