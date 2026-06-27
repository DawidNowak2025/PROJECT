// This code is used to import React state and API helper.
import { useState } from "react";
import api from "../services/api";

// This code is used to show weather-based watering advice using OpenWeather API through the backend.
function WeatherAdvice() {
  const [city, setCity] = useState("Dublin");
  const [weather, setWeather] = useState(null);
  const [advice, setAdvice] = useState([]);
  const [message, setMessage] = useState("");

  // This code is used to load weather and watering advice from the backend.
  async function handleCheckWeather(event) {
    event.preventDefault();

    try {
      setMessage("Loading weather advice...");
      const weatherResponse = await api.get("/api/weather/current", {
        params: { city }
      });

      const adviceResponse = await api.get("/api/weather/watering-advice", {
        params: { city }
      });

      setWeather(weatherResponse.data);
      setAdvice(adviceResponse.data.advice);
      setMessage("");
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not load weather advice.");
    }
  }

  return (
    <section className="page-grid">
      <section className="card">
        <h2>Weather-Based Watering Advice</h2>
        <p className="small-text">
          This section uses OpenWeather API and local plant data to create simple watering recommendations.
        </p>

        <form className="api-search-form" onSubmit={handleCheckWeather}>
          <label>
            City
            <input
              value={city}
              onChange={(event) => setCity(event.target.value)}
              placeholder="Example: Dublin"
            />
          </label>

          <button type="submit">Check Weather Advice</button>
        </form>

        {message && <p className="zone-message">{message}</p>}
      </section>

      {weather && (
        <section className="card">
          <h2>Current Weather</h2>

          <div className="weather-summary">
            <div>
              <strong>{weather.city}, {weather.country}</strong>
              <p>{weather.description}</p>
            </div>

            <div>
              <strong>{weather.temperature}°C</strong>
              <p>Temperature</p>
            </div>

            <div>
              <strong>{weather.humidity}%</strong>
              <p>Humidity</p>
            </div>

            <div>
              <strong>{weather.rain} mm</strong>
              <p>Rain</p>
            </div>
          </div>

          <div className="recommendation-box">
            <strong>Weather Recommendation</strong>
            <p>{weather.wateringAdvice}</p>
          </div>
        </section>
      )}

      {advice.length > 0 && (
        <section className="card">
          <h2>Smart Watering Priority List</h2>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Plant</th>
                  <th>Zone</th>
                  <th>Status</th>
                  <th>Health</th>
                  <th>Priority</th>
                  <th>Recommendation</th>
                </tr>
              </thead>

              <tbody>
                {advice.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.gardenZone}</td>
                    <td>{item.wateringStatus}</td>
                    <td>{item.healthStatus}</td>
                    <td>{item.priority}</td>
                    <td>{item.recommendation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </section>
  );
}

export default WeatherAdvice;
