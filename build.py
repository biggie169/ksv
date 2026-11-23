#!/usr/bin/env python3
"""Build the King Solomon's Vineyard site into public/.

    python3 build.py            test build: hidden from search engines (default)
    python3 build.py --launch   launch build: indexable, real robots.txt and sitemap

Sources live in src/: layout chrome (header.html, footer.html), page bodies
(pages/*.html) and src/data.json (wines, gift sets, club levels). Styles and
scripts live directly in public/assets/. Re-run the build after editing src/.
"""
import hashlib, html, json, re, sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SRC, OUT = ROOT / "src", ROOT / "public"
LAUNCH = "--launch" in sys.argv
BASE = "https://www.kingsolomonsvineyard.com"
TODAY = date.today().isoformat()
VER = {}

PAGES = [
    dict(slug="home", file="index.html", path="/", priority="1.0",
         title="King Solomon's Vineyard | Estate Wine from Schuylkill County, PA",
         desc="Estate-grown Pennsylvania wine from the slopes of the Blue Mountain. Shop Cabernet Franc, Merlot, Chardonnay and holiday gift sets, or join The Keepers wine club.",
         image="/img/sunset.jpg"),
    dict(slug="club", file="club.html", path="/club", priority="0.9",
         title="The Keepers Wine Club | King Solomon's Vineyard",
         desc="Join The Keepers, the King Solomon's Vineyard wine club. Wine every month, 25% off every bottle and first pick of small-lot releases, from $20 a month.",
         image="/img/ig-rows-clouds.jpg"),
    dict(slug="wines", file="wines.html", path="/wines", priority="0.9",
         title="Shop Pennsylvania Wines & Gift Sets | King Solomon's Vineyard",
         desc="Shop estate-grown Pennsylvania wines: dry reds, whites and holiday gift sets. Shipping to 37 states, free on orders over $50.",
         image="/img/set-12.png"),
    dict(slug="story", file="story.html", path="/story", priority="0.6",
         title="Our Story | King Solomon's Vineyard, Pottsville PA",
         desc="Founded in 2009 by Dr. Solomon and Wendy Luo, King Solomon's Vineyard grows European vinifera on 90 acres in Schuylkill County, Pennsylvania.",
         image="/img/aerial.jpg"),
    dict(slug="policies", file="policies.html", path="/policies", priority="0.2",
         title="Privacy & Terms | King Solomon's Vineyard",
         desc="Privacy policy and terms of sale for King Solomon's Vineyard, including our requirements for the sale of alcohol.",
         image="/img/sunset.jpg"),
]

# Old Squarespace addresses -> new pages, so links and search rankings carry over.
REDIRECTS = [
    ("/shop", "/wines"), ("/shop/*", "/wines"), ("/cart", "/wines"),
    ("/about", "/story"), ("/vineyard", "/story"),
    ("/visit", "/"), ("/contact", "/"), ("/credits", "/"),
]

TICKER = (["Free shipping on orders over $50", "Join The Keepers and save 25% on every bottle"] if LAUNCH
          else ["Test site", "Free shipping on orders over $50"])

data = json.loads((SRC / "data.json").read_text())
header = (SRC / "header.html").read_text()
footer = (SRC / "footer.html").read_text()

WINERY = {
    "@context": "https://schema.org", "@type": "Winery", "@id": BASE + "/#winery",
    "name": "King Solomon's Vineyard", "url": BASE + "/",
    "logo": BASE + "/img/logo-gold.png", "image": BASE + "/img/sunset.jpg",
    "description": "Family-owned estate vineyard in Schuylkill County, Pennsylvania, growing European vinifera since 2010.",
    "foundingDate": "2009", "telephone": "+1-570-990-5243", "email": "info@kingsolomonsvineyard.com",
    "address": {"@type": "PostalAddress", "streetAddress": "81 Hemlock Dr.", "addressLocality": "Pottsville",
                "addressRegion": "PA", "postalCode": "17901", "addressCountry": "US"},
    "sameAs": ["https://www.instagram.com/kingsolomonsvineyard/", "https://www.facebook.com/KingSolomonsVineyard"],
}


def product(name, desc, img, price, in_stock, anchor):
    return {"@type": "Product", "name": name, "description": desc, "image": BASE + img,
            "brand": {"@type": "Brand", "name": "King Solomon's Vineyard"}, "category": "Wine",
            "offers": {"@type": "Offer", "price": f"{price:.2f}", "priceCurrency": "USD",
                       "availability": "https://schema.org/" + ("InStock" if in_stock else "OutOfStock"),
                       "url": f"{BASE}/wines#{anchor}"}}


