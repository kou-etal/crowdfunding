import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { axiosInstance } from "../api/axiosInstance";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import AppLayout from "../components/AppLayout";
import { Input } from "@/components/ui/input";

export function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [amount, setAmount] = useState(""); // 支援金額
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    sessionStorage.setItem("lastViewedProjectId", id);
    const fetchProject = async () => {
      try {
        const res = await axiosInstance.get(`/api/crowdfunding-projects/${id}`);
        setProject(res.data);
      } catch (err) {
        console.error("Failed to fetch project details", err);
      }
    };

    fetchProject();
  }, [id]);

  const handleSupport = async () => {
    if (!amount || isNaN(amount) || parseInt(amount) <= 0) {
      alert("有効な支援金額を入力してください");
      return;
    }

    try {
      setLoading(true);
      const res = await axiosInstance.post("/api/crowdfunding-supports/session", {
        project_id: project.id,
        amount: parseInt(amount),
      });
      window.location.href = res.data.url; // Stripeへリダイレクト
    } catch (err) {
      console.error("支援セッション作成失敗", err);
      alert("支援処理に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  if (!project) return <div className="text-center mt-10">Loading...</div>;

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto mt-10">
        <Card className="shadow-lg">
          <CardContent className="p-8 space-y-6">

            <h1 className="text-3xl font-bold">{project.title}</h1>
            <p className="text-gray-600">{project.description}</p>

            <div className="space-y-2">
              <div className="text-sm text-gray-500">
                目標金額: ¥{project.goal_amount.toLocaleString()} / 現在: ¥{project.current_amount.toLocaleString()}
              </div>
              <Progress value={project.progress_percent} />
              <div className="text-sm text-gray-500">
                達成率: {project.progress_percent}%
              </div>
            </div>

            <div className="pt-6 space-y-3">
              <Input
                type="number"
                placeholder="支援金額（円）"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <Button className="w-full" onClick={handleSupport} disabled={loading}>
                {loading ? "処理中..." : "支援する"}
              </Button>
            </div>

          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
