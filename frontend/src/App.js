// This code is used to import React hooks, API helper, CSS and MVP components.
import { useEffect, useState } from "react";
import "./App.css";
import api from "./services/api";
import Navigation from "./components/Navigation";
import Dashboard from "./components/Dashboard";
import PlantForm from "./components/PlantForm";
import PlantList from "./components/PlantList";
import GardenZoneManager from "./components/GardenZoneManager";
import WateringSchedule from "./components/WateringSchedule";
import PlantHistory from "./components/PlantHistory";
import ActivityLog from "./components/ActivityLog";
import ImageModal from "./components/ImageModal";
import AuthScreen from "./components/AuthScreen";

// This code is used as the main application component for the Week 8 MVP.
function App() {
  const [activeView, setActiveView] = useState("dashboard");
  const [plants, setPlants] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [activity, setActivity] = useState([]);
  const [zones, setZones] = useState([]);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [selectedZone, setSelectedZone] = useState("All Zones");
  const [plantFilter, setPlantFilter] = useState("all");
  const [wateringFilter, setWateringFilter] = useState("all");
  const [message, setMessage] = useState("");
  const [modalImage, setModalImage] = useState({ url: "", title: "" });
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem("growUser");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    if (currentUser) {
      loadAllData();
    }
  }, [currentUser]);

  async function loadAllData() {
    try {
      const plantsResponse = await api.get("/api/plants");
      const dashboardResponse = await api.get("/api/dashboard");
      const zonesResponse = await api.get("/api/zones");
      const activityResponse = await api.get("/api/activity");

      setPlants(plantsResponse.data);
      setDashboard(dashboardResponse.data);
      setZones(zonesResponse.data);
      setActivity(activityResponse.data);
    } catch (error) {
      setMessage("Could not connect to backend. Please check if backend is running on port 5000.");
    }
  }

  function handleDashboardFilter(view, filter) {
    setActiveView(view);

    if (view === "plants") {
      setPlantFilter(filter);
    }

    if (view === "watering") {
      setWateringFilter(filter);
    }
  }

  function getFilteredPlants() {
    let result = plants;

    if (selectedZone !== "All Zones") {
      result = result.filter((plant) => plant.gardenZone === selectedZone);
    }

    if (plantFilter === "issues") {
      result = result.filter((plant) => plant.healthStatus !== "Healthy");
    }

    return result;
  }

  function handlePlantSaved() {
    setSelectedPlant(null);
    setMessage("Plant saved successfully.");
    setActiveView("plants");
    loadAllData();
  }

  function handleEditPlant(plant) {
    setSelectedPlant(plant);
    setActiveView("addplant");
  }

  async function handleDeletePlant(id) {
    const confirmDelete = window.confirm("Are you sure you want to delete this plant?");

    if (!confirmDelete) {
      return;
    }

    await api.delete(`/api/plants/${id}`);
    setMessage("Plant deleted successfully.");
    loadAllData();
  }

  async function handleWaterPlant(id) {
    await api.post(`/api/plants/${id}/water`);
    setMessage("Plant watering updated.");
    loadAllData();
  }

  function handleImageClick(url, title) {
    setModalImage({ url, title });
  }

  function handleLogout() {
    localStorage.removeItem("growUser");
    setCurrentUser(null);
  }

  if (!currentUser) {
    return <AuthScreen onLogin={setCurrentUser} />;
  }

  return (
    <div className="app">
      <header className="hero">
        <p className="tagline">Garden Resource Organisation and Watering</p>
        <h1>GROW - Garden Tracker MVP</h1>
        <p>
          A Week 8 MVP web application for plant records, image uploads, garden zones,
          watering schedules, activity history and local JSON storage.
        </p>
      </header>

      <Navigation activeView={activeView} onChangeView={setActiveView} />

      <div className="user-bar">
        <span>Logged in as <strong>{currentUser.name}</strong> ({currentUser.email})</span>
        <button onClick={handleLogout}>Logout</button>
      </div>

      {message && (
        <div className="message">
          <span>{message}</span>
          <button onClick={() => setMessage("")}>Close</button>
        </div>
      )}

      <main className="layout">
        {activeView === "dashboard" && <Dashboard dashboard={dashboard} onFilter={handleDashboardFilter} />}

        {activeView === "plants" && (
          <>
            <section className="card">
              <div className="form-actions">
                <button onClick={() => setActiveView("addplant")}>Add Plant Record</button>
                <button onClick={() => setSelectedZone("All Zones")}>Show All Zones</button>
              </div>
            </section>

            <div className="filter-row">
              <button onClick={() => setPlantFilter("all")} className={plantFilter === "all" ? "active-filter" : ""}>All Plants</button>
              <button onClick={() => setPlantFilter("issues")} className={plantFilter === "issues" ? "active-filter" : ""}>Plants With Issues</button>
            </div>

            <PlantList
              plants={getFilteredPlants()}
              selectedZone={selectedZone}
              onEdit={handleEditPlant}
              onDelete={handleDeletePlant}
              onWater={handleWaterPlant}
              onImageClick={handleImageClick}
            />
          </>
        )}

        {activeView === "addplant" && (
          <PlantForm
            selectedPlant={selectedPlant}
            zones={zones}
            onPlantSaved={handlePlantSaved}
            onCancelEdit={() => {
              setSelectedPlant(null);
              setActiveView("plants");
            }}
          />
        )}

        {activeView === "zones" && <GardenZoneManager zones={zones} onZoneAdded={loadAllData} />}

        {activeView === "watering" && (
          <>
            <div className="filter-row">
              <button onClick={() => setWateringFilter("all")} className={wateringFilter === "all" ? "active-filter" : ""}>All</button>
              <button onClick={() => setWateringFilter("today")} className={wateringFilter === "today" ? "active-filter" : ""}>Water Today</button>
              <button onClick={() => setWateringFilter("overdue")} className={wateringFilter === "overdue" ? "active-filter" : ""}>Overdue</button>
            </div>

            <WateringSchedule plants={plants} filter={wateringFilter} onWater={handleWaterPlant} />
          </>
        )}

        {activeView === "activity" && (
          <>
            <ActivityLog activity={activity} />
            <PlantHistory plants={plants} onHistoryAdded={loadAllData} />
          </>
        )}
      </main>

      <ImageModal imageUrl={modalImage.url} title={modalImage.title} onClose={() => setModalImage({ url: "", title: "" })} />

      <footer>
        <p>GROW Week 8 MVP built with React, Node.js, Express, Multer, bcrypt and local JSON storage.</p>
      </footer>
    </div>
  );
}

export default App;
