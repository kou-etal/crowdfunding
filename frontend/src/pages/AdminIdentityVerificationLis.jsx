import { useEffect, useState } from "react";
import { axiosInstance } from "../api/axiosInstance";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import AppLayout from "../components/AppLayout";

export function AdminIdentityVerificationList() {
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ 外に出して handleAction からも呼べるようにする
 const fetchVerifications = async () => {
  try {
    setLoading(true);
    const res = await axiosInstance.get("/api/identity-verifications");
    setVerifications(res.data);
  } catch (err) {
    console.error("取得失敗", err);
  } finally {
    setLoading(false); // ← ✅ 成功しても失敗しても必ずここで解除
  }
};

  useEffect(() => {
    fetchVerifications();
  }, []);

  const handleAction = async (id, action) => {
    const url = `/api/identity-verifications/${id}/${action}`;
    try {
      await axiosInstance.post(url);
      alert(`Successfully ${action}ed`);
      await fetchVerifications(); // 再取得
    } catch (err) {
      console.error(`${action}失敗`, err);
      alert(`Error: ${action}`);
    }
  };

  return (
     <AppLayout>
      <div className="max-w-5xl mx-auto mt-20 space-y-6">
        <h1 className="text-3xl font-bold">本人確認申請一覧</h1>

        {loading ? (
          <p>読み込み中...</p>
        ) : verifications.filter(v => v.status !== "approved" && v.status !== "rejected").length === 0 ? (
          <p>申請はまだありません。</p>
        ) : (
          verifications
            .filter(v => v.status !== "approved" && v.status !== "rejected")
            .map((v) => (
              <div key={v.id} className="flex w-full p-4 border rounded-lg shadow-md">
                {/* 左側の画像セクション (横並び) */}
                <div className="flex items-center space-x-4 pr-4">
                  <div className="text-center">
                    <strong>顔写真:</strong><br />
                    <img src={v.face_image_url} alt="face" className="w-48 h-48 object-cover border-2 border-gray-300 rounded-md" />
                  </div>
                  <div className="text-center">
                    <strong>書類:</strong><br />
                    <img src={v.document_image_url} alt="document" className="w-48 h-48 object-cover border-2 border-gray-300 rounded-md" />
                  </div>
                </div>

                {/* 右側のテキスト情報セクションとボタン */}
                <div className="flex flex-grow flex-col justify-between pl-4"> {/* flex-col と justify-between で縦方向配置と間隔を管理 */}
                  <div className="grid grid-cols-2 gap-x-1"> {/* Using grid for two columns of text */}
                    <div >
                      <p className="mb-2"><strong>ユーザーID:</strong> {v.user_id}</p>
                      <p className="mb-2"><strong>氏名:</strong> {v.user?.name || "N/A"}</p>
                    </div>
                    <div>
                      <p className="mb-2"><strong>指導教員:</strong> {v.supervisor_name}</p>
                      <p className="mb-2"><strong>メール:</strong> {v.supervisor_email}</p>
                      <p className="mb-2"><strong>所属機関:</strong> {v.supervisor_affiliation}</p>
                      <p className="mb-2"><strong>誓約:</strong> {v.honor_statement ? "✓" : "✗"}</p>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 mt-4"> {/* ボタンを右下に配置するため justify-end を使用 */}
                    <Button variant="success" onClick={() => handleAction(v.id, "approve")}>承認</Button>
                    <Button variant="destructive" onClick={() => handleAction(v.id, "reject")}>却下</Button>
                  </div>
                </div>
              </div>
            ))
        )}
      </div>
    </AppLayout>

  );
}

