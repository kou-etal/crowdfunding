
import { Button } from "@/components/ui/button";

export function AdminIdentityVerificationListMobile({
  verifications = [],
  loading = false,
  onAction,
}) {
  const pending = verifications.filter(
    (v) => v.status !== "approved" && v.status !== "rejected"
  );

  if (loading) return <p className="text-center text-gray-500 mt-6">Loading...</p>;
  if (pending.length === 0) return <p className="text-center text-gray-500 mt-6">No pending requests.</p>;

  return (
    <div className="max-w-lg mx-auto mt-6 space-y-6 px-4">
      <h1 className="text-2xl font-bold text-center text-blue-900 mb-6">
        Identity Verification
      </h1>

      {pending.map((v) => (
        <div key={v.id} className="border rounded-lg shadow-sm overflow-hidden bg-white">
         
          <div className="p-4">
            <p className="font-semibold mb-2 text-center">Face Photo</p>
            <img
              src={v.face_image_url}
              alt="face"
              className="w-full h-56 object-cover rounded-md border"
              loading="lazy"
              decoding="async"
            />
          </div>

        
          <div className="px-4 pb-4">
            <p className="font-semibold mb-2 text-center">Document</p>
            <img
              src={v.document_image_url}
              alt="document"
              className="w-full h-56 object-cover rounded-md border"
              loading="lazy"
              decoding="async"
            />
          </div>

          
          <div className="px-4 pb-4 space-y-1 text-sm break-words">
            <p><strong>User ID:</strong> {v.user_id}</p>
            <p><strong>Name:</strong> {v.user?.name || "N/A"}</p>
            <p><strong>Supervisor:</strong> {v.supervisor_name}</p>
            <p><strong>Email:</strong> {v.supervisor_email}</p>
            <p><strong>Affiliation:</strong> {v.supervisor_affiliation}</p>
            <p><strong>Honor Statement:</strong> {v.honor_statement ? "✓" : "✗"}</p>
          </div>

          
          <div className="flex gap-2 justify-end px-4 pb-4">
            <Button onClick={() => onAction?.(v.id, "approve")}>Approve</Button>
            <Button variant="destructive" onClick={() => onAction?.(v.id, "reject")}>
              Reject
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

