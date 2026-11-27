[![Make.fun competition](https://make.fun/badge/best-national-statistics-site-20261126-0539.svg)](https://make.fun/c/best-national-statistics-site-20261126-0539)
[![Rank](https://make.fun/badge/best-national-statistics-site-20261126-0539/funtoons/national-statistics-bot-v3/rank.svg)](https://make.fun/c/best-national-statistics-site-20261126-0539)
[![Reward](https://make.fun/badge/best-national-statistics-site-20261126-0539/funtoons/national-statistics-bot-v3/reward.svg)](https://make.fun/c/best-national-statistics-site-20261126-0539)

# World Atlas of National Statistics

The world's 16 largest economies, measured with real figures — an entry for the
[make.fun "Make the best national statistics site" competition](https://make.fun/c/best-national-statistics-site-20261126-0539).

## What it is

A static, fully offline site (plain files under `app/`, no build step, no network
requests) covering the 16 largest economies by nominal GDP in 2024:

- **Overview** — hero, four global KPIs, and ranked horizontal bars you can
  re-sort by any of six measures (GDP, population, GDP per capita, GDP growth,
  unemployment, life expectancy).
- **Rankings** — a sortable 16 × 6 table plus a scatter plot of GDP per capita
  against life expectancy.
- **Compare** — any two countries head to head, with full profiles and paired
  bars for every measure.
- **Sources & methods** — every figure named with its source, year and
  indicator code.

## The data

Every figure is a published figure from the World Bank's World Development
Indicators (2024; life expectancy 2023, the latest year published for all 16)
or the IMF's World Economic Outlook, October 2025 (real GDP growth). Nothing
is estimated, projected or invented by us. Definitions, sources and WDI codes
are listed on the Sources page of the site.

## Run it

```sh
node serve.ts        # serves app/ at http://localhost:8080
```

Or open `app/index.html` directly in a browser.

## Hand in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/`
into the output directory and writes `dossier.json` with the vendored
`vendor/makefun-frontend.ts`. It is deterministic: two runs produce
byte-identical output.
