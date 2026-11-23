# Launch checklist

The site is currently a **test build**: hidden from search engines, and checkout, club sign-up and the mailing list are mockups. Work through this list before pointing kingsolomonsvineyard.com at it.

## Before launch

- [ ] **Connect checkout to Vinoshipper.** "Add to bag" and "Check out" are mockups. Each wine and gift set needs to link to (or embed) its Vinoshipper product, and the gift sets need to be created as products in Vinoshipper.
- [ ] **Connect club sign-up.** The Keepers join form is a mockup. Set up the three club levels in Vinoshipper (or the chosen club platform) and point the "Join" buttons at it.
- [ ] **Connect the mailing list** (for example Mailchimp or Klaviyo) to the footer sign-up form.
- [ ] **Legal review of `/policies`.** The text is carried over from the old site, with two proposed changes for the reviewer to approve or amend:
  - **Governing law.** The old terms named California law and the courts of Napa County, California (apparently copied from another winery's template). Proposed: the laws of the United States and the Commonwealth of Pennsylvania, with disputes heard in the state courts of Schuylkill County or the U.S. District Court for the Middle District of Pennsylvania.
  - **Typo.** "WE DOES NOT WARRANT" corrected to "WE DO NOT WARRANT".
- [ ] **Confirm facts with the winemaker:** prices, alcohol levels, vintages, tasting notes, gift set contents, and craft claims (hand-picked, bottled by hand, master vintners).
- [ ] **Build for launch:** `python3 build.py --launch`, then commit and push.

## Launch day

- [ ] In Cloudflare, add `www.kingsolomonsvineyard.com` as a custom domain on the `ksv` Worker, and redirect `kingsolomonsvineyard.com` to the `www` address. The domain's DNS must be managed in Cloudflare; if it is currently at Squarespace, move it first.
- [ ] Check that old addresses redirect: `/shop`, `/about`, `/vineyard`, `/visit` and `/contact`.
- [ ] In Google Search Console, verify the domain, submit `https://www.kingsolomonsvineyard.com/sitemap.xml`, and request indexing for `/`, `/club` and `/wines`.
- [ ] Keep the Squarespace site until the new one is confirmed live, then cancel it.

## After launch

- [ ] Re-check Search Console after one to two weeks for indexing errors.
- [ ] Update `src/data.json` whenever prices or stock change, then rebuild.
