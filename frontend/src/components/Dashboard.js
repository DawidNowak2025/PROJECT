// This code is used to display dashboard statistics.
function Dashboard({ dashboard, onFilter }) {
  if (!dashboard) {
    return <section className="card"><p>Loading dashboard...</p></section>;
  }

  return (
    <section>
      <div className="dashboard-grid">
        <button className="dashboard-card" onClick={() => onFilter("plants", "all")}><span>Total Plants</span><strong>{dashboard.totalPlants}</strong></button>
        <button className="dashboard-card warning" onClick={() => onFilter("watering", "today")}><span>Water Today</span><strong>{dashboard.waterToday}</strong></button>
        <button className="dashboard-card danger" onClick={() => onFilter("watering", "overdue")}><span>Overdue</span><strong>{dashboard.overduePlants}</strong></button>
        <button className="dashboard-card issue" onClick={() => onFilter("plants", "issues")}><span>Plants With Issues</span><strong>{dashboard.plantsWithIssues}</strong></button>
        <button className="dashboard-card" onClick={() => onFilter("zones", "all")}><span>Garden Zones Used</span><strong>{dashboard.gardenZonesUsed}</strong></button>
      </div>
    </section>
  );
}

export default Dashboard;
