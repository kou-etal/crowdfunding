// src/pages/ProjectDetail.jsx
import { useEffect, useMemo, useState } from "react";
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
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // 合計金額の取得（API のキー差を吸収）
  const getTotal = (p) =>
    Number(
      p?.current_amount ??
        p?.currentAmount ??
        p?.total_amount ??
        p?.supports_sum_amount ??
        0
    );

  // 初回取得
  useEffect(() => {
    sessionStorage.setItem("lastViewedProjectId", id);
    const fetchProject = async () => {
      try {
        setFetching(true);
        const res = await axiosInstance.get(`/api/crowdfunding-projects/${id}`);
        setProject(res.data);
      } catch (err) {
        console.error("Failed to fetch project details", err);
      } finally {
        setFetching(false);
      }
    };
    fetchProject();
  }, [id]);

  // 表示用の派生値
  const derived = useMemo(() => {
    if (!project) {
      return {
        goal: 0,
        raised: 0,
        remaining: 0,
        progress: 0,
      };
    }
    const goal = Number(project.goal_amount ?? 0);
    const raised = getTotal(project);
    const remaining = Math.max(0, goal - raised);
    const progress = goal > 0 ? Math.min(Math.round((raised / goal) * 100), 100) : 0;
    return { goal, raised, remaining, progress };
  }, [project]);

  const handleSupport = async () => {
    const numericAmount = parseInt(amount, 10);

    if (!numericAmount || isNaN(numericAmount) || numericAmount <= 0) {
      alert("Please enter a valid support amount.");
      return;
    }

    // クライアント側の即時ガード（サーバ側でも検証される）
    if (numericAmount > derived.remaining) {
      alert(
        derived.remaining > 0
          ? `Only $${derived.remaining.toLocaleString()} is needed to reach the goal.`
          : "This project already reached its goal."
      );
      return;
    }

    try {
      setLoading(true);
      const res = await axiosInstance.post("/api/crowdfunding-supports/session", {
        project_id: project.id,
        amount: numericAmount,
      });
      // PayPal承認へ
      window.location.href = res.data.url;
    } catch (err) {
      console.error("Support session creation failed", err);
      const status = err?.response?.status;
      const msg = err?.response?.data?.message;

      if (status === 409) {
        // サーバ側：達成済み
        alert("This project already reached its goal.");
      } else if (status === 422 && msg?.includes("exceeds")) {
        const srvRemaining = err?.response?.data?.remaining;
        alert(
          `Amount exceeds remaining goal. ${
            typeof srvRemaining === "number"
              ? `Only $${srvRemaining.toLocaleString()} is needed.`
              : ""
          }`
        );
      } else {
        alert("Failed to process support request. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetching || !project) {
    return (
      <AppLayout>
        <div className="text-center mt-16 text-gray-600">Loading...</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="w-full mx-auto mt-10 grid grid-cols-1 md:grid-cols-5 gap-8 px-6 md:px-12">
        {/* Left: Project Details */}
        <div className="md:col-span-3">
          <Card className="shadow-lg bg-white rounded-xl h-full">
            <CardContent className="p-8 space-y-6">
              <h1 className="text-3xl font-bold text-blue-900 break-words">
                {project.title}
              </h1>

              {/* メイン画像（あれば） */}
              {project.image_path && (
                <img
                  src={project.image_path}
                  alt={project.title}
                  className="w-full max-h-[380px] object-cover rounded-lg border"
                />
              )}

              <p className="text-gray-700 leading-relaxed w-full break-words">
                {project.description}
              </p>

              <div className="space-y-2">
                <div className="text-sm text-gray-600">
                  Target: ${derived.goal.toLocaleString()} &nbsp;/&nbsp; Raised: $
                  {derived.raised.toLocaleString()}
                </div>
                <Progress value={project.progress_percent ?? derived.progress} />
                <div className="text-sm text-gray-600">
                  Progress: {project.progress_percent ?? derived.progress}%
                </div>
                <div className="text-sm text-gray-600">
                  Remaining: ${derived.remaining.toLocaleString()}
                </div>
              </div>

              <div className="pt-6 space-y-3">
                <Input
                  type="number"
                  placeholder="Enter support amount ($)"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min={1}
                  max={derived.remaining > 0 ? derived.remaining : undefined}
                  disabled={derived.remaining <= 0}
                />
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={handleSupport}
                  disabled={loading || derived.remaining <= 0}
                >
                  {derived.remaining <= 0
                    ? "Goal Reached"
                    : loading
                    ? "Processing..."
                    : "Support this project"}
                </Button>
                <p className="text-xs text-gray-500 text-center">
                  Payment may take a short time to reflect on the total. Thanks for your patience!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Owner / Researcher */}
        <div className="md:col-span-2">
          <Card className="bg-white/90 backdrop-blur-md shadow-md rounded-xl h-full">
            <CardContent className="p-6 space-y-6">
              <h2 className="text-xl font-bold text-blue-900 text-center">
                Project Owner
              </h2>

              <div className="flex flex-col items-center gap-2">
                <img
                  src={project.user?.profile_image}
                  alt={project.user?.name}
                  className="w-20 h-20 rounded-full object-cover border"
                />
                <p className="text-lg font-semibold text-gray-900">
                  {project.user?.name}
                </p>
                <p className="text-sm text-gray-600">{project.user?.email}</p>
              </div>

              <div className="pt-4 border-t">
                <h3 className="text-sm font-semibold text-blue-700 mb-2">
                  Researcher Info
                </h3>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Full Name:</span>{" "}
                  {project.user?.full_name || "N/A"}
                </p>
                <p className="text-sm text-gray-600 break-words">
                  <span className="font-medium">Bio:</span>{" "}
                  {project.user?.bio || "N/A"}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Degree:</span>{" "}
                  {project.user?.degree || "N/A"}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Expertise:</span>{" "}
                  {project.user?.expertise || "N/A"}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">University:</span>{" "}
                  {project.user?.university || "N/A"}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Institute:</span>{" "}
                  {project.user?.institute || "N/A"}
                </p>
              </div>

              <div className="pt-4 border-t">
                <h3 className="text-sm font-semibold text-blue-700 mb-2">
                  Supervisor
                </h3>
                <p className="text-sm text-gray-600">
                  {project.supervisor_name || "N/A"}
                </p>
                <p className="text-sm text-gray-600">
                  {project.supervisor_email || "N/A"}
                </p>
                <p className="text-sm text-gray-600">
                  {project.supervisor_affiliation || "N/A"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
