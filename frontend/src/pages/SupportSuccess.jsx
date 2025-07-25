import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AppLayout from "../components/AppLayout";

export function SupportSuccess() {
  const navigate = useNavigate();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const sessionId = params.get("session_id");

  useEffect(() => {
    const timer = setTimeout(() => {
      const projectId = sessionStorage.getItem("lastViewedProjectId");
      navigate(`/crowdfunding/${projectId}`);
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <AppLayout>
      <div className="text-center mt-20 space-y-4">
        <h1 className="text-2xl font-bold">🎉 Thank you for your support!</h1>
        <p>You will be redirected to the project page in a few seconds...</p>
      </div>
    </AppLayout>
  );
}

