function entrar() {

  let input = document.getElementById("telefone").value;

  let telefone = normalizarTelefone(input);

  if (!telefone || telefone.length < 11) {
    alert("Digite um número válido com DDD + 9");
    return;
  }

  localStorage.setItem("telefone", telefone);

  window.location.href = "dashboard.html";
}