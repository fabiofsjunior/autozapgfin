const API = "SUA_URL_WEBAPP";
const TOKEN = "TOKEN_INTERNO_123";

let TELEFONE = localStorage.getItem("tel");

// =======================
// 📱 NORMALIZAR TELEFONE
// =======================
function normalizarTelefone(numero) {

  numero = numero.replace(/\D/g, "");

  if (numero.startsWith("55")) {
    numero = numero.substring(2);
  }

  // adiciona 9
  if (numero.length === 10) {
    numero = numero.slice(0, 2) + "9" + numero.slice(2);
  }

  return numero;
}

// =======================
// 🔐 LOGIN
// =======================
function fazerLogin() {

  let tel = document.getElementById("telefone").value;

  tel = normalizarTelefone(tel);

  if (!tel || tel.length !== 11) {
    alert("Use formato: 81999999999");
    return;
  }

  localStorage.setItem("tel", tel);

  window.location.href = "dashboard.html";
}

// =======================
// 🚪 LOGOUT
// =======================
function logout() {
  localStorage.removeItem("tel");
  window.location.href = "index.html";
}

// =======================
// 💾 ENVIAR
// =======================
async function enviar() {

  const data = {
    descricao: desc.value,
    tipoPagamento: pagamento.value,
    categoria: categoria.value,
    valor: parseFloat(valor.value)
  };

  await fetch(API, {
    method: "POST",
    body: JSON.stringify({
      token: TOKEN,
      telefone: TELEFONE,
      action: "create",
      data
    })
  });

  limpar();
  carregar();
}

// =======================
// 🔄 CARREGAR
// =======================
async function carregar() {

  if (!TELEFONE) return;

  const res = await fetch(`${API}?token=${TOKEN}&telefone=${TELEFONE}`);
  const dados = await res.json();

  const lista = dados
    .map(normalizarItem)
    .filter(i => i.id && i.descricao);

  renderHistorico(lista);
  renderGrafico(lista);
}

// =======================
function normalizarItem(i) {
  return {
    id: i.ID,
    descricao: i["Descrição"] || i["Descricao"] || "",
    valor: parseFloat(i.Valor) || 0,
    categoria: i.Categoria || "Outros"
  };
}

// =======================
// 📄 HISTÓRICO
// =======================
function renderHistorico(lista) {

  const el = document.getElementById("historico");

  el.innerHTML = lista
    .slice(-50)
    .reverse()
    .map(i => `
      <div class="item">
        <strong>${i.descricao}</strong>
        <div>R$ ${i.valor.toFixed(2)}</div>
        <small>${i.categoria}</small>

        <div class="acoes">
          <button onclick="editar(${i.id})">✏️</button>
          <button onclick="deletar(${i.id})">🗑️</button>
        </div>
      </div>
    `).join("");
}

// =======================
// 📊 GRÁFICO PIZZA
// =======================
function renderGrafico(lista) {

  let resumo = {};

  lista.forEach(i => {
    if (!i.categoria) return;

    if (!resumo[i.categoria]) resumo[i.categoria] = 0;
    resumo[i.categoria] += i.valor;
  });

  const ctx = document.getElementById("grafico");

  if (window.chart) window.chart.destroy();

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
// ✏️ EDITAR
// =======================
function editar(id) {

  const valor = prompt("Novo valor:");

  if (!valor) return;

  fetch(API, {
    method: "POST",
    body: JSON.stringify({
      token: TOKEN,
      telefone: TELEFONE,
      action: "update",
      id,
      data: { valor: parseFloat(valor) }
    })
  }).then(carregar);
}

// =======================
// 🗑️ DELETAR
// =======================
function deletar(id) {

  fetch(API, {
    method: "POST",
    body: JSON.stringify({
      token: TOKEN,
      telefone: TELEFONE,
      action: "delete",
      id
    })
  }).then(carregar);
}

// =======================
function limpar() {
  desc.value = "";
  valor.value = "";
}

// =======================
if (window.location.pathname.includes("dashboard")) {
  carregar();
  setInterval(carregar, 5000);
}