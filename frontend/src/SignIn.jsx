
import { useState } from "react";
import { Factory, LockKeyhole, UserRound } from "lucide-react";
import api from "./api";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validate the credentials directly against Django.
      await api.get("/api/materials/", {
        auth: { username, password },
      });

      // Temporary local-development session only.
      sessionStorage.setItem("dev_username", username);
      sessionStorage.setItem("dev_password", password);

      // Remove old JWTs so they cannot interfere.
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");

      onLogin();
    } catch (err) {
      setError(
        err.response?.status === 401 || err.response?.status === 403
          ? "Login failed. Check your username and password."
          : "Could not connect to Django. Check that the backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-brand">
          <div className="brand-mark">
            <Factory size={24} />
          </div>
          <div>
            <h1>FactoryOS</h1>
            <p>QUALITY & OPERATIONS</p>
          </div>
        </div>

        <h2>Welcome back</h2>
        <p className="login-description">
          Sign in to manage your factory operations.
        </p>

        <label className="login-label">Username</label>
        <div className="login-input">
          <UserRound size={17} />
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            autoComplete="username"
            required
          />
        </div>

        <label className="login-label">Password</label>
        <div className="login-input">
          <LockKeyhole size={17} />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            autoComplete="current-password"
            required
          />
        </div>

        {error && <p className="login-error">{error}</p>}

        <button
          className="button button-primary login-submit"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>

        <p className="login-footer">
          Secure access to your operations workspace
        </p>
      </form>
    </main>
  );
}
