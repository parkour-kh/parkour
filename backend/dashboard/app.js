async function refresh() {
  const res = await fetch("/api/count");
  const data = await res.json();
  document.getElementById("count").textContent = data.count;
}

refresh();
setInterval(refresh, 2000);
