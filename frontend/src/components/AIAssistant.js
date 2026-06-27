// This code is used to import React state and API helper.
import { useState } from "react";
import api from "../services/api";

// This code is used to display rule-based AI-style plant care advice.
function AIAssistant({ plants }) {
  const [selectedPlantId, setSelectedPlantId] = useState("");
  const [singleAdvice, setSingleAdvice] = useState(null);
  const [allAdvice, setAllAdvice] = useState([]);
  const [message, setMessage] = useState("");

  // This code is used to get advice for one selected plant.
  async function getSingleAdvice(event) {
    event.preventDefault();

    if (!selectedPlantId) {
      setMessage("Please select a plant.");
      return;
    }

    try {
      const response = await api.get(`/api/assistant/plant/${selectedPlantId}`);
      setSingleAdvice(response.data);
      setAllAdvice([]);
      setMessage("");
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not get AI assistant advice.");
    }
  }

  // This code is used to get advice for all plants.
  async function getAllAdvice() {
    try {
      const response = await api.get("/api/assistant/all");
      setAllAdvice(response.data);
      setSingleAdvice(null);
      setMessage("");
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not get AI assistant advice.");
    }
  }

  return (
    <section className="page-grid">
      <section className="card">
        <h2>AI Plant Care Assistant</h2>
        <p className="small-text">
          This assistant uses rule-based AI-style logic to analyse watering status, health status and plant notes.
        </p>

        <form className="api-search-form" onSubmit={getSingleAdvice}>
          <label>
            Select Plant
            <select value={selectedPlantId} onChange={(event) => setSelectedPlantId(event.target.value)}>
              <option value="">Choose plant</option>
              {plants.map((plant) => (
                <option key={plant.id} value={plant.id}>
                  {plant.name} - {plant.gardenZone}
                </option>
              ))}
            </select>
          </label>

          <button type="submit">Get Smart Advice</button>
        </form>

        <button type="button" className="secondary-button" onClick={getAllAdvice}>
          Get Advice For All Plants
        </button>

        {message && <p className="zone-message">{message}</p>}
      </section>

      {singleAdvice && (
        <section className="card">
          <h2>{singleAdvice.plantName}</h2>
          <p><strong>Priority:</strong> {singleAdvice.priority}</p>
          <p><strong>Garden Zone:</strong> {singleAdvice.gardenZone}</p>
          <p><strong>Plant Type:</strong> {singleAdvice.plantType}</p>
          <p><strong>Advice:</strong> {singleAdvice.advice}</p>
          <p><strong>Next Action:</strong> {singleAdvice.nextAction}</p>
          <p><strong>Reason:</strong> {singleAdvice.reason}</p>
        </section>
      )}

      {allAdvice.length > 0 && (
        <section className="card">
          <h2>Smart Priority List</h2>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Plant</th>
                  <th>Zone</th>
                  <th>Priority</th>
                  <th>Health</th>
                  <th>Watering</th>
                  <th>Next Action</th>
                </tr>
              </thead>

              <tbody>
                {allAdvice.map((item) => (
                  <tr key={item.plantId}>
                    <td>{item.plantName}</td>
                    <td>{item.gardenZone}</td>
                    <td>{item.priority}</td>
                    <td>{item.healthStatus}</td>
                    <td>{item.wateringStatus}</td>
                    <td>{item.nextAction}</td>
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

export default AIAssistant;
