/* King Solomon's Vineyard: shared site script. Data comes from /assets/data.js (window.KSV), built from src/data.json. */
(() => {
const { wines: WINES, sets: SETS, tiers: TIERS, sweetness: SWEET } = window.KSV;
const ITEMS = [...SETS, ...WINES];
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const money = n => "$" + (Number.isInteger(n) ? n : n.toFixed(2));
const PAGE = document.body.dataset.page;
const params = new URLSearchParams(location.search);
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
};

/* ---------- page entrance ---------- */
$("main").classList.add("page-enter");

/* ---------- ticker: each message crosses right to left, one at a time ---------- */
(() => {
  const box = $("#ticker"), el = $("#tickText"); if (!box) return;
  const msgs = JSON.parse(box.dataset.msgs || "[]"); let i = 0;
  function run() {
    el.textContent = msgs[i]; i = (i + 1) % msgs.length;
    const d = box.clientWidth + el.offsetWidth;
    el.animate([{ transform: "translateX(0)" }, { transform: `translateX(${-d}px)` }], { duration: d / 140 * 1000, easing: "linear" }).onfinish = run;
  }
  if (msgs.length) run();
})();

/* ---------- header: clear over the hero, solid once scrolled ---------- */
const hdr = $("header.site");
const setSolid = () => hdr.classList.toggle("solid", window.scrollY > 30);
addEventListener("scroll", setSolid, { passive: true }); setSolid();

/* ---------- menu ---------- */
const menu = $("#menu"), mScrim = $("#menuScrim"), mBtn = $("#menuBtn");
function openMenu(o) {
  menu.classList.toggle("open", o); menu.inert = !o; mBtn.setAttribute("aria-expanded", o); mScrim.hidden = !o;
  if (o) $("#menuClose").focus(); else if (menu.contains(document.activeElement)) mBtn.focus();
}
mBtn.onclick = () => openMenu(true); $("#menuClose").onclick = () => openMenu(false); mScrim.onclick = () => openMenu(false);
$$(".menu .links a").forEach(a => { if (a.dataset.page === PAGE) a.setAttribute("aria-current", "page"); });
menu.addEventListener("click", e => {
  const a = e.target.closest("a"); if (!a) return;
  if (a.dataset.page === PAGE && !a.hash) { e.preventDefault(); openMenu(false); window.scrollTo({ top: 0, behavior: "smooth" }); }
});

/* ---------- smooth in-page slides ---------- */
document.addEventListener("click", e => {
  const a = e.target.closest("[data-scroll]"); if (!a) return;
  const t = document.getElementById(a.dataset.scroll); if (!t) return;
  e.preventDefault(); t.scrollIntoView({ behavior: "smooth" });
});

/* ---------- hero wordmark rests on the treeline of the photo (42% down the image) ---------- */
(() => {
  const wm = $(".hero-wm"); if (!wm) return;
  const HZ = .418, hero = $(".hero"), img = hero.querySelector(":scope > img"), wrap = wm.parentElement, h1 = wrap.querySelector("h1");
  function place() {
    wm.classList.remove("float"); wm.style.top = "";
    const W = hero.clientWidth, H = hero.clientHeight; if (!W || !H) return;
    const ar = (img.naturalHeight && img.naturalWidth) ? img.naturalHeight / img.naturalWidth : .75;
    const y = W * ar >= H ? (H - W * ar) / 2 + HZ * W * ar : HZ * H;
    const hr = hero.getBoundingClientRect(), h1Top = h1.getBoundingClientRect().top - hr.top;
    const top = y - wm.offsetHeight - 10;
    if (top > 90 && top + wm.offsetHeight < h1Top - 24) {
      wm.classList.add("float");
      const w2 = wrap.getBoundingClientRect(); wm.style.top = (top - (w2.top - hr.top)) + "px";
    }
  }
  if (img.complete) place(); else img.addEventListener("load", place);
  addEventListener("resize", place); addEventListener("load", place);
  if (document.fonts) document.fonts.ready.then(place);
})();

/* ---------- club levels (home + club page) ---------- */
const joinHref = key => `/club?tier=${key}#join`;
function tierHTML(t) {
  return `<article class="tier${t.flag ? " feature" : ""}">${t.flag ? `<span class="flag">${t.flag}</span>` : ""}
  <h3>${t.name}</h3><div class="price"><b>$${t.fee}</b><span>/ month</span></div>
  <p class="incl">${t.incl}</p>${t.plus ? `<p class="plus">${t.plus}</p>` : ""}
  <ul>${t.items.map(([i, a]) => `<li${a ? ' class="add"' : ""}>${i}</li>`).join("")}</ul>
  <a class="btn ${t.flag ? "btn-gold" : "btn-ink"}" href="${joinHref(t.key)}" data-join="${t.key}">Join ${t.name}</a></article>`;
}
const popular = TIERS.find(t => t.flag) || TIERS[1];
$$("[data-tiers]").forEach(el => {
  el.innerHTML = TIERS.map(tierHTML).join("");
  el.insertAdjacentHTML("afterend", `<div class="tier-nav"><div class="tier-dots">${TIERS.map((t, i) => `<button type="button" aria-label="Show ${t.name}" data-i="${i}"></button>`).join("")}</div></div><a class="btn btn-gold tier-cta" href="${joinHref(popular.key)}" data-join="${popular.key}">Join ${popular.name}, our most popular</a>`);
  const dots = [...el.nextElementSibling.querySelectorAll("button")];
  const upd = () => {
    const mid = el.scrollLeft + el.clientWidth / 2; let k = 0, best = 1e9;
    [...el.children].forEach((c, i) => { const d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid); if (d < best) { best = d; k = i; } });
    dots.forEach((d, i) => d.classList.toggle("on", i === k));
  };
  el.addEventListener("scroll", upd, { passive: true });
  dots.forEach(d => d.onclick = () => { const c = el.children[+d.dataset.i]; el.scrollTo({ left: c.offsetLeft - (el.clientWidth - c.offsetWidth) / 2, behavior: "smooth" }); });
  const center = () => { if (!el.clientWidth) return; if (getComputedStyle(el).display === "flex") { const c = el.children[1]; el.scrollLeft = c.offsetLeft - (el.clientWidth - c.offsetWidth) / 2; } upd(); };
  center(); addEventListener("load", center);
});

