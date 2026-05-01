const API = "https://script.google.com/macros/s/AKfycbw7p1V-elYlP31gkOAInnpmuYWFxGC08RWcrA0e5h8PHVPvC3C3AB4lfRrjwxBpCO8o/exec";
const TOKEN = "TOKEN_INTERNO_123";

let TELEFONE = localStorage.getItem("tel") || "";

function normalizarTelefone(numero) {
  numero = numero.replace(/\D/g, "");
  if (numero.startsWith("55")) numero = numero.substring(2);
  return numero;
}

function login() {
  let tel = prompt("Digite seu telefone (DDD + número):\nEx: 81999999999");

  tel = normalizarTelefone(tel);

  if (!tel || tel.length < 10) {
    alert("Telefone inválido");
    return;
  }

  localStorage.setItem("tel", tel);
  TELEFONE = tel;

  carregar();
}

async function carregar() {

  if (!TELEFONE) return login();

  const res = await fetch(`${API}?token=${TOKEN}&telefone=${TELEFONE}`);
  const dados = await res.json();

  const validos = dados.filter(i => i.ID && i.Descrição);

  renderHistorico(validos);
}

function renderHistorico(lista) {

  const el = document.getElementById("historico");

  el.innerHTML = lista
    .slice(-50)
    .reverse()
    .map(i => `
      <div class="item">
        <strong>${i.Descrição}</strong>
        R$ ${i.Valor}
        <div class="acoes">
          <button onclick="editar(${i.ID})">✏️</button>
          <button onclick="deletar(${i.ID})">🗑️</button>
        </div>
      </div>
    `)
    .join("");
}

carregar();
setInterval(carregar, 5000);