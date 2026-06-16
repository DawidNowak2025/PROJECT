// This code is used to display the Week 8 MVP navigation tabs.
function Navigation({ activeView, onChangeView }) {
  const views = [
    { id: "dashboard", label: "Dashboard" },
    { id: "plants", label: "Plants" },
    { id: "addplant", label: "Add Plant Record" },
    { id: "zones", label: "Garden Zones" },
    { id: "watering", label: "Watering" },
    { id: "activity", label: "Activity Log" }
  ];

  return (
    <nav className="nav-tabs">
      {views.map((view) => (
        <button
          key={view.id}
          className={activeView === view.id ? "active-tab" : ""}
          onClick={() => onChangeView(view.id)}
        >
          {view.label}
        </button>
      ))}
    </nav>
  );
}

export default Navigation;