/* ---------- join form (club page) ---------- */
if ($("#joinForm")) {
  let selected = TIERS.some(t => t.key === params.get("tier")) ? params.get("tier") : popular.key;
  $("#tierOpts").innerHTML = TIERS.map(t => `<label><input type="radio" name="tier" id="t-${t.key}" value="${t.key}"${t.key === selected ? " checked" : ""}> ${t.name} · $${t.fee}/mo</label>`).join("");
  document.addEventListener("click", e => {
    const j = e.target.closest("[data-join]"); if (!j) return;
    e.preventDefault(); const r = $("#t-" + j.dataset.join); if (r) r.checked = true;
    openBag(false); $("#join").scrollIntoView({ behavior: "smooth" });
  });
  $("#joinForm").addEventListener("submit", e => {
    e.preventDefault();
    const f = $("#jFirst").value.trim(), em = $("#jEmail").value.trim(), dob = $("#jDob").value;
    if (!f || !/^\S+@\S+\.\S+$/.test(em)) { $("#jErr").textContent = "Enter your first name and a valid email."; return; }
    if (!dob) { $("#jErr").textContent = "Enter your date of birth."; return; }
    if ((Date.now() - new Date(dob)) / 31557600000 < 21) { $("#jErr").textContent = "Members must be 21 or older."; return; }
    const t = TIERS.find(x => x.key === (document.querySelector('input[name="tier"]:checked') || {}).value) || popular;
    $("#joinWrap").innerHTML = `<div class="ok"><p class="eyebrow">Test site</p><h3 style="margin-top:.4rem">Welcome to ${t.name}, ${f.replace(/[<>&]/g, "")}.</h3><p style="margin-top:.6rem;color:var(--muted-dk)">On the live site this step opens secure payment for $${t.fee} a month. Nothing was charged and nothing was saved.</p></div>`;
  });
}

/* ---------- membership calculator (club page): avg retail $52, member $39, Vineyard $20 incl. 1 bottle ---------- */
if ($("#calcN")) {
  let cn = 2;
  const calc = () => {
    const non = cn * 52 * 12, mem = (cn - 1) * 39 * 12 + 240, max = 6 * 52 * 12;
    $("#calcN").textContent = `${cn} bottle${cn > 1 ? "s" : ""} / mo`;
    $("#cNon").textContent = "$" + non.toLocaleString() + " / yr"; $("#cMem").textContent = "$" + mem.toLocaleString() + " / yr";
    $("#fNon").style.width = (non / max * 100) + "%"; $("#fMem").style.width = (mem / max * 100) + "%";
    const s = non - mem;
    $("#cSave").textContent = s > 0 ? `Members save $${s.toLocaleString()} a year` : s === 0 ? "Membership breaks even" : `At one bottle a month, retail costs $${-s} less a year`;
  };
  $("#calcMinus").onclick = () => { cn = Math.max(1, cn - 1); calc(); };
  $("#calcPlus").onclick = () => { cn = Math.min(6, cn + 1); calc(); };
  calc();
}

