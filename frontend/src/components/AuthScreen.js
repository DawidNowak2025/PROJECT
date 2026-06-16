// This code is used to import React state and API helper.
import { useState } from "react";
import api from "../services/api";

// This code is used to show login and register forms.
function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((oldData) => ({ ...oldData, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const response = await api.post(endpoint, formData);
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
        <p className="small-text">Week 8 MVP login and registration screen.</p>

        <div className="auth-tabs">
          <button className={mode === "login" ? "active-tab" : ""} onClick={() => setMode("login")}>Login</button>
          <button className={mode === "register" ? "active-tab" : ""} onClick={() => setMode("register")}>Register</button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === "register" && (
            <label>
              Name
              <input name="name" value={formData.name} onChange={handleChange} placeholder="Dawid Nowak" />
            </label>
          )}

          <label>
            Email
            <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="email@example.com" required />
          </label>

          <label>
            Password
            <input name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Minimum 6 characters" required />
          </label>

          <button type="submit">{mode === "login" ? "Login" : "Create Account"}</button>
        </form>

        {message && <p className="auth-message">{message}</p>}
      </section>
    </div>
  );
}

export default AuthScreen;
