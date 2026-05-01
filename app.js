const API = "https://script.google.com/macros/s/AKfycbw7p1V-elYlP31gkOAInnpmuYWFxGC08RWcrA0e5h8PHVPvC3C3AB4lfRrjwxBpCO8o/exec";

let phone = localStorage.getItem("user");

if (!phone) {
  phone = prompt("Digite seu telefone (DDD + 9 + número)\nEx: 81983402995");
  localStorage.setItem("user", phone);
}

async function carregar() {

  const res = await fetch(API + "?phone=" + phone);
  const dados = await res.json();

  const lanc = dados.filter(i => i.ID && i.Valor);

  renderGrafico(lanc);
  renderIA(lanc);
}

function renderGrafico(lista) {

  let resumo = {};

  lista.forEach(i => {
    const cat = i.Categoria || "Outros";
    const val = parseFloat(i.Valor) || 0;

    if (!resumo[cat]) resumo[cat] = 0;
    resumo[cat] += val;
  });

  if (window.chart) window.chart.destroy();

  const ctx = document.getElementById("grafico");

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

function renderIA(lista) {

  let total = 0;
  lista.forEach(i => total += parseFloat(i.Valor) || 0);

  document.getElementById("analise").innerHTML = `
    💸 Total gasto: R$ ${total.toFixed(2)} <br>
    📊 Transações: ${lista.length}
  `;
}

carregar();
setInterval(carregar, 5000);