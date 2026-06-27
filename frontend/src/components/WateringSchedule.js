// This code is used to display watering tracker table.
function WateringSchedule({ plants, filter, onWater }) {
  let filteredPlants = plants;

  if (filter === "today") {
    filteredPlants = plants.filter((plant) => plant.wateringStatus === "Water Today");
  }

  if (filter === "overdue") {
    filteredPlants = plants.filter((plant) => plant.wateringStatus === "Overdue");
  }

  const sortedPlants = [...filteredPlants].sort((a, b) => {
    if (!a.nextWateringDate) return 1;
    if (!b.nextWateringDate) return -1;
    return a.nextWateringDate.localeCompare(b.nextWateringDate);
  });

  return (
    <section className="card">
      <h2>Watering Tracker</h2>
      <p className="small-text">Current filter: {filter === "all" ? "All watering records" : filter}</p>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Plant</th>
              <th>Zone</th>
              <th>Last Watered</th>
              <th>Every</th>
              <th>Next Watering</th>
              <th>Status</th>
              <th>Health</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {sortedPlants.map((plant) => (
              <tr key={plant.id}>
                <td>{plant.name}</td>
                <td>{plant.gardenZone}</td>
                <td>{plant.lastWatered || "Not set"}</td>
                <td>{plant.wateringFrequency} days</td>
                <td>{plant.nextWateringDate || "Not set"}</td>
                <td>{plant.wateringStatus}</td>
                <td>{plant.healthStatus}</td>
                <td><button onClick={() => onWater(plant.id)}>Water Today</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default WateringSchedule;
