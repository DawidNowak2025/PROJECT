// This code is used to import Axios for backend communication.
import axios from "axios";

// This code is used to create the reusable backend connection.
const api = axios.create({
  baseURL: "http://localhost:5000"
});

export default api;