/* ---------- homepage: wine strip and gift sets ---------- */
if ($("#homeStrip")) {
  $("#homeStrip").innerHTML = [107195, 107194, 107190, 107188].map(id => {
    const w = WINES.find(x => x.id === id);
    return `<a href="/wines"><img src="/img/bottle_${w.id}.png" alt="${w.name}" loading="lazy"><h3>${w.name}</h3><span class="p">${SWEET[w.sweet]} · ${money(w.list)} · <b>Members ${money(w.mem)}</b></span></a>`;
  }).join("");
}
if ($("#homeGiftsGrid")) {
  $("#homeGiftsGrid").innerHTML = SETS.map(b => `<article class="gift"><div class="gimg"><img src="/img/${b.img}" alt="${b.name} gift set" loading="lazy"></div>
  <p class="kicker">${b.size}</p><h3>${b.name}</h3><p class="for">${b.for}</p>
  <div class="row"><div class="pr"><s>${money(b.value)}</s><span>${money(b.list)}</span><b><small>Member</small>${money(b.mem)}</b></div>
  <button class="btn btn-gold" type="button" data-add="${b.id}">Add to bag</button></div></article>`).join("");
}

/* ---------- wines page ---------- */
if ($("#ledger")) {
  const scale = n => `<div class="scale" aria-hidden="true">${[1, 2, 3, 4].map(i => `<i class="${i <= n ? "on" : ""}"></i>`).join("")}</div>`;
  const wineRow = w => `<article class="wine fade" id="w-${w.id}">
  <div class="bottle"><img src="/img/bottle_${w.id}.png" alt="${w.name} bottle" loading="lazy"></div>
  <div><h2 class="wname">${w.name}</h2>${w.grape !== w.name ? `<p class="grape">${w.grape}</p>` : ""}<p class="desc">${w.desc}</p><p class="pair">Pair with: ${w.pair}</p></div>
  <div class="sweet"><span class="lbl">Sweetness</span>${scale(w.sweet)}<span class="val">${SWEET[w.sweet]}</span></div>
  <div class="buy"><div class="prices"><div class="list">${money(w.list)} retail</div><div class="mem"><small>Member</small>${money(w.mem)}</div></div>
  ${w.stock > 0 ? `<button class="btn btn-ink" type="button" data-add="${w.id}">Add to bag</button>` : `<span class="sold">Sold out. Members get the next release first.</span>`}</div></article>`;
  const setRow = b => `<article class="wine set fade" id="${b.id}">
  <div class="bottle"><img src="/img/${b.img}" alt="${b.name} gift set" loading="lazy"></div>
  <div><p class="kicker">${b.size} · Gift set</p><h2 class="wname">${b.name}</h2><p class="grape">${b.for}</p><p class="desc">${b.desc}</p></div>
  <div class="sweet"><span class="lbl">In the box</span><ul class="box">${b.items.map(i => `<li>${i}</li>`).join("")}</ul></div>
  <div class="buy"><div class="prices"><div class="list"><s>${money(b.value)}</s> ${money(b.list)}</div><div class="mem"><small>Member</small>${money(b.mem)}</div></div>
  <button class="btn btn-ink" type="button" data-add="${b.id}">Add to bag</button></div></article>`;
  const VARIETALS = ["Cabernet Franc", "Merlot", "Chambourcin", "Chardonnay", "Red blend", "White blend"];
  const shop = { f: ["red", "white", "sets"].includes(params.get("f")) ? params.get("f") : "all", v: VARIETALS.includes(params.get("v")) ? params.get("v") : "", s: "feat" };
  $("#fVar").insertAdjacentHTML("beforeend", VARIETALS.map(v => `<option value="${v}">${v}</option>`).join(""));
  $("#fVar").value = shop.v;
  const syncChips = () => $$(".chip").forEach(x => x.setAttribute("aria-pressed", x.dataset.f === shop.f));
  const syncUrl = () => { const q = new URLSearchParams(); if (shop.f !== "all") q.set("f", shop.f); if (shop.v) q.set("v", shop.v); history.replaceState(null, "", location.pathname + (q.toString() ? "?" + q : "")); };
  function render() {
    let list = ITEMS.filter(x => {
      const isSet = !!x.items;
      if (shop.f === "sets") return isSet && !shop.v;
      if (isSet) return shop.f === "all" && !shop.v;
      if (shop.f === "red" && x.color !== "red") return false;
      if (shop.f === "white" && x.color !== "white") return false;
      return !shop.v || x.varietal === shop.v;
    });
    if (shop.s !== "feat") list = [...list].sort((a, b) => shop.s === "asc" ? a.list - b.list : b.list - a.list);
    $("#ledger").innerHTML = list.length ? list.map(x => x.items ? setRow(x) : wineRow(x)).join("") : `<p class="empty">Nothing matches those filters. <button type="button" id="clearF">Show all wines</button></p>`;
    const c = $("#clearF"); if (c) c.onclick = () => { shop.f = "all"; shop.v = ""; $("#fVar").value = ""; syncChips(); syncUrl(); render(); };
  }
  $$(".chip").forEach(c => c.addEventListener("click", () => { shop.f = c.dataset.f; if (shop.f === "sets") { shop.v = ""; $("#fVar").value = ""; } syncChips(); syncUrl(); render(); }));
  $("#fVar").addEventListener("change", e => { shop.v = e.target.value; if (shop.v && shop.f === "sets") shop.f = "all"; syncChips(); syncUrl(); render(); });
  $("#fSort").addEventListener("change", e => { shop.s = e.target.value; render(); });
  syncChips(); render();
}

