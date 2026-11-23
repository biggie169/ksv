/* King Solomon's Vineyard: shared site script. Data comes from /assets/data.js (window.KSV), built from src/data.json. */
(() => {
const { wines: WINES, sets: SETS, tiers: TIERS } = window.KSV;
const ICONS = {
  "Notes": '<path d="M8 3h8l-.4 6.2a3.6 3.6 0 0 1-7.2 0L8 3zM12 12.8V20M8.5 20.5h7"/>',
  "Pairs with": '<path d="M7 3v6.5a2 2 0 0 0 2 2V21M11 3v6.5a2 2 0 0 1-2 2M9 3v5.5M17 21V3c-2 1.6-3 4.2-3 7v3.5h3"/>',
  "In the box": '<path d="M4 10h16v10H4zM3 7h18v3H3zM12 7v13M12 7c-1.6-3.2-5.5-3-5.2-.9C7 7.3 10 7 12 7zM12 7c1.6-3.2 5.5-3 5.2-.9C17 7.3 14 7 12 7z"/>'
};
const icon = label => ICONS[label] ? `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${ICONS[label]}</svg>` : "";
/* chip row with an icon label; compact rows show only the icon (label kept for screen readers) */
const tags = (label, list, cls = "", compact = false) => `<div class="tags${compact ? " compact" : ""}"><span class="tl">${icon(label)}<span class="lt">${label}</span></span>${list.map(x => `<span class="tag${cls}">${x}</span>`).join("")}</div>`;
const ITEMS = [...SETS, ...WINES];
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const money = n => "$" + (Number.isInteger(n) ? n : n.toFixed(2));
/* Keeper insignia: a ring broken by a small crown, with a script K */
const KMARK = '<svg class="kmark" viewBox="0 0 32 32" aria-hidden="true"><path d="M11.2 5.2A12 12 0 1 0 20.8 5.2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M12.3 7.4 11.6 2.6 14.1 4.6 16 1.6 17.9 4.6 20.4 2.6 19.7 7.4Z" fill="currentColor"/><text x="16.3" y="23.4" text-anchor="middle" font-family="Bodoni Moda, Didot, serif" font-style="italic" font-weight="500" font-size="15.5" fill="currentColor">K</text></svg>';
/* headline "Keeper": the insignia stands in for the K; the full word stays for screen readers */
const kp = v => `<span class="kp" title="Keeper price"><span class="vh">Keeper price </span>${money(v)}${KMARK}</span>`;
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
/* on the homepage the logo flight decides when the header turns solid (see below) */
const setSolid = () => { if (!document.body.classList.contains("has-hero-logo")) hdr.classList.toggle("solid", window.scrollY > 30); };
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

/* ---------- homepage logo: gold logo over the sky; the monogram turns ivory as it flies into the header ---------- */
(() => {
  if (PAGE !== "home" || !$(".hero")) return;
  /* built here and placed at the end of <body>, never in the page flow above the hero */
  const box = document.createElement("div");
  box.className = "hero-logo"; box.setAttribute("aria-hidden", "true");
  box.innerHTML = '<img class="hl-mark" src="/img/ksv-mark-gold.svg" alt=""><img class="hl-mark hl-mark-w" src="/img/ksv-mark-light.svg" alt=""><img class="hl-text" src="/img/ksv-logo-text-gold.svg" alt="">';
  document.body.appendChild(box); document.body.classList.add("has-hero-logo");
  const marks = [...box.querySelectorAll(".hl-mark")], markW = box.querySelector(".hl-mark-w"), text = box.querySelector(".hl-text");
  const hero = $(".hero"), photo = hero.querySelector(":scope > img"), dock = $("header.site .mark img");
  const wrap = hero.querySelector(":scope > .wrap"), h1 = hero.querySelector("h1");
  const HZ = .418, FOREST = .56;           /* in the photo: sky meets trees 42% down; the forest gives way to vines 56% down */
  const MARK_AR = 1780 / 2133, TEXT_W = 2331 / 2133, TEXT_AR = 766 / 2331, GAP = .03;
  let s = null, ticking = false;
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const pageTop = el => { let y = 0; for (; el; el = el.offsetParent) y += el.offsetTop; return y; };   /* unaffected by the fade-in */
  function layout() {
    const hr = hero.getBoundingClientRect(), W = hero.clientWidth, H = hero.clientHeight;
    if (!W || !H) return;
    const ar = (photo.naturalHeight && photo.naturalWidth) ? photo.naturalHeight / photo.naturalWidth : .75;
    const heroTop = pageTop(hero), wide = W >= 900;
    const py = (parseFloat(getComputedStyle(photo).objectPosition.split(" ")[1]) || 50) / 100;
    const photoY = f => { const Wp = photo.clientWidth, Hp = photo.clientHeight;   /* page y of a point f of the way down the photo */
      return heroTop + photo.offsetTop + (Wp * ar >= Hp ? (Hp - Wp * ar) * py + f * Wp * ar : f * Hp); };
    /* desktop: the headline starts below the forest, by trimming the bottom space, then the type size if needed */
    wrap.style.paddingBottom = ""; h1.style.fontSize = "";
    if (wide) {
      let need = photoY(FOREST) + 10 - pageTop(h1);
      if (need > 0) {
        const pb = parseFloat(getComputedStyle(wrap).paddingBottom), npb = Math.max(22, pb - need);
        wrap.style.paddingBottom = npb + "px"; need -= pb - npb;
        if (need > 0) { const fs = parseFloat(getComputedStyle(h1).fontSize); h1.style.fontSize = Math.max(38, fs - need / 2.2) + "px"; }
      }
    }
    const horizon = photoY(HZ);
    hero.style.setProperty("--hz", (horizon - heroTop) + "px");   /* the moving sky fades out just above the treeline */
    const perW = MARK_AR * (1 + GAP) + TEXT_W * TEXT_AR;              /* logo height per px of monogram width */
    const top = heroTop + (wide ? 10 : 8), avail = horizon - 30 - top;   /* may rise into the clear header; stays above the treeline */
    const h1Room = pageTop(h1) - 28 - top;                            /* never reach the headline */
    const w = wide ? Math.min(avail / perW, h1Room / perW, W * .205, 360) : Math.min(avail / perW, h1Room / perW, W * .7);
    const mh = w * MARK_AR, tw = w * TEXT_W, total = mh * (1 + GAP) + tw * TEXT_AR;
    const y = top + Math.max(0, (Math.min(avail, h1Room) - total) / 2);
    s = { x: hr.left + (W - w) / 2, y, w, tx: hr.left + (W - tw) / 2, ty: y + mh * (1 + GAP), tw };   /* positions as seen at the top of the page */
    marks.forEach(m => m.style.width = w + "px"); text.style.width = tw + "px";
    frame(); box.classList.add("ready");
  }
  function frame() {
    ticking = false; if (!s) return;
    const sy = scrollY, D = Math.max(260, innerHeight * .5);
    const p = Math.min(1, Math.max(0, sy / D)), e = ease(p);
    const t = dock.getBoundingClientRect();
    const x = lerp(s.x, t.left, e), y = lerp(s.y, t.top, e), k = lerp(1, t.width / s.w, e);
    marks.forEach(m => m.style.transform = `translate(${x}px,${y}px) scale(${k})`);
    markW.style.opacity = Math.min(1, Math.max(0, (p - .15) / .7));   /* gold to ivory while it travels */
    text.style.transform = `translate(${s.tx}px,${s.ty - p * 70}px)`;
    text.style.opacity = Math.max(0, 1 - p / .35);
    document.body.classList.toggle("logo-docked", p >= 1);
    hdr.classList.toggle("solid", p >= 1);          /* black bar fades in only once the logo has landed */
  }
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }, { passive: true });
  addEventListener("resize", layout);
  if (photo.complete) layout(); else photo.addEventListener("load", layout);
  addEventListener("load", layout);
  if (document.fonts) document.fonts.ready.then(layout);
})();

