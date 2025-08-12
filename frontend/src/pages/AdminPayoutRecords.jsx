import { useEffect, useState } from "react";
import { axiosInstance } from "../api/axiosInstance";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AppLayout from "../components/AppLayout";

const toNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};
const jpy = (v) => `¥${toNum(v).toLocaleString("ja-JP")}`;

export function AdminPayoutRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const fetchRecords = async () => {
    try {
      setLoading(true);
      setLoadError("");
      const res = await axiosInstance.get("/api/admin/payout-records");
      setRecords(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch records", err);
      setLoadError("Failed to fetch payout records.");
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPaid = async (id) => {
    try {
      await axiosInstance.post(`/api/admin/payout-records/${id}/mark-paid`);
      fetchRecords();
    } catch (err) {
      console.error("Failed to update", err);
      alert("Failed to mark as paid");
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  return (
    <AppLayout>
      <div className="w-full max-w-5xl mx-auto mt-20 space-y-6 px-4">
        <h1 className="text-3xl font-extrabold text-blue-900 text-center">Payout Records</h1>

        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : loadError ? (
          <p className="text-center text-red-600">{loadError}</p>
        ) : records.length === 0 ? (
          <p className="text-center text-gray-500">No payout records available.</p>
        ) : (
          records.map((record) => {
            const goal = toNum(record?.project?.goal_amount);
            const total = toNum(record?.total_amount);
            const fee = toNum(record?.platform_fee);
            const title = record?.project?.title ?? "-";
            const researcher = record?.user_full_name ?? "-";
            const email = record?.user_email ?? "-";

            return (
              <Card key={record.id} className="bg-white shadow-sm">
                <CardContent className="p-6 space-y-3 min-w-0">
                  <p><strong>Project ID:</strong> {record.project_id}</p>
                  <p className="break-words">
                    <strong>Project Title:</strong> {title}
                  </p>
                  <p className="break-words">
                    <strong>Researcher:</strong> {researcher} ({email})
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <p><strong>Goal Amount:</strong> {jpy(goal)}</p>
                    <p><strong>Total Support Amount:</strong> {jpy(total)}</p>
                    <p><strong>Platform Fee:</strong> {jpy(fee)}</p>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Button
                      variant={record.is_paid ? "secondary" : "default"}
                      disabled={record.is_paid}
                      onClick={() => handleMarkAsPaid(record.id)}
                    >
                      {record.is_paid ? "Paid" : "Mark as Paid"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </AppLayout>
  );
}

//<p><strong>Ready At:</strong> {record.payout_ready_at}</p>