// This code is used to import React hooks, API helper, CSS and components.
import { useEffect, useState } from "react";
import "./App.css";
import api from "./services/api";
import Navigation from "./components/Navigation";
import Dashboard from "./components/Dashboard";
import PlantForm from "./components/PlantForm";
import PlantList from "./components/PlantList";
import GardenMap from "./components/GardenMap";
import WateringSchedule from "./components/WateringSchedule";
import PlantHistory from "./components/PlantHistory";
import ActivityLog from "./components/ActivityLog";
import PlantApiSearch from "./components/PlantApiSearch";
import AIAssistant from "./components/AIAssistant";
import ImageModal from "./components/ImageModal";
import AuthScreen from "./components/AuthScreen";
import SettingsPanel from "./components/SettingsPanel";

// This code is used as the main application component.
function App() {
  const [activeView, setActiveView] = useState("dashboard");
  const [plants, setPlants] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [activity, setActivity] = useState([]);
  const [zones, setZones] = useState([]);
  const [plantTypes, setPlantTypes] = useState([]);
  const [zoneImages, setZoneImages] = useState({});
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [selectedZone, setSelectedZone] = useState("All Zones");
  const [plantFilter, setPlantFilter] = useState("all");
  const [plantSearch, setPlantSearch] = useState("");
  const [wateringFilter, setWateringFilter] = useState("all");
  const [message, setMessage] = useState("");
  const [modalImage, setModalImage] = useState({ url: "", title: "" });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem("growUser");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // This code is used to load data when the application starts.
  useEffect(() => {
    if (currentUser) {
      loadAllData();
    }
  }, [currentUser]);

  // This code is used to load plants, dashboard, zones, zone photos, plant types and activity log.
  async function loadAllData() {
    try {
      const plantsResponse = await api.get("/api/plants");
      const dashboardResponse = await api.get("/api/dashboard");
      const zonesResponse = await api.get("/api/zones");
      const plantTypesResponse = await api.get("/api/plant-types");
      const zoneImagesResponse = await api.get("/api/zone-images");
      const activityResponse = await api.get("/api/activity");

      setPlants(plantsResponse.data);
      setDashboard(dashboardResponse.data);
      setZones(zonesResponse.data);
      setPlantTypes(plantTypesResponse.data);
      setZoneImages(zoneImagesResponse.data);
      setActivity(activityResponse.data);
    } catch (error) {
      setMessage("Could not connect to backend. Please check if backend is running on port 5000.");
    }
  }

  // This code is used to change view from dashboard cards.
  function handleDashboardFilter(view, filter) {
    setActiveView(view);

    if (view === "plants") {
      setPlantFilter(filter);
    }

    if (view === "watering") {
      setWateringFilter(filter);
    }

    if (view === "map") {
      setSelectedZone("All Zones");
    }
  }

  // This code is used to filter plants for plant list view.
  function getFilteredPlants() {
    let result = plants;

    if (selectedZone !== "All Zones") {
      result = result.filter((plant) => plant.gardenZone === selectedZone);
    }

    if (plantFilter === "issues") {
      result = result.filter((plant) => plant.healthStatus !== "Healthy");
    }

    if (plantSearch.trim()) {
      const searchValue = plantSearch.toLowerCase();

      result = result.filter((plant) => {
        return (
          plant.name.toLowerCase().includes(searchValue) ||
          String(plant.type || "").toLowerCase().includes(searchValue) ||
          String(plant.gardenZone || "").toLowerCase().includes(searchValue) ||
          String(plant.healthStatus || "").toLowerCase().includes(searchValue)
        );
      });
    }

    return result;
  }

  // This code is used after a plant is saved.
  function handlePlantSaved() {
    setSelectedPlant(null);
    setMessage("Plant saved successfully.");
    setActiveView("plants");
    loadAllData();
  }

  // This code is used to open empty add plant form.
  function handleAddNewPlant() {
    setSelectedPlant(null);
    setActiveView("addplant");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // This code is used to select a plant for editing and move to Add Plant Record view.
  function handleEditPlant(plant) {
    setSelectedPlant(plant);
    setActiveView("addplant");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // This code is used to delete a plant.
  async function handleDeletePlant(id) {
    const confirmDelete = window.confirm("Are you sure you want to delete this plant?");

    if (!confirmDelete) {
      return;
    }

    await api.delete(`/api/plants/${id}`);
    setMessage("Plant deleted successfully.");
    loadAllData();
  }

  // This code is used to mark a plant as watered today.
  async function handleWaterPlant(id) {
    await api.post(`/api/plants/${id}/water`);

    if (wateringFilter === "today") {
      setWateringFilter("all");
      setMessage("Plant was watered. It moved from Water Today to All because it is no longer due today.");
    } else {
      setMessage("Plant watering updated.");
    }

    loadAllData();
  }

  // This code is used to select a garden zone and move to Plants view.
  function handleSelectZone(zone) {
    setSelectedZone(zone);
    setPlantFilter("all");
    setActiveView("plants");
  }

  // This code is used to open the full-screen image modal.
  function handleImageClick(url, title) {
    setModalImage({ url, title });
  }

  // This code is used to log out the current local user.
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
        <h1>GROW - Garden Tracker</h1>
        <p>
          A multi-view garden tracking system for plant records, visual location tracking,
          watering schedules, garden zones, health monitoring and activity history.
        </p>
      </header>

      <div className="top-navigation-row">
        <Navigation activeView={activeView} onChangeView={setActiveView} />

        <button className="settings-menu-button" onClick={() => setSettingsOpen(true)}>
          ☰ Manage
        </button>
      </div>

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
        {activeView === "dashboard" && (
          <Dashboard dashboard={dashboard} plants={plants} onFilter={handleDashboardFilter} />
        )}

        {activeView === "plants" && (
          <>
            <section className="card">
              <div className="section-title-row">
                <div>
                  <h2>Plants</h2>
                  <p className="small-text">
                    Search and manage plant records without showing the add form on this page.
                  </p>
                </div>

                <button onClick={handleAddNewPlant}>Add Plant Record</button>
              </div>

              <label className="search-box">
                Search Plants
                <input
                  value={plantSearch}
                  onChange={(event) => setPlantSearch(event.target.value)}
                  placeholder="Search by name, type, zone or health status"
                />
              </label>
            </section>

            <div className="filter-row">
              <button onClick={() => setPlantFilter("all")} className={plantFilter === "all" ? "active-filter" : ""}>All Plants</button>
              <button onClick={() => setPlantFilter("issues")} className={plantFilter === "issues" ? "active-filter" : ""}>Plants With Issues</button>
              <button onClick={() => setSelectedZone("All Zones")} className={selectedZone === "All Zones" ? "active-filter" : ""}>All Zones</button>
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
            plantTypes={plantTypes}
            zoneImages={zoneImages}
            onPlantSaved={handlePlantSaved}
            onCancelEdit={() => {
              setSelectedPlant(null);
              setActiveView("plants");
            }}
          />
        )}

        {activeView === "map" && (
          <>
            <GardenMap
              zones={zones}
              plants={plants}
              zoneImages={zoneImages}
              selectedZone={selectedZone}
              onSelectZone={handleSelectZone}
              onEditPlant={handleEditPlant}
            />

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

        {activeView === "assistant" && (
          <AIAssistant plants={plants} />
        )}

        {activeView === "plantapi" && (
          <PlantApiSearch />
        )}

        {activeView === "activity" && (
          <>
            <ActivityLog activity={activity} />
            <PlantHistory plants={plants} onHistoryAdded={loadAllData} />
          </>
        )}
      </main>

      <SettingsPanel
        isOpen={settingsOpen}
        zones={zones}
        zoneImages={zoneImages}
        plantTypes={plantTypes}
        onClose={() => setSettingsOpen(false)}
        onDataChanged={loadAllData}
      />

      <ImageModal
        imageUrl={modalImage.url}
        title={modalImage.title}
        onClose={() => setModalImage({ url: "", title: "" })}
      />

      <footer>
        <p>GROW project built with React, Node.js, Express, Axios, Multer and local JSON storage.</p>
      </footer>
    </div>
  );
}

export default App;
