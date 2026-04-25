import { Navigate, useLocation } from "react-router-dom";

function ProtectedRoute({ isAuthenticated, authChecked, currentUser, allowedRoles, children }) {
  const location = useLocation();

  if (!authChecked) {
    return <div style={{ padding: "2rem" }}>Checking login...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles?.length && !allowedRoles.includes(currentUser?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
