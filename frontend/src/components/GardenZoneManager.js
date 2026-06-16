// This code is used to import React state and API helper.
import { useState } from "react";
import api from "../services/api";

// This code is used to manage garden zones.
function GardenZoneManager({ zones, onZoneAdded }) {
  const [newZone, setNewZone] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    if (!newZone.trim()) {
      setMessage("Please enter a garden zone name.");
      return;
    }

    try {
      await api.post("/api/zones", { zone: newZone });
      setNewZone("");
      setMessage("Garden zone added successfully.");
      onZoneAdded();
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not add garden zone.");
    }
  }

  return (
    <section className="card">
      <h2>Garden Zone Management</h2>
      <p className="small-text">Create and view garden zones for plant locations.</p>

      <form className="zone-form" onSubmit={handleSubmit}>
        <label>
          New Garden Zone
          <input value={newZone} onChange={(event) => setNewZone(event.target.value)} placeholder="Example: Vegetable Bed" />
        </label>
        <button type="submit">Add Garden Zone</button>
      </form>

      {message && <p className="zone-message">{message}</p>}

      <div className="zone-list">
        {zones.map((zone) => <span key={zone}>{zone}</span>)}
      </div>
    </section>
  );
}

export default GardenZoneManager;
