const API = "https://script.google.com/macros/s/AKfycbw7p1V-elYlP31gkOAInnpmuYWFxGC08RWcrA0e5h8PHVPvC3C3AB4lfRrjwxBpCO8o/exec";

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