const API = "https://script.google.com/macros/s/AKfycbwJPbJ_dfcX7u6OZQine64Vfpg47shcOLsgHTYz5dd0oHa-JtMVhft2aStjyHKOvcfQ/exec";

async function getDados(telefone) {
  const res = await fetch(API + "?phone=" + telefone);
  return await res.json();
}