/* ---------- bag (remembered between pages) ---------- */
const bag = store.get("ksv-bag", {});
function renderBag() {
  const ids = Object.keys(bag).filter(k => bag[k] > 0 && ITEMS.some(x => x.id == k)); let n = 0, list = 0, mem = 0;
  $("#lines").innerHTML = ids.length ? ids.map(id => {
    const w = ITEMS.find(x => x.id == id), q = bag[id]; n += q; list += q * w.list; mem += q * w.mem;
    return `<div class="line"><div>${w.name}<br><span>${q} × ${money(w.list)}</span></div><div>${money(q * w.list)}<br><span style="color:var(--claret)">${money(q * w.mem)} member</span></div></div>`;
  }).join("") : `<p class="muted">Your bag is empty.</p>`;
  $("#bagCount").textContent = n; $("#bagCount").hidden = !n;
  $("#totals").innerHTML = n ? `<div class="r"><span>Retail total</span><b>${money(list)}</b></div><div class="r mem"><span>Member total</span><b>${money(mem)}</b></div>
   <div class="nudge"><span>Members save <b style="color:var(--claret)">${money(list - mem)}</b> on this order. Membership starts at $20 a month, bottle included.</span><a class="btn btn-gold" href="${joinHref("vineyard")}" data-join="vineyard">Join and save</a><button class="btn btn-line" type="button" style="color:var(--ink)" id="checkoutBtn">Check out at retail price</button></div><p id="coMsg" class="muted" style="font-size:.82rem"></p>` : "";
}
function openBag(o) { $("#drawer").classList.toggle("open", o); $("#drawer").setAttribute("aria-hidden", !o); $("#scrim").hidden = !o; }
document.addEventListener("click", e => {
  const a = e.target.closest("[data-add]");
  if (a) { bag[a.dataset.add] = (bag[a.dataset.add] || 0) + 1; store.set("ksv-bag", bag); renderBag(); openBag(true); }
  if (e.target.id === "checkoutBtn") $("#coMsg").textContent = "Test site: checkout would hand off to Vinoshipper here.";
});
$("#bagBtn").onclick = () => openBag(true); $("#bagClose").onclick = () => openBag(false); $("#scrim").onclick = () => openBag(false);
document.addEventListener("keydown", e => { if (e.key === "Escape") { openBag(false); openMenu(false); } });
renderBag();

/* ---------- mailing list (test only) ---------- */
const fForm = $("#footForm");
if (fForm) fForm.addEventListener("submit", e => {
  e.preventDefault(); const v = $("#fEmail").value.trim();
  $("#fMsg").textContent = /^\S+@\S+\.\S+$/.test(v) ? "Test site: on the live site, this adds you to the list." : "Enter a valid email address.";
});
})();
