import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";

function PrivateRoute({ children }) {
  const navigate = useNavigate();
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      navigate("/");
    }
  }, [navigate]);

  return (
    <>
      <Outlet />
      {children}
    </>
  );
}

export default PrivateRoute;
