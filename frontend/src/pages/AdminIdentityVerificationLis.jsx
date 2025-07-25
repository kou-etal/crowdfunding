import { useEffect, useState } from "react";
import { axiosInstance } from "../api/axiosInstance";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import AppLayout from "../components/AppLayout";

export function AdminIdentityVerificationList() {
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchVerifications = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/api/identity-verifications");
      setVerifications(res.data);
    } catch (err) {
      console.error("Failed to fetch", err);
    } finally {
      setLoading(false);
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
      await fetchVerifications();
    } catch (err) {
      console.error(`${action} failed`, err);
      alert(`Error: ${action}`);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto mt-20 space-y-6">
        <h1 className="text-3xl font-bold">Identity Verification Requests</h1>

        {loading ? (
          <p>Loading...</p>
        ) : verifications.filter(v => v.status !== "approved" && v.status !== "rejected").length === 0 ? (
          <p>No pending requests.</p>
        ) : (
          verifications
            .filter(v => v.status !== "approved" && v.status !== "rejected")
            .map((v) => (
              <div key={v.id} className="flex w-full p-4 border rounded-lg shadow-md">

                <div className="flex items-center space-x-4 pr-4">
                  <div className="text-center">
                    <strong>Face Photo:</strong><br />
                    <img src={v.face_image_url} alt="face" className="w-48 h-48 object-cover border-2 border-gray-300 rounded-md" />
                  </div>
                  <div className="text-center">
                    <strong>Document:</strong><br />
                    <img src={v.document_image_url} alt="document" className="w-48 h-48 object-cover border-2 border-gray-300 rounded-md" />
                  </div>
                </div>

                  <div className="flex flex-grow flex-col justify-between pl-4">
                  <div className="grid grid-cols-2 gap-x-1">
                    <div>
                      <p className="mb-2"><strong>User ID:</strong> {v.user_id}</p>
                      <p className="mb-2"><strong>Name:</strong> {v.user?.name || "N/A"}</p>
                    </div>
                    <div>
                      <p className="mb-2"><strong>Supervisor:</strong> {v.supervisor_name}</p>
                      <p className="mb-2"><strong>Email:</strong> {v.supervisor_email}</p>
                      <p className="mb-2"><strong>Affiliation:</strong> {v.supervisor_affiliation}</p>
                      <p className="mb-2"><strong>Honor Statement:</strong> {v.honor_statement ? "✓" : "✗"}</p>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 mt-4">
                    <Button variant="success" onClick={() => handleAction(v.id, "approve")}>Approve</Button>
                    <Button variant="destructive" onClick={() => handleAction(v.id, "reject")}>Reject</Button>
                  </div>
                </div>
              </div>
            ))
        )}
      </div>
    </AppLayout>
  );
}


