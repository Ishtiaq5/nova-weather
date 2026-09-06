/* Nova Weather — simulated weather engine (no external APIs) */
"use strict";

const CITIES = [
  { name: "Karachi, PK", temp: 31, cond: "Hazy Sunshine", icon: "🌤️", hum: 62, wind: 18, uv: 8, vis: 6 },
  { name: "Tokyo, JP", temp: 24, cond: "Light Rain", icon: "🌦️", hum: 78, wind: 12, uv: 3, vis: 9 },
  { name: "Oslo, NO", temp: 9, cond: "Snow Showers", icon: "🌨️", hum: 81, wind: 22, uv: 1, vis: 4 },
  { name: "Dubai, AE", temp: 38, cond: "Scorching Clear", icon: "☀️", hum: 34, wind: 9, uv: 10, vis: 12 },
  { name: "London, UK", temp: 15, cond: "Overcast Drizzle", icon: "🌧️", hum: 84, wind: 15, uv: 2, vis: 8 },
  { name: "New York, US", temp: 21, cond: "Partly Cloudy", icon: "⛅", hum: 55, wind: 20, uv: 5, vis: 14 },
  { name: "Singapore, SG", temp: 29, cond: "Thunderstorms", icon: "⛈️", hum: 88, wind: 11, uv: 6, vis: 5 },
  { name: "Reykjavík, IS", temp: 4, cond: "Aurora Night", icon: "🌌", hum: 76, wind: 27, uv: 0, vis: 16 },
  { name: "Sydney, AU", temp: 19, cond: "Clear Skies", icon: "🌞", hum: 48, wind: 17, uv: 7, vis: 18 },
  { name: "Lahore, PK", temp: 33, cond: "Dusty Haze", icon: "🌫️", hum: 44, wind: 8, uv: 9, vis: 3 }
];

const DAILY_ICONS = ["🌤️", "☀️", "🌧️", "⛈️", "🌨️", "⛅", "🌦️"];
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const $ = (id) => document.getElementById(id);

function pseudoRandom(seed) {
  let x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function buildSeries(city) {
  const seed = city.name.length * 7 + city.temp;
  const hourly = [];
  for (let h = 0; h < 12; h++) {
    const t = city.temp + Math.round((pseudoRandom(seed + h) - 0.5) * 6);
    const hour = (new Date().getHours() + 1 + h) % 24;
    hourly.push({
      time: String(hour).padStart(2, "0") + ":00",
      icon: DAILY_ICONS[Math.floor(pseudoRandom(seed * 3 + h) * DAILY_ICONS.length)],
      temp: t
    });
  }
  const daily = [];
  for (let d = 0; d < 5; d++) {
    const date = new Date();
    date.setDate(date.getDate() + d + 1);
    const hi = city.temp + Math.round(pseudoRandom(seed + d * 5) * 4) + 1;
    const lo = city.temp - Math.round(pseudoRandom(seed + d * 9) * 5) - 2;
    daily.push({
      name: d === 0 ? "Tomorrow" : DAY_NAMES[date.getDay()],
      icon: DAILY_ICONS[Math.floor(pseudoRandom(seed * 7 + d) * DAILY_ICONS.length)],
      hi, lo
    });
  }
  return { hourly, daily };
}

function animateNumber(el, target, suffix) {
  const start = performance.now();
  const from = Math.max(0, target - 8);
  const dur = 900;
  function tick(now) {
    const p = Math.min(1, (now - start) / dur);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(from + (target - from) * eased) + (suffix || "");
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function setBar(id, pct) {
  const bar = $(id);
  bar.style.width = "0%";
  requestAnimationFrame(() => { bar.style.width = Math.min(100, Math.max(4, pct)) + "%"; });
}

function render(city) {
  $("now-title").textContent = city.name;
  $("condition").textContent = city.cond;
  $("weather-icon").textContent = city.icon;
  $("feels").textContent = city.temp + Math.round(city.hum / 20);
  animateNumber($("temp"), city.temp);
  animateNumber($("humidity"), city.hum);
  animateNumber($("wind"), city.wind);
  $("uv").textContent = city.uv;
  animateNumber($("vis"), city.vis);
  setBar("bar-humidity", city.hum);
  setBar("bar-wind", city.wind * 3.5);
  setBar("bar-uv", city.uv * 10);
  setBar("bar-vis", city.vis * 5.5);

  const series = buildSeries(city);
  $("hourly").innerHTML = series.hourly.map((h) =>
    `<div class="hour" role="listitem"><span class="h-time">${h.time}</span><div class="h-icon" aria-hidden="true">${h.icon}</div><span class="h-temp">${h.temp}°</span></div>`
  ).join("");
  $("daily").innerHTML = series.daily.map((d) =>
    `<div class="day" role="listitem"><span class="d-name">${d.name}</span><span class="d-icon" aria-hidden="true">${d.icon}</span><span class="d-range"><b>${d.hi}°</b> / ${d.lo}°</span></div>`
  ).join("");
  $("updated").textContent = "Updated just now";
}

/* live clock */
setInterval(() => {
  const now = new Date();
  $("clock").textContent = [now.getHours(), now.getMinutes(), now.getSeconds()]
    .map((n) => String(n).padStart(2, "0")).join(":");
}, 1000);

/* search: match a known city or "discover" a new one */
let current = CITIES[0];
$("city-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const q = $("city-input").value.trim().toLowerCase();
  if (!q) return;
  const found = CITIES.find((c) => c.name.toLowerCase().includes(q));
  if (found) {
    current = found;
  } else {
    const pool = CITIES.filter((c) => c !== current);
    current = pool[Math.floor(Math.random() * pool.length)];
  }
  $("city-input").value = "";
  render(current);
});

render(current);
