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
    const numericAmount = parseInt(amount);

    if (!numericAmount || isNaN(numericAmount) || numericAmount <= 0) {
      alert("Please enter a valid support amount.");
      return;
    }

    const remaining = project.goal_amount - project.current_amount;
    if (numericAmount > remaining) {
      alert(`Only $${remaining.toLocaleString()} is needed to reach the goal.`);
      return;
    }

    try {
      setLoading(true);
      const res = await axiosInstance.post("/api/crowdfunding-supports/session", {
        project_id: project.id,
        amount: numericAmount,
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
      <div className="w-full mx-auto mt-10 grid grid-cols-1 md:grid-cols-5 gap-8 px-12">
        {/* Left: Project Details */}
        <div className="md:col-span-3">
          <Card className="shadow-lg bg-white rounded-xl h-full">
            <CardContent className="p-8 space-y-6 flex flex-col gap-10">
              <h1 className="text-3xl font-bold text-blue-900">{project.title}</h1>
              <p className="text-gray-700 leading-relaxed w-full break-words">{project.description}</p>

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
                  max={project.goal_amount - project.current_amount}
                />
                <Button className="w-full" onClick={handleSupport} disabled={loading}>
                  {loading ? "Processing..." : "Support this project"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Researcher / Supervisor Info */}
        <div className="md:col-span-2">
          <Card className="bg-white/90 backdrop-blur-md shadow-md rounded-xl h-full">
            <CardContent className="p-6 space-y-6">
              <h2 className="text-xl font-bold text-blue-900 text-center">Project Owner</h2>

              <div className="flex flex-col items-center gap-2">
                <img
                  src={project.user?.profile_image}
                  alt={project.user?.name}
                  className="w-20 h-20 rounded-full object-cover border"
                />
                <p className="text-lg font-semibold text-gray-900">{project.user?.name}</p>
                <p className="text-sm text-gray-600">{project.user?.email}</p>
              </div>

              <div className="pt-4 border-t">
                <h3 className="text-sm font-semibold text-blue-700 mb-2">Researcher Info</h3>
                <p className="text-sm text-gray-600"><span className="font-medium">Full Name:</span> {project.user?.full_name || "N/A"}</p>
                <p className="text-sm text-gray-600 break-words"><span className="font-medium">Bio:</span> {project.user?.bio || "N/A"}</p>
                <p className="text-sm text-gray-600"><span className="font-medium">Degree:</span> {project.user?.degree || "N/A"}</p>
                <p className="text-sm text-gray-600"><span className="font-medium">Expertise:</span> {project.user?.expertise || "N/A"}</p>
                <p className="text-sm text-gray-600"><span className="font-medium">University:</span> {project.user?.university || "N/A"}</p>
                <p className="text-sm text-gray-600"><span className="font-medium">Institute:</span> {project.user?.institute || "N/A"}</p>
              </div>

              <div className="pt-4 border-t">
                <h3 className="text-sm font-semibold text-blue-700 mb-2">Supervisor</h3>
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

