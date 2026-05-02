function renderHistorico(lista) {

    const el = document.getElementById("historico");
  
    el.innerHTML = lista.slice(-50).reverse().map(i => `
      <div class="item">
        <div>
          <strong>${i.Descrição}</strong>
          <span>R$ ${i.Valor}</span>
        </div>
  
        <div class="acoes">
          <button onclick="editar(${i.ID})">✏️</button>
          <button onclick="deletar(${i.ID})">🗑️</button>
        </div>
      </div>
    `).join("");
  }
  
  // =======================
  function editar(id) {
  
    const novo = prompt("Novo valor:");
    if (!novo) return;
  
    apiPost({
      phone: telefone,
      action: "update",
      id,
      data: { valor: parseFloat(novo) }
    }).then(carregar);
  }
  
  // =======================
  function deletar(id) {
  
    apiPost({
      phone: telefone,
      action: "delete",
      id
    }).then(carregar);
  }