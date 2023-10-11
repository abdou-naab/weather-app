document.cookie = "key=value; SameSite=None; Secure";
const api_key = "?key=bd1cc97dc32d403894f93847230310";
const base_url = "http://api.weatherapi.com/v1";
const curr_weather_api = "/current.json";
const forcast_api = "/forecast.json";
const search_api = "/search.json";

const getForecastData = (obj) => {
  const cloud = obj.current.cloud;
  const feelslike = {
    c: obj.current.feelslike_c,
    f: obj.current.feelslike_f,
  };
  const temp = {
    c: obj.current.temp_c,
    f: obj.current.temp_f,
  };
  const humidity = obj.current.humidity;
  const precip = {
    in: obj.current.precip_in,
    mm: obj.current.precip_mm,
  };
  const pressure = {
    in: obj.current.pressure_in,
    mb: obj.current.pressure_mb,
  };
  const wind_dir = obj.current.wind_dir;
  const wind = {
    kph: obj.current.wind_kph,
    mph: obj.current.wind_mph,
  };
  const icon = obj.current.condition.icon;
  const condition = obj.current.condition.text;

  const country = obj.location.country;
  const latitude = obj.location.lat;
  const longitude = obj.location.lon;
  const local_time = obj.location.localtime;
  const name = obj.location.name;
  const region = obj.location.region;
  const days_forecast = obj.forecast.forecastday;
  return {
    cloud,
    feelslike,
    temp,
    humidity,
    precip,
    pressure,
    wind_dir,
    wind,
    icon,
    condition,
    longitude,
    latitude,
    country,
    local_time,
    name,
    region,
    days_forecast,
  };
};

const SearchField = (() => {
  const searchField = document.getElementById("search-field");

  function render_suggestions(lst) {
    const ul = document.querySelector(".suggestions");
    ul.innerHTML = "";
    for (i of lst) {
      const li = document.createElement("li");
      li.innerText = i;
      li.addEventListener("click", (e) => {
        searchField.value = li.innerText;
        ul.innerHTML = "";
      });
      ul.append(li);
    }
  }
  async function search_results(loc) {
    let response = await fetch(base_url + search_api + api_key + "&q=" + loc);
    response = await response.json();
    if (response) {
      let temp = [];
      for (let obj of response) {
        temp.push(obj.name);
      }
      return temp;
    }
  }
  const suggest = () =>
    searchField.addEventListener("input", async (e) => {
      if (searchField.value.trim()) {
        let response = await search_results(searchField.value.trim());
        if (response) {
          render_suggestions(response);
        }
      } else {
        document.querySelector(".suggestions").innerHTML = "";
      }
    });

  async function get_3days_forecast(loc) {
    let response = await fetch(
      base_url + forcast_api + api_key + "&q=" + loc + "&days=3"
    );
    if (!response.ok) {
      searchField.value = "";
      searchField.setAttribute("placeholder", "Enter a valid location!");
      return undefined;
    } else {
      response = await response.json();
      return response;
    }
  }
  const search = async (ip_address = undefined) => {
    if (searchField.value.trim().length) {
      document.querySelector(".suggestions").innerHTML = "";
      let results = await get_3days_forecast(searchField.value.trim());
      if (results) {
        let forecast_data = getForecastData(results);
        return forecast_data;
      }
    }
    if (ip_address) {
      let results = await get_3days_forecast(ip_address);
      let forecast_data = getForecastData(results);
      return forecast_data;
    }
  };
  return { suggest, search };
})();
SearchField.suggest();
/*
 * hourly forecast
 */
const forecastByHour = (obj, hour_now) => {
  const createHourCard = (hour) => {
    const hourCard = document.createElement("div");
    hourCard.classList.add("hour-card", "flex-column");
    const hourSpan = document.createElement("span");
    const degreeSpan = document.createElement("span");
    const c_degree = document.createElement("span");
    const f_degree = document.createElement("span");
    const feelslike = document.createElement("span");
    const feelslike_c = document.createElement("span");
    const feelslike_f = document.createElement("span");

    c_degree.classList.add("c");
    f_degree.classList.add("f");
    feelslike_c.classList.add("c");
    feelslike_f.classList.add("f");
    const img = document.createElement("img");
    if (
      hour_now &&
      parseInt(hour.time.split(" ")[1].split(":")[0]) == hour_now
    ) {
      hourSpan.innerText = "NOW";
      hourSpan.style.fontWeight = "bold";
    } else {
      hourSpan.innerText = hour.time.split(" ")[1];
    }

    // String(new Date(hour.time.split(" ")[0])).substring(0,15);

    c_degree.innerText = "temp: " + hour.temp_c + "°";
    f_degree.innerText = "temp: " + hour.temp_f + "°";
    feelslike_c.innerText = "feelslike: " + hour.feelslike_c + "°";
    feelslike_f.innerText = "feelslike: " + hour.feelslike_f + "°";
    degreeSpan.append(c_degree, f_degree);
    feelslike.append(feelslike_c, feelslike_f);
    img.setAttribute("src", hour.condition.icon);
    img.setAttribute("alt", hour.condition.text);
    img.classList.add("sml-img");
    hourCard.append(hourSpan, img, degreeSpan, feelslike);
    return hourCard;
  };

  const todayHoursList = () => {
    const temp = [];
    for (let h in obj.hour) {
      temp.push(createHourCard(obj.hour[h]));
    }
    return temp;
  };
  return { todayHoursList };
};

