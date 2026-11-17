# DIALOG prototype

A clickable concept prototype: data as a currency you can earn, spend, share and save.

Live: https://gigs-prototype.vercel.app

## What's in it

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
