// =======================
// 🔐 TELEFONE (LOGIN)
// =======================
let telefone = localStorage.getItem("telefone");

if (!telefone) {
  window.location.href = "index.html";
}

// =======================
// 📊 CARREGAR DADOS
// =======================
async function carregar() {

  const dados = await getDados(telefone);

  const validos = dados.filter(i => i.ID && i.Valor);

  renderHistorico(validos);
  renderGrafico(validos);
  renderGraficoMensal(validos); // 👈 NOVO
  renderIA(validos);
}

// =======================
// 📊 GRÁFICO PIZZA
// =======================
function renderGrafico(lista) {

  const resumo = {};

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
// 📄 HISTÓRICO (COM CRUD)
// =======================
function renderHistorico(lista) {

  const el = document.getElementById("historico");

  el.innerHTML = lista
    .slice(-50)
    .reverse()
    .map(i => {

      if (!i.ID || !i.Valor) return "";

      return `
      <div class="item">
        
        <div class="info">
          <strong>${i["Descrição"] || "-"}</strong>
          <span>R$ ${Number(i.Valor).toFixed(2)}</span>
        </div>

        <div class="acoes">
          <button onclick="editar(${i.ID})" class="btn-edit">✏️</button>
          <button onclick="deletar(${i.ID})" class="btn-delete">🗑️</button>
        </div>

      </div>
      `;
    })
    .join("");
}

// =======================
// ✏️ EDITAR
// =======================
async function editar(id) {

  const novoValor = prompt("Novo valor:");

  if (!novoValor) return;

  const valor = Number(novoValor.replace(",", "."));

  if (isNaN(valor)) {
    alert("Valor inválido");
    return;
  }

  await apiPost({
    phone: telefone,
    action: "update",
    id: id,
    data: {
      valor: valor
    }
  });

  carregar();
}

// =======================
// 🗑 DELETAR
// =======================
async function deletar(id) {

  const confirmar = confirm("Deseja excluir este lançamento?");
  if (!confirmar) return;

  await apiPost({
    phone: telefone,
    action: "delete",
    id: id
  });

  carregar();
}

// =======================
// 🧠 IA (ANÁLISE)
// =======================
function renderIA(lista) {

  if (!lista.length) {
    document.getElementById("ia").innerText = "Sem dados ainda.";
    return;
  }

  let total = 0;
  let categorias = {};
  let maiorValor = 0;
  let maiorItem = null;

  lista.forEach(i => {

    let valor = String(i.Valor)
      .replace("R$", "")
      .replace(",", ".")
      .replace(/[^\d.]/g, "");

    valor = Number(valor) || 0;

    const cat = i.Categoria || "Outros";

    total += valor;

    categorias[cat] = (categorias[cat] || 0) + valor;

    if (valor > maiorValor) {
      maiorValor = valor;
      maiorItem = i;
    }
  });

  const topCategoria = Object.entries(categorias)
    .sort((a, b) => b[1] - a[1])[0];

  document.getElementById("ia").innerHTML = `
    💰 Total gasto: <b>R$ ${total.toFixed(2)}</b><br><br>

    📊 Categoria principal: <b>${topCategoria[0]}</b><br>
    💸 Total: R$ ${topCategoria[1].toFixed(2)}<br><br>

    🔥 Maior gasto real:<br>
    <b>${maiorItem?.["Descrição"] || "-"}</b><br>
    R$ ${maiorValor.toFixed(2)}
  `;
}

//RENDER GRAFICO MENSAL (LISTA)
function renderGraficoMensal(lista) {

  const meses = {};

  lista.forEach(i => {

    let valor = String(i.Valor)
      .replace("R$", "")
      .replace(",", ".")
      .replace(/[^\d.]/g, "");

    valor = Number(valor) || 0;

    // Data formato: dd/MM/yyyy
    const data = i.Data || "";
    const mes = data.substring(3, 10); // MM/yyyy

    if (!mes) return;

    meses[mes] = (meses[mes] || 0) + valor;
  });

  const labels = Object.keys(meses).sort();
  const valores = labels.map(m => meses[m]);

  const ctx = document.getElementById("graficoMensal");

  if (window.chartMensal) window.chartMensal.destroy();

  window.chartMensal = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [{
        label: "Gasto mensal",
        data: valores,
        tension: 0.3
      }]
    }
  });
}

// =======================
// 🔄 AUTO UPDATE
// =======================
carregar();
setInterval(carregar, 10000);