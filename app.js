const API =
  "https://script.google.com/macros/s/AKfycbw7p1V-elYlP31gkOAInnpmuYWFxGC08RWcrA0e5h8PHVPvC3C3AB4lfRrjwxBpCO8o/exec";

// =======================
// 📤 ENVIAR DADOS
// =======================
async function enviar() {
  try {
    const data = {
      descricao: document.getElementById("desc").value,
      tipoPagamento: document.getElementById("pagamento").value,
      categoria: document.getElementById("categoria").value,
      valor: parseFloat(document.getElementById("valor").value),
    };

    if (!data.descricao || !data.valor) {
      alert("Preencha descrição e valor");
      return;
    }

    await fetch(API, {
      method: "POST",
      body: JSON.stringify(data),
    });

    limparCampos();
    carregar();
  } catch (e) {
    console.error("Erro ao enviar:", e);
  }
}

// =======================
// 📥 CARREGAR DADOS
// =======================
async function carregar() {
  try {
    const res = await fetch(API + "?mode=web");
    const dados = await res.json();

    console.log("OK:", dados);

    // 🔥 FILTRO: só lançamentos válidos
    const lancamentos = dados.filter(
      (item) => item.ID && item.Valor !== "" && !isNaN(item.Valor),
    );

    // 🔥 AGRUPAR POR CATEGORIA
    let resumo = {};

    lancamentos.forEach((item) => {
      const categoria = item.Categoria || "Outros";
      const valor = parseFloat(item.Valor) || 0;

      if (!resumo[categoria]) resumo[categoria] = 0;
      resumo[categoria] += valor;
    });

    renderGrafico(resumo);
    renderHistorico(lancamentos);
  } catch (e) {
    console.error("Erro ao carregar:", e);
  }
}

// =======================
// 📊 GRÁFICO
// =======================
function renderGrafico(resumo) {
  const labels = Object.keys(resumo);
  const valores = Object.values(resumo);

  if (window.chart) window.chart.destroy();

  const ctx = document.getElementById("grafico");

  window.chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Gastos por Categoria",
          data: valores,
        },
      ],
    },
  });
}

// =======================
// 📄 HISTÓRICO
// =======================
function renderHistorico(lista) {
  const el = document.getElementById("historico");

  if (!el) return;

  const ultimos = lista.slice(-10).reverse();

  el.innerHTML = ultimos
    .map(
      (item) => `
    <div style="padding:8px;border-bottom:1px solid #eee;">
      <b>${item.Descrição || "Sem descrição"}</b><br>
      R$ ${formatarValor(item.Valor)} • ${item.Categoria || "Outros"}
    </div>
  `,
    )
    .join("");
}

// =======================
// 🧹 LIMPAR CAMPOS
// =======================
function limparCampos() {
  document.getElementById("desc").value = "";
  document.getElementById("valor").value = "";
}

// =======================
// 💰 FORMATAR VALOR
// =======================
function formatarValor(v) {
  return Number(v).toFixed(2);
}

// =======================
// 🚀 INIT
// =======================
carregar();
