import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { auth, db } from "../firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import FullPageLoader from "./FullPageLoader";

function ProtectedRoute({ element, requiredRole = null }) {
  const [isAuthorized, setIsAuthorized] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (!user) {
          setIsAuthorized(false);
          return;
        }

        if (requiredRole === null) {
          setIsAuthorized(true);
          return;
        }

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
    });

    return () => unsubscribe();
  }, [requiredRole]);

  if (isAuthorized === null) {
    return <FullPageLoader label="Checking access..." />;
  }

  if (!isAuthorized) {
    return <Navigate to="/" />;
  }

  return element;
}

export default ProtectedRoute;
