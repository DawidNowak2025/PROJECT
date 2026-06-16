// This code is used to import React hooks and API helper.
import { useEffect, useState } from "react";
import api from "../services/api";

// This code is used to display the add/edit plant form.
function PlantForm({ selectedPlant, zones, onPlantSaved, onCancelEdit }) {
  const [formData, setFormData] = useState({
    name: "",
    type: "Vegetable",
    gardenZone: "",
    locationDescription: "",
    plantedDate: "",
    lastWatered: "",
    wateringFrequency: "",
    healthStatus: "Healthy",
    notes: ""
  });
  const [plantPhoto, setPlantPhoto] = useState(null);

  useEffect(() => {
    if (!selectedPlant && zones.length > 0) {
      setFormData((oldData) => ({ ...oldData, gardenZone: oldData.gardenZone || zones[0] }));
    }
  }, [zones, selectedPlant]);

  useEffect(() => {
    if (selectedPlant) {
      setFormData({
        name: selectedPlant.name || "",
        type: selectedPlant.type || "Vegetable",
        gardenZone: selectedPlant.gardenZone || zones[0] || "",
        locationDescription: selectedPlant.locationDescription || "",
        plantedDate: selectedPlant.plantedDate || "",
        lastWatered: selectedPlant.lastWatered || "",
        wateringFrequency: selectedPlant.wateringFrequency || "",
        healthStatus: selectedPlant.healthStatus || "Healthy",
        notes: selectedPlant.notes || ""
      });
    }
  }, [selectedPlant, zones]);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((oldData) => ({ ...oldData, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const data = new FormData();
    Object.keys(formData).forEach((key) => data.append(key, formData[key]));

    if (plantPhoto) {
      data.append("plantPhoto", plantPhoto);
    }

    if (selectedPlant) {
      await api.put(`/api/plants/${selectedPlant.id}`, data);
    } else {
      await api.post("/api/plants", data);
    }

    onPlantSaved();
  }

  return (
    <section className="card">
      <h2>{selectedPlant ? "Edit Plant Record" : "Add Plant Record"}</h2>

      <form className="plant-form" onSubmit={handleSubmit}>
        <label>
          Plant Name
          <input name="name" value={formData.name} onChange={handleChange} required />
        </label>

        <label>
          Plant Type
          <select name="type" value={formData.type} onChange={handleChange}>
            <option value="Vegetable">Vegetable</option>
            <option value="Flower">Flower</option>
            <option value="Herb">Herb</option>
            <option value="Houseplant">Houseplant</option>
            <option value="Fruit">Fruit</option>
          </select>
        </label>

        <label>
          Garden Zone
          <select name="gardenZone" value={formData.gardenZone} onChange={handleChange}>
            {zones.map((zone) => <option key={zone} value={zone}>{zone}</option>)}
          </select>
        </label>

        <label>
          Health Status
          <select name="healthStatus" value={formData.healthStatus} onChange={handleChange}>
            <option value="Healthy">Healthy</option>
            <option value="Needs Water">Needs Water</option>
            <option value="Needs Attention">Needs Attention</option>
          </select>
        </label>

        <label>
          Planted Date
          <input type="date" name="plantedDate" value={formData.plantedDate} onChange={handleChange} />
        </label>

        <label>
          Last Watered
          <input type="date" name="lastWatered" value={formData.lastWatered} onChange={handleChange} />
        </label>

        <label>
          Watering Frequency in Days
          <input type="number" min="1" name="wateringFrequency" value={formData.wateringFrequency} onChange={handleChange} />
        </label>

        <label>
          Plant Photo
          <input type="file" accept=".jpg,.jpeg,.png,.webp,.heic,.heif" onChange={(event) => setPlantPhoto(event.target.files[0])} />
        </label>

        <label className="full-width">
          Location Description
          <input name="locationDescription" value={formData.locationDescription} onChange={handleChange} />
        </label>

        <label className="full-width">
          Notes
          <textarea name="notes" value={formData.notes} onChange={handleChange} />
        </label>

        <div className="form-actions full-width">
          <button type="submit">{selectedPlant ? "Save Changes" : "Add Plant"}</button>
          {selectedPlant && <button type="button" className="secondary-button" onClick={onCancelEdit}>Cancel Edit</button>}
        </div>
      </form>
    </section>
  );
}

export default PlantForm;
