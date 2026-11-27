// World Atlas of National Statistics — page router and renderers.
// Four hash pages: #/overview, #/rankings, #/compare, #/sources. Every
// control on every page works: the metric switcher re-ranks the bars, the
// rankings table sorts on any column, and the compare pickers swap the two
// countries being compared.

const view = document.getElementById("view");
let currentMetric = "gdp";
let sortKey = "gdp";
let sortDir = -1;
let compareA = "USA";
let compareB = "CHN";

function country(code) {
  for (const c of COUNTRIES) if (c.code === code) return c;
  return COUNTRIES[0];
}

function sum(key) {
  return COUNTRIES.reduce((t, c) => t + c[key], 0);
}

function median(values) {
  const s = values.slice().sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}

function navActive(page) {
  document.querySelectorAll("nav a").forEach((a) => {
    a.classList.toggle("active", a.getAttribute("href") === "#/" + page);
  });
}

// ---- Overview -------------------------------------------------------------
function renderOverview() {
  navActive("overview");
  const totalGdp = sum("gdp");
  const totalPop = sum("pop");
  const medGdppc = median(COUNTRIES.map((c) => c.gdppc));
  const fastest = COUNTRIES.slice().sort((a, b) => b.growth - a.growth)[0];
  const longest = COUNTRIES.slice().sort((a, b) => b.life - a.life)[0];
  const top5 = COUNTRIES.slice().sort((a, b) => b.gdp - a.gdp).slice(0, 5);
  const metric = metricByKey(currentMetric);

  let kpis = '<div class="kpis">' +
    kpi(gdpTrillions(totalGdp), "Combined GDP", "16 economies, 2024") +
    kpi(totalPop.toLocaleString("en-US", { maximumFractionDigits: 0 }) + " m",
      "Combined population", "about 56% of humanity, 2024") +
    kpi("$" + medGdppc.toLocaleString("en-US"), "Median GDP per capita",
      "middle of the 16, 2024") +
    kpi(fastest.name + " +" + fastest.growth.toFixed(1) + "%", "Fastest growing",
      "real GDP growth, 2024") +
    "</div>";

  let top5rows = top5.map((c, i) =>
    "<tr><td class=\"name\"><span class=\"dot\" style=\"background:" + c.color +
    "\"></span>" + (i + 1) + ". " + c.name + "</td><td>" + gdpTrillions(c.gdp) +
    "</td><td>" + c.pop.toLocaleString("en-US", { maximumFractionDigits: 1 }) +
    " m</td><td>$" + c.gdppc.toLocaleString("en-US") + "</td></tr>").join("");

  view.innerHTML =
    '<section class="hero"><h1>The world&rsquo;s 16 largest economies, side by side</h1>' +
    "<p>Real 2024 figures for the countries that make up most of the world economy: " +
    "output, people, income per person, growth, jobs and how long people live. " +
    "Pick a measure below and the ranking re-sorts itself.</p>" +
    '<p class="source-note">Sources: World Bank World Development Indicators, 2024 ' +
    "(life expectancy 2023) and IMF World Economic Outlook, October 2025. " +
    "Every figure is named with its source and year on the Sources page.</p></section>" +
    kpis +
    "<h2>Rank the 16 by any measure</h2>" +
    '<p class="hint">' + metric.blurb + ". Bars are coloured by country — the same colour follows each country on every page.</p>" +
    '<div class="switcher" role="group" aria-label="Choose a measure">' +
    METRICS.map((m) =>
      '<button data-metric="' + m.key + '"' + (m.key === currentMetric ? ' class="on"' : "") +
      ">" + m.label + "</button>").join("") +
    "</div>" +
    '<div class="panel">' + rankedBars(currentMetric) + "</div>" +
    "<h2>The five biggest economies at a glance</h2>" +
    '<div class="table-wrap"><table><thead><tr><th>Country</th><th>GDP</th>' +
    "<th>Population</th><th>GDP per capita</th></tr></thead><tbody>" + top5rows +
    "</tbody></table></div>" +
    "<h2>What the numbers say</h2>" +
    '<div class="findings">' +
    finding("Size is not prosperity",
      "India is the 5th largest economy but, at $2,695 per person, the poorest per head of the 16. The United States is 31 times richer per person.") +
    finding("Long life follows income — mostly",
      "Japan lives longest at 84.0 years, but the United States, the richest per person, lives only 78.4 years — shorter than every other rich country here.") +
    finding("Growth has moved east and south",
      "India grew 6.5% in 2024 and Indonesia and China 5.0%. Germany shrank 0.2% and Japan barely grew at 0.1%.") +
    finding("Spain's jobs problem stands out",
      "Spain's unemployment is 11.4% — nearly triple the group's middle. Japan and Russia are lowest, at 2.5% and 2.4%.") +
    "</div>" +
    '<p class="hint" style="margin-top:16px">See the full sortable table and the income-versus-longevity scatter on the ' +
    '<a href="#/rankings">Rankings</a> page, compare any two countries on ' +
    '<a href="#/compare">Compare</a>, and check every source on ' +
    '<a href="#/sources">Sources &amp; methods</a>.</p>';

  view.querySelectorAll(".switcher button").forEach((b) => {
    b.addEventListener("click", () => { currentMetric = b.getAttribute("data-metric"); renderOverview(); });
  });
}

