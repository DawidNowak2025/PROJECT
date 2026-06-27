// This code is used to import React state and API helper.
import { useState } from "react";
import api from "../services/api";

// This code is used to add, edit and delete custom plant types.
function PlantTypeManager({ plantTypes, onPlantTypesChanged }) {
  const [newType, setNewType] = useState("");
  const [editingType, setEditingType] = useState("");
  const [editedType, setEditedType] = useState("");
  const [typeMessage, setTypeMessage] = useState("");

  // This code is used to add a new plant type.
  async function handleAddType(event) {
    event.preventDefault();

    if (!newType.trim()) {
      setTypeMessage("Please enter a plant type name.");
      return;
    }

    try {
      await api.post("/api/plant-types", {
        type: newType
      });

      setNewType("");
      setTypeMessage("Plant type added successfully.");
      onPlantTypesChanged();
    } catch (error) {
      setTypeMessage(error.response?.data?.message || "Could not add plant type.");
    }
  }

  // This code is used to start editing a plant type.
  function startEdit(type) {
    setEditingType(type);
    setEditedType(type);
    setTypeMessage("");
  }

  // This code is used to save an edited plant type.
  async function saveEdit() {
    if (!editedType.trim()) {
      setTypeMessage("Plant type name cannot be empty.");
      return;
    }

    try {
      await api.put(`/api/plant-types/${encodeURIComponent(editingType)}`, {
        type: editedType
      });

      setEditingType("");
      setEditedType("");
      setTypeMessage("Plant type updated successfully.");
      onPlantTypesChanged();
    } catch (error) {
      setTypeMessage(error.response?.data?.message || "Could not update plant type.");
    }
  }

  // This code is used to delete a plant type.
  async function deleteType(type) {
    const confirmDelete = window.confirm(`Delete plant type "${type}"? It cannot be deleted if plants are using it.`);

    if (!confirmDelete) {
      return;
    }

    try {
      await api.delete(`/api/plant-types/${encodeURIComponent(type)}`);
      setTypeMessage("Plant type deleted successfully.");
      onPlantTypesChanged();
    } catch (error) {
      setTypeMessage(error.response?.data?.message || "Could not delete plant type.");
    }
  }

  return (
    <section className="card">
      <h2>Manage Plant Types</h2>
      <p className="small-text">
        Add your own plant types such as Fruit, Tree, Shrub, Succulent or any custom category.
      </p>

      <form className="zone-form" onSubmit={handleAddType}>
        <label>
          New Plant Type
          <input
            value={newType}
            onChange={(event) => setNewType(event.target.value)}
            placeholder="Example: Fruit"
          />
        </label>

        <button type="submit">Add Plant Type</button>
      </form>

      {typeMessage && <p className="zone-message">{typeMessage}</p>}

      <div className="manager-list">
        {plantTypes.map((type) => (
          <div className="manager-row" key={type}>
            {editingType === type ? (
              <>
                <input value={editedType} onChange={(event) => setEditedType(event.target.value)} />
                <button onClick={saveEdit}>Save</button>
                <button className="secondary-button" onClick={() => setEditingType("")}>Cancel</button>
              </>
            ) : (
              <>
                <span>{type}</span>
                <button className="secondary-button" onClick={() => startEdit(type)}>Edit</button>
                <button className="danger-button" onClick={() => deleteType(type)}>Delete</button>
              </>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export default PlantTypeManager;
