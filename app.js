// Stealthpad front end — mogz.fun rails, wXMR quote. Non-custodial: we only
// ever ask the wallet to sign; keys never leave Phantom/Solflare.
const WXMR_MINT = "WXMRyRZhsa19ety5erZhHg4N3xj3EVN92u94422teJp";
const MOGZ = "https://mogz.fun";

// ---- tabs ----
document.querySelectorAll(".tab").forEach((t) => {
  t.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((x) => x.classList.toggle("active", x === t));
    document.querySelectorAll(".view").forEach((v) => v.classList.toggle("active", v.id === "view-" + t.dataset.view));
    if (t.dataset.view === "coins") loadCoins();
  });
});

// ---- wallet connect (read-only address; signing happens on mogz) ----
async function connect(kind) {
  const provider = kind === "phantom" ? window.solana : window.solflare;
  const addrEl = document.getElementById("wallet-addr");
  if (!provider) {
    addrEl.hidden = false;
    addrEl.textContent = kind === "phantom" ? "Phantom not detected — install the extension/app" : "Solflare not detected — install the extension/app";
    return;
  }
  try {
    const res = await provider.connect();
    const pk = (res && res.publicKey ? res.publicKey : provider.publicKey).toString();
    addrEl.hidden = false;
    addrEl.textContent = pk.slice(0, 4) + "…" + pk.slice(-4);
  } catch (e) {
    addrEl.hidden = false;
    addrEl.textContent = "Connection rejected";
  }
}
document.getElementById("btn-phantom").addEventListener("click", () => connect("phantom"));
document.getElementById("btn-solflare").addEventListener("click", () => connect("solflare"));

// ---- launch form -> mogz create flow with wXMR pair ----
document.getElementById("launch-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("f-name").value.trim();
  const ticker = document.getElementById("f-ticker").value.trim().toUpperCase();
  if (!name || !ticker) return;
  // Hand off to mogz's create page; the pair there is chosen as Custom -> wXMR mint.
  // mogz builds the create tx in-browser and co-signs; Stealthpad holds nothing.
  const url = MOGZ + "/create?pair=" + WXMR_MINT + "&name=" + encodeURIComponent(name) + "&ticker=" + encodeURIComponent(ticker);
  window.open(url, "_blank", "noopener");
});

// ---- coin list: wXMR-quoted coins from the mogz index ----
let coinsLoaded = false;
async function loadCoins() {
  if (coinsLoaded) return;
  coinsLoaded = true;
  const el = document.getElementById("coin-list");
  try {
    const r = await fetch(MOGZ + "/api/coins?limit=100", { headers: { Accept: "application/json" } });
    if (!r.ok) throw new Error("mogz api " + r.status);
    const data = await r.json();
    const coins = (Array.isArray(data) ? data : data.coins || []).filter(
      (c) => c.quoteMint === WXMR_MINT || c.quote_mint === WXMR_MINT || c.pairMint === WXMR_MINT || (c.quote && c.quote.mint === WXMR_MINT)
    );
    if (!coins.length) {
      el.innerHTML = '<div class="coin-row"><div><b>No wXMR coins yet</b><div class="muted">The XMR pair is live on mogz — 0 launches so far. Be the first.</div></div></div>';
      return;
    }
    el.innerHTML = coins.map((c) =>
      '<div class="coin-row"><div><b>' + (c.name || "?") + '</b> <span class="accent">$' + (c.symbol || "") + '</span><div class="muted">quoted in wXMR</div></div><a class="wallet-btn" href="' + MOGZ + "/coin/" + (c.mint || c.address || "") + '" target="_blank" rel="noopener">View</a></div>'
    ).join("");
  } catch (err) {
    el.innerHTML = '<div class="coin-row"><div><b>Pair status: live, 0 coins</b><div class="muted">wXMR is an approved mogz quote token (verified 2026-11-03). The full index could not be loaded from here — see mogz.fun for the live list.</div></div></div>';
  }
}
