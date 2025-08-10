
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
  const [amountStr, setAmountStr] = useState(""); // ← テキストで管理（整数のみ許可）
  const [amountError, setAmountError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const getTotal = (p) =>
    Number(
      p?.current_amount ??
        p?.currentAmount ??
        p?.total_amount ??
        p?.supports_sum_amount ??
        0
    );

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

  const derived = useMemo(() => {
    if (!project) return { goal: 0, raised: 0, remaining: 0, progress: 0 };
    const goal = Number(project.goal_amount ?? 0);
    const raised = getTotal(project);
    const remaining = Math.max(0, goal - raised);
    const progress = goal > 0 ? Math.min(Math.round((raised / goal) * 100), 100) : 0;
    return { goal, raised, remaining, progress };
  }, [project]);

  // 入力ハンドラ（整数のみ / 小数は即エラー）
  const onChangeAmount = (e) => {
    const raw = e.target.value;

    // 小数を含んだらエラー（'.'や','）
    if (raw.includes(".") || raw.includes(",")) {
      setAmountStr(raw);
      setAmountError("USD is whole dollars only. Please enter an integer.");
      return;
    }

    // 数字以外は除去（先頭ゼロは許容）
    if (!/^\d*$/.test(raw)) {
      // 直近の数字だけ抽出して反映
      const digits = raw.replace(/\D+/g, "");
      setAmountStr(digits);
      setAmountError(digits ? "" : "");
      return;
    }

    setAmountStr(raw);

    // ルール: 1 以上 & 残額以内
    if (raw === "") {
      setAmountError("");
      return;
    }

    const val = parseInt(raw, 10);
    if (Number.isNaN(val) || val < 1) {
      setAmountError("Please enter at least $1.");
    } else if (derived.remaining > 0 && val > derived.remaining) {
      setAmountError(
        `Amount exceeds remaining goal. Only $${derived.remaining.toLocaleString()} is needed.`
      );
    } else {
      setAmountError("");
    }
  };

  const handleSupport = async () => {
    const numericAmount = parseInt(amountStr || "0", 10);

    // 最終ガード
    if (!numericAmount || numericAmount < 1 || amountError) {
      alert(amountError || "Please enter a valid support amount.");
      return;
    }
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
        amount: numericAmount, // サーバへは整数ドル
      });
      window.location.href = res.data.url; // PayPal 承認へ
    } catch (err) {
      console.error("Support session creation failed", err);
      const status = err?.response?.status;
      const msg = err?.response?.data?.message;

      if (status === 409) {
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
                  // 数字キーボードを出しつつ自由度を保つ
                  type="text"
                  inputMode="numeric"
                  pattern="\d*"
                  placeholder="Enter support amount ($, whole dollars only)"
                  value={amountStr}
                  onChange={onChangeAmount}
                  minLength={1}
                  disabled={derived.remaining <= 0}
                />
                {amountError && (
                  <p className="text-red-600 text-sm">{amountError}</p>
                )}

                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={handleSupport}
                  disabled={loading || derived.remaining <= 0 || !!amountError || amountStr === ""}
                >
                  {derived.remaining <= 0
                    ? "Goal Reached"
                    : loading
                    ? "Processing..."
                    : "Support this project"}
                </Button>
                <p className="text-xs text-gray-500 text-center">
                  Payments may take a short time to reflect on the total. Thanks for your patience!
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

