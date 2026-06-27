// This code is used to import Axios for backend communication.
import axios from "axios";

// This code is used to keep the backend URL in one place.
const API_BASE_URL = "http://localhost:5000";

// This code is used to create a reusable Axios instance.
const api = axios.create({
  baseURL: API_BASE_URL
});

// This code is used to export the API connection and base URL.
export { API_BASE_URL };
export default api;
