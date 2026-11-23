# King Solomon's Vineyard — website redesign (test site)

Test build of the club-first redesign for kingsolomonsvineyard.com. It is a static site: one HTML page with hash routes (`#club`, `#wines`, `#story`, `#visit`) and images in `public/img/`.

It is a **test site**. Prices, membership levels, perks, tasting notes and craft claims are drafts awaiting approval. The join form, the bag and the mailing-list forms are mockups and take no orders, payments or signups. Search engines are blocked by `robots.txt`, a `noindex` meta tag and an `X-Robots-Tag` header.

## Run locally

```bash
npx wrangler dev
```

## Deploy

The site deploys to Cloudflare Workers as static assets (see `wrangler.jsonc`). With the repository connected in Cloudflare (Workers & Pages → Create → Import a repository), every push to `main` deploys automatically. The deploy command is `npx wrangler deploy`, with no build step.

## Editing

- Wine list and prices: the `WINES` array near the bottom of `public/index.html`.
- Membership levels: the `TIERS` array in the same place.
- Colors and fonts: the `:root` tokens at the top of the `<style>` block.
