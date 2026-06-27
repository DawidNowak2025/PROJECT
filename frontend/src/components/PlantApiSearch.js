// This code is used to import React state and API helper.
import { useState } from "react";
import api from "../services/api";

// This code is used to search plant information using Wikipedia REST API through the backend.
function PlantApiSearch() {
  const [query, setQuery] = useState("");
  const [plantInfo, setPlantInfo] = useState(null);
  const [message, setMessage] = useState("");

  // This code is used to search Wikipedia for plant information.
  async function handleSearch(event) {
    event.preventDefault();

    if (!query.trim()) {
      setMessage("Please enter a plant name.");
      return;
    }

    try {
      setMessage("Searching Wikipedia...");
      const response = await api.get(`/api/wiki/${query}`);
      setPlantInfo(response.data);
      setMessage("");
    } catch (error) {
      setPlantInfo(null);
      setMessage(error.response?.data?.message || "Could not fetch plant information from Wikipedia.");
    }
  }

  return (
    <section className="page-grid">
      <section className="card">
        <h2>Plant Knowledge Search</h2>
        <p className="small-text">
          This section uses Wikipedia REST API to get plant descriptions, images and source links without needing an API key.
        </p>

        <form className="api-search-form" onSubmit={handleSearch}>
          <label>
            Plant Name
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Example: tomato, rose, mint, lavender"
            />
          </label>

          <button type="submit">Search Wikipedia</button>
        </form>

        {message && <p className="zone-message">{message}</p>}
      </section>

      {plantInfo && (
        <section className="card">
          <h2>{plantInfo.title}</h2>

          <div className="api-details">
            {plantInfo.image ? (
              <img src={plantInfo.image} alt={plantInfo.title} />
            ) : (
              <div className="photo-placeholder">No Image</div>
            )}

            <div>
              <p><strong>Description:</strong> {plantInfo.description}</p>
              <p>{plantInfo.extract}</p>

              {plantInfo.url && (
                <a href={plantInfo.url} target="_blank" rel="noreferrer">
                  Read More on Wikipedia
                </a>
              )}
            </div>
          </div>
        </section>
      )}
    </section>
  );
}

export default PlantApiSearch;
