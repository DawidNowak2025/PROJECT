// This code is used to display an interactive photo-based garden map.
function GardenMap({ zones, plants, zoneImages = {}, selectedZone, onSelectZone, onEditPlant }) {
  const visibleZones = selectedZone === "All Zones" ? zones : zones.filter((zone) => zone === selectedZone);

  // This code is used to choose pin colour by plant status.
  function getPinClass(plant) {
    if (plant.wateringStatus === "Overdue" || plant.healthStatus !== "Healthy") {
      return "plant-map-pin danger-pin";
    }

    if (plant.wateringStatus === "Water Today") {
      return "plant-map-pin warning-pin";
    }

    return "plant-map-pin healthy-pin";
  }

  return (
    <section className="card">
      <div className="section-title-row">
        <div>
          <h2>Photo Garden Map</h2>
          <p>
            Upload a photo for each garden zone, then place plant pins on the photo when adding or editing plants.
          </p>
        </div>

        <button className="secondary-button" onClick={() => onSelectZone("All Zones")}>
          Show All Zones
        </button>
      </div>

      <div className="photo-map-grid">
        {visibleZones.map((zone) => {
          const plantsInZone = plants.filter((plant) => plant.gardenZone === zone);
          const zoneImage = zoneImages[zone];

          return (
            <article key={zone} className={selectedZone === zone ? "photo-map-zone active-photo-map-zone" : "photo-map-zone"}>
              <div className="photo-map-header">
                <button type="button" onClick={() => onSelectZone(zone)}>
                  {zone}
                </button>
                <span>{plantsInZone.length} plant(s)</span>
              </div>

              <div className="photo-map-image-wrap">
                {zoneImage ? (
                  <img src={`http://localhost:5000${zoneImage}`} alt={zone} />
                ) : (
                  <div className="photo-map-placeholder">
                    Upload a garden photo for this zone
                  </div>
                )}

                {zoneImage &&
                  plantsInZone
                    .filter((plant) => plant.markerX && plant.markerY)
                    .map((plant) => (
                      <button
                        key={plant.id}
                        type="button"
                        className={getPinClass(plant)}
                        style={{ left: `${plant.markerX}%`, top: `${plant.markerY}%` }}
                        title={`${plant.name} - ${plant.wateringStatus}`}
                        onClick={() => onEditPlant(plant)}
                      >
                        {plant.name.charAt(0).toUpperCase()}
                      </button>
                    ))}
              </div>

              {plantsInZone.length > 0 && (
                <div className="photo-map-plant-list">
                  {plantsInZone.map((plant) => (
                    <button key={plant.id} type="button" onClick={() => onEditPlant(plant)}>
                      {plant.name} - {plant.wateringStatus}
                    </button>
                  ))}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default GardenMap;
