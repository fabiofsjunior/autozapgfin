const API = "https://script.google.com/macros/s/AKfycbw7p1V-elYlP31gkOAInnpmuYWFxGC08RWcrA0e5h8PHVPvC3C3AB4lfRrjwxBpCO8o/exec";

async function enviar() {

  const data = {
    descricao: document.getElementById("desc").value,
    tipoPagamento: document.getElementById("pagamento").value,
    categoria: document.getElementById("categoria").value,
    valor: parseFloat(document.getElementById("valor").value)
  };

  await fetch(API, {
    method: "POST",
    body: JSON.stringify(data)
  });

  carregar();
}

async function carregar() {

  const res = await fetch(API + "?mode=web");
  const dados = await res.json();

  // 🔥 FILTRA MÊS ATUAL
  const hoje = new Date();
  const mesAtual = hoje.getMonth() + 1;

  const filtrado = dados.filter(item => {
    const data = item["Data"];
    if (!data) return false;
    const mes = parseInt(data.split("/")[1]);
    return mes === mesAtual;
  });

  // 📊 AGRUPA POR CATEGORIA
  let resumo = {};

  filtrado.forEach(item => {
    const cat = item["Categoria"];
    const valor = parseFloat(item["Valor"]);

    if (!resumo[cat]) resumo[cat] = 0;
    resumo[cat] += valor;
  });

  const labels = Object.keys(resumo);
  const valores = Object.values(resumo);

  if (window.chart) window.chart.destroy();

  window.chart = new Chart(document.getElementById("grafico"), {
    type: "bar",
    data: {
      labels,
      datasets: [{ data: valores }]
    }
  });

  // 📜 HISTÓRICO
  const tabela = document.getElementById("tabela");
  tabela.innerHTML = "";

  filtrado.slice(-10).reverse().forEach(item => {
    tabela.innerHTML += `
      <tr>
        <td>${item["Data"]}</td>
        <td>${item["Descrição"]}</td>
        <td>R$ ${item["Valor"]}</td>
      </tr>
    `;
  });
}

carregar();