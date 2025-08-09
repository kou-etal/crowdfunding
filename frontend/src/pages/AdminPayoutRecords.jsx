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
      console.error("Failed to fetch records", err);
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
      <div className="max-w-5xl mx-auto mt-20 space-y-6">
        <h1 className="text-3xl font-bold">Payout Records</h1>
        {records.length === 0 ? (
          <p>No payout records available.</p>
        ) : (
          records.map((record) => (
            <Card key={record.id}>
              <CardContent className="p-6 space-y-3">
                <p><strong>Project ID:</strong> {record.project_id}</p>
                <p><strong>Project Title:</strong> {record.project?.title ?? '-'}</p>
                <p><strong>Researcher:</strong> {record.user_full_name} ({record.user_email})</p>
                <p><strong>Goal Amount:</strong> ¥{Number(record.project?.goal_amount ?? 0).toLocaleString()}</p>
                <p><strong>Total Support Amount:</strong> ¥{record.total_amount.toLocaleString()}</p>
                <p><strong>Platform Fee:</strong> ¥{record.platform_fee.toLocaleString()}</p>
                

                <Button
                  variant={record.is_paid ? "secondary" : "default"}
                  disabled={record.is_paid}
                  onClick={() => handleMarkAsPaid(record.id)}
                >
                  {record.is_paid ? "Paid" : "Mark as Paid"}
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </AppLayout>
  );
}
//<p><strong>Ready At:</strong> {record.payout_ready_at}</p>