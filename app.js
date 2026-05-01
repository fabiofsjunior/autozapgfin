  const API =
  "https://script.google.com/macros/s/AKfycbw7p1V-elYlP31gkOAInnpmuYWFxGC08RWcrA0e5h8PHVPvC3C3AB4lfRrjwxBpCO8o/exec";
  
const TOKEN = "MEU_TOKEN_SEGURO_123";

// 🔥 SIMULA LOGIN (depois vira autenticação real)
const USER = localStorage.getItem("user") || prompt("Digite seu telefone:");
localStorage.setItem("user", USER);

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
      user: USER,
      action: "create",
      data
    })
  });

  limpar();
  carregar();
}

// =======================
async function carregar() {

  const res = await fetch(`${API}?token=${TOKEN}&user=${USER}`);
  const dados = await res.json();

  renderGrafico(dados);
  renderHistorico(dados);
}

// =======================
// 📊 GRÁFICO PIZZA (NUBANK STYLE)
function renderGrafico(lista){

  let resumo = {};

  lista.forEach(i=>{
    if(!resumo[i.Categoria]) resumo[i.Categoria]=0;
    resumo[i.Categoria]+=parseFloat(i.Valor)||0;
  });

  const labels = Object.keys(resumo);
  const valores = Object.values(resumo);

  if(window.chart) window.chart.destroy();

  const ctx = document.getElementById("grafico");

  window.chart = new Chart(ctx,{
    type:"doughnut",
    data:{
      labels,
      datasets:[{
        data: valores
      }]
    },
    options:{
      plugins:{
        legend:{ position:"bottom" }
      }
    }
  });
}

// =======================
function editar(id){
  const novo = prompt("Novo valor:");
  if(!novo) return;

  fetch(API,{
    method:"POST",
    body: JSON.stringify({
      token:TOKEN,
      user:USER,
      action:"update",
      id,
      data:{ valor:parseFloat(novo) }
    })
  }).then(carregar);
}

// =======================
function deletar(id){

  fetch(API,{
    method:"POST",
    body: JSON.stringify({
      token:TOKEN,
      user:USER,
      action:"delete",
      id
    })
  }).then(carregar);
}

// =======================
function renderHistorico(lista){

  const el = document.getElementById("historico");

  el.innerHTML = lista.slice(-50).reverse().map(i=>`
    <div class="item">
      <strong>${i.Descrição}</strong>
      R$ ${i.Valor}
      <small>${i.Categoria}</small>
      <div class="acoes">
        <button onclick="editar(${i.ID})">✏️</button>
        <button onclick="deletar(${i.ID})">🗑️</button>
      </div>
    </div>
  `).join("");
}

// =======================
function limpar(){
  desc.value="";
  valor.value="";
}

// =======================
carregar();
setInterval(carregar,5000);