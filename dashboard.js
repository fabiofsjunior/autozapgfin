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
        .replace(/[^\d.-]/g, ""),
    ) || 0
  );
}

// =======================
// 📅 FILTRO POR PERÍODO
// =======================

// =======================
// 🔄 ALTERAR FILTRO
// =======================
function alterarFiltro(periodo, btn) {
  filtroAtual = periodo;

  // REMOVE CLASSE ATIVA
  document
    .querySelectorAll(".filtro-btn")
    .forEach((b) => b.classList.remove("ativo"));

  // ADICIONA CLASSE ATIVA
  btn.classList.add("ativo");

  carregar();
}

function filtrarPeriodo(lista) {
  const filtro = filtroAtual;

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  return lista.filter((i) => {
    if (!i.Data) return false;

    // 🔥 normaliza data ignorando timezone (EVITA BUG Z)
    const dataItem = new Date(i.Data);
    const localDate = new Date(
      dataItem.getFullYear(),
      dataItem.getMonth(),
      dataItem.getDate(),
    );

    localDate.setHours(0, 0, 0, 0);

    // =======================
    // DIA
    // =======================
    if (filtro === "DIA") {
      return localDate.getTime() === hoje.getTime();
    }

    // =======================
    // SEMANA
    // =======================
    if (filtro === "SEMANA") {
      const inicio = new Date(hoje);
      inicio.setDate(hoje.getDate() - 7);
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

    console.log("🔥 DADOS BRUTOS DO BACKEND:", dados);

    const validos = dados.filter((i) => i.ID && i.Valor);

    console.log("✔ VALIDOS:", validos);

    // 👇 AQUI REMOVE DUPLICADOS
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
// 📄 HISTÓRICO (COM CRUD)
// =======================
function renderHistorico(lista) {
  const el = document.getElementById("historico");

  const ordenado = [...lista].sort((a, b) => {
    const da = new Date(a.Data);
    const db = new Date(b.Data);

    return db - da;
  });

  el.innerHTML = ordenado
    .slice(0, 50)
    .map((i) => {
      if (!i.ID || i.Valor === undefined) return "";

      return `
      <div class="item">

        <div class="info">

          <strong>
            ${i["Descrição"] || "-"}
          </strong>

          <span>
            R$ ${parseValor(i.Valor).toFixed(2)}
          </span>

        </div>

        <div class="acoes">

          <button onclick="editar(${i.ID})" class="btn-edit">
            ✏️
          </button>

          <button onclick="deletar(${i.ID})" class="btn-delete">
            🗑️
          </button>

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

    data: {
      valor: valor,
    },
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

  // 🔥 PROTEÇÃO
  const topCategoria = Object.entries(categorias).sort(
    (a, b) => b[1] - a[1],
  )[0] || ["Outros", 0];

  el.innerHTML = `

    💰 Total gasto:
    <b>R$ ${total.toFixed(2)}</b>

    <br><br>

    📊 Categoria principal:
    <b>${topCategoria[0]}</b>

    <br>

    💸 Total:
    R$ ${topCategoria[1].toFixed(2)}

    <br><br>

    🔥 Maior gasto real:

    <br>

    <b>
      ${maiorItem?.["Descrição"] || "-"}
    </b>

    <br>

    R$ ${maiorValor.toFixed(2)}

  `;
}

// =======================
// 📈 GRÁFICO MENSAL
// =======================
function renderGraficoMensal(lista) {
  const meses = {};

  lista.forEach((i) => {
    const valor = parseValor(i.Valor);

    // dd/MM/yyyy
    const data = i.Data || "";

    const mes = data.substring(3, 10);

    if (!mes) return;

    meses[mes] = (meses[mes] || 0) + valor;
  });

  // 🔥 ORDENA CRONOLOGICAMENTE
  const labels = Object.keys(meses).sort((a, b) => {
    const [mesA, anoA] = a.split("/");
    const [mesB, anoB] = b.split("/");

    return new Date(anoA, mesA - 1) - new Date(anoB, mesB - 1);
  });

  const valores = labels.map((m) => meses[m]);

  const ctx = document.getElementById("graficoMensal");

  if (window.chartMensal) {
    window.chartMensal.destroy();
  }

  window.chartMensal = new Chart(ctx, {
    type: "line",

    data: {
      labels: labels,

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

///REMOVE OS DUPLICADOS DA SOMA
function removerDuplicados(lista) {
  const map = new Map();

  lista.forEach((item) => {
    map.set(item.ID, item); // sobrescreve duplicados
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
