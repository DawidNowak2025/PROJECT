// This code is used to display clickable dashboard summary cards.
function Dashboard({ dashboard, plants, onFilter }) {
  if (!dashboard) {
    return <section className="card">Loading dashboard...</section>;
  }

  const overduePlants = plants.filter((plant) => plant.wateringStatus === "Overdue");
  const todayPlants = plants.filter((plant) => plant.wateringStatus === "Water Today");
  const issuePlants = plants.filter((plant) => plant.healthStatus !== "Healthy");

  return (
    <section className="page-grid">
      <div className="dashboard-grid">
        <button className="dashboard-card" onClick={() => onFilter("plants", "all")}>
          <span>Total Plants</span>
          <strong>{dashboard.totalPlants}</strong>
        </button>

        <button className="dashboard-card warning" onClick={() => onFilter("watering", "today")}>
          <span>Water Today</span>
          <strong>{dashboard.waterToday}</strong>
        </button>

        <button className="dashboard-card danger" onClick={() => onFilter("watering", "overdue")}>
          <span>Overdue Plants</span>
          <strong>{dashboard.overduePlants}</strong>
        </button>

        <button className="dashboard-card issue" onClick={() => onFilter("plants", "issues")}>
          <span>Plants With Issues</span>
          <strong>{dashboard.plantsWithIssues}</strong>
        </button>

        <button className="dashboard-card" onClick={() => onFilter("map", "zones")}>
          <span>Garden Zones Used</span>
          <strong>{dashboard.gardenZonesUsed}</strong>
        </button>
      </div>

      <section className="card">
        <h2>Quick Garden Overview</h2>
        <p>
          This dashboard gives a quick summary of watering, health status and garden zone usage.
          The cards are clickable and take the user to the matching section.
        </p>

        <div className="mini-columns">
          <div>
            <h3>Overdue</h3>
            {overduePlants.length === 0 ? <p>No overdue plants.</p> : overduePlants.map((p) => <p key={p.id}>{p.name}</p>)}
          </div>

          <div>
            <h3>Water Today</h3>
            {todayPlants.length === 0 ? <p>No plants to water today.</p> : todayPlants.map((p) => <p key={p.id}>{p.name}</p>)}
          </div>

          <div>
            <h3>Health Issues</h3>
            {issuePlants.length === 0 ? <p>No plant issues.</p> : issuePlants.map((p) => <p key={p.id}>{p.name} - {p.healthStatus}</p>)}
          </div>
        </div>
      </section>
    </section>
  );
}

export default Dashboard;
