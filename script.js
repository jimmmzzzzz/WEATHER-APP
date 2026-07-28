const WEATHER_ICONS = {
  Sun: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`,
  Clouds: `<svg viewBox="0 0 24 24"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>`,
  Rain: `<svg viewBox="0 0 24 24"><line x1="16" y1="13" x2="16" y2="21"/><line x1="8" y1="13" x2="8" y2="21"/><line x1="12" y1="15" x2="12" y2="23"/><path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"/></svg>`,
  Thunderstorm: `<svg viewBox="0 0 24 24"><path d="M19 11h-1.7A7 7 0 1 0 4 14"/><polyline points="13 11 9 17 15 17 11 23"/></svg>`,
  Snow: `<svg viewBox="0 0 24 24"><path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25"/><line x1="8" y1="16" x2="8.01" y2="16"/><line x1="12" y1="18" x2="12.01" y2="18"/><line x1="16" y1="16" x2="16.01" y2="16"/></svg>`,
  Mist: `<svg viewBox="0 0 24 24"><line x1="3" y1="10" x2="21" y2="10"/><line x1="3" y1="14" x2="21" y2="14"/><line x1="5" y1="18" x2="19" y2="18"/><line x1="5" y1="6" x2="19" y2="6"/></svg>`
};

const state = {
  city: "Lagos",
  country: "NG",
  coords: { lat: 6.5244, lon: 3.3792 },
  current: null,
  forecast: [],
  theme: localStorage.getItem("atmos-theme") || "dark",
  apiKey: "22c14220e39594a0bfc5f9391994c766",
  isMock: false
};

const DOM = {
  themeBtn: document.getElementById("theme-btn"),
  searchForm: document.getElementById("search-form"),
  searchInput: document.getElementById("search-input"),
  geoBtn: document.getElementById("geo-btn"),
  toast: document.getElementById("status-toast"),
  toastMsg: document.getElementById("status-message"),
  toastClose: document.getElementById("toast-close"),

  cityName: document.getElementById("city-name"),
  coordsDisplay: document.getElementById("coords-display"),
  localTimeDisplay: document.getElementById("local-time-display"),
  weatherDate: document.getElementById("weather-date"),
  currentTemp: document.getElementById("current-temp"),
  heroIcon: document.getElementById("weather-icon-hero"),
  weatherMain: document.getElementById("weather-main"),
  weatherDesc: document.getElementById("weather-description"),

  humidityVal: document.getElementById("humidity-value"),
  humidityBar: document.getElementById("humidity-bar"),
  windVal: document.getElementById("wind-value"),
  windDir: document.getElementById("wind-dir-text"),
  pressureVal: document.getElementById("pressure-value"),
  pressureStatus: document.getElementById("pressure-status"),
  visibilityVal: document.getElementById("visibility-value"),
  visibilityStatus: document.getElementById("visibility-status"),

  sunriseTime: document.getElementById("sunrise-time"),
  sunsetTime: document.getElementById("sunset-time"),
  daylightDuration: document.getElementById("daylight-duration"),
  sunNode: document.getElementById("sun-node"),

  forecastContainer: document.getElementById("forecast-container")
};

function initApp() {
  document.documentElement.setAttribute("data-theme", state.theme);

  if (DOM.themeBtn) DOM.themeBtn.addEventListener("click", toggleTheme);
  if (DOM.searchForm) DOM.searchForm.addEventListener("submit", handleSearchSubmit);
  if (DOM.geoBtn) DOM.geoBtn.addEventListener("click", handleGeolocation);
  if (DOM.toastClose) DOM.toastClose.addEventListener("click", hideToast);

  fetchWeatherData(state.city);
}

function toggleTheme() {
  state.theme = state.theme === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", state.theme);
  localStorage.setItem("atmos-theme", state.theme);
}

function showToast(message) {
  if (!DOM.toast || !DOM.toastMsg) return;
  DOM.toastMsg.textContent = message;
  DOM.toast.classList.remove("hidden");
}

function hideToast() {
  if (!DOM.toast) return;
  DOM.toast.classList.add("hidden");
}

async function fetchWeatherData(query) {
  triggerSkeletonState();
  hideToast();

  if (!state.apiKey || state.apiKey === "PASTE_YOUR_OPENWEATHER_API_KEY_HERE") {
    const mockData = generateMockWeatherData(query);
    state.isMock = true;
    updateStateAndRender(mockData.current, mockData.forecast);
    showToast(`Using mock data for "${query}". Add your OpenWeather API key in state.apiKey.`);
    return;
  }

  try {
    const currentRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(query)}&units=metric&appid=${state.apiKey}`
    );

    if (!currentRes.ok) throw new Error("Location not found.");
    const currentData = await currentRes.json();

    const forecastRes = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(query)}&units=metric&appid=${state.apiKey}`
    );

    if (!forecastRes.ok) throw new Error("Forecast not available.");
    const forecastData = await forecastRes.json();

    state.isMock = false;
    processAndRenderApiData(currentData, forecastData);
  } catch (err) {
    const mockData = generateMockWeatherData(query);
    state.isMock = true;
    updateStateAndRender(mockData.current, mockData.forecast);
    showToast(err.message || "Failed to load live weather. Showing mock data.");
  }
}

