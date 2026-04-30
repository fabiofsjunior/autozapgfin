const API =
  "https://script.google.com/macros/s/AKfycbw7p1V-elYlP31gkOAInnpmuYWFxGC08RWcrA0e5h8PHVPvC3C3AB4lfRrjwxBpCO8o/exec";

async function enviar() {
  const data = {
    descricao: document.getElementById("desc").value,
    tipoPagamento: document.getElementById("pagamento").value,
    categoria: document.getElementById("categoria").value,
    valor: parseFloat(document.getElementById("valor").value),
  };

  await fetch(API, {
    method: "POST",
    body: JSON.stringify(data),
  });

  carregar();
}

async function carregar() {
  try {
    const res = await fetch(API + "?mode=web");
    const dados = await res.json();

    console.log("OK:", dados);
  } catch (e) {
    console.error("ERRO FETCH:", e);
  }
}

carregar();
