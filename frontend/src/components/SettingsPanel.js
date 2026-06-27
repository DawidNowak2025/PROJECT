// This code is used to import React state and management components for the side settings panel.
import { useState } from "react";
import api from "../services/api";
import GardenZoneManager from "./GardenZoneManager";
import PlantTypeManager from "./PlantTypeManager";

// This code is used to display the management menu away from the main tabs.
function SettingsPanel({ isOpen, zones, zoneImages, plantTypes, onClose, onDataChanged }) {
  const [backupFile, setBackupFile] = useState(null);
  const [backupMessage, setBackupMessage] = useState("");

  if (!isOpen) {
    return null;
  }

  // This code is used to download a JSON backup from the backend.
  function exportData() {
    window.open("http://localhost:5000/api/export-data", "_blank");
  }

  // This code is used to upload a JSON backup and restore local data.
  async function importData(event) {
    event.preventDefault();

    if (!backupFile) {
      setBackupMessage("Please choose a JSON backup file first.");
      return;
    }

    const confirmRestore = window.confirm(
      "This will replace current local plants, zones, plant types and activity log with data from the backup. Continue?"
    );

    if (!confirmRestore) {
      return;
    }

    const data = new FormData();
    data.append("backupFile", backupFile);

    try {
      await api.post("/api/import-data", data);
      setBackupFile(null);
      setBackupMessage("Backup restored successfully. Data refreshed.");
      onDataChanged();
    } catch (error) {
      setBackupMessage(error.response?.data?.message || "Could not restore backup.");
    }
  }

  return (
    <div className="settings-overlay">
      <aside className="settings-panel">
        <div className="settings-panel-header">
          <div>
            <p className="tagline">Application Management</p>
            <h2>Manage Garden Settings</h2>
          </div>

          <button className="modal-close-button" onClick={onClose}>
            Close
          </button>
        </div>

        <section className="card">
          <h2>Backup Data</h2>
          <p className="small-text">
            Export or restore a JSON backup with plants, garden zones, plant types, activity log and zone image paths.
          </p>

          <div className="backup-actions">
            <button onClick={exportData}>Export JSON Backup</button>

            <form onSubmit={importData} className="restore-form">
              <label>
                Restore from JSON Backup
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={(event) => setBackupFile(event.target.files[0])}
                />
              </label>

              <button type="submit" className="secondary-button">
                Restore JSON Backup
              </button>
            </form>
          </div>

          {backupMessage && <p className="zone-message">{backupMessage}</p>}
        </section>

        <div className="settings-panel-content">
          <PlantTypeManager
            plantTypes={plantTypes}
            onPlantTypesChanged={onDataChanged}
          />

          <GardenZoneManager
            zones={zones}
            zoneImages={zoneImages}
            onZoneAdded={onDataChanged}
          />
        </div>
      </aside>
    </div>
  );
}

export default SettingsPanel;