function kpi(num, lbl, sub) {
  return '<div class="kpi"><div class="num">' + num + '</div><div class="lbl">' + lbl +
    '</div><div class="sub">' + sub + "</div></div>";
}

function finding(title, text) {
  return '<div class="finding"><b>' + title + "</b><p>" + text + "</p></div>";
}

// ---- Rankings -------------------------------------------------------------
function renderRankings() {
  navActive("rankings");
  const rows = COUNTRIES.slice().sort((a, b) => (a[sortKey] - b[sortKey]) * sortDir);
  const arrow = (key) => (sortKey === key ? (sortDir === -1 ? " ▼" : " ▲") : "");
  const head = (key, label) =>
    '<th><button data-sort="' + key + '">' + label + arrow(key) + "</button></th>";

  const body = rows.map((c) =>
    "<tr><td class=\"name\"><span class=\"dot\" style=\"background:" + c.color + "\"></span>" +
    c.name + " <em>(" + c.code + ")</em></td>" +
    "<td>" + gdpTrillions(c.gdp) + "</td>" +
    "<td>" + c.pop.toLocaleString("en-US", { maximumFractionDigits: 1 }) + " m</td>" +
    "<td>$" + c.gdppc.toLocaleString("en-US") + "</td>" +
    "<td class=\"" + (c.growth < 0 ? "neg" : "pos") + "\">" +
    (c.growth > 0 ? "+" : "") + c.growth.toFixed(1) + "%</td>" +
    "<td>" + c.unemp.toFixed(1) + "%</td>" +
    "<td>" + c.life.toFixed(1) + "</td></tr>").join("");

  view.innerHTML =
    "<h1>Rankings: all 16 countries, six measures</h1>" +
    "<p>Click any column heading to sort the table by that measure. GDP and population are 2024; " +
    "life expectancy is 2023, the latest year the World Bank had published for all 16.</p>" +
    '<div class="table-wrap"><table><thead><tr><th><button data-sort="name">Country' +
    arrow("name") + "</button></th>" +
    head("gdp", "GDP") + head("pop", "Population") + head("gdppc", "GDP per capita") +
    head("growth", "GDP growth") + head("unemp", "Unemployment") + head("life", "Life expectancy") +
    "</tr></thead><tbody>" + body + "</tbody></table></div>" +
    '<p class="hint">GDP: nominal, current US$. Growth: real, % per year, IMF WEO Oct 2025. ' +
    "Unemployment: % of labour force, modelled ILO estimate. Full definitions and codes on Sources &amp; methods.</p>" +
    "<h2>Does richer mean longer-lived?</h2>" +
    "<p>GDP per capita against life expectancy. The dots climb steeply at first — moving from " +
    "$3,000 to $15,000 per person buys about six extra years — then flatten: above $30,000, " +
    "more money buys almost no extra years, and the United States sits well below the line its income would predict.</p>" +
    '<div class="panel">' + scatterPlot() + "</div>" +
    '<p class="hint">Each dot is a country (three-letter code). Colour matches the country everywhere on this site.</p>';

  view.querySelectorAll("button[data-sort]").forEach((b) => {
    b.addEventListener("click", () => {
      const key = b.getAttribute("data-sort");
      if (key === "name") {
        sortDir = sortKey === "name" ? -sortDir : 1;
        sortKey = "name";
        COUNTRIES.sort((a, c) => a.name.localeCompare(c.name) * sortDir);
        // Name sort needs a string comparator; re-render with a custom order.
        renderRankingsByName();
        return;
      }
      if (sortKey === key) sortDir = -sortDir; else { sortKey = key; sortDir = -1; }
      renderRankings();
    });
  });
}

