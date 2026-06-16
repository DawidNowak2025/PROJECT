// This code is used to display plant records.
const BACKEND_URL = "http://localhost:5000";

// This code is used to show plant cards.
function PlantList({ plants, selectedZone, onEdit, onDelete, onWater, onImageClick }) {
  if (!plants || plants.length === 0) {
    return (
      <section className="card">
        <h2>Plant Records</h2>
        <p>No plants found.</p>
      </section>
    );
  }

  function statusClass(text, prefix) {
    return `${prefix}-${String(text || "").toLowerCase().replace(/\s+/g, "-")}`;
  }

  function imageUrl(path) {
    return path ? `${BACKEND_URL}${path}` : "";
  }

  return (
    <section className="card">
      <h2>Plant Records</h2>
      <p>
        Showing {plants.length} plant record(s)
        {selectedZone && selectedZone !== "All Zones" ? ` in ${selectedZone}` : ""}.
      </p>

      <div className="plant-grid">
        {plants.map((plant) => (
          <article className="plant-card" key={plant.id}>
            {plant.plantPhoto ? (
              <img
                src={imageUrl(plant.plantPhoto)}
                alt={plant.name}
                className="clickable-image"
                loading="lazy"
                onClick={() => onImageClick(imageUrl(plant.plantPhoto), `${plant.name} photo`)}
              />
            ) : (
              <div className="photo-placeholder">No Plant Photo</div>
            )}

            <div className="plant-card-content">
              <h3>{plant.name}</h3>

              <div className="badges">
                <span className="badge">{plant.type}</span>
                <span className="badge">{plant.gardenZone}</span>
                <span className={`badge ${statusClass(plant.healthStatus, "health")}`}>{plant.healthStatus}</span>
                <span className={`badge ${statusClass(plant.wateringStatus, "water")}`}>{plant.wateringStatus}</span>
              </div>

              <p><strong>Next Watering:</strong> {plant.nextWateringDate || "Not set"}</p>
              <p><strong>Location:</strong> {plant.locationDescription || "No location description"}</p>
              <p><strong>Notes:</strong> {plant.notes || "No notes added"}</p>

              <div className="plant-actions">
                <button onClick={() => onEdit(plant)}>Edit</button>
                <button onClick={() => onWater(plant.id)}>Water Today</button>
                <button className="danger-button" onClick={() => onDelete(plant.id)}>Delete</button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default PlantList;
