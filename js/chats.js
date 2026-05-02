function renderGrafico(lista) {

    let resumo = {};
  
    lista.forEach(i => {
      if (!resumo[i.Categoria]) resumo[i.Categoria] = 0;
      resumo[i.Categoria] += parseFloat(i.Valor);
    });
  
    const ctx = document.getElementById("grafico");
  
    if (window.chart) window.chart.destroy();
  
    window.chart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: Object.keys(resumo),
        datasets: [{
          data: Object.values(resumo)
        }]
      }
    });
  }