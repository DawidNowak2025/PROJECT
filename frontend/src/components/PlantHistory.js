// This code is used to import React state and API helper.
import { useState } from "react";
import api from "../services/api";

// This code is used to add notes to plant history.
function PlantHistory({ plants, onHistoryAdded }) {
  const [plantId, setPlantId] = useState("");
  const [text, setText] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    if (!plantId || !text.trim()) {
      return;
    }

    await api.post(`/api/plants/${plantId}/history`, { text });
    setText("");
    onHistoryAdded();
  }

  return (
    <section className="card">
      <h2>Plant History Note</h2>

      <form className="history-form" onSubmit={handleSubmit}>
        <label>
          Plant
          <select value={plantId} onChange={(event) => setPlantId(event.target.value)}>
            <option value="">Select Plant</option>
            {plants.map((plant) => <option key={plant.id} value={plant.id}>{plant.name}</option>)}
          </select>
        </label>

        <label>
          Note
          <input value={text} onChange={(event) => setText(event.target.value)} placeholder="Example: Plant watered and checked" />
        </label>

        <button type="submit">Add History Note</button>
      </form>
    </section>
  );
}

export default PlantHistory;