function renderRankingsByName() {
  // Same table as renderRankings but ordered by name; kept separate so the
  // numeric sort path stays simple.
  navActive("rankings");
  const rows = COUNTRIES.slice().sort((a, b) => a.name.localeCompare(b.name) * sortDir);
  const arrow = (key) => (sortKey === key ? (sortDir === -1 ? " ▼" : " ▲") : "");
  const head = (key, label) =>
    '<th><button data-sort="' + key + '">' + label + arrow(key) + "</button></th>";
  const body = rows.map((c) =>
    "<tr><td class=\"name\"><span class=\"dot\" style=\"background:" + c.color + "\"></span>" +
    c.name + " <em>(" + c.code + ")</em></td>" +
    "<td>" + gdpTrillions(c.gdp) + "</td>" +
    "<td>" + c.pop.toLocaleString("en-US", { maximumFractionDigits: 1 }) + " m</td>" +
    "<td>$" + c.gdppc.toLocaleString("en-US") + "</td>" +
    "<td class=\"" + (c.growth < 0 ? "neg" : "pos") + "\">" +
    (c.growth > 0 ? "+" : "") + c.growth.toFixed(1) + "%</td>" +
    "<td>" + c.unemp.toFixed(1) + "%</td>" +
    "<td>" + c.life.toFixed(1) + "</td></tr>").join("");
  view.innerHTML =
    "<h1>Rankings: all 16 countries, six measures</h1>" +
    "<p>Click any column heading to sort the table by that measure. GDP and population are 2024; " +
    "life expectancy is 2023, the latest year the World Bank had published for all 16.</p>" +
    '<div class="table-wrap"><table><thead><tr><th><button data-sort="name">Country' +
    arrow("name") + "</button></th>" +
    head("gdp", "GDP") + head("pop", "Population") + head("gdppc", "GDP per capita") +
    head("growth", "GDP growth") + head("unemp", "Unemployment") + head("life", "Life expectancy") +
    "</tr></thead><tbody>" + body + "</tbody></table></div>" +
    '<p class="hint">GDP: nominal, current US$. Growth: real, % per year, IMF WEO Oct 2025. ' +
    "Unemployment: % of labour force, modelled ILO estimate. Full definitions and codes on Sources &amp; methods.</p>" +
    "<h2>Does richer mean longer-lived?</h2>" +
    "<p>GDP per capita against life expectancy. The dots climb steeply at first — moving from " +
    "$3,000 to $15,000 per person buys about six extra years — then flatten: above $30,000, " +
    "more money buys almost no extra years, and the United States sits well below the line its income would predict.</p>" +
    '<div class="panel">' + scatterPlot() + "</div>" +
    '<p class="hint">Each dot is a country (three-letter code). Colour matches the country everywhere on this site.</p>';
  view.querySelectorAll("button[data-sort]").forEach((b) => {
    b.addEventListener("click", () => {
      const key = b.getAttribute("data-sort");
      if (key === "name") { sortDir = -sortDir; renderRankingsByName(); return; }
      sortKey = key; sortDir = -1; renderRankings();
    });
  });
}

