// This code is used to display watering schedule information.
function WateringSchedule({ plants, filter, onWater }) {
  let filteredPlants = plants;

  if (filter === "today") {
    filteredPlants = plants.filter((plant) => plant.wateringStatus === "Water Today");
  }

  if (filter === "overdue") {
    filteredPlants = plants.filter((plant) => plant.wateringStatus === "Overdue");
  }

  return (
    <section className="card">
      <h2>Watering Schedule</h2>
      <p>Showing {filteredPlants.length} watering record(s).</p>

      <div className="plant-grid">
        {filteredPlants.map((plant) => (
          <article className="plant-card" key={plant.id}>
            <div className="plant-card-content">
              <h3>{plant.name}</h3>
              <p><strong>Garden Zone:</strong> {plant.gardenZone}</p>
              <p><strong>Last Watered:</strong> {plant.lastWatered || "Not set"}</p>
              <p><strong>Frequency:</strong> Every {plant.wateringFrequency || "?"} day(s)</p>
              <p><strong>Next Watering:</strong> {plant.nextWateringDate || "Not set"}</p>
              <p><strong>Status:</strong> {plant.wateringStatus}</p>
              <button onClick={() => onWater(plant.id)}>Water Today</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default WateringSchedule;
