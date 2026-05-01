function gerarAnalise(lista){

    let total = 0;
    let categorias = {};
  
    lista.forEach(i => {
      total += i.Valor;
  
      if(!categorias[i.Categoria]) categorias[i.Categoria] = 0;
      categorias[i.Categoria] += i.Valor;
    });
  
    let maior = Object.keys(categorias).reduce((a,b) => 
      categorias[a] > categorias[b] ? a : b
    );
  
    document.getElementById("analise").innerHTML = `
      💸 Você gastou <b>R$ ${total.toFixed(2)}</b><br>
      📊 Maior gasto: <b>${maior}</b><br>
      ⚠️ Dica: reduzir ${maior} pode melhorar seu saldo
    `;
  }

  gerarAnalise(lancamentos);