// ---- Compare --------------------------------------------------------------
function profileCard(c) {
  return '<div class="profile" style="border-top-color:' + c.color + '">' +
    '<div class="big">' + c.name + '</div><em>' + c.region + " · " + c.code + "</em>" +
    "<dl>" +
    "<dt>GDP, 2024</dt><dd>" + gdpTrillions(c.gdp) + "</dd>" +
    "<dt>Population, 2024</dt><dd>" + c.pop.toLocaleString("en-US", { maximumFractionDigits: 1 }) + " m</dd>" +
    "<dt>GDP per capita, 2024</dt><dd>$" + c.gdppc.toLocaleString("en-US") + "</dd>" +
    "<dt>GDP growth, 2024</dt><dd>" + (c.growth > 0 ? "+" : "") + c.growth.toFixed(1) + "%</dd>" +
    "<dt>Unemployment, 2024</dt><dd>" + c.unemp.toFixed(1) + "%</dd>" +
    "<dt>Life expectancy, 2023</dt><dd>" + c.life.toFixed(1) + " yrs</dd>" +
    "</dl></div>";
}

function renderCompare() {
  navActive("compare");
  const a = country(compareA), b = country(compareB);
  const options = (sel) => COUNTRIES.map((c) =>
    '<option value="' + c.code + '"' + (c.code === sel ? " selected" : "") + ">" +
    c.name + "</option>").join("");
  const ratio = (a.gdp / b.gdp).toFixed(1);
  const bigger = a.gdp >= b.gdp ? a : b;
  const smaller = a.gdp >= b.gdp ? b : a;
  const gap = (bigger.life - smaller.life).toFixed(1);

  view.innerHTML =
    "<h1>Compare two countries</h1>" +
    "<p>Pick any two of the 16 and see them head to head on all six measures. " +
    "Bars are scaled to the larger value of the pair, so the gap you see is the real gap.</p>" +
    '<div class="pickers"><label for="pick-a">First country</label>' +
    '<select id="pick-a">' + options(compareA) + '</select><span class="vs">VS</span>' +
    '<label for="pick-b">Second country</label>' +
    '<select id="pick-b">' + options(compareB) + "</select></div>" +
    '<div class="compare-grid">' + profileCard(a) + profileCard(b) + "</div>" +
    '<div class="panel"><h3 style="margin-bottom:4px">The headline</h3><p>' +
    bigger.name + "&rsquo;s economy is " + ratio + "&times; the size of " + smaller.name +
    "&rsquo;s, but its people live " + gap + " years " +
    (bigger.life >= smaller.life ? "longer" : "shorter") + " on average. " +
    "Size, income and longevity do not move together — that is why the pair is worth comparing measure by measure below.</p></div>" +
    "<h2>Measure by measure</h2>" +
    '<div class="panel">' + pairedBars(a, b) + "</div>" +
    '<p class="hint">Sources: World Bank WDI 2024 (life expectancy 2023); growth from IMF WEO, October 2025. See Sources &amp; methods for definitions.</p>';

  document.getElementById("pick-a").addEventListener("change", (e) => {
    compareA = e.target.value;
    if (compareA === compareB) compareB = compareA === "USA" ? "CHN" : "USA";
    renderCompare();
  });
  document.getElementById("pick-b").addEventListener("change", (e) => {
    compareB = e.target.value;
    if (compareB === compareA) compareA = compareB === "USA" ? "CHN" : "USA";
    renderCompare();
  });
}

