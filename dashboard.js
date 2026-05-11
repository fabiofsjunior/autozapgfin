// =======================
// 🔐 TELEFONE (LOGIN)
// =======================
let telefone = localStorage.getItem("telefone");

// =======================
// 📅 FILTRO ATIVO
// =======================
let filtroAtual = "DIA";

if (!telefone) {
  window.location.href = "index.html";
}

// =======================
// 🚫 CONTROLE DE REQUISIÇÃO
// =======================
let carregando = false;

// =======================
// 💰 PARSE VALOR MONETÁRIO
// =======================
function parseValor(valor) {
  return (
    Number(
      String(valor)
        .replace("R$", "")
        .replace(/\./g, "")
        .replace(",", ".")
        .replace(/[^\d.-]/g, "")
    ) || 0
  );
}

// =======================
// 📅 PARSE DATA (CORRIGIDO)
// =======================
function parseData(dataStr) {
  if (!dataStr) return null;

  // ISO
  if (dataStr.includes("-")) {
    return new Date(dataStr);
  }

  // dd/MM/yyyy
  const partes = dataStr.split("/");
  if (partes.length !== 3) return null;

  const [d, m, y] = partes;
  return new Date(y, m - 1, d);
}

// =======================
// 🔄 ALTERAR FILTRO
// =======================
function alterarFiltro(periodo, btn) {
  filtroAtual = periodo;

  document
    .querySelectorAll(".filtro-btn")
    .forEach((b) => b.classList.remove("ativo"));

  btn.classList.add("ativo");

  carregar();
}

// =======================
// 📅 FILTRO POR PERÍODO (CORRIGIDO)
// =======================
function filtrarPeriodo(lista) {
  const filtro = filtroAtual;

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  return lista.filter((i) => {
    const dataItem = parseData(i.Data);
    if (!dataItem) return false;

    const localDate = new Date(
      dataItem.getFullYear(),
      dataItem.getMonth(),
      dataItem.getDate()
    );

    localDate.setHours(0, 0, 0, 0);

    // =======================
    // DIA
    // =======================
    if (filtro === "DIA") {
      return localDate.getTime() === hoje.getTime();
    }

    // =======================
    // SEMANA (SEMANA REAL)
    // =======================
    if (filtro === "SEMANA") {
      const inicio = new Date(hoje);
      const diaSemana = inicio.getDay(); // domingo = 0
      inicio.setDate(inicio.getDate() - diaSemana);
      return localDate >= inicio;
    }

    // =======================
    // MÊS
    // =======================
    if (filtro === "MES") {
      return (
        localDate.getMonth() === hoje.getMonth() &&
        localDate.getFullYear() === hoje.getFullYear()
      );
    }

    // =======================
    // ANO
    // =======================
    if (filtro === "ANO") {
      return localDate.getFullYear() === hoje.getFullYear();
    }

    // =======================
    // TUDO
    // =======================
    return true;
  });
}

// =======================
// 📊 CARREGAR DADOS
// =======================
async function carregar() {
  if (carregando) return;

  carregando = true;

  try {
    const dados = await getDados(telefone);

    console.log("🔥 DADOS BRUTOS:", dados);

    const validos = dados.filter(
      (i) => i.ID && i.Valor !== undefined && i.Valor !== null
    );

    console.log("✔ VALIDOS:", validos);

    const unicos = removerDuplicados(validos);

    const filtrados = filtrarPeriodo(unicos);

    console.log("📅 FILTRADOS:", filtrados);

    renderHistorico(filtrados);
    renderGrafico(filtrados);
    renderGraficoMensal(filtrados);
    renderIA(filtrados);
  } catch (erro) {
    console.error("Erro ao carregar:", erro);
  } finally {
    carregando = false;
  }
}

