const API = "https://script.google.com/macros/s/AKfycbwJPbJ_dfcX7u6OZQine64Vfpg47shcOLsgHTYz5dd0oHa-JtMVhft2aStjyHKOvcfQ/exec";

async function apiGet(phone) {

  const res = await fetch(`${API}?phone=${phone}`);
  return await res.json();
}

async function apiPost(body) {

  await fetch(API, {
    method: "POST",
    body: JSON.stringify(body)
  });
}