async function fetchWeatherByCoords(lat, lon) {
  triggerSkeletonState();
  hideToast();

  if (!state.apiKey || state.apiKey === "PASTE_YOUR_OPENWEATHER_API_KEY_HERE") {
    const mockData = generateMockWeatherData("Current Location");
    mockData.current.coords = { lat: lat.toFixed(4), lon: lon.toFixed(4) };
    state.isMock = true;
    updateStateAndRender(mockData.current, mockData.forecast);
    showToast("Geolocation loaded with mock data.");
    return;
  }

  try {
    const currentRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${state.apiKey}`
    );

    if (!currentRes.ok) throw new Error("Location not found.");
    const currentData = await currentRes.json();

    const forecastRes = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${state.apiKey}`
    );

    if (!forecastRes.ok) throw new Error("Forecast not available.");
    const forecastData = await forecastRes.json();

    state.isMock = false;
    processAndRenderApiData(currentData, forecastData);
  } catch (err) {
    const mockData = generateMockWeatherData("Current Location");
    state.isMock = true;
    updateStateAndRender(mockData.current, mockData.forecast);
    showToast(err.message || "Failed to load coordinates. Showing mock data.");
  }
}

function handleSearchSubmit(e) {
  e.preventDefault();
  const query = DOM.searchInput.value.trim();
  if (query) {
    fetchWeatherData(query);
    DOM.searchInput.value = "";
  }
}

function handleGeolocation() {
  if (!navigator.geolocation) {
    showToast("Geolocation is not supported.");
    return;
  }

  showToast("Finding your location...");
  navigator.geolocation.getCurrentPosition(
    pos => fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude),
    () => showToast("Location access denied or timed out."),
    { timeout: 8000 }
  );
}

