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
  const [amountStr, setAmountStr] = useState("");
  const [amountError, setAmountError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const pickRaised = (p) =>
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
    const raised = pickRaised(project);
    const remaining = Math.max(0, +(goal - raised).toFixed(2));
    const progress = goal > 0 ? Math.min(Math.round((raised / goal) * 100), 100) : 0;
    return { goal, raised, remaining, progress };
  }, [project]);

 
  const onChangeAmount = (e) => {
    let raw = e.target.value;
    raw = raw.replace(/，/g, ",").replace(/．/g, ".").replace(/,/g, "");
    raw = raw.replace(/[^0-9.]/g, "");
    const firstDot = raw.indexOf(".");
    if (firstDot !== -1) {
      const before = raw.slice(0, firstDot + 1);
      const after = raw.slice(firstDot + 1).replace(/\./g, "");
      raw = before + after;
    }
    if (/\.\d{3,}$/.test(raw)) {
      raw = raw.replace(/(\.\d{2})\d+$/, "$1");
    }
    setAmountStr(raw);

    if (raw === "") return setAmountError("");
    const val = parseFloat(raw);
    if (Number.isNaN(val)) return setAmountError("Enter a valid amount (e.g. 10 or 10.50).");
    if (val < 1) return setAmountError("Minimum support amount is $1.00.");
    if (derived.remaining > 0 && val > derived.remaining) {
      return setAmountError(
        `Amount exceeds remaining goal. Only $${derived.remaining.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })} is needed.`
      );
    }
    setAmountError("");
  };

  const handleSupport = async () => {
    const num = parseFloat(amountStr);
    if (!amountStr || Number.isNaN(num) || num < 1 || amountError) {
      alert(amountError || "Please enter a valid amount (min $1.00).");
      return;
    }
    if (num > derived.remaining) {
      alert(
        derived.remaining > 0
          ? `Only $${derived.remaining.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })} is needed to reach the goal.`
          : "This project already reached its goal."
      );
      return;
    }

    try {
      setLoading(true);
      const payload = { project_id: project.id, amount: Number(num.toFixed(2)) };
      const res = await axiosInstance.post("/api/crowdfunding-supports/session", payload);
      window.location.href = res.data.url;
    } catch (err) {
      console.error("Support session creation failed", err);
      const status = err?.response?.status;
      const msg = err?.response?.data?.message;

      if (status === 409) {
        alert("This project already reached its goal.");
      } else if (status === 422 && msg?.includes("exceeds")) {
        const srvRemaining = err?.response?.data?.remaining;
        alert(
          `Amount exceeds remaining goal.${
            typeof srvRemaining === "number"
              ? ` Only $${srvRemaining.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })} is needed.`
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
      
      <div className="w-full max-w-7xl mx-auto mt-10 px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
         
          <div className="md:col-span-3 min-w-0">
            <Card className="shadow-lg bg-white rounded-xl h-full overflow-hidden">
              <CardContent className="p-8 space-y-6">
                <h1 className="text-3xl font-bold text-blue-900 break-words">
                  {project.title}
                </h1>

                {project.image_path && (
                  <img
                    src={project.image_path}
                    alt={project.title}
                    className="w-full max-h-[380px] object-cover rounded-lg border"
                    loading="lazy"
                    decoding="async"
                  />
                )}

                <p className="text-gray-700 leading-relaxed w-full break-words">
                  {project.description}
                </p>

                <div className="space-y-2">
                  <div className="text-sm text-gray-600">
                    Target: $
                    {derived.goal.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                    &nbsp;/&nbsp; Raised: $
                    {derived.raised.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>

                 
                  <Progress value={derived.progress} />
                  <div className="text-sm text-gray-600">
                    Progress: {derived.progress}%
                  </div>

                  <div className="text-sm text-gray-600">
                    Remaining: $
                    {derived.remaining.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                </div>

                <div className="pt-6 space-y-3">
                  <Input
                    type="text"
                    inputMode="decimal"
                    placeholder="Enter support amount (USD, e.g. 10.00)"
                    value={amountStr}
                    onChange={onChangeAmount}
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

      
          <div className="md:col-span-2 min-w-0">
            <Card className="bg-white/90 backdrop-blur-md shadow-md rounded-xl h-full overflow-hidden">
              <CardContent className="p-6 space-y-6">
                <h2 className="text-xl font-bold text-blue-900 text-center">
                  Project Owner
                </h2>

                <div className="flex flex-col items-center gap-2">
                  <img
                    src={project.user?.profile_image}
                    alt={project.user?.name}
                    className="w-20 h-20 rounded-full object-cover border"
                    loading="lazy"
                    decoding="async"
                  />
                  <p className="text-lg font-semibold text-gray-900 break-words text-center">
                    {project.user?.name}
                  </p>
                  <p className="text-sm text-gray-600 break-words text-center">
                    {project.user?.email}
                  </p>
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
                  <p className="text-sm text-gray-600 break-words">
                    {project.supervisor_name || "N/A"}
                  </p>
                  <p className="text-sm text-gray-600 break-words">
                    {project.supervisor_email || "N/A"}
                  </p>
                  <p className="text-sm text-gray-600 break-words">
                    {project.supervisor_affiliation || "N/A"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

