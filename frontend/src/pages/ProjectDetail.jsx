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
  const [amount, setAmount] = useState("");
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
      alert("Please enter a valid support amount.");
      return;
    }

    try {
      setLoading(true);
      const res = await axiosInstance.post("/api/crowdfunding-supports/session", {
        project_id: project.id,
        amount: parseInt(amount),
      });
      window.location.href = res.data.url;
    } catch (err) {
      console.error("Support session creation failed", err);
      alert("Failed to process support request.");
    } finally {
      setLoading(false);
    }
  };

  if (!project) return <div className="text-center mt-10">Loading...</div>;

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto mt-10 grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
        {/* Left: Project Details */}
        <div className="md:col-span-2">
          <Card className="shadow-lg">
            <CardContent className="p-8 space-y-6">
              <h1 className="text-3xl font-bold text-blue-900">{project.title}</h1>
              <p className="text-gray-700 leading-relaxed">{project.description}</p>

              <div className="space-y-2">
                <div className="text-sm text-gray-500">
                  Target: ${project.goal_amount.toLocaleString()} / Raised: ${project.current_amount.toLocaleString()}
                </div>
                <Progress value={project.progress_percent} />
                <div className="text-sm text-gray-500">Progress: {project.progress_percent}%</div>
              </div>

              <div className="pt-6 space-y-3">
                <Input
                  type="number"
                  placeholder="Enter support amount ($)"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <Button className="w-full" onClick={handleSupport} disabled={loading}>
                  {loading ? "Processing..." : "Support this project"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Researcher / Supervisor Info */}
        <div>
          <Card className="shadow-md">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-xl font-bold text-blue-800">Project Owner</h2>
              <div className="flex items-center gap-4">
                <img
                  src={project.user?.profile_image}
                  alt={project.user?.name}
                  className="w-14 h-14 rounded-full object-cover border"
                />
                <p className="font-semibold text-gray-900">{project.user?.name}</p>
              </div>

              <div className="pt-4">
                <h3 className="text-md font-semibold text-gray-700">Supervisor</h3>
                <p className="text-sm text-gray-600">{project.supervisor_name || "N/A"}</p>
                <p className="text-sm text-gray-600">{project.supervisor_email || "N/A"}</p>
                <p className="text-sm text-gray-600">{project.supervisor_affiliation || "N/A"}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}