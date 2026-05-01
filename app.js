const API = "https://script.google.com/macros/s/AKfycbw7p1V-elYlP31gkOAInnpmuYWFxGC08RWcrA0e5h8PHVPvC3C3AB4lfRrjwxBpCO8o/exec";

// =======================
// 🔐 LOGIN
// =======================
let phone = localStorage.getItem("user");

if (!phone) {
  phone = prompt(
    "Digite seu telefone\nFormato: DDD + 9 + número\nEx: 81983402995"
  );
  localStorage.setItem("user", phone);
}

// =======================
// 📥 CARREGAR DADOS
// =======================
async function carregar() {
  try {

    const res = await fetch(API + "?phone=" + phone);
    const dados = await res.json();

    const lanc = dados.filter(i => i.ID && i.Valor);

    renderGrafico(lanc);
    renderHistorico(lanc);
    renderIA(lanc);

  } catch (e) {
    console.log("Erro ao carregar:", e);
  }
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

  if (window.chart) window.chart.destroy();

  const ctx = document.getElementById("grafico");

  if (!ctx) return;

  window.chart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: Object.keys(resumo),
      datasets: [{
        data: Object.values(resumo)
      }]
    }
  });
}

// =======================
// 📄 HISTÓRICO + CRUD
// =======================
function renderHistorico(lista) {

  const el = document.getElementById("historico");
  if (!el) return;

  const ultimos = lista.slice(-50).reverse();

  el.innerHTML = ultimos.map(item => {

    if (!item.ID || !item.Valor) return "";

    return `
      <div class="item">
        <strong>${item.Descrição}</strong>
        <div>R$ ${parseFloat(item.Valor).toFixed(2)}</div>
        <small>${item.Categoria}</small>

        <div class="acoes">
          <button onclick="editar(${item.ID})">✏️</button>
          <button onclick="deletar(${item.ID})">🗑️</button>
        </div>
      </div>
    `;
  }).join("");
}

// =======================
// ✏️ EDITAR
// =======================
function editar(id) {

  const novoValor = prompt("Novo valor:");
  if (!novoValor) return;

  fetch(API, {
    method: "POST",
    body: JSON.stringify({
      phone: phone,
      action: "update",
      id: id,
      data: {
        valor: parseFloat(novoValor)
      }
    })
  }).then(() => carregar());
}

// =======================
// 🗑️ DELETAR
// =======================
function deletar(id) {

  if (!confirm("Deseja excluir?")) return;

  fetch(API, {
    method: "POST",
    body: JSON.stringify({
      phone: phone,
      action: "delete",
      id: id
    })
  }).then(() => carregar());
}

// =======================
// 🤖 IA RESUMO
// =======================
function renderIA(lista) {

  let total = 0;
  let categorias = {};

  lista.forEach(i => {
    const val = parseFloat(i.Valor) || 0;
    total += val;

    const cat = i.Categoria || "Outros";

    if (!categorias[cat]) categorias[cat] = 0;
    categorias[cat] += val;
  });

  let maior = Object.entries(categorias).sort((a,b)=>b[1]-a[1])[0];

  document.getElementById("analise").innerHTML = `
    💸 Total gasto: R$ ${total.toFixed(2)} <br>
    📊 Transações: ${lista.length} <br>
    🔥 Maior gasto: ${maior ? maior[0] : "-"}
  `;
}

// =======================
// 🔄 AUTO UPDATE
// =======================
carregar();
setInterval(carregar, 5000);