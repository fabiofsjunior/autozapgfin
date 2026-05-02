const KEY = "autozap_user";

// =======================
// LOGIN
// =======================
function entrar() {

  let input = document.getElementById("telefone").value;

  let telefone = normalizar(input);

  if (!telefone) {
    alert("Número inválido");
    return;
  }

  localStorage.setItem(KEY, telefone);

  window.location.href = "dashboard.html";
}

// =======================
// CHECK LOGIN
// =======================
function getUser() {
  return localStorage.getItem(KEY);
}

// =======================
function normalizar(num) {

  num = num.replace(/\D/g, "");

  if (num.startsWith("55")) num = num.substring(2);

  if (num.length === 10) {
    num = num.slice(0,2) + "9" + num.slice(2);
  }

  return num.length === 11 ? num : null;
}