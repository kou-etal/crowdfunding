import { useEffect, useState } from "react";
import { axiosInstance } from "../api/axiosInstance";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AppLayout from "../components/AppLayout";

export function AdminPayoutRecords() {
  const [records, setRecords] = useState([]);

  const fetchRecords = async () => {
    try {
      const res = await axiosInstance.get("/api/admin/payout-records");
      setRecords(res.data);
    } catch (err) {
      console.error("データ取得失敗", err);
    }
  };

  const handleMarkAsPaid = async (id) => {
    try {
      await axiosInstance.post(`/api/admin/payout-records/${id}/mark-paid`);
      fetchRecords();
    } catch (err) {
      console.error("更新失敗", err);
      alert("支払い処理に失敗しました");
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto mt-20 space-y-6">
        <h1 className="text-3xl font-bold">出金レコード一覧</h1>
        {records.length === 0 ? (
          <p>現在、出金対象のレコードはありません。</p>
        ) : (
          records.map((record) => (
            <Card key={record.id}>
              <CardContent className="p-6 space-y-3">
                <p><strong>プロジェクトID:</strong> {record.project_id}</p>
                <p><strong>研究者:</strong> {record.user_full_name}（{record.user_email}）</p>
                <p><strong>支援総額:</strong> ¥{record.total_amount.toLocaleString()}</p>
                <p><strong>プラットフォーム手数料:</strong> ¥{record.platform_fee.toLocaleString()}</p>
                <p><strong>準備完了日時:</strong> {record.payout_ready_at}</p>

                <Button
                  variant={record.is_paid ? "secondary" : "default"}
                  disabled={record.is_paid}
                  onClick={() => handleMarkAsPaid(record.id)}
                >
                  {record.is_paid ? "支払い済み" : "支払う"}
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </AppLayout>
  );
}
