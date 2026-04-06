import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./services/firebase";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NewBooking from "./pages/NewBooking";
import MyBookings from "./pages/MyBookings";
import "./index.css";

const ProtectedRoute = ({ isAuthenticated, authLoading, children }) => {
  if (authLoading) {
    return (
      <div
        style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}
      >
        Checking authentication...
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  const [user, setUser] = React.useState(null);
  const [authLoading, setAuthLoading] = React.useState(true);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Authenticated Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute isAuthenticated={!!user} authLoading={authLoading}>
              <Dashboard user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bookings/new"
          element={
            <ProtectedRoute isAuthenticated={!!user} authLoading={authLoading}>
              <NewBooking user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bookings/my"
          element={
            <ProtectedRoute isAuthenticated={!!user} authLoading={authLoading}>
              <MyBookings user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />

        {/* Fallbacks */}
        <Route
          path="/"
          element={<Navigate to={user ? "/dashboard" : "/login"} replace />}
        />
        <Route
          path="*"
          element={<Navigate to={user ? "/dashboard" : "/login"} replace />}
        />
      </Routes>
    </Router>
  );
}

export default App;
