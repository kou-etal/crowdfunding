import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AppLayout from "../components/AppLayout";

export function SupportSuccess() {
  const navigate = useNavigate();
  const location = useLocation();

  // クエリから session_id を取得（もし使いたいなら）
  const params = new URLSearchParams(location.search);
  const sessionId = params.get("session_id");

  // 自動リダイレクト（数秒後）
  useEffect(() => {
    const timer = setTimeout(() => {
      // 遷移元の詳細ページに戻す（例：直前のプロジェクト詳細）
      // 必要ならsessionStorageで project_id を保存しておいても良い
      const projectId = sessionStorage.getItem("lastViewedProjectId");
      navigate(`/crowdfunding/${projectId}`);
    }, 3000); // 3秒後にリダイレクト

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <AppLayout>
      <div className="text-center mt-20 space-y-4">
        <h1 className="text-2xl font-bold">🎉 ご支援ありがとうございました！</h1>
        <p>数秒後にプロジェクトページへ戻ります...</p>
      </div>
    </AppLayout>
  );
}
