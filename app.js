const API = "https://script.google.com/macros/s/AKfycbw7p1V-elYlP31gkOAInnpmuYWFxGC08RWcrA0e5h8PHVPvC3C3AB4lfRrjwxBpCO8o/exec";
const TOKEN = "TOKEN_INTERNO_123";

let TELEFONE = localStorage.getItem("tel") || "";

// =======================
// 📱 NORMALIZA TELEFONE
// =======================
function normalizarTelefone(numero) {
  numero = numero.replace(/\D/g, "");
  if (numero.startsWith("55")) numero = numero.substring(2);
  return numero;
}

// =======================
// 🔐 LOGIN
// =======================
function login() {
  let tel = prompt("Digite seu telefone (DDD + número)\nEx: 81999999999");

  tel = normalizarTelefone(tel);

  if (!tel || tel.length < 10) {
    alert("Telefone inválido");
    return;
  }

  localStorage.setItem("tel", tel);
  TELEFONE = tel;

  carregar();
}

// =======================
// 🔄 CARREGAR DADOS
// =======================
async function carregar() {

  if (!TELEFONE) return login();

  try {
    const res = await fetch(`${API}?token=${TOKEN}&telefone=${TELEFONE}`);

    const dados = await res.json();

    console.log("DADOS BRUTOS:", dados);

    if (!Array.isArray(dados)) {
      console.error("Resposta inválida:", dados);
      return;
    }

    const lista = dados
      .map(normalizarItem)
      .filter(i => i.id && i.descricao);

    renderHistorico(lista);

  } catch (e) {
    console.error("Erro ao carregar:", e);
  }
}

// =======================
// 🔄 NORMALIZA ITEM
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

  if (!lista.length) {
    el.innerHTML = "<p>Nenhuma transação encontrada</p>";
    return;
  }

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
    `)
    .join("");
}

// =======================
carregar();
setInterval(carregar, 5000);