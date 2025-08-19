
import { useEffect, useState } from "react";
import { axiosInstance } from "../api/axiosInstance";
import { Button } from "@/components/ui/button";
import AppLayout from "../components/AppLayout";
import { AdminIdentityVerificationListMobile } from "./AdminIdentityVerificationListMobile";

export function AdminIdentityVerificationList() {
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchVerifications = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/api/identity-verifications");
      setVerifications(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error("Failed to fetch verifications", e);
      setVerifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifications();
  }, []);

  const actionLabel = (action) =>
    action === "approve" ? "Approved" : action === "reject" ? "Rejected" : "Done";

  const handleAction = async (id, action) => {
    try {
      await axiosInstance.post(`/api/identity-verifications/${id}/${action}`);
      await fetchVerifications();
      alert(`Successfully ${actionLabel(action)}`);
    } catch (e) {
      console.error(`${action} failed`, e);
      alert(`Error: ${actionLabel(action)}`);
    }
  };

  const pending = verifications.filter(
    (v) => v.status !== "approved" && v.status !== "rejected"
  );

  return (
    <AppLayout>
      
      <div className="block md:hidden">
        <AdminIdentityVerificationListMobile
          verifications={verifications}
          loading={loading}
          onAction={handleAction}
        />
      </div>

     
      <div className="hidden md:block">
        <div className="max-w-5xl mx-auto mt-20 space-y-6 px-4">
          <h1 className="text-3xl font-bold text-center text-blue-900">
            Identity Verification
          </h1>

          {loading ? (
            <p className="text-center text-gray-500">Loading...</p>
          ) : pending.length === 0 ? (
            <p className="text-center text-gray-500">No pending requests.</p>
          ) : (
            pending.map((v) => (
              <div
                key={v.id}
                className="flex w-full p-4 border rounded-lg shadow-md bg-white"
              >
               
                <div className="flex items-center space-x-4 pr-4">
                  <div className="text-center">
                    <strong>Face Photo:</strong><br />
                    <img
                      src={v.face_image_url}
                      alt="face"
                      className="w-48 h-48 object-cover border-2 border-gray-300 rounded-md"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <div className="text-center">
                    <strong>Document:</strong><br />
                    <img
                      src={v.document_image_url}
                      alt="document"
                      className="w-48 h-48 object-cover border-2 border-gray-300 rounded-md"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                </div>

                
                <div className="flex flex-grow flex-col justify-between pl-4 min-w-0">
                  <div className="grid grid-cols-2 gap-x-1">
                    <div className="min-w-0">
                      <p className="mb-2"><strong>User ID:</strong> {v.user_id}</p>
                      <p className="mb-2 break-words">
                        <strong>Name:</strong> {v.user?.name || "N/A"}
                      </p>
                    </div>
                    <div className="min-w-0">
                      <p className="mb-2 break-words">
                        <strong>Supervisor:</strong> {v.supervisor_name}
                      </p>
                      <p className="mb-2 break-words">
                        <strong>Email:</strong> {v.supervisor_email}
                      </p>
                      <p className="mb-2 break-words">
                        <strong>Affiliation:</strong> {v.supervisor_affiliation}
                      </p>
                      <p className="mb-2">
                        <strong>Honor Statement:</strong> {v.honor_statement ? "✓" : "✗"}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 mt-4">
                    <Button onClick={() => handleAction(v.id, "approve")}>Approve</Button>
                    <Button variant="destructive" onClick={() => handleAction(v.id, "reject")}>
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}

