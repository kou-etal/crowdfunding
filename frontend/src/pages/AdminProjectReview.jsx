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
      console.error("取得失敗", err);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleApprove = async (id) => {
    try {
      await axiosInstance.post(`/api/crowdfunding-projects/${id}/approve`);
      alert("承認しました");
      fetchProjects();
    } catch (err) {
      console.error("承認エラー", err);
    }
  };

  const handleReject = async (id) => {
    try {
      await axiosInstance.post(`/api/crowdfunding-projects/${id}/reject`, {
        rejected_reason: rejectReasons[id] || "",
      });
      alert("却下しました");
      fetchProjects();
    } catch (err) {
      console.error("却下エラー", err);
    }
  };

  const handleReasonChange = (id, value) => {
    setRejectReasons((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto mt-20 space-y-6">
        <h1 className="text-3xl font-bold">提出されたプロジェクト一覧</h1>
        <div className="grid grid-cols-2 gap-4">
        {projects.length === 0 ? (
          <p>現在、審査待ちのプロジェクトはありません。</p>
        ) : (
          projects.map((project) => (
            
            <Card key={project.id}>
              <CardContent className="p-6 space-y-2">
                <p className="w-full break-words"><strong>タイトル:</strong> {project.title}</p>
                <p className="w-full break-words"><strong>説明:</strong> {project.description}</p>
                <p><strong>目標金額:</strong> ¥{project.goal_amount.toLocaleString()}</p>
                <p><strong>締切日:</strong> {project.deadline}</p>

                <div className="flex items-center space-x-2 mt-4">
                  <Button variant="success" onClick={() => handleApprove(project.id)}>承認</Button>
                  <Input
                    placeholder="却下理由（任意）"
                    value={rejectReasons[project.id] || ""}
                    onChange={(e) => handleReasonChange(project.id, e.target.value)}
                    className="w-64"
                  />
                  <Button variant="destructive" onClick={() => handleReject(project.id)}>却下</Button>
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