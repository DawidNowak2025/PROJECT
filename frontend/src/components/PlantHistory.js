// This code is used to import React state and API helper.
import { useState } from "react";
import api from "../services/api";

// This code is used to display and add plant history notes.
function PlantHistory({ plants, onHistoryAdded }) {
  const [selectedPlantId, setSelectedPlantId] = useState("");
  const [note, setNote] = useState("");

  const selectedPlant = plants.find((plant) => plant.id === Number(selectedPlantId));

  // This code is used to save a new history note.
  async function handleSubmit(event) {
    event.preventDefault();

    if (!selectedPlantId || !note.trim()) {
      return;
    }

    await api.post(`/api/plants/${selectedPlantId}/history`, { text: note });
    setNote("");
    onHistoryAdded();
  }

  return (
    <section className="card">
      <h2>Plant History Notes</h2>

      <form className="history-form" onSubmit={handleSubmit}>
        <label>
          Select Plant
          <select value={selectedPlantId} onChange={(event) => setSelectedPlantId(event.target.value)}>
            <option value="">Choose plant</option>
            {plants.map((plant) => (
              <option key={plant.id} value={plant.id}>{plant.name} - {plant.gardenZone}</option>
            ))}
          </select>
        </label>

        <label>
          Add History Note
          <input value={note} onChange={(event) => setNote(event.target.value)} placeholder="Example: leaves look bigger this week" />
        </label>

        <button type="submit">Add Note</button>
      </form>

      {selectedPlant && (
        <div className="history-list">
          <h3>History for {selectedPlant.name}</h3>
          <ul>
            {selectedPlant.history.map((item, index) => (
              <li key={index}><strong>{item.date}:</strong> {item.text}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

export default PlantHistory;
