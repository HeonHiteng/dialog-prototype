# DIALOG prototype

A clickable concept prototype: data as a currency you can earn, spend, share and save.

Live: https://gigs-prototype.vercel.app

## What's in it

- **MyDialog mini-program skin**: built to sit inside the MyDialog app. Plum host bar with back and a ••• / close capsule, light grey canvas with white cards, uppercase crimson CTAs, plum tab strip with an orange underline, Axiata prism colours and the triangle motif, Poppins as a stand-in for Dialog's typeface. Light theme only, like MyDialog
- **Booster-first home**: DIALOG balance as a coin chip top-right, a live booster indicator (none / Scroll / Clutch / Binge) with time and data left, and an Activate button per booster
- **5G Boosters**: Scroll (social), Clutch (games), Binge (streaming). Sizes: 30 min + 500 MB (150 DIALOG), 1 hr + 1 GB (Dialog gifts and campaigns only), 3 hr + 3 GB (Rs 149), 6 hr + 6 GB (Rs 249), 12 hr + 12 GB (Rs 399). Free and coin boosters last 7 days, cash ones 30 days
- **Booster screen**: inventory by source and expiry, cash options first and the coin option last
- **Share a booster** from your inventory, a **Daily Puzzles** card with a reset countdown, and a **Booster shop**
- Side panel **Preview states** to jump to any booster or puzzle state
- **Pay → Earn → Boost → Share** demo loop with a timer (goal: under a minute)
- **Dia**, the network concierge, with Sinhala / Tamil / English commands and a voice demo
- **5G Arenas** map, **Boost the Match**, **Light Up My Street**, leftover data → savings
- **Play** tab: the Daily Puzzles mini-app (`puzzles/`). Solving a puzzle pays +50 DIALOG, all three pay a +150 bonus
- Presenter mode (`P`), sound toggle (`M`), SI / TA / EN switch

All names, numbers and scores are placeholders. The Sinhala and Tamil text needs native review.

## Run locally

```bash
python -m http.server 8765
```

Open http://localhost:8765

## Deploy

The Vercel project is connected to this repo: every push to `main` deploys to https://gigs-prototype.vercel.app automatically. Pushes to other branches get their own preview link.