// ---- Sources --------------------------------------------------------------
function renderSources() {
  navActive("sources");
  view.innerHTML =
    "<h1>Sources &amp; methods</h1>" +
    "<p>Every number on this site comes from one of two public sources. Nothing is estimated by us, " +
    "nothing is projected, and no figure is older than the latest year the source had published for all 16 countries.</p>" +
    '<div class="table-wrap"><table class="source-table"><thead><tr><th>Measure</th><th>What it is</th>' +
    "<th>Source</th><th>Year</th><th>Code</th></tr></thead><tbody>" +
    "<tr><td>GDP</td><td>Gross domestic product at current prices, in US dollars, converted at official exchange rates.</td><td>World Bank, World Development Indicators</td><td>2024</td><td><code>NY.GDP.MKTP.CD</code></td></tr>" +
    "<tr><td>Population</td><td>All residents at mid-year, regardless of citizenship.</td><td>World Bank, World Development Indicators</td><td>2024</td><td><code>SP.POP.TOTL</code></td></tr>" +
    "<tr><td>GDP per capita</td><td>GDP divided by mid-year population, from the same World Bank vintage, so the three series agree.</td><td>World Bank, World Development Indicators</td><td>2024</td><td><code>NY.GDP.PCAP.CD</code></td></tr>" +
    "<tr><td>GDP growth</td><td>Annual change in real (inflation-adjusted) GDP. India's figure is on a fiscal-year basis, as the IMF reports it.</td><td>IMF, World Economic Outlook</td><td>2024</td><td>WEO, Oct 2025</td></tr>" +
    "<tr><td>Unemployment</td><td>Share of the labour force without work but available for and seeking work; modelled ILO estimate.</td><td>World Bank, World Development Indicators</td><td>2024</td><td><code>SL.UEM.TOTL.ZS</code></td></tr>" +
    "<tr><td>Life expectancy</td><td>Years a newborn would live if current death rates stayed the same. Latest year published for all 16 countries.</td><td>World Bank, World Development Indicators</td><td>2023</td><td><code>SP.DYN.LE00.IN</code></td></tr>" +
    "</tbody></table></div>" +
    "<h2>How to read this site</h2>" +
    "<p><b>Why these 16?</b> They are the 16 largest economies by nominal GDP in 2024. Together they produce about $84.6 trillion — roughly three quarters of world output — and hold about 4.5 billion people.</p>" +
    "<p><b>Why nominal GDP, not PPP?</b> Nominal GDP is the size of an economy at market exchange rates — the number that decides trade weight and market size. Purchasing-power-parity figures would reorder the list (China first, India third) and answer a different question.</p>" +
    "<p><b>Why is life expectancy a year older?</b> The World Bank publishes life expectancy with a longer lag than GDP. Using 2023 for all 16 keeps the comparison honest; mixing years would compare different worlds.</p>" +
    "<p><b>Rounding.</b> GDP is shown to two decimals in trillions and to the dollar per person; populations to one decimal in millions. Rankings use the unrounded figures, so a close pair can look tied when it is not.</p>" +
    "<p><b>Revisions.</b> The World Bank and the IMF revise past figures. These are the values as published in the 2024 WDI vintage and the IMF's October 2025 WEO. If a source revises a number, this page is the place that change would be noted.</p>" +
    "<h2>About this site</h2>" +
    "<p>World Atlas of National Statistics is an independent reference built from public data. It is not affiliated with the World Bank, the IMF or any national statistics office. All text, design and charts on this site are original; the numbers are public facts, cited above.</p>";
}

// ---- Router ---------------------------------------------------------------
function route() {
  const hash = location.hash || "#/overview";
  if (hash.indexOf("#/rankings") === 0) renderRankings();
  else if (hash.indexOf("#/compare") === 0) renderCompare();
  else if (hash.indexOf("#/sources") === 0) renderSources();
  else renderOverview();
}

window.addEventListener("hashchange", route);
route();
