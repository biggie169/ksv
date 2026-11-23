# King Solomon's Vineyard: website

Static website for kingsolomonsvineyard.com, deployed to Cloudflare Workers as static assets. Every push to `main` deploys automatically.

## Pages

| Address | Source |
|---|---|
| `/` | `src/pages/home.html` |
| `/club` | `src/pages/club.html` (The Keepers wine club) |
| `/wines` | `src/pages/wines.html` (filters: `/wines?f=red`, `?f=white`, `?f=sets`, `?v=Merlot`) |
| `/story` | `src/pages/story.html` |
| `/policies` | `src/pages/policies.html` |
| any unknown address | `src/pages/404.html` |

## Editing

1. Edit the sources:
   - Page content: `src/pages/*.html`
   - Header and menu: `src/header.html`. Footer and bag: `src/footer.html`
   - Wines, prices, gift sets and club levels: `src/data.json` (feeds the pages and the product data search engines read)
   - Page titles and search descriptions, redirects: the `PAGES` and `REDIRECTS` lists at the top of `build.py`
   - Styles: `public/assets/site.css`. Behavior: `public/assets/site.js`
2. Rebuild: `python3 build.py` (test build) or `python3 build.py --launch` (public build)
3. Commit and push. Cloudflare deploys `public/`.

Preview locally with Cloudflare's own server, which applies the redirects and headers:

```bash
npx wrangler dev
```

## Test build vs. launch build

`python3 build.py` produces the **test build**: every page carries `noindex`, `robots.txt` blocks all crawlers, and the ticker says "Test site". `python3 build.py --launch` produces the **launch build**: pages are indexable, `robots.txt` points to the sitemap, and the ticker shows sales messages. See `LAUNCH.md`.

## Search engine setup included

- A title, description, canonical address and social-sharing image for each page
- Structured data: the winery (address, phone, social profiles) on every page, the wines and gift sets as products on `/wines`, and the club FAQ on `/club`
- `sitemap.xml`
- `_redirects`: old Squarespace addresses (`/shop`, `/about`, `/vineyard`, `/visit`, `/contact`, `/cart`) redirect permanently to the new pages