def structured(page, body):
    graphs = [WINERY]
    if page["slug"] == "wines":
        items = [product(f"{s['name']} gift set ({s['size']})", s["desc"], "/img/" + s["img"], s["list"], True, s["id"]) for s in data["sets"]]
        items += [product(w["name"], w["desc"], f"/img/bottle_{w['id']}.png", w["list"], w["stock"] > 0, f"w-{w['id']}") for w in data["wines"]]
        graphs.append({"@context": "https://schema.org", "@type": "ItemList", "name": "Wines and gift sets",
                       "itemListElement": [{"@type": "ListItem", "position": i + 1, "item": it} for i, it in enumerate(items)]})
    if page["slug"] == "club":
        qa = re.findall(r"<summary>(.*?)</summary><p>(.*?)</p>", body)
        if qa:
            graphs.append({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
                {"@type": "Question", "name": html.unescape(q),
                 "acceptedAnswer": {"@type": "Answer", "text": html.unescape(re.sub(r"<[^>]+>", "", a))}} for q, a in qa]})
    return "\n".join(f'<script type="application/ld+json">{json.dumps(g, ensure_ascii=False)}</script>' for g in graphs)


def render(page):
    body = (SRC / "pages" / f"{page['slug']}.html").read_text()
    url = BASE + page["path"]
    esc = lambda s: html.escape(s, quote=True)
    robots = "" if LAUNCH else '<meta name="robots" content="noindex, nofollow">\n'
    nav = header
    for p in PAGES:
        nav = nav.replace(f'<a href="{p["path"]}">', f'<a href="{p["path"]}" data-page="{p["slug"]}">')
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{esc(page['title'])}</title>
<meta name="description" content="{esc(page['desc'])}">
{robots}<link rel="canonical" href="{url}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="King Solomon's Vineyard">
<meta property="og:title" content="{esc(page['title'])}">
<meta property="og:description" content="{esc(page['desc'])}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{BASE + page['image']}">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#141c18">
<link rel="icon" type="image/png" href="/img/ksv-mark.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;0,6..96,500;0,6..96,600;1,6..96,400;1,6..96,500&family=Instrument+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap">
<link rel="stylesheet" href="/assets/site.css?v={VER['site.css']}">
{structured(page, body)}
</head>
<body data-page="{page['slug']}">
<div class="ticker" id="ticker" role="note" aria-label="{esc('. '.join(TICKER))}." data-msgs="{esc(json.dumps(TICKER))}"><span id="tickText" aria-hidden="true"></span></div>
{nav}
<main>
{body}</main>
{footer}
<script src="/assets/data.js?v={VER['data.js']}"></script>
<script src="/assets/site.js?v={VER['site.js']}"></script>
</body>
</html>
"""


def main():
    (OUT / "assets").mkdir(parents=True, exist_ok=True)
    (OUT / "assets" / "data.js").write_text("window.KSV=" + json.dumps(data, ensure_ascii=False) + ";\n")
    for name in ("site.css", "site.js", "data.js"):   # content hash, so a deploy never mixes new pages with cached old assets
        VER[name] = hashlib.md5((OUT / "assets" / name).read_bytes()).hexdigest()[:10]
    for page in PAGES:
        (OUT / page["file"]).write_text(render(page))
    not_found = dict(slug="404", file="404.html", path="/404", title="Page not found | King Solomon's Vineyard",
                     desc="This page has moved or no longer exists.", image="/img/sunset.jpg")
    (OUT / "404.html").write_text(render(not_found).replace("<link rel=\"canonical\"", '<meta name="robots" content="noindex">\n<link rel="canonical"', 1))
    (OUT / "sitemap.xml").write_text(
        '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        + "".join(f"  <url><loc>{BASE + p['path']}</loc><lastmod>{TODAY}</lastmod><priority>{p['priority']}</priority></url>\n" for p in PAGES)
        + "</urlset>\n")
    (OUT / "robots.txt").write_text(
        f"User-agent: *\nAllow: /\n\nSitemap: {BASE}/sitemap.xml\n" if LAUNCH else "User-agent: *\nDisallow: /\n")
    cache = "/img/*\n  Cache-Control: public, max-age=604800\n/assets/*\n  Cache-Control: public, max-age=3600\n"
    (OUT / "_headers").write_text(cache if LAUNCH else "/*\n  X-Robots-Tag: noindex, nofollow\n" + cache)
    (OUT / "_redirects").write_text("".join(f"{a} {b} 301\n" for a, b in REDIRECTS))
    print(f"Built {len(PAGES)} pages ({'LAUNCH: indexable' if LAUNCH else 'TEST: hidden from search engines'})")


if __name__ == "__main__":
    main()
