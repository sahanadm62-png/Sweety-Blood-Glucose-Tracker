import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import "./App.css";

function App() {
    return (
        <BrowserRouter>
            <Routes>

                {/* Default page */}
                <Route
                    path="/"
                    element={<Navigate to="/login" />}
                />

                {/* Signup page */}
                <Route
                    path="/signup"
                    element={<Signup />}
                />

                {/* Login page */}
                <Route
                    path="/login"
                    element={<Login />}
                />

                {/* Dashboard page */}
                <Route
                    path="/dashboard"
                    element={<Dashboard />}
                />

            </Routes>
        </BrowserRouter>
    );
}

export default App;