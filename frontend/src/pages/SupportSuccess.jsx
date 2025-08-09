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
    }, 9000); // 少し長めに待機

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center space-y-6">
        {/* 成功アイコン */}
        <div className="text-green-600 text-6xl">🎉</div>

        {/* 見出し */}
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 tracking-tight">
          Thank you for your support!
        </h1>

        {/* メッセージ */}
        <p className="text-lg text-gray-800 max-w-lg">
          Your contribution means a lot to this project.
        </p>
        <p className="text-base text-gray-800">
          You will be redirected to the project page shortly.
        </p>

        {/* 金額反映メッセージ */}
        <p className="text-sm text-gray-800 italic">
          ※ The total raised amount may take a few moments to update. Please refresh the page if it does not appear immediately.
        </p>
      </div>
    </AppLayout>
  );
}