function processAndRenderApiData(currentData, forecastData) {
  const current = {
    city: currentData.name,
    country: currentData.sys?.country || "",
    coords: {
      lat: currentData.coord?.lat ?? 0,
      lon: currentData.coord?.lon ?? 0
    },
    localTime: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    formattedDate: new Date().toDateString(),
    temp: currentData.main?.temp ?? 0,
    conditionMain: currentData.weather?.[0]?.main || "Clouds",
    conditionDesc: currentData.weather?.[0]?.description || "",
    humidity: currentData.main?.humidity ?? 0,
    windSpeed: currentData.wind?.speed ?? 0,
    windDeg: currentData.wind?.deg ?? 0,
    pressure: currentData.main?.pressure ?? 0,
    visibility: currentData.visibility ?? 10000,
    sunrise: currentData.sys?.sunrise ? new Date(currentData.sys.sunrise * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--:--",
    sunset: currentData.sys?.sunset ? new Date(currentData.sys.sunset * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--:--",
    daylightHours: currentData.sys?.sunrise && currentData.sys?.sunset
      ? formatDuration((currentData.sys.sunset - currentData.sys.sunrise) / 60)
      : "--"
  };

  const list = forecastData.list || [];
  const forecast = list
    .filter((_, i) => i % 8 === 0)
    .slice(0, 5)
    .map(item => ({
      day: new Date(item.dt * 1000).toLocaleDateString("en-US", { weekday: "short" }).toUpperCase(),
      date: new Date(item.dt * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric" }).toUpperCase(),
      tempMax: item.main?.temp_max ?? item.main?.temp ?? 0,
      tempMin: item.main?.temp_min ?? item.main?.temp ?? 0,
      condition: item.weather?.[0]?.main || "Clouds"
    }));

  updateStateAndRender(current, forecast);
}

function updateStateAndRender(current, forecast) {
  state.current = current;
  state.forecast = forecast;
  renderUI();
}

function renderUI() {
  const c = state.current;
  if (!c) return;

  if (DOM.cityName) DOM.cityName.textContent = `${c.city}, ${c.country}`;
  if (DOM.coordsDisplay) DOM.coordsDisplay.textContent = `LAT: ${c.coords.lat} // LON: ${c.coords.lon}`;
  if (DOM.localTimeDisplay) DOM.localTimeDisplay.textContent = c.localTime;
  if (DOM.weatherDate) DOM.weatherDate.textContent = c.formattedDate;
  if (DOM.currentTemp) DOM.currentTemp.textContent = Math.round(c.temp);
  if (DOM.weatherMain) DOM.weatherMain.textContent = c.conditionMain;
  if (DOM.weatherDesc) DOM.weatherDesc.textContent = c.conditionDesc;

  if (DOM.heroIcon) DOM.heroIcon.innerHTML = WEATHER_ICONS[c.conditionMain] || WEATHER_ICONS.Clouds;

  if (DOM.humidityVal) DOM.humidityVal.textContent = c.humidity;
  if (DOM.humidityBar) DOM.humidityBar.style.width = `${c.humidity}%`;

  if (DOM.windVal) DOM.windVal.textContent = Number(c.windSpeed).toFixed(1);
  if (DOM.windDir) DOM.windDir.textContent = `${getCardinalDirection(c.windDeg)} (${c.windDeg}°)`;

  if (DOM.pressureVal) DOM.pressureVal.textContent = c.pressure;
  if (DOM.pressureStatus) DOM.pressureStatus.textContent = c.pressure >= 1013 ? "High Pressure" : "Low Pressure";

  if (DOM.visibilityVal) DOM.visibilityVal.textContent = (c.visibility / 1000).toFixed(1);
  if (DOM.visibilityStatus) DOM.visibilityStatus.textContent = c.visibility >= 10000 ? "Clear" : "Low Visibility";

  if (DOM.sunriseTime) DOM.sunriseTime.textContent = c.sunrise;
  if (DOM.sunsetTime) DOM.sunsetTime.textContent = c.sunset;
  if (DOM.daylightDuration) DOM.daylightDuration.textContent = c.daylightHours;

  updateSolarArcPosition();
  renderForecast(state.forecast);
  removeSkeletonState();
}

function renderForecast(forecastList) {
  if (!DOM.forecastContainer) return;
  DOM.forecastContainer.innerHTML = "";

  forecastList.forEach((item, idx) => {
    const card = document.createElement("article");
    card.className = "forecast-card";
    card.style.animationDelay = `${idx * 0.08}s`;

    card.innerHTML = `
      <div>
        <div class="forecast-day">${item.day}</div>
        <div class="forecast-date">${item.date}</div>
      </div>
      <div class="forecast-icon">${WEATHER_ICONS[item.condition] || WEATHER_ICONS.Clouds}</div>
      <div class="forecast-temp-range">
        <span class="temp-max">${Math.round(item.tempMax)}°</span>
        <span class="temp-min">${Math.round(item.tempMin)}°</span>
      </div>
      <div class="forecast-condition-label">${item.condition}</div>
    `;

    DOM.forecastContainer.appendChild(card);
  });
}

function updateSolarArcPosition() {
  if (!DOM.sunNode) return;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const start = 6 * 60 + 30;
  const end = 18 * 60 + 45;
  const t = Math.max(0, Math.min(1, (currentMinutes - start) / (end - start)));

  const p0 = { x: 10, y: 70 };
  const p1 = { x: 150, y: -20 };
  const p2 = { x: 290, y: 70 };

  const cx = (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * p1.x + t * t * p2.x;
  const cy = (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * p1.y + t * t * p2.y;

  DOM.sunNode.setAttribute("cx", cx.toFixed(1));
  DOM.sunNode.setAttribute("cy", cy.toFixed(1));
}

function getCardinalDirection(deg) {
  const directions = ["North", "Northeast", "East", "Southeast", "South", "Southwest", "West", "Northwest"];
  return directions[Math.round(deg / 45) % 8];
}

function triggerSkeletonState() {
  document.querySelectorAll(".temp-number, .metric-num, .city-title")
    .forEach(el => el.classList.add("skeleton"));
}

function removeSkeletonState() {
  document.querySelectorAll(".skeleton")
    .forEach(el => el.classList.remove("skeleton"));
}

function generateMockWeatherData(locationQuery) {
  const city = locationQuery.charAt(0).toUpperCase() + locationQuery.slice(1);
  const conditions = ["Sun", "Clouds", "Rain", "Thunderstorm", "Mist"];
  const condition = conditions[Math.floor(Math.random() * conditions.length)];
  const baseTemp = Math.floor(Math.random() * 15) + 18;

  return {
    current: {
      city,
      country: "NG",
      coords: { lat: 6.5244, lon: 3.3792 },
      localTime: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      formattedDate: new Date().toDateString(),
      temp: baseTemp,
      conditionMain: condition,
      conditionDesc: `${condition.toLowerCase()} conditions.`,
      humidity: Math.floor(Math.random() * 30) + 55,
      windSpeed: (Math.random() * 15 + 5).toFixed(1),
      windDeg: Math.floor(Math.random() * 360),
      pressure: Math.floor(Math.random() * 20) + 1005,
      visibility: 10000,
      sunrise: "06:28 AM",
      sunset: "06:42 PM",
      daylightHours: "12h 14m"
    },
    forecast: [
      { day: "SUN", date: "JUL 26", tempMax: baseTemp + 2, tempMin: baseTemp - 4, condition: "Sun" },
      { day: "MON", date: "JUL 27", tempMax: baseTemp + 1, tempMin: baseTemp - 3, condition: "Clouds" },
      { day: "TUE", date: "JUL 28", tempMax: baseTemp - 1, tempMin: baseTemp - 5, condition: "Rain" },
      { day: "WED", date: "JUL 29", tempMax: baseTemp + 3, tempMin: baseTemp - 2, condition: "Thunderstorm" },
      { day: "THU", date: "JUL 30", tempMax: baseTemp + 4, tempMin: baseTemp - 1, condition: "Sun" }
    ]
  };
}

function formatDuration(totalMinutes) {
  const h = Math.floor(totalMinutes / 60);
  const m = Math.round(totalMinutes % 60);
  return `${h}h ${m}m`;
}

document.addEventListener("DOMContentLoaded", initApp);