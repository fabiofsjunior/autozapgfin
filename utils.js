function normalizarTelefone(num) {
  if (!num) return null;

  num = num.replace(/\D/g, "");

  if (num.startsWith("55")) num = num.substring(2);

  if (num.length === 10) {
    num = num.slice(0,2) + "9" + num.slice(2);
  }

  return num;
}