// This code is used to display the main navigation tabs.
function Navigation({ activeView, onChangeView }) {
  const views = [
    { id: "dashboard", label: "Dashboard" },
    { id: "plants", label: "Plants" },
    { id: "map", label: "Garden Map" },
    { id: "watering", label: "Watering" },
    { id: "assistant", label: "AI Assistant" },
    { id: "plantapi", label: "Plant Knowledge" },
    { id: "activity", label: "Activity Log" },
    { id: "addplant", label: "Add Plant Record" }
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
