// This code is used to display plant records in a faster card list.
import { useState } from "react";

// This code is used as the backend image URL.
const BACKEND_URL = "http://localhost:5000";

// This code is used to display plant cards and open full details only when needed.
function PlantList({ plants, selectedZone, onEdit, onDelete, onWater, onImageClick }) {
  const [detailsPlant, setDetailsPlant] = useState(null);

  // This code is used to show readable text when no plants match filters.
  if (!plants || plants.length === 0) {
    return (
      <section className="card">
        <h2>Plant Records</h2>
        <p>No plants found for this view.</p>
      </section>
    );
  }

  // This code is used to create safe CSS class names for status badges.
  function makeStatusClass(text, prefix) {
    return `${prefix}-${String(text || "").toLowerCase().replace(/\s+/g, "-")}`;
  }

  // This code is used to create the full image URL.
  function getImageUrl(path) {
    if (!path) {
      return "";
    }

    return `${BACKEND_URL}${path}`;
  }

  return (
    <section className="card">
      <div className="section-title-row">
        <div>
          <h2>Plant Records</h2>
          <p>
            Showing {plants.length} plant record(s)
            {selectedZone && selectedZone !== "All Zones" ? ` in ${selectedZone}` : ""}.
          </p>
        </div>
      </div>

      <div className="plant-grid">
        {plants.map((plant) => (
          <article className="plant-card compact-plant-card" key={plant.id}>
            <div className="single-photo-row">
              {plant.plantPhoto ? (
                <img
                  src={getImageUrl(plant.plantPhoto)}
                  alt={plant.name}
                  className="clickable-image"
                  loading="lazy"
                  onClick={() => onImageClick(getImageUrl(plant.plantPhoto), `${plant.name} plant photo`)}
                />
              ) : (
                <div className="photo-placeholder">No Plant Photo</div>
              )}
            </div>

            <div className="plant-card-content">
              <h3>{plant.name}</h3>

              <div className="badges">
                <span className="badge">{plant.type}</span>
                <span className="badge">{plant.gardenZone}</span>
                <span className={`badge ${makeStatusClass(plant.healthStatus, "health")}`}>
                  {plant.healthStatus}
                </span>
                <span className={`badge ${makeStatusClass(plant.wateringStatus, "water")}`}>
                  {plant.wateringStatus}
                </span>
              </div>

              <p><strong>Next Watering:</strong> {plant.nextWateringDate || "Not set"}</p>
              <p><strong>Location:</strong> {plant.locationDescription || "No exact location description"}</p>

              <div className="plant-actions">
                <button onClick={() => setDetailsPlant(plant)}>View Details</button>
                <button onClick={() => onEdit(plant)}>Edit</button>
                <button onClick={() => onWater(plant.id)}>Water Today</button>
                <button className="danger-button" onClick={() => onDelete(plant.id)}>Delete</button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {detailsPlant && (
        <div className="details-overlay">
          <div className="details-modal">
            <div className="details-header">
              <div>
                <p className="tagline">Plant Details</p>
                <h2>{detailsPlant.name}</h2>
              </div>

              <button className="modal-close-button" onClick={() => setDetailsPlant(null)}>
                Close
              </button>
            </div>

            <div className="details-photo-grid">
              <div>
                <h3>Plant Photo</h3>
                {detailsPlant.plantPhoto ? (
                  <img
                    src={getImageUrl(detailsPlant.plantPhoto)}
                    alt={`${detailsPlant.name} plant`}
                    loading="lazy"
                    onClick={() => onImageClick(getImageUrl(detailsPlant.plantPhoto), `${detailsPlant.name} plant photo`)}
                  />
                ) : (
                  <div className="photo-placeholder">No Plant Photo</div>
                )}
              </div>

              <div>
                <h3>Location Photo</h3>
                {detailsPlant.locationPhoto ? (
                  <img
                    src={getImageUrl(detailsPlant.locationPhoto)}
                    alt={`${detailsPlant.name} location`}
                    loading="lazy"
                    onClick={() => onImageClick(getImageUrl(detailsPlant.locationPhoto), `${detailsPlant.name} location photo`)}
                  />
                ) : (
                  <div className="photo-placeholder">No Location Photo</div>
                )}
              </div>
            </div>

            <div className="details-info-grid">
              <p><strong>Type:</strong> {detailsPlant.type}</p>
              <p><strong>Garden Zone:</strong> {detailsPlant.gardenZone}</p>
              <p><strong>Planted Date:</strong> {detailsPlant.plantedDate || "Not set"}</p>
              <p><strong>Last Watered:</strong> {detailsPlant.lastWatered || "Not set"}</p>
              <p><strong>Watering Frequency:</strong> {detailsPlant.wateringFrequency || "Not set"} day(s)</p>
              <p><strong>Next Watering:</strong> {detailsPlant.nextWateringDate || "Not set"}</p>
              <p><strong>Health:</strong> {detailsPlant.healthStatus}</p>
              <p><strong>Watering Status:</strong> {detailsPlant.wateringStatus}</p>
            </div>

            <div className="details-notes">
              <h3>Location Description</h3>
              <p>{detailsPlant.locationDescription || "No exact location description."}</p>

              <h3>Notes</h3>
              <p>{detailsPlant.notes || "No notes added."}</p>
            </div>

            {detailsPlant.history && detailsPlant.history.length > 0 && (
              <div className="details-history">
                <h3>Plant History</h3>
                <ul>
                  {detailsPlant.history.map((item, index) => (
                    <li key={`${detailsPlant.id}-${index}`}>
                      <strong>{item.date}:</strong> {item.text}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="plant-actions">
              <button onClick={() => onEdit(detailsPlant)}>Edit Plant</button>
              <button onClick={() => onWater(detailsPlant.id)}>Water Today</button>
              <button className="danger-button" onClick={() => onDelete(detailsPlant.id)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default PlantList;