// =======================
// 📊 GRÁFICO PIZZA
// =======================
function renderGrafico(lista) {
  const resumo = {};

  lista.forEach((i) => {
    const cat = i.Categoria || "Outros";
    resumo[cat] = (resumo[cat] || 0) + parseValor(i.Valor);
  });

  const ctx = document.getElementById("grafico");

  if (window.chart) {
    window.chart.destroy();
  }

  window.chart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: Object.keys(resumo),
      datasets: [
        {
          data: Object.values(resumo),
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "bottom",
        },
      },
    },
  });
}

// =======================
// 📄 HISTÓRICO
// =======================
function renderHistorico(lista) {
  const el = document.getElementById("historico");

  const ordenado = [...lista].sort((a, b) => {
    return parseData(b.Data) - parseData(a.Data);
  });

  el.innerHTML = ordenado
    .slice(0, 50)
    .map((i) => {
      if (!i.ID || i.Valor === undefined) return "";

      return `
      <div class="item">

        <div class="info">
          <strong>${i["Descrição"] || "-"}</strong>
          <span>R$ ${parseValor(i.Valor).toFixed(2)}</span>
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

  const valor = parseValor(novoValor);

  if (isNaN(valor)) {
    alert("Valor inválido");
    return;
  }

  await apiPost({
    phone: telefone,
    action: "update",
    id: id,
    data: { valor },
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
    id: id,
  });

  carregar();
}

// =======================
// 🧠 IA (ANÁLISE)
// =======================
function renderIA(lista) {
  const el = document.getElementById("ia");

  if (!lista.length) {
    el.innerText = "Sem dados neste período.";
    return;
  }

  let total = 0;
  let categorias = {};
  let maiorValor = 0;
  let maiorItem = null;

  lista.forEach((i) => {
    const valor = parseValor(i.Valor);
    const cat = i.Categoria || "Outros";

    total += valor;
    categorias[cat] = (categorias[cat] || 0) + valor;

    if (valor > maiorValor) {
      maiorValor = valor;
      maiorItem = i;
    }
  });

  const topCategoria =
    Object.entries(categorias).sort((a, b) => b[1] - a[1])[0] || [
      "Outros",
      0,
    ];

  el.innerHTML = `
    💰 Total gasto: <b>R$ ${total.toFixed(2)}</b>
    <br><br>

    📊 Categoria principal: <b>${topCategoria[0]}</b>
    <br>
    💸 Total: R$ ${topCategoria[1].toFixed(2)}
    <br><br>

    🔥 Maior gasto real:
    <br>
    <b>${maiorItem?.["Descrição"] || "-"}</b>
    <br>
    R$ ${maiorValor.toFixed(2)}
  `;
}

// =======================
// 📈 GRÁFICO MENSAL (CORRIGIDO)
// =======================
function renderGraficoMensal(lista) {
  const meses = {};

  lista.forEach((i) => {
    const d = parseData(i.Data);
    if (!d) return;

    const mes = `${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;

    meses[mes] = (meses[mes] || 0) + parseValor(i.Valor);
  });

  const labels = Object.keys(meses).sort((a, b) => {
    const [ma, ya] = a.split("/");
    const [mb, yb] = b.split("/");

    return new Date(ya, ma - 1) - new Date(yb, mb - 1);
  });

  const valores = labels.map((m) => meses[m]);

  const ctx = document.getElementById("graficoMensal");

  if (window.chartMensal) {
    window.chartMensal.destroy();
  }

  window.chartMensal = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Gasto mensal",
          data: valores,
          tension: 0.3,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true,
        },
      },
    },
  });
}

// =======================
// 🔥 REMOVE DUPLICADOS REAL
// =======================
function removerDuplicados(lista) {
  const map = new Map();

  lista.forEach((item) => {
    const chave = `${item.ID}-${item.Valor}-${item.Data}`;
    map.set(chave, item);
  });

  return Array.from(map.values());
}

// =======================
// 🔄 AUTO UPDATE
// =======================
carregar();

setInterval(() => {
  carregar();
}, 10000);