const API =
  "https://script.google.com/macros/s/AKfycbw7p1V-elYlP31gkOAInnpmuYWFxGC08RWcrA0e5h8PHVPvC3C3AB4lfRrjwxBpCO8o/exec";


let editandoId = null;

// =======================
// 📤 ENVIAR / EDITAR
// =======================
async function enviar() {

  const desc = document.getElementById("desc").value;
  const pagamento = document.getElementById("pagamento").value;
  const categoria = document.getElementById("categoria").value;
  const valor = parseFloat(document.querySelector('input[type="number"]').value);

  if (!desc || !valor) {
    alert("Preencha os campos");
    return;
  }

  const payload = {
    id: editandoId,
    descricao: desc,
    tipoPagamento: pagamento,
    categoria: categoria,
    valor: valor
  };

  const method = editandoId ? "PUT" : "POST";

  await fetch(API, {
    method: method,
    body: JSON.stringify(payload)
  });

  limparCampos();
  editandoId = null;

  carregar();
}

// =======================
// 📥 CARREGAR
// =======================
async function carregar() {

  const res = await fetch(API + "?mode=web");
  const dados = await res.json();

  const lancamentos = dados.filter(i => i.ID && i.Valor);

  renderHistorico(lancamentos);
  renderGrafico(lancamentos);
}

// =======================
// 📊 GRÁFICO
// =======================
function renderGrafico(lista) {

  let resumo = {};

  lista.forEach(item => {
    const cat = item.Categoria || "Outros";
    const val = parseFloat(item.Valor) || 0;

    if (!resumo[cat]) resumo[cat] = 0;
    resumo[cat] += val;
  });

  if (window.chart) window.chart.destroy();

  new Chart(document.getElementById("grafico"), {
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
// 📄 HISTÓRICO (CRUD UI)
// =======================
function renderHistorico(lista) {

  const el = document.getElementById("historico");

  el.innerHTML = lista.slice(-10).reverse().map(item => `
    <div class="item">
      <strong>${item.Descrição}</strong>
      R$ ${item.Valor} • ${item.Categoria}

      <div style="margin-top:8px; display:flex; gap:5px;">
        <button onclick="editar(${item.ID}, '${item.Descrição}', '${item.Categoria}', '${item.Pagamento}', ${item.Valor})">✏️</button>
        <button onclick="deletar(${item.ID})" style="background:#e53935;">🗑️</button>
      </div>
    </div>
  `).join("");
}

// =======================
// ✏️ EDITAR
// =======================
function editar(id, desc, categoria, pagamento, valor) {

  document.getElementById("desc").value = desc;
  document.getElementById("categoria").value = categoria;
  document.getElementById("pagamento").value = pagamento;
  document.querySelector('input[type="number"]').value = valor;

  editandoId = id;

  window.scrollTo({ top: 0, behavior: "smooth" });
}

// =======================
// 🗑️ DELETAR
// =======================
async function deletar(id) {

  if (!confirm("Deseja deletar?")) return;

  await fetch(API, {
    method: "DELETE",
    body: JSON.stringify({ id })
  });

  carregar();
}

// =======================
// 🧹 LIMPAR
// =======================
function limparCampos() {
  document.getElementById("desc").value = "";
  document.querySelector('input[type="number"]').value = "";
}

// INIT
carregar();