import axios from "axios"

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:3001",
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("@TEAprende:token")
      localStorage.removeItem("@TEAprende:user")
      window.location.href = "/login"
    }
    return Promise.reject(error)
  },
)

export default api

