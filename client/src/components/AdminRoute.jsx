import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useEffect, useState } from "react";

export default function AdminRoute() {
  const { firebaseUser } = useAuth();
  const [isAdmin, setIsAdmin] = useState(null);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!firebaseUser) {
        setIsAdmin(false);
        return;
      }
      try {
        const token = await firebaseUser.getIdTokenResult();
        setIsAdmin(token.claims.admin === true);
      } catch (e) {
        setIsAdmin(false);
      }
    };
    checkAdmin();
  }, [firebaseUser]);

  if (isAdmin === null) return <div>Loading</div>;
  if (!firebaseUser || !isAdmin) return <Navigate to="/" replace />;

  return <Outlet />;
}
