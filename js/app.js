let telefone = null;

// =======================
window.onload = async () => {

  telefone = localStorage.getItem("autozap_user");

  if (!telefone) {
    window.location.href = "index.html";
    return;
  }

  await carregar();
  setInterval(carregar, 5000);
};

// =======================
async function carregar() {

  const dados = await apiGet(telefone);

  const validos = dados.filter(i => i.ID && i.Valor);

  renderHistorico(validos);
  renderGrafico(validos);
}

// =======================
async function criar() {

  const data = {
    descricao: desc.value,
    valor: parseFloat(valor.value),
    categoria: categoria.value,
    tipo: "Despesa",
    forma_pagamento: "pix"
  };

  await apiPost({
    phone: telefone,
    action: "create",
    data
  });

  limpar();
  carregar();
}

// =======================
function limpar() {
  desc.value = "";
  valor.value = "";
}