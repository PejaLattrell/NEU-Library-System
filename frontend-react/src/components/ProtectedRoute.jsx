import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { auth, db } from "../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";

function ProtectedRoute({ element, requiredRole = null }) {
  const [isAuthorized, setIsAuthorized] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = auth.currentUser;
        
        if (!user) {
          setIsAuthorized(false);
          return;
        }

        if (requiredRole === null) {
            setIsAuthorized(true);
            return;
        }

        // Check user role
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const userData = userSnap.data();
          setIsAuthorized(userData.role === requiredRole);
        } else {
          setIsAuthorized(false);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setIsAuthorized(false);
      }
    };

    checkAuth();
  }, [requiredRole]);

  if (isAuthorized === null) {
    return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>Loading...</div>;
  }

  if (!isAuthorized) {
    return <Navigate to="/" />;
  }

  return element;
}

export default ProtectedRoute;
