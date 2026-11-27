// Hand-rolled SVG charts. No library, no network: every chart is a string of
// SVG built from COUNTRIES and inserted into the page by main.js.

function esc(text) {
  return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Ranked horizontal bars for one metric, largest first. Each country keeps
// its own colour everywhere on the site, so a colour means the same country
// on every page.
function rankedBars(metricKey) {
  const metric = metricByKey(metricKey);
  const rows = COUNTRIES.slice().sort((a, b) => b[metricKey] - a[metricKey]);
  const max = Math.max.apply(null, rows.map((c) => Math.abs(c[metricKey])));
  const rowH = 34, labelW = 150, valueW = 96, barX = labelW + 8;
  const barW = 560, height = rows.length * rowH + 8;
  let out = '<svg class="chart" viewBox="0 0 830 ' + height +
    '" role="img" aria-label="Ranked bars, ' + esc(metric.label) + '">';
  rows.forEach((c, i) => {
    const y = 8 + i * rowH;
    const w = Math.max(3, (Math.abs(c[metricKey]) / max) * barW);
    const neg = c[metricKey] < 0;
    out += '<text x="' + (labelW - 6) + '" y="' + (y + 19) + '" class="bar-label" text-anchor="end">' +
      (i + 1) + ". " + esc(c.name) + "</text>";
    out += '<rect x="' + barX + '" y="' + (y + 5) + '" width="' + w.toFixed(1) +
      '" height="18" rx="3" fill="' + c.color + '"' + (neg ? ' opacity="0.55"' : "") + "/>";
    out += '<text x="' + (barX + w + 8) + '" y="' + (y + 19) + '" class="bar-value">' +
      esc(formatValue(metric, c[metricKey])) + "</text>";
  });
  return out + "</svg>";
}

// Donut chart: share of the combined GDP of all 16 economies, 2024.
// The five largest economies get their own slice; the other 11 are grouped,
// so the chart stays readable. Every slice is computed from the GDP figures
// in data.js — no new data.
function donutChart() {
  const total = COUNTRIES.reduce((t, c) => t + c.gdp, 0);
  const top = COUNTRIES.slice().sort((a, b) => b.gdp - a.gdp).slice(0, 5);
  const other = total - top.reduce((t, c) => t + c.gdp, 0);
  const slices = top.map((c) => ({ name: c.name, color: c.color, value: c.gdp }));
  slices.push({ name: "Other 11 economies", color: "#94a3b8", value: other });
  const R = 80, C = 2 * Math.PI * R, cx = 110, cy = 110;
  let offset = 0, rings = "";
  slices.forEach((s) => {
    const len = (s.value / total) * C;
    rings += '<circle cx="' + cx + '" cy="' + cy + '" r="' + R + '" fill="none" stroke="' +
      s.color + '" stroke-width="34" stroke-dasharray="' + Math.max(0, len - 2).toFixed(1) +
      " " + C.toFixed(1) + '" stroke-dashoffset="' + (-offset).toFixed(1) +
      '" transform="rotate(-90 ' + cx + " " + cy + ')"/>';
    offset += len;
  });
  const legend = slices.map((s) =>
    '<li><span class="dot" style="background:' + s.color + '"></span>' + esc(s.name) +
    "<b>" + (100 * s.value / total).toFixed(1) + "%</b></li>").join("");
  return '<svg class="chart donut" viewBox="0 0 220 220" role="img" aria-label="Donut chart of each economy\'s share of combined GDP">' +
    rings +
    '<text x="' + cx + '" y="104" class="donut-total" text-anchor="middle">' + gdpTrillions(total) + "</text>" +
    '<text x="' + cx + '" y="124" class="donut-sub" text-anchor="middle">combined GDP</text>' +
    '<text x="' + cx + '" y="142" class="donut-sub" text-anchor="middle">16 economies, 2024</text></svg>' +
    '<ul class="donut-legend">' + legend + "</ul>";
}

// Line chart: real GDP growth of the United States, 2015–2025. One line,
// one country, eleven yearly values from US_GROWTH_2015_2025 (IMF WEO,
// October 2025, Table A1). The 2025 point is the IMF projection. The
// negative 2020 value gets its label below the dot so the falling line
// does not cross the text.
function growthLineChart() {
  const data = US_GROWTH_2015_2025;
  const W = 820, H = 250, padL = 46, padB = 30, padT = 28, padR = 16;
  const yMin = -3, yMax = 7;
  const x = (i) => padL + (i / (data.length - 1)) * (W - padL - padR);
  const y = (v) => H - padB - ((v - yMin) / (yMax - yMin)) * (H - padT - padB);
  let out = '<svg class="chart" viewBox="0 0 ' + W + " " + H +
    '" role="img" aria-label="Line chart of real GDP growth of the United States, 2015 to 2025">';
  for (let g = -2; g <= 6; g += 2) {
    out += '<line x1="' + padL + '" y1="' + y(g) + '" x2="' + (W - padR) + '" y2="' + y(g) + '" class="grid"/>';
    out += '<text x="' + (padL - 8) + '" y="' + (y(g) + 4) + '" class="axis" text-anchor="end">' +
      (g > 0 ? "+" : "") + g + "%</text>";
  }
  out += '<line x1="' + padL + '" y1="' + y(0) + '" x2="' + (W - padR) + '" y2="' + y(0) +
    '" stroke="#94a3b8" stroke-width="1.5"/>';
  const pts = data.map((d, i) => x(i).toFixed(1) + "," + y(d.value).toFixed(1)).join(" ");
  out += '<polyline points="' + pts + '" fill="none" stroke="#1d4ed8" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>';
  data.forEach((d, i) => {
    out += '<circle cx="' + x(i).toFixed(1) + '" cy="' + y(d.value).toFixed(1) +
      '" r="4.5" fill="#fff" stroke="#1d4ed8" stroke-width="2.5"/>';
    const ly = d.value < 0 ? y(d.value) + 20 : y(d.value) - 10;
    // First point: anchor the label to the right of the dot so it cannot
    // collide with the y-axis labels at the left edge.
    const anchor = i === 0 ? "start" : "middle";
    const lx = i === 0 ? x(i) + 10 : x(i);
    out += '<text x="' + lx.toFixed(1) + '" y="' + ly.toFixed(1) +
      '" class="dot-label" text-anchor="' + anchor + '">' + (d.value > 0 ? "+" : "") + d.value.toFixed(1) + "%</text>";
    out += '<text x="' + x(i).toFixed(1) + '" y="' + (H - 8) + '" class="axis" text-anchor="middle">' +
      d.year + (d.projected ? "*" : "") + "</text>";
  });
  return out + "</svg>";
}

// Scatter plot: GDP per capita (x) against life expectancy (y). One dot per
// country, coloured and labelled, so the pattern is readable without a legend.
function scatterPlot() {
  const W = 820, H = 420, padL = 56, padB = 44, padT = 18, padR = 90;
  const xs = COUNTRIES.map((c) => c.gdppc), ys = COUNTRIES.map((c) => c.life);
  const xMin = 0, xMax = 90000, yMin = 68, yMax = 86;
  const x = (v) => padL + ((v - xMin) / (xMax - xMin)) * (W - padL - padR);
  const y = (v) => H - padB - ((v - yMin) / (yMax - yMin)) * (H - padT - padB);
  let out = '<svg class="chart" viewBox="0 0 ' + W + " " + H +
    '" role="img" aria-label="Scatter plot of GDP per capita against life expectancy">';
  for (let g = 0; g <= 90000; g += 15000) {
    out += '<line x1="' + x(g) + '" y1="' + (H - padB) + '" x2="' + x(g) + '" y2="' + padT +
      '" class="grid"/>';
    out += '<text x="' + x(g) + '" y="' + (H - padB + 20) + '" class="axis" text-anchor="middle">$' +
      (g / 1000) + "k</text>";
  }
  for (let l = 70; l <= 85; l += 5) {
    out += '<line x1="' + padL + '" y1="' + y(l) + '" x2="' + (W - padR) + '" y2="' + y(l) + '" class="grid"/>';
    out += '<text x="' + (padL - 8) + '" y="' + (y(l) + 4) + '" class="axis" text-anchor="end">' + l + "</text>";
  }
  out += '<text x="' + ((W - padR + padL) / 2) + '" y="' + (H - 4) +
    '" class="axis-title" text-anchor="middle">GDP per capita, 2024 (US$)</text>';
  out += '<text x="14" y="' + ((H - padB + padT) / 2) +
    '" class="axis-title" text-anchor="middle" transform="rotate(-90 14 ' +
    ((H - padB + padT) / 2) + ')">Life expectancy, 2023 (years)</text>';
  COUNTRIES.forEach((c) => {
    out += '<circle cx="' + x(c.gdppc).toFixed(1) + '" cy="' + y(c.life).toFixed(1) +
      '" r="9" fill="' + c.color + '" stroke="#fff" stroke-width="2"/>';
    out += '<text x="' + (x(c.gdppc) + 12).toFixed(1) + '" y="' + (y(c.life) + 4).toFixed(1) +
      '" class="dot-label">' + esc(c.code) + "</text>";
  });
  return out + "</svg>";
}

// One paired bar per metric comparing two countries, scaled to the larger of
// the two values so the difference is honest at a glance.
function pairedBars(a, b) {
  let out = "";
  METRICS.forEach((m) => {
    const top = Math.max(Math.abs(a[m.key]), Math.abs(b[m.key]), 0.001);
    const wa = (Math.abs(a[m.key]) / top) * 100;
    const wb = (Math.abs(b[m.key]) / top) * 100;
    const leader = a[m.key] === b[m.key] ? "Tie" : (a[m.key] > b[m.key] ? a.name : b.name);
    out += '<div class="pair"><div class="pair-head"><span>' + esc(m.label) +
      ' <em>(' + esc(m.unit) + ")</em></span><span class=\"pair-leader\">" + esc(leader) +
      " leads</span></div>" +
      '<div class="pair-row"><span class="pair-name">' + esc(a.name) + "</span>" +
      '<div class="pair-track"><div class="pair-fill" style="width:' + wa.toFixed(1) +
      "%;background:" + a.color + '"></div></div><span class="pair-val">' +
      esc(formatValue(m, a[m.key])) + "</span></div>" +
      '<div class="pair-row"><span class="pair-name">' + esc(b.name) + "</span>" +
      '<div class="pair-track"><div class="pair-fill" style="width:' + wb.toFixed(1) +
      "%;background:" + b.color + '"></div></div><span class="pair-val">' +
      esc(formatValue(m, b[m.key])) + "</span></div></div>";
  });
  return out;
}
