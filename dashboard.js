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
// 💰 PARSE VALOR
// =======================

function parseValor(valor) {
  if (valor === null || valor === undefined) return 0;

  let v = String(valor).trim();

  // remove moeda
  v = v.replace("R$", "").replace(/\s/g, "");

  // CASO 1: formato BR (1.234,56)
  if (v.includes(",") && v.includes(".")) {
    v = v.replace(/\./g, "").replace(",", ".");
  }

  // CASO 2: formato EU/US (15.30)
  else if (v.includes(".") && !v.includes(",")) {
    // mantém ponto como decimal (NÃO remove!)
    v = v;
  }

  // CASO 3: só vírgula decimal (15,30)
  else if (v.includes(",") && !v.includes(".")) {
    v = v.replace(",", ".");
  }

  // remove qualquer lixo restante
  v = v.replace(/[^\d.-]/g, "");

  return Number(v) || 0;
}

// =======================
// 📅 NORMALIZAR DATA (ANTI TIMEZONE BUG)
// =======================
function normalizarData(dataStr) {
  if (!dataStr) return null;

  // ISO (backend)
  if (dataStr.includes("T")) {
    return dataStr.split("T")[0]; // YYYY-MM-DD
  }

  // dd/MM/yyyy
  if (dataStr.includes("/")) {
    const [d, m, y] = dataStr.split("/");
    return `${y}-${m}-${d}`;
  }

  return null;
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
// 📅 FILTRO POR PERÍODO (CORRIGIDO DEFINITIVO)
// =======================
// =======================
// 📅 NORMALIZAR DATA (SEM TIMEZONE BUG)
// =======================
function normalizarData(dataStr) {
  if (!dataStr) return null;

  // ISO: 2026-04-29T03:00:00.000Z
  if (dataStr.includes("T")) {
    return dataStr.split("T")[0];
  }

  // dd/MM/yyyy
  if (dataStr.includes("/")) {
    const [d, m, y] = dataStr.split("/");
    return `${y}-${m}-${d}`;
  }

  return null;
}

// =======================
// 📅 FILTRO DE PERÍODO (CORRIGIDO 100%)
// =======================
function filtrarPeriodo(lista) {
  const filtro = filtroAtual;

  const hoje = new Date();
  const hojeStr = hoje.toISOString().split("T")[0]; // YYYY-MM-DD

  return lista.filter((i) => {
    const dataStr = normalizarData(i.Data);
    if (!dataStr) return false;

    // =======================
    // 📍 DIA
    // =======================
    if (filtro === "DIA") {
      return dataStr === hojeStr;
    }

    // =======================
    // 📍 SEMANA (DOM - SAB)
    // =======================
    if (filtro === "SEMANA") {
      const hojeDate = new Date(hojeStr);

      const inicioSemana = new Date(hojeDate);
      inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay());

      const dataItem = new Date(dataStr);

      return dataItem >= inicioSemana && dataItem <= hojeDate;
    }

    // =======================
    // 📍 MÊS
    // =======================
    if (filtro === "MES") {
      const [y1, m1] = dataStr.split("-");
      const [y2, m2] = hojeStr.split("-");

      return y1 === y2 && m1 === m2;
    }

    // =======================
    // 📍 ANO
    // =======================
    if (filtro === "ANO") {
      return dataStr.split("-")[0] === hojeStr.split("-")[0];
    }

    // =======================
    // 📍 TUDO
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

  if (window.chart) window.chart.destroy();

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
    const da = new Date(normalizarData(b.Data));
    const db = new Date(normalizarData(a.Data));
    return da - db;
  });

  el.innerHTML = ordenado
    .slice(0, 50)
    .map((i) => {
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
    id,
    data: { valor },
  });

  carregar();
}

// =======================
// 🗑 DELETAR
// =======================
async function deletar(id) {
  if (!confirm("Deseja excluir este lançamento?")) return;

  await apiPost({
    phone: telefone,
    action: "delete",
    id,
  });

  carregar();
}

// =======================
// 🧠 IA
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
    💰 Total: <b>R$ ${total.toFixed(2)}</b>
    <br><br>

    📊 Categoria: <b>${topCategoria[0]}</b>
    <br>
    💸 Total: R$ ${topCategoria[1].toFixed(2)}
    <br><br>

    🔥 Maior gasto:
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
    const dataStr = normalizarData(i.Data);
    if (!dataStr) return;

    const d = new Date(dataStr + "T00:00:00");

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

  if (window.chartMensal) window.chartMensal.destroy();

  window.chartMensal = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Gastos",
          data: valores,
          tension: 0.3,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
    },
  });
}

// =======================
// 🔥 REMOVE DUPLICADOS REAL
// =======================
function removerDuplicados(lista) {
  const map = new Map();

  lista.forEach((item) => {
    const chave = `${item.ID}|${item.Data}|${item.Valor}|${item["Descrição"]}`;
    map.set(chave, item);
  });

  return Array.from(map.values());
}

// =======================
// 🔄 AUTO UPDATE
// =======================
carregar();

setInterval(carregar, 60000);