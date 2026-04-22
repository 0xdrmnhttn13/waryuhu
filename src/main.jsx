import React from "react"
import ReactDOM from "react-dom/client"
import { useState, useEffect } from "react"
import WarYuhuAdmin from "./WarYuhuAdmin.jsx"
import WarYuhuUser from "./WarYuhuUser.jsx"
import LoginPage from "./LoginPage.jsx"
import "./index.css"

function App() {
  const [route, setRoute] = useState(window.location.hash || "#/")

  useEffect(() => {
    const onHashChange = () => setRoute(window.location.hash || "#/")
    window.addEventListener("hashchange", onHashChange)
    return () => window.removeEventListener("hashchange", onHashChange)
  }, [])

  if (route === "#/admin") {
    return <LoginPage />
  }

  if (route === "#/admin/dashboard") {
    return <WarYuhuAdmin />
  }

  return <WarYuhuUser />
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
