# GIGS prototype

A clickable concept prototype: data as a currency you can earn, spend, share and save.

Live: https://gigs-prototype.vercel.app

## What's in it

- **MyDialog mini-program skin**: built to sit inside the MyDialog app. Plum host bar with back and a ••• / close capsule, light grey canvas with white cards, uppercase crimson CTAs, plum tab strip with an orange underline, Axiata prism colours and the triangle motif, Poppins as a stand-in for Dialog's typeface. Light theme only, like MyDialog
- **Booster-first home**: GIGS balance as a coin chip top-right, a live booster indicator (none / Scroll / Clutch / Binge) with time and data left, and an Activate button per booster
- **5G Boosters**: Scroll (social), Clutch (games), Binge (streaming). Sizes: 30 min + 500 MB (150 GIGS), 1 hr + 1 GB (Dialog gifts and campaigns only), 3 hr + 3 GB (Rs 149), 6 hr + 6 GB (Rs 249), 12 hr + 12 GB (Rs 399). Free and coin boosters last 7 days, cash ones 30 days
- **Booster screen**: inventory by source and expiry, cash options first and the coin option last
- **Share a booster** from your inventory, a **Daily Puzzles** card with a reset countdown, and a **Booster shop**
- Side panel **Preview states** to jump to any booster or puzzle state
- **Pay → Earn → Boost → Share** demo loop with a timer (goal: under a minute)
- **DIA** sends boosters from your inventory ("send Amma a Binge Booster"). A raw-data request such as "අම්මාට 20GB දෙන්න" becomes a booster offer. Sinhala / Tamil / English and a voice demo
- **Community** tab: **5G Arenas** (check in to collect a free booster, a different one per Arena) and **Match Day** (watch with a Binge Booster; when 100,000 fans join, everyone who joined gets +1 GB of bonus 5G data)
- **GIGS expiry**: each month's GIGS expire at the end of the 3rd month after they're earned, and spending uses the oldest first. A home banner warns 31 days ahead, and tapping the coin chip opens the wallet with the expiry schedule and recent activity. The side panel can expire the oldest batch on demand
- **Puzzle leaderboard** (`puzzles/js/rank.js`), in the style of LinkedIn's daily games: after each solve you see your percentile for the day ("Top 12% of 48,213 players"), a playful brag line, your rank among friends and in Colombo, and the people just above and below you. A full leaderboard page (`#/leaderboard/<all|rush|mines|olinda>`) shows friends with streaks and a Nudge button. Ranking is by time plus penalties (+5s per extra move, +10s per pothole hit, +15s per Olinda retry). Other players are simulated with a seeded generator until there's a backend
- **Play** tab: the Daily Puzzles mini-app (`puzzles/`). Solving a puzzle pays +50 GIGS, all three pay a +150 bonus
- Presenter mode (`P`), sound toggle (`M`), SI / TA / EN switch

All names, numbers and scores are placeholders. The Sinhala and Tamil text needs native review.

## Run locally

```bash
python -m http.server 8765
```

Open http://localhost:8765

## Deploy

The Vercel project is connected to this repo: every push to `main` deploys to https://gigs-prototype.vercel.app automatically. Pushes to other branches get their own preview link.
