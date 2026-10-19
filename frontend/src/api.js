
import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const username = sessionStorage.getItem("dev_username");
  const password = sessionStorage.getItem("dev_password");

  if (username && password) {
    config.auth = { username, password };
  }

  return config;
});

export default api;
