# TODO: Integrate Hero Detail API Fetch

## Tasks

- [x] Modify fetchHeroes in AddAccount.tsx to fetch detailed hero info from /api/hero-detail/{hero_id} after basic fetch
- [x] Use Promise.all for parallel detail fetches to populate skins array
- [x] Handle API errors gracefully, fallback to empty skins if detail fetch fails
- [ ] Test the updated hero fetching with skins populated
