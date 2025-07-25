import { useEffect, useState } from "react";
import { axiosInstance } from "../api/axiosInstance";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AppLayout from "../components/AppLayout";

export function AdminProjectReview() {
  const [projects, setProjects] = useState([]);
  const [rejectReasons, setRejectReasons] = useState({});

  const fetchProjects = async () => {
    try {
      const res = await axiosInstance.get("/api/admin/pending-projects");
      setProjects(res.data);
    } catch (err) {
      console.error("Failed to fetch", err);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleApprove = async (id) => {
    try {
      await axiosInstance.post(`/api/crowdfunding-projects/${id}/approve`);
      alert("Project approved");
      fetchProjects();
    } catch (err) {
      console.error("Approval error", err);
    }
  };

  const handleReject = async (id) => {
    try {
      await axiosInstance.post(`/api/crowdfunding-projects/${id}/reject`, {
        rejected_reason: rejectReasons[id] || "",
      });
      alert("Project rejected");
      fetchProjects();
    } catch (err) {
      console.error("Rejection error", err);
    }
  };

  const handleReasonChange = (id, value) => {
    setRejectReasons((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto mt-20 space-y-6">
        <h1 className="text-3xl font-bold">Submitted Projects</h1>
        <div className="grid grid-cols-2 gap-4">
          {projects.length === 0 ? (
            <p>No projects are currently pending review.</p>
          ) : (
            projects.map((project) => (
              <Card key={project.id}>
                <CardContent className="p-6 space-y-2">
                  <p className="w-full break-words">
                    <strong>Title:</strong> {project.title}
                  </p>
                  <p className="w-full break-words">
                    <strong>Description:</strong> {project.description}
                  </p>
                  <p>
                    <strong>Target Amount:</strong> ¥{project.goal_amount.toLocaleString()}
                  </p>
                  <p>
                    <strong>Deadline:</strong> {project.deadline}
                  </p>

                  <div className="flex items-center space-x-2 mt-4">
                    <Button variant="success" onClick={() => handleApprove(project.id)}>Approve</Button>
                    <Input
                      placeholder="Rejection reason (optional)"
                      value={rejectReasons[project.id] || ""}
                      onChange={(e) => handleReasonChange(project.id, e.target.value)}
                      className="w-64"
                    />
                    <Button variant="destructive" onClick={() => handleReject(project.id)}>Reject</Button>
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
