import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const AuthChecker = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = () => {
      try {
        const userStr = localStorage.getItem("user");
        const loginTimeStr = localStorage.getItem("loginTime");

        if (!userStr || !loginTimeStr) return;

        const user = JSON.parse(userStr);
        const loginTime = new Date(loginTimeStr);
        const now = new Date();
        const hoursDiff = (now - loginTime) / (1000 * 60 * 60);

        // Auto logout if session expired
        if (hoursDiff > 24) {
          localStorage.removeItem("user");
          localStorage.removeItem("loginTime");
          if (location.pathname !== "/") navigate("/");
          return;
        }

        // ✅ Redirect only if we are on login page
        if (location.pathname === "/" && user?.role === "admin") {
          navigate("/dashboard", { replace: true });
        }
      } catch (error) {
        console.error("Auth check error:", error);
        localStorage.removeItem("user");
        localStorage.removeItem("loginTime");
      }
    };

    checkAuth();
    // Run only once on mount and when pathname changes
  }, [navigate, location.pathname]);

  return null;
};

export default AuthChecker;
