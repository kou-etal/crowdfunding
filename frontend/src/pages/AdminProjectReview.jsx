
import { useEffect, useState } from "react";
import { axiosInstance } from "../api/axiosInstance";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AppLayout from "../components/AppLayout";

export function AdminProjectReview() {
  const [projects, setProjects] = useState([]);
  const [rejectReasons, setRejectReasons] = useState({});
  const [processingId, setProcessingId] = useState(null); // ★ 連打防止

  const fetchProjects = async () => {
    try {
      const res = await axiosInstance.get("/api/admin/pending-projects");
      setProjects(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch", err);
      setProjects([]);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleApprove = async (id) => {
    if (processingId) return;
    try {
      setProcessingId(id);
      await axiosInstance.post(`/api/crowdfunding-projects/${id}/approve`);
      alert("Project approved");
      await fetchProjects();
    } catch (err) {
      console.error("Approval error", err);
      alert("Failed to approve");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id) => {
    if (processingId) return;
    try {
      setProcessingId(id);
      await axiosInstance.post(`/api/crowdfunding-projects/${id}/reject`, {
        rejected_reason: rejectReasons[id] || "",
      });
      alert("Project rejected");
      await fetchProjects();
    } catch (err) {
      console.error("Rejection error", err);
      alert("Failed to reject");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReasonChange = (id, value) => {
    setRejectReasons((prev) => ({ ...prev, [id]: value }));
  };

  const fmtDate = (iso) => {
    if (!iso) return "-";
    const d = new Date(iso);
    if (isNaN(d)) return iso;
    return d.toLocaleDateString("ja-JP", { year: "numeric", month: "2-digit", day: "2-digit" });
  };

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto mt-20 space-y-6 px-4">
        <h1 className="text-4xl font-extrabold text-blue-900 text-center">Submitted Projects</h1>

        <div className="grid grid-cols-1 gap-4">
          {projects.length === 0 ? (
            <p className="text-center text-gray-500">No projects are currently pending review.</p>
          ) : (
            projects.map((project) => (
              <Card key={project.id}>
                {/* ★ min-w-0 & break-words & hyphens で横縮み防止 */}
                <CardContent className="p-6 space-y-3 min-w-0">
                  <p className="w-full break-words [hyphens:auto]">
                    <strong>Title:</strong> {project.title}
                  </p>
                  <p className="w-full break-words [hyphens:auto]">
                    <strong>Description:</strong> {project.description}
                  </p>
                  <p>
                    <strong>Target Amount:</strong>{" "}
                    ${Number(project.goal_amount ?? 0).toLocaleString()}
                  </p>
                  <p>
                    <strong>Deadline:</strong> {fmtDate(project.deadline)}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 mt-4">
                    <Button
                      onClick={() => handleApprove(project.id)}
                      disabled={processingId === project.id}
                    >
                      {processingId === project.id ? "Processing..." : "Approve"}
                    </Button>
                    <Input
                      placeholder="Rejection reason (optional)"
                      value={rejectReasons[project.id] || ""}
                      onChange={(e) => handleReasonChange(project.id, e.target.value)}
                      className="w-full sm:w-64"
                      autoCapitalize="none"
                      spellCheck={false}
                      autoComplete="off"
                    />
                    <Button
                      variant="destructive"
                      onClick={() => handleReject(project.id)}
                      disabled={processingId === project.id}
                    >
                      {processingId === project.id ? "Processing..." : "Reject"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}
