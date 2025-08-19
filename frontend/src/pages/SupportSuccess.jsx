import { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import AppLayout from "../components/AppLayout";

export function SupportSuccess() {
  const navigate = useNavigate();
  const location = useLocation();

  
  const params = new URLSearchParams(location.search);
  const sessionId = params.get("session_id");

  
  const [projectId, setProjectId] = useState(null);

  useEffect(() => {
    const id = sessionStorage.getItem("lastViewedProjectId");
    setProjectId(id || null);

    const timer = setTimeout(() => {
      navigate(id ? `/crowdfunding/${id}` : "/", { replace: true });
    }, 9000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <AppLayout>
      
      <div className="flex flex-col items-center justify-center min-h-[60dvh] px-6 text-center space-y-6">
        <div className="text-green-600 text-6xl">🎉</div>

        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 tracking-tight">
          Thank you for your support!
        </h1>

        <p className="text-lg text-gray-800 max-w-lg">
          Your contribution means a lot to this project.
        </p>

        <p className="text-base text-gray-800" aria-live="polite">
          You will be redirected to the project page shortly.
        </p>

        <p className="text-sm text-gray-800 italic">
          ※ The total raised amount may take a few moments to update. Please refresh the page if it does not appear immediately.
        </p>

      
        <Link
          to={projectId ? `/crowdfunding/${projectId}` : "/"}
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg transition-colors"
        >
          Go back now
        </Link>
      </div>
    </AppLayout>
  );
}

