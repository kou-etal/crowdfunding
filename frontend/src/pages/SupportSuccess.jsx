import { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import AppLayout from "../components/AppLayout";

export function SupportSuccess() {
  const navigate = useNavigate();
  const location = useLocation();

  // 使わないなら session_id は参照だけ（必要ならここで検証リクエストに使う）
  const params = new URLSearchParams(location.search);
  const sessionId = params.get("session_id");

  // リンク表示にも使うので状態に保持
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
      {/* 60vh 相当 → 60dvh に変更して Galaxy のアドレスバー高さ変動でも安定 */}
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

        {/* 今すぐ戻る導線（projectIdが無ければTopへ） */}
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

