const API = "https://script.google.com/macros/s/AKfycbwJPbJ_dfcX7u6OZQine64Vfpg47shcOLsgHTYz5dd0oHa-JtMVhft2aStjyHKOvcfQ/exec";

let telefone = localStorage.getItem("telefone");

// =======================
// LOAD
// =======================
async function carregar() {

  if (!telefone) {
    window.location.href = "index.html";
    return;
  }

  const res = await fetch(API + "?phone=" + telefone);
  const dados = await res.json();

  const validos = dados.filter(i => i.ID && i.Valor);

  renderHistorico(validos);
  renderGrafico(validos);
  renderIA(validos);
}

// =======================
// GRÁFICO (FIX)
// =======================
function renderGrafico(lista) {

  const resumo = {};

  lista.forEach(i => {
    const cat = i.Categoria || "Outros";
    resumo[cat] = (resumo[cat] || 0) + Number(i.Valor);
  });

  const ctx = document.getElementById("grafico");

  if (window.chart) {
    window.chart.destroy();
  }

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
// IA ANALYSIS
// =======================
function renderIA(lista) {

  let total = 0;
  let categorias = {};

  lista.forEach(i => {
    const valor = Number(i.Valor);
    total += valor;

    const cat = i.Categoria || "Outros";
    categorias[cat] = (categorias[cat] || 0) + valor;
  });

  // maior gasto
  let maiorCategoria = Object.entries(categorias)
    .sort((a,b) => b[1] - a[1])[0];

  let texto = `
Total gasto: R$ ${total.toFixed(2)}  
Maior categoria: ${maiorCategoria ? maiorCategoria[0] : "-"}  
Você está gastando mais com isso do que o restante.
`;

  document.getElementById("ia").innerText = texto;
}

// =======================
// HISTÓRICO
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
carregar();
setInterval(carregar, 5000);