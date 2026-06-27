// This code is used to display automatic garden activity log.
function ActivityLog({ activity }) {
  return (
    <section className="card">
      <h2>Garden Activity Log</h2>
      <p className="small-text">
        This log records important tracker actions, such as adding, watering, updating and deleting plants.
      </p>

      {activity.length === 0 ? (
        <p>No activity yet.</p>
      ) : (
        <ul className="activity-list">
          {activity.map((item) => (
            <li key={item.id}>
              <strong>{item.date}</strong>
              <span>{item.text}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default ActivityLog;