/* ---------- hero sky: drifts slowly; on desktop it also leans a few pixels toward the pointer ---------- */
(() => {
  const hero = $(".hero"), sky = hero && hero.querySelector(".sky"); if (!sky) return;
  if (!matchMedia("(pointer: fine)").matches) return;
  let tx = 0, ty = 0, x = 0, y = 0, raf = 0;
  const step = () => { x += (tx - x) * .06; y += (ty - y) * .06; sky.style.translate = `${x.toFixed(2)}px ${y.toFixed(2)}px`; raf = Math.abs(tx - x) + Math.abs(ty - y) > .05 ? requestAnimationFrame(step) : 0; };
  hero.addEventListener("pointermove", e => { const r = hero.getBoundingClientRect(); tx = ((e.clientX - r.left) / r.width - .5) * -24; ty = ((e.clientY - r.top) / r.height - .5) * -10; if (!raf) raf = requestAnimationFrame(step); });
  hero.addEventListener("pointerleave", () => { tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(step); });
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
  el.insertAdjacentHTML("afterend", `<div class="tier-nav"><div class="tier-dots">${TIERS.map((t, i) => `<button type="button" aria-label="Show ${t.name}" data-i="${i}"></button>`).join("")}</div></div>`);
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

/* ---------- "Love wine?" calculator (club page): bottles a month and a wine; compares a year at retail with the best-value level ---------- */
if ($("#calcN")) {
  const INCL = { vineyard: 1, reserve: 3, kings: 6 }, OFF = { vineyard: .75, reserve: .75, kings: .7 };
  const buyable = WINES.filter(w => w.stock > 0);
  $("#calcWine").innerHTML = buyable.map(w => `<option value="${w.id}">${w.name} · ${money(w.list)}</option>`).join("");
  let cn = 2;
  const yr = n => "$" + Math.round(n).toLocaleString();
  const calc = () => {
    const w = WINES.find(x => x.id == $("#calcWine").value) || buyable[0];
    const non = cn * w.list * 12;
    /* illustrative: included bottles count toward the month's wine; extra bottles at that level's price */
    const plans = TIERS.map(t => ({ t, cost: t.fee * 12 + Math.max(0, cn - INCL[t.key]) * w.list * OFF[t.key] * 12 }));
    const best = plans.reduce((a, b) => b.cost < a.cost ? b : a);
    const save = non - best.cost, pct = Math.round(save / non * 100);
    $("#calcN").textContent = `${cn} bottle${cn > 1 ? "s" : ""} / mo`;
    $("#cNon").textContent = yr(non) + " / yr"; $("#cMem").textContent = yr(best.cost) + " / yr";
    $("#cMemLbl").textContent = `As a ${best.t.name} Keeper, fee included`;
    $("#fNon").style.width = "100%"; $("#fMem").style.width = Math.max(4, best.cost / non * 100) + "%";
    $("#cSave").innerHTML = save > 0 ? `Keepers save ${yr(save)} a year <span class="pct">${pct}% less</span>` : "Membership breaks even";
    const b = $("#cBuy"); b.dataset.join = best.t.key; b.href = `/club?tier=${best.t.key}#join`;
    b.textContent = save > 0 ? `Join ${best.t.name} and save ${yr(save)} a year` : `Join ${best.t.name}`;
  };
  $("#calcMinus").onclick = () => { cn = Math.max(1, cn - 1); calc(); };
  $("#calcPlus").onclick = () => { cn = Math.min(12, cn + 1); calc(); };
  $("#calcWine").addEventListener("change", calc);
  calc();
}

/* ---------- homepage: wine strip and gift sets ---------- */
if ($("#homeStrip")) {
  const strip = $("#homeStrip");
  strip.innerHTML = WINES.map(w => `<article class="wcard">
    <a class="wimg" href="/wines#w-${w.id}"><img src="/img/bottle_${w.id}.png" alt="${w.name}" loading="lazy"></a>
    <h3><a href="/wines#w-${w.id}">${w.name}</a></h3>
    ${tags("Notes", w.notes.slice(0, 2), "", true)}${tags("Pairs with", w.pairs.slice(0, 2), " pair", true)}
    <div class="wfoot"><span class="pp">${money(w.list)} <b>${kp(w.mem)}</b></span>
    ${w.stock > 0 ? `<button class="btn btn-ink" type="button" data-add="${w.id}">Add to bag</button>` : `<span class="sold">Sold out</span>`}</div>
  </article>`).join("");
  strip.insertAdjacentHTML("afterend", `<div class="car-nav"><button class="car-arrow" type="button" data-dir="-1" aria-label="Previous wines">&#8592;</button><div class="tier-dots">${WINES.map((w, i) => `<button type="button" aria-label="Show ${w.name}" data-i="${i}"></button>`).join("")}</div><button class="car-arrow" type="button" data-dir="1" aria-label="More wines">&#8594;</button></div>`);
  const nav = strip.nextElementSibling, dots = [...nav.querySelectorAll(".tier-dots button")], cards = [...strip.children];
  const pad = () => parseFloat(getComputedStyle(strip).scrollPaddingLeft) || 0;
  const step = () => cards[1].offsetLeft - cards[0].offsetLeft;
  const upd = () => {
    const k = Math.round(strip.scrollLeft / step());
    const end = strip.scrollLeft + strip.clientWidth >= strip.scrollWidth - 4;
    dots.forEach((d, i) => d.classList.toggle("on", end ? i === cards.length - 1 || (i >= k && cards[i].offsetLeft - strip.scrollLeft < strip.clientWidth) : i === k));
    nav.querySelector('[data-dir="-1"]').disabled = strip.scrollLeft < 4;
    nav.querySelector('[data-dir="1"]').disabled = end;
  };
  strip.addEventListener("scroll", () => requestAnimationFrame(upd), { passive: true });
  dots.forEach(d => d.onclick = () => strip.scrollTo({ left: cards[+d.dataset.i].offsetLeft - cards[0].offsetLeft, behavior: "smooth" }));
  nav.querySelectorAll(".car-arrow").forEach(a => a.onclick = () => strip.scrollBy({ left: +a.dataset.dir * step(), behavior: "smooth" }));
  upd(); addEventListener("resize", upd);
}
if ($("#homeGiftsGrid")) {
  $("#homeGiftsGrid").innerHTML = SETS.map(b => `<article class="gift"><span class="savebadge">Save ${money(b.value - b.list)}</span><div class="gimg"><img src="/img/${b.img}" alt="${b.name} gift set" loading="lazy"></div>
  <h3>${b.name}</h3>
  <div class="row"><div class="pr"><span class="now">${money(b.list)}</span><s>${money(b.value)}</s><b>${kp(b.mem)}</b></div>
  <button class="btn btn-gold" type="button" data-add="${b.id}">Add to bag</button></div></article>`).join("");
}

/* ---------- branded dropdowns: a styled button and list drive the hidden native select ---------- */
const dropdowns = [];
function refreshSelects() { dropdowns.forEach(d => d.sync()); }
$$(".sel select").forEach(sel => {
  const wrap = sel.closest(".sel"); wrap.classList.add("dd");
  const btn = document.createElement("button"); btn.type = "button"; btn.className = "dd-btn";
  btn.setAttribute("aria-haspopup", "listbox"); btn.setAttribute("aria-expanded", "false");
  const list = document.createElement("ul"); list.className = "dd-list"; list.setAttribute("role", "listbox"); list.hidden = true;
  wrap.append(btn, list); sel.tabIndex = -1; sel.setAttribute("aria-hidden", "true");
  const build = () => { list.innerHTML = [...sel.options].map((o, i) => `<li role="option" data-i="${i}" tabindex="-1"${o.selected ? ' aria-selected="true"' : ""}>${o.textContent}</li>`).join(""); };
  const sync = () => { btn.textContent = sel.options[sel.selectedIndex] ? sel.options[sel.selectedIndex].textContent : ""; build(); };
  const open = o => {
    if (o) $$(".dd-list").forEach(l => { if (l !== list) { l.hidden = true; l.previousElementSibling.setAttribute("aria-expanded", "false"); } });
    list.hidden = !o; btn.setAttribute("aria-expanded", o);
    if (o) (list.querySelector('[aria-selected="true"]') || list.firstElementChild).focus();
  };
  const choose = i => { sel.selectedIndex = i; sync(); open(false); btn.focus(); sel.dispatchEvent(new Event("change")); };
  btn.onclick = () => open(list.hidden);
  list.addEventListener("click", e => { const li = e.target.closest("li"); if (li) choose(+li.dataset.i); });
  list.addEventListener("keydown", e => {
    const items = [...list.children], k = items.indexOf(document.activeElement);
    if (e.key === "ArrowDown") { e.preventDefault(); items[Math.min(k + 1, items.length - 1)].focus(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); items[Math.max(k - 1, 0)].focus(); }
    else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); if (k >= 0) choose(k); }
    else if (e.key === "Escape" || e.key === "Tab") { open(false); if (e.key === "Escape") btn.focus(); }
  });
  document.addEventListener("click", e => { if (!wrap.contains(e.target)) open(false); });
  dropdowns.push({ sync }); sync();
});