/*  */
const todayHoursContainer = document.querySelector(".today-hourly");

/*
days-selection
*/

const fillHourlyHorecast = async (e, day, forecast) => {
  document.querySelector(".current-day").classList.remove("current-day");
  day.classList.add("current-day");

  todayHoursContainer.innerHTML = "";
  let day_n = parseInt(day.getAttribute("day"));
  let hour_now = undefined;
  if (day_n == 0)
    hour_now = parseInt(forecast.local_time.split(" ")[1].split(":")[0]);
  let forecast_by_hour = forecastByHour(
    forecast.days_forecast[day_n],
    hour_now
  );

  todayHoursContainer.append(...forecast_by_hour.todayHoursList());
  // scroll to now hour :
  if (hour_now)
    todayHoursContainer.scroll(
      todayHoursContainer.children[hour_now - 1].offsetLeft,
      0
    );
  else todayHoursContainer.scroll(0, 0);

  const sunrise = document.querySelector(".sunrise span");
  const sunset = document.querySelector(".sunset span");
  sunrise.innerHTML = "";
  sunset.innerHTML = "";
  sunrise.innerText = forecast.days_forecast[day_n].astro.sunrise;
  sunset.innerText = forecast.days_forecast[day_n].astro.sunset;

  // fill the main
  const locationInfo = document.querySelector(".today .loc-info");
  const dateInfo = document.querySelector(".today .data-info");
  const temp_c = document.querySelector(".today .temp span.c ");
  const temp_f = document.querySelector(".today .temp span.f ");
  const image = document.querySelector(".today .temp img ");
  const condition = document.querySelector(".today .temp img + span ");
  const rainChance = document.querySelector(".today span.rain-chance ");
  const wind_c = document.querySelector(".today .wind span.c");
  const wind_f = document.querySelector(".today .wind span.f");
  const visibility_c = document.querySelector(".today .visibility span.c");
  const visibility_f = document.querySelector(".today .visibility span.f");
  const humidity = document.querySelector(".today .humidity ");
  const setField = (elm, text) => {
    elm.innerHTML = "";
    elm.innerText = text;
  };
  setField(
    locationInfo,
    `${forecast.name} - ${forecast.region}. ${forecast.country}`
  );
  setField(
    dateInfo,
    String(new Date(forecast.days_forecast[day_n].date)).substring(0, 15)
  );
  const forecastDay = forecast.days_forecast[day_n].day;
  setField(temp_c, forecastDay.avgtemp_c + "°");
  setField(temp_f, forecastDay.avgtemp_f + "°");
  image.setAttribute("src", forecastDay.condition.icon);
  image.setAttribute("alt", forecastDay.condition.text);
  setField(condition, forecastDay.condition.text);
  setField(rainChance, forecastDay.daily_chance_of_rain + " %");
  setField(wind_c, forecastDay.maxwind_kph + " kph");
  setField(wind_f, forecastDay.maxwind_mph + " mph");
  setField(humidity, forecastDay.avghumidity);
  setField(visibility_c, forecastDay.avgvis_km + " km");
  setField(visibility_f, forecastDay.avgvis_miles + " miles");
  displayRightDegree();
};

const day_0 = document.querySelector("[day='0']");
const day_1 = document.querySelector("[day='1']");
const day_2 = document.querySelector("[day='2']");
const days = [day_0, day_1, day_2];
days.forEach((day) => {
  day.addEventListener("click", async (e) => {
    let ip_address = undefined;
    let ip_value = undefined;
    ip_address = await fetch("https://api.ipify.org?format=json");
    ip_address = await ip_address.json();
    ip_value = ip_address.ip;
    const forecast = await SearchField.search(ip_value);
    if (forecast) fillHourlyHorecast(e, day, forecast);
  });
});

/**
 * change degree
 */
const displayRightDegree = () => {
  const degree = document
    .querySelector(".active-degree")
    .getAttribute("degree");
  const c_spans = document.querySelectorAll(".c");
  const f_spans = document.querySelectorAll(".f");
  if (degree == "c") {
    c_spans.forEach((span) => {
      span.style.display = "inline";
    });
    f_spans.forEach((span) => {
      span.style.display = "none";
    });
  } else {
    f_spans.forEach((span) => {
      span.style.display = "inline";
    });
    c_spans.forEach((span) => {
      span.style.display = "none";
    });
  }
};
window.addEventListener("load", async (event) => {
  let ip_address = await fetch("https://api.ipify.org?format=json");
  ip_address = await ip_address.json();
  const forecast = await SearchField.search(ip_address.ip);
  if (forecast) fillHourlyHorecast(event, day_0, forecast);
});

const degreeBtn = document.querySelector(".degree");
degreeBtn.addEventListener("click", (e) => {
  const span_c = document.querySelector(".degree span[degree = 'c']");
  const span_f = document.querySelector(".degree span[degree = 'f']");
  span_c.classList.toggle("active-degree");
  span_f.classList.toggle("active-degree");
  displayRightDegree();
});

const form = document.querySelector(".search-box .search-form");
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const forecast = await SearchField.search();
  if (forecast) {
    fillHourlyHorecast(e, day_0, forecast);
  }
});
