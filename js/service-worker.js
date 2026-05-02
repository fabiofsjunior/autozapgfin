const API = "SUA_URL_WEBAPP";

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