/* ---------- wines page ---------- */
if ($("#ledger")) {
  const wineRow = w => `<article class="wine fade" id="w-${w.id}">
  <div class="bottle"><img src="/img/bottle_${w.id}.png" alt="${w.name} bottle" loading="lazy"></div>
  <div class="info"><h2 class="wname">${w.name}</h2>${w.grape !== w.name ? `<p class="grape">${w.grape}</p>` : ""}<p class="desc">${w.desc}</p>
  ${tags("Notes", w.notes)}${tags("Pairs with", w.pairs, " pair")}</div>
  <div class="buy"><div class="prices"><div class="list">${money(w.list)}</div><div class="mem">${kp(w.mem)}</div></div>
  ${w.stock > 0 ? `<button class="btn btn-ink" type="button" data-add="${w.id}">Add to bag</button>` : `<span class="sold">Sold out. Members get the next release first.</span>`}</div></article>`;
  const setRow = b => `<article class="wine set fade" id="${b.id}">
  <div class="bottle"><img src="/img/${b.img}" alt="${b.name} gift set" loading="lazy"></div>
  <div class="info"><h2 class="wname">${b.name}</h2><p class="grape">${b.for}</p><p class="desc">${b.desc}</p>
  ${tags("In the box", b.items)}</div>
  <div class="buy"><div class="prices"><span class="savebadge">Save ${money(b.value - b.list)}</span><div class="list"><s>${money(b.value)}</s> ${money(b.list)}</div><div class="mem">${kp(b.mem)}</div></div>
  <button class="btn btn-ink" type="button" data-add="${b.id}">Add to bag</button></div></article>`;
  const VARIETALS = ["Cabernet Franc", "Merlot", "Chambourcin", "Chardonnay", "Red blend", "White blend"];
  const shop = { f: ["red", "white", "sets"].includes(params.get("f")) ? params.get("f") : "all", v: VARIETALS.includes(params.get("v")) ? params.get("v") : "", s: "feat" };
  $("#fVar").insertAdjacentHTML("beforeend", VARIETALS.map(v => `<option value="${v}">${v}</option>`).join(""));
  $("#fVar").value = shop.v;
  const syncChips = () => $$(".chip").forEach(x => x.setAttribute("aria-pressed", x.dataset.f === shop.f));
  const syncUrl = () => { const q = new URLSearchParams(); if (shop.f !== "all") q.set("f", shop.f); if (shop.v) q.set("v", shop.v); history.replaceState(null, "", location.pathname + (q.toString() ? "?" + q : "")); };
  function render() {
    refreshSelects();
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
  $("#kkey").innerHTML = `${KMARK} Keeper price. <a href="/club">Become a Keeper</a> and save 25% on every bottle.`;
  syncChips(); render();
}

/* ---------- bag (remembered between pages) ---------- */
const bag = store.get("ksv-bag", {});
function renderBag() {
  const ids = Object.keys(bag).filter(k => bag[k] > 0 && ITEMS.some(x => x.id == k)); let n = 0, list = 0, mem = 0;
  $("#lines").innerHTML = ids.length ? ids.map(id => {
    const w = ITEMS.find(x => x.id == id), q = bag[id]; n += q; list += q * w.list; mem += q * w.mem;
    return `<div class="line"><div>${w.name}<br><span>${q} × ${money(w.list)}</span></div><div>${money(q * w.list)}<br><span style="color:var(--claret)">${kp(q * w.mem)}</span></div></div>`;
  }).join("") : `<p class="muted">Your bag is empty.</p>`;
  $("#bagCount").textContent = n; $("#bagCount").hidden = !n;
  $("#totals").innerHTML = n ? `<div class="r"><span>Retail total</span><b>${money(list)}</b></div><div class="r mem"><span>${KMARK} Keeper total</span><b>${money(mem)}</b></div>
   <div class="nudge"><span>Keepers save <b style="color:var(--claret)">${money(list - mem)}</b> on this order. Membership starts at $30 a month, bottle included.</span><a class="btn btn-gold" href="${joinHref("vineyard")}" data-join="vineyard">Join and save</a><button class="btn btn-line" type="button" style="color:var(--ink)" id="checkoutBtn">Check out at retail price</button></div><p id="coMsg" class="muted" style="font-size:.82rem"></p>` : "";
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

/* ---------- events inquiry (test only) ---------- */
if ($("#eventForm")) $("#eventForm").addEventListener("submit", e => {
  e.preventDefault();
  const n = $("#eName").value.trim(), em = $("#eEmail").value.trim();
  if (!n || !/^\S+@\S+\.\S+$/.test(em)) { $("#eErr").textContent = "Enter your name and a valid email."; return; }
  $("#eventWrap").innerHTML = `<div class="ok"><p class="eyebrow">Test site</p><h3 style="margin-top:.4rem">Thank you, ${n.replace(/[<>&]/g, "")}.</h3><p style="margin-top:.6rem;color:var(--muted-dk)">On the live site this inquiry goes to the vineyard team, who reply within one business day. Nothing was sent.</p></div>`;
});

/* ---------- mailing list (test only) ---------- */
const fForm = $("#footForm");
if (fForm) fForm.addEventListener("submit", e => {
  e.preventDefault(); const v = $("#fEmail").value.trim();
  $("#fMsg").textContent = /^\S+@\S+\.\S+$/.test(v) ? "Test site: on the live site, this adds you to the list." : "Enter a valid email address.";
});
})();
