// This code is used to import React state and API helper.
import { useState } from "react";
import api from "../services/api";

// This code is used to allow the user to add, edit, delete and photograph custom garden zones.
function GardenZoneManager({ zones, zoneImages = {}, onZoneAdded }) {
  const [newZone, setNewZone] = useState("");
  const [editingZone, setEditingZone] = useState("");
  const [editedZone, setEditedZone] = useState("");
  const [zoneMessage, setZoneMessage] = useState("");
  const [zonePhotoFiles, setZonePhotoFiles] = useState({});

  // This code is used to submit a new garden zone to the backend.
  async function handleSubmit(event) {
    event.preventDefault();

    if (!newZone.trim()) {
      setZoneMessage("Please enter a garden zone name.");
      return;
    }

    try {
      await api.post("/api/zones", {
        zone: newZone
      });

      setNewZone("");
      setZoneMessage("Garden zone added successfully.");
      onZoneAdded();
    } catch (error) {
      setZoneMessage(error.response?.data?.message || "Could not add garden zone.");
    }
  }

  // This code is used to upload or replace the zone photo.
  async function uploadZonePhoto(zone) {
    const file = zonePhotoFiles[zone];

    if (!file) {
      setZoneMessage("Please choose a photo first.");
      return;
    }

    const data = new FormData();
    data.append("zonePhoto", file);

    try {
      await api.post(`/api/zones/${encodeURIComponent(zone)}/photo`, data);
      setZoneMessage(`Photo uploaded for ${zone}.`);
      setZonePhotoFiles((oldFiles) => ({ ...oldFiles, [zone]: null }));
      onZoneAdded();
    } catch (error) {
      setZoneMessage(error.response?.data?.message || "Could not upload zone photo.");
    }
  }

  // This code is used to start editing a garden zone.
  function startEdit(zone) {
    setEditingZone(zone);
    setEditedZone(zone);
    setZoneMessage("");
  }

  // This code is used to save the edited garden zone name.
  async function saveEdit() {
    if (!editedZone.trim()) {
      setZoneMessage("Garden zone name cannot be empty.");
      return;
    }

    try {
      await api.put(`/api/zones/${encodeURIComponent(editingZone)}`, {
        zone: editedZone
      });

      setEditingZone("");
      setEditedZone("");
      setZoneMessage("Garden zone updated successfully.");
      onZoneAdded();
    } catch (error) {
      setZoneMessage(error.response?.data?.message || "Could not update garden zone.");
    }
  }

  // This code is used to delete an unused garden zone.
  async function deleteZone(zone) {
    const confirmDelete = window.confirm(`Delete garden zone "${zone}"? It cannot be deleted if plants are using it.`);

    if (!confirmDelete) {
      return;
    }

    try {
      await api.delete(`/api/zones/${encodeURIComponent(zone)}`);
      setZoneMessage("Garden zone deleted successfully.");
      onZoneAdded();
    } catch (error) {
      setZoneMessage(error.response?.data?.message || "Could not delete garden zone.");
    }
  }

  return (
    <section className="card">
      <h2>Manage Garden Zones</h2>
      <p className="small-text">
        Add/edit garden areas and upload a real garden photo for each zone.
      </p>

      <form className="zone-form" onSubmit={handleSubmit}>
        <label>
          New Garden Zone
          <input
            value={newZone}
            onChange={(event) => setNewZone(event.target.value)}
            placeholder="Example: Vegetable Bed"
          />
        </label>

        <button type="submit">Add Garden Zone</button>
      </form>

      {zoneMessage && <p className="zone-message">{zoneMessage}</p>}

      <div className="manager-list">
        {zones.map((zone) => (
          <div className="manager-row zone-manager-photo-row" key={zone}>
            {editingZone === zone ? (
              <>
                <input value={editedZone} onChange={(event) => setEditedZone(event.target.value)} />
                <button onClick={saveEdit}>Save</button>
                <button className="secondary-button" onClick={() => setEditingZone("")}>Cancel</button>
              </>
            ) : (
              <>
                <div className="zone-manager-info">
                  <strong>{zone}</strong>
                  {zoneImages[zone] ? (
                    <img src={`http://localhost:5000${zoneImages[zone]}`} alt={zone} />
                  ) : (
                    <span className="small-text">No garden photo uploaded yet.</span>
                  )}
                </div>

                <div className="zone-upload-controls">
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,.heic,.heif"
                    onChange={(event) =>
                      setZonePhotoFiles((oldFiles) => ({
                        ...oldFiles,
                        [zone]: event.target.files[0]
                      }))
                    }
                  />
                  <button type="button" onClick={() => uploadZonePhoto(zone)}>Upload Photo</button>
                </div>

                <div className="zone-action-buttons">
                  <button className="secondary-button" onClick={() => startEdit(zone)}>Edit</button>
                  <button className="danger-button" onClick={() => deleteZone(zone)}>Delete</button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export default GardenZoneManager;
