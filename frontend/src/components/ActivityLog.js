// This code is used to display activity history.
function ActivityLog({ activity }) {
  return (
    <section className="card">
      <h2>Activity Log</h2>
      <p className="small-text">This section records plant updates, watering actions and garden changes.</p>

      <ul className="activity-list">
        {activity.map((item) => (
          <li key={item.id}>
            <strong>{item.date}</strong>
            <span>{item.text}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default ActivityLog;
