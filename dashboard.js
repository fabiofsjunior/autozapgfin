let telefone = localStorage.getItem("telefone");

if (!telefone) {
  window.location.href = "index.html";
}

async function carregar() {

  const dados = await getDados(telefone);

  const validos = dados.filter(i => i.ID && i.Valor);

  renderHistorico(validos);
  renderGrafico(validos);
  renderIA(validos);
}

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

function renderIA(lista) {

  if (!lista.length) {
    document.getElementById("ia").innerText = "Sem dados ainda.";
    return;
  }

  let total = 0;
  let categorias = {};
  let maior = { valor: 0 };

  lista.forEach(i => {

    const valor = Number(i.Valor) || 0;
    const cat = i.Categoria || "Outros";

    total += valor;

    categorias[cat] = (categorias[cat] || 0) + valor;

    if (valor > maior.valor) {
      maior = i;
    }
  });

  const topCategoria = Object.entries(categorias)
    .sort((a,b) => b[1] - a[1])[0];

  document.getElementById("ia").innerHTML = `
    💰 Total gasto: <b>R$ ${total.toFixed(2)}</b><br><br>

    📊 Categoria principal: <b>${topCategoria[0]}</b><br>
    💸 Valor: R$ ${topCategoria[1].toFixed(2)}<br><br>

    🔥 Maior gasto:<br>
    <b>${maior["Descrição"] || "-"}</b><br>
    R$ ${Number(maior.Valor).toFixed(2)}
  `;
}

carregar();
setInterval(carregar, 10000);