const API = "https://script.google.com/macros/s/AKfycbwJPbJ_dfcX7u6OZQine64Vfpg47shcOLsgHTYz5dd0oHa-JtMVhft2aStjyHKOvcfQ/exec";

async function apiGet(phone) {

  const res = await fetch(API + "?phone=" + phone);
  return await res.json();
}

async function apiPost(data) {

  await fetch(API, {
    method: "POST",
    body: JSON.stringify(data)
  });
}

async function getDados(telefone) {
  const res = await fetch(API + "?phone=" + telefone);
  return await res.json();
}