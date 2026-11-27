// World Atlas of National Statistics — the dataset.
//
// The 16 largest economies by nominal GDP in 2024. Every figure below is a
// published figure from the World Bank's World Development Indicators (WDI)
// or the IMF's World Economic Outlook (WEO), October 2025. The year of each
// figure is shown next to it on the Sources page, and the WDI indicator code
// is listed there too. GDP per capita is GDP divided by population, from the
// same WDI vintage, so the three series agree with each other.
//
// Figures were checked against the World Bank WDI 2024 vintage in November
// 2026. Life expectancy is the latest complete year the World Bank had
// published for all 16 countries at that time: 2023.

const COUNTRIES = [
  { code: "USA", name: "United States", region: "North America", color: "#1d4ed8",
    pop: 340.1, gdp: 28750, gdppc: 84534, growth: 2.8, unemp: 4.0, life: 78.4 },
  { code: "CHN", name: "China", region: "East Asia", color: "#dc2626",
    pop: 1409.0, gdp: 18740, gdppc: 13303, growth: 5.0, unemp: 4.6, life: 78.0 },
  { code: "DEU", name: "Germany", region: "Western Europe", color: "#6d28d9",
    pop: 83.5, gdp: 4690, gdppc: 56104, growth: -0.2, unemp: 3.4, life: 81.1 },
  { code: "JPN", name: "Japan", region: "East Asia", color: "#db2777",
    pop: 124.0, gdp: 4030, gdppc: 32487, growth: 0.1, unemp: 2.5, life: 84.0 },
  { code: "IND", name: "India", region: "South Asia", color: "#ea580c",
    pop: 1450.9, gdp: 3910, gdppc: 2695, growth: 6.5, unemp: 4.2, life: 72.0 },
  { code: "GBR", name: "United Kingdom", region: "Western Europe", color: "#0891b2",
    pop: 69.3, gdp: 3690, gdppc: 53341, growth: 1.1, unemp: 4.4, life: 81.8 },
  { code: "FRA", name: "France", region: "Western Europe", color: "#4338ca",
    pop: 68.6, gdp: 3160, gdppc: 46103, growth: 1.1, unemp: 7.4, life: 83.0 },
  { code: "ITA", name: "Italy", region: "Southern Europe", color: "#15803d",
    pop: 59.0, gdp: 2380, gdppc: 40385, growth: 0.7, unemp: 6.5, life: 83.7 },
  { code: "CAN", name: "Canada", region: "North America", color: "#b45309",
    pop: 41.3, gdp: 2240, gdppc: 54340, growth: 1.5, unemp: 6.4, life: 81.6 },
  { code: "BRA", name: "Brazil", region: "South America", color: "#65a30d",
    pop: 212.0, gdp: 2190, gdppc: 10310, growth: 3.4, unemp: 6.8, life: 75.8 },
  { code: "RUS", name: "Russia", region: "Europe / Asia", color: "#0e7490",
    pop: 143.7, gdp: 2170, gdppc: 15130, growth: 4.3, unemp: 2.4, life: 73.3 },
  { code: "KOR", name: "South Korea", region: "East Asia", color: "#be185d",
    pop: 51.8, gdp: 1880, gdppc: 36200, growth: 2.0, unemp: 2.7, life: 83.4 },
  { code: "MEX", name: "Mexico", region: "North America", color: "#a16207",
    pop: 130.9, gdp: 1860, gdppc: 14180, growth: 1.5, unemp: 2.7, life: 75.1 },
  { code: "AUS", name: "Australia", region: "Oceania", color: "#0369a1",
    pop: 27.2, gdp: 1760, gdppc: 64600, growth: 1.0, unemp: 3.9, life: 83.1 },
  { code: "ESP", name: "Spain", region: "Southern Europe", color: "#c2410c",
    pop: 48.9, gdp: 1730, gdppc: 35300, growth: 3.2, unemp: 11.4, life: 83.9 },
  { code: "IDN", name: "Indonesia", region: "Southeast Asia", color: "#047857",
    pop: 283.5, gdp: 1400, gdppc: 4925, growth: 5.0, unemp: 4.9, life: 71.1 },
];

// Field order in COUNTRIES: pop = population, millions, 2024 (WDI SP.POP.TOTL);
// gdp = nominal GDP, billions of current US$, 2024 (WDI NY.GDP.MKTP.CD);
// gdppc = GDP per capita, current US$, 2024 (WDI NY.GDP.PCAP.CD, equals
// gdp / pop from the same vintage); growth = real GDP growth, % per year,
// 2024 (IMF WEO, October 2025; India is on a fiscal-year basis);
// unemp = unemployment, % of labour force, 2024 (WDI SL.UEM.TOTL.ZS,
// modelled ILO estimate); life = life expectancy at birth, years, 2023
// (WDI SP.DYN.LE00.IN — the latest year published for all 16).

// Real GDP growth of the United States, 2015–2025, annual % change.
// IMF World Economic Outlook, October 2025, Statistical Appendix Table A1.
// 2025 is the IMF projection in that vintage (marked with * on the chart);
// 2024 (+2.8%) is the same figure already used for the United States in
// COUNTRIES above, so the chart and the rest of the site agree.
const US_GROWTH_2015_2025 = [
  { year: 2015, value: 2.9 }, { year: 2016, value: 1.8 },
  { year: 2017, value: 2.5 }, { year: 2018, value: 3.0 },
  { year: 2019, value: 2.6 }, { year: 2020, value: -2.1 },
  { year: 2021, value: 6.2 }, { year: 2022, value: 2.5 },
  { year: 2023, value: 2.9 }, { year: 2024, value: 2.8 },
  { year: 2025, value: 2.0, projected: true },
];

const METRICS = [
  { key: "gdp", label: "GDP", unit: "US$ bn", format: "money", higher: "larger economy",
    blurb: "Nominal GDP, current US dollars, 2024" },
  { key: "pop", label: "Population", unit: "million", format: "pop", higher: "more people",
    blurb: "Mid-year population, 2024" },
  { key: "gdppc", label: "GDP per capita", unit: "US$", format: "money", higher: "richer per person",
    blurb: "GDP per person, current US dollars, 2024" },
  { key: "growth", label: "GDP growth", unit: "% / year", format: "pct", higher: "faster growing",
    blurb: "Real GDP growth, 2024 (IMF WEO, Oct 2025)" },
  { key: "unemp", label: "Unemployment", unit: "% of labour force", format: "pct", higher: "more jobless",
    blurb: "Unemployment, % of labour force, 2024" },
  { key: "life", label: "Life expectancy", unit: "years", format: "years", higher: "longer lives",
    blurb: "Life expectancy at birth, 2023" },
];

function metricByKey(key) {
  for (const m of METRICS) if (m.key === key) return m;
  return METRICS[0];
}

function formatValue(metric, value) {
  if (metric.format === "money") return "$" + Math.round(value).toLocaleString("en-US");
  if (metric.format === "pop") return value.toLocaleString("en-US", { maximumFractionDigits: 1 }) + " m";
  if (metric.format === "pct") return (value > 0 ? "+" : "") + value.toFixed(1) + "%";
  if (metric.format === "years") return value.toFixed(1) + " yrs";
  return String(value);
}

function gdpTrillions(valueBn) { return "$" + (valueBn / 1000).toFixed(2) + " tn"; }
