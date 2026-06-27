// This code is used to import React hooks and API helper.
import { useEffect, useState } from "react";
import api from "../services/api";

// This code is used to display the add/edit plant form.
function PlantForm({ selectedPlant, zones = [], plantTypes = [], zoneImages = {}, onPlantSaved, onCancelEdit }) {
  const defaultType = plantTypes.length > 0 ? plantTypes[0] : "Vegetable";

  const [formData, setFormData] = useState({
    name: "",
    type: defaultType,
    gardenZone: "",
    locationDescription: "",
    markerX: "",
    markerY: "",
    plantedDate: "",
    lastWatered: "",
    wateringFrequency: "",
    healthStatus: "Healthy",
    notes: ""
  });

  const [plantPhoto, setPlantPhoto] = useState(null);
  const [locationPhoto, setLocationPhoto] = useState(null);
  const [recommendation, setRecommendation] = useState(null);

  // This code is used to set the first plant type and garden zone as defaults.
  useEffect(() => {
    setFormData((oldData) => ({
      ...oldData,
      type: oldData.type || defaultType,
      gardenZone: oldData.gardenZone || zones[0] || ""
    }));
  }, [zones, defaultType]);

  // This code is used to fill the form when editing a plant.
  useEffect(() => {
    if (selectedPlant) {
      setFormData({
        name: selectedPlant.name || "",
        type: selectedPlant.type || defaultType,
        gardenZone: selectedPlant.gardenZone || zones[0] || "",
        locationDescription: selectedPlant.locationDescription || "",
        markerX: selectedPlant.markerX || "",
        markerY: selectedPlant.markerY || "",
        plantedDate: selectedPlant.plantedDate || "",
        lastWatered: selectedPlant.lastWatered || "",
        wateringFrequency: selectedPlant.wateringFrequency || "",
        healthStatus: selectedPlant.healthStatus || "Healthy",
        notes: selectedPlant.notes || ""
      });
    }
  }, [selectedPlant, defaultType, zones]);

  // This code is used to get care recommendations when plant type changes.
  useEffect(() => {
    if (!formData.type) {
      return;
    }

    api
      .get(`/api/recommendations/${formData.type}`)
      .then((response) => setRecommendation(response.data))
      .catch(() => setRecommendation(null));
  }, [formData.type]);

  // This code is used to update form values.
  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((oldData) => {
      const updatedData = { ...oldData, [name]: value };

      if (name === "gardenZone") {
        updatedData.markerX = "";
        updatedData.markerY = "";
      }

      return updatedData;
    });
  }

  // This code is used to save marker position when user clicks on the zone photo.
  function handleMarkerClick(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    setFormData((oldData) => ({
      ...oldData,
      markerX: x.toFixed(2),
      markerY: y.toFixed(2)
    }));
  }

  // This code is used to apply the recommended watering frequency to the form.
  function useSuggestedWatering() {
    if (recommendation) {
      setFormData((oldData) => ({
        ...oldData,
        wateringFrequency: recommendation.wateringFrequency
      }));
    }
  }

  // This code is used to clear the form after save.
  function resetForm() {
    setFormData({
      name: "",
      type: defaultType,
      gardenZone: zones[0] || "",
      locationDescription: "",
      markerX: "",
      markerY: "",
      plantedDate: "",
      lastWatered: "",
      wateringFrequency: "",
      healthStatus: "Healthy",
      notes: ""
    });
    setPlantPhoto(null);
    setLocationPhoto(null);
  }

  // This code is used to send the form data to the backend.
  async function handleSubmit(event) {
    event.preventDefault();

    const data = new FormData();
    Object.keys(formData).forEach((key) => data.append(key, formData[key]));

    if (plantPhoto) {
      data.append("plantPhoto", plantPhoto);
    }

    if (locationPhoto) {
      data.append("locationPhoto", locationPhoto);
    }

    if (selectedPlant) {
      await api.put(`/api/plants/${selectedPlant.id}`, data);
    } else {
      await api.post("/api/plants", data);
    }

    resetForm();
    onPlantSaved();
  }

  const selectedZoneImage = zoneImages[formData.gardenZone];

  return (
    <section className="card">
      <h2>{selectedPlant ? "Edit Plant Record" : "Add New Plant Record"}</h2>

      <form className="plant-form" onSubmit={handleSubmit}>
        <label>
          Plant Name
          <input name="name" value={formData.name} onChange={handleChange} placeholder="Example: Tomato" required />
        </label>

        <label>
          Plant Type
          <select name="type" value={formData.type} onChange={handleChange}>
            {plantTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </label>

        <label>
          Garden Zone
          <select name="gardenZone" value={formData.gardenZone} onChange={handleChange}>
            {zones.map((zone) => <option key={zone} value={zone}>{zone}</option>)}
          </select>
        </label>

        <label>
          Plant Health Status
          <select name="healthStatus" value={formData.healthStatus} onChange={handleChange}>
            <option value="Healthy">Healthy</option>
            <option value="Needs Water">Needs Water</option>
            <option value="Pest Issue">Pest Issue</option>
            <option value="Wilting">Wilting</option>
            <option value="Harvest Ready">Harvest Ready</option>
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
          <input type="number" name="wateringFrequency" value={formData.wateringFrequency} onChange={handleChange} placeholder="Example: 3" min="1" />
        </label>

        <label>
          Plant Photo
          <input type="file" accept=".jpg,.jpeg,.png,.webp,.heic,.heif" onChange={(event) => setPlantPhoto(event.target.files[0])} />
        </label>

        <label>
          Location Photo
          <input type="file" accept=".jpg,.jpeg,.png,.webp,.heic,.heif" onChange={(event) => setLocationPhoto(event.target.files[0])} />
        </label>

        <label className="full-width">
          Exact Location Description
          <input name="locationDescription" value={formData.locationDescription} onChange={handleChange} placeholder="Example: beside the fence, second row from left" />
        </label>

        {selectedZoneImage && (
          <div className="full-width marker-picker-box">
            <strong>Select Plant Position on Garden Photo</strong>
            <p className="small-text">Click on the photo to place or move the plant pin.</p>

            <div className="zone-photo-marker-picker" onClick={handleMarkerClick}>
              <img src={`http://localhost:5000${selectedZoneImage}`} alt={formData.gardenZone} />

              {formData.markerX && formData.markerY && (
                <span
                  className="plant-map-pin selected-pin"
                  style={{ left: `${formData.markerX}%`, top: `${formData.markerY}%` }}
                >
                  {formData.name ? formData.name.charAt(0).toUpperCase() : "P"}
                </span>
              )}
            </div>

            <p className="small-text">
              Saved position: {formData.markerX && formData.markerY ? `${formData.markerX}%, ${formData.markerY}%` : "No pin selected yet"}
            </p>
          </div>
        )}

        {!selectedZoneImage && (
          <p className="full-width zone-message">
            Upload a photo for this garden zone in Garden Map to place a plant pin on the map.
          </p>
        )}

        <label className="full-width">
          Notes
          <textarea name="notes" value={formData.notes} onChange={handleChange} placeholder="Write plant notes here" />
        </label>

        {recommendation && (
          <div className="recommendation-box full-width">
            <strong>Plant Care Recommendation</strong>
            <p>Suggested watering: every {recommendation.wateringFrequency} days.</p>
            <p>Sunlight: {recommendation.sunlight}</p>
            <p>{recommendation.advice}</p>
            <button type="button" onClick={useSuggestedWatering}>Use Suggested Watering</button>
          </div>
        )}

        <div className="form-actions full-width">
          <button type="submit">{selectedPlant ? "Save Changes" : "Add Plant"}</button>
          {selectedPlant && <button type="button" className="secondary-button" onClick={onCancelEdit}>Cancel Edit</button>}
        </div>
      </form>
    </section>
  );
}

export default PlantForm;
