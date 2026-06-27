// This code is used to import React state and the API helper.
import { useState } from "react";
import api from "../services/api";

// This code is used to display login and register screens for local users.
function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [message, setMessage] = useState("");

  // This code is used to update form values when the user types.
  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((oldData) => ({
      ...oldData,
      [name]: value
    }));
  }

  // This code is used to send login or register data to the backend.
  async function handleSubmit(event) {
    event.preventDefault();

    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";

      const payload =
        mode === "login"
          ? {
              email: formData.email,
              password: formData.password
            }
          : formData;

      const response = await api.post(endpoint, payload);

      localStorage.setItem("growUser", JSON.stringify(response.data.user));
      onLogin(response.data.user);
    } catch (error) {
      setMessage(error.response?.data?.message || "Authentication failed.");
    }
  }

  return (
    <div className="auth-page">
      <section className="auth-card">
        <p className="tagline">Garden Resource Organisation and Watering</p>
        <h1>GROW Garden Tracker</h1>
        <p className="small-text">
          Login or register to use the local garden tracking system.
        </p>

        <div className="auth-tabs">
          <button
            type="button"
            className={mode === "login" ? "active-tab" : ""}
            onClick={() => {
              setMode("login");
              setMessage("");
            }}
          >
            Login
          </button>

          <button
            type="button"
            className={mode === "register" ? "active-tab" : ""}
            onClick={() => {
              setMode("register");
              setMessage("");
            }}
          >
            Register
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === "register" && (
            <label>
              Name
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Example: Dawid"
              />
            </label>
          )}

          <label>
            Email
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Example: user@email.com"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Minimum 6 characters"
              required
            />
          </label>

          <button type="submit">
            {mode === "login" ? "Login" : "Create Account"}
          </button>
        </form>

        {message && <p className="auth-message">{message}</p>}

        <p className="small-text">
          Registered users are stored locally in backend/data/users.json for project demonstration.
        </p>
      </section>
    </div>
  );
}

export default AuthScreen;
