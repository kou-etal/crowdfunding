import { useEffect, useState } from "react";
import { axiosInstance } from "../api/axiosInstance";
import AppLayout from "../components/AppLayout";
import ProjectCard from "../components/ProjectCard";
import { HeroSection } from "../components/HeroSection";
import { MissionSection } from "../components/MissionSection";

const toInt = (v, d = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
};
const parsePercent = (v) => {
  if (v === null || v === undefined) return null;
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const m = v.match(/[\d.]+/);
    return m ? Number(m[0]) : null;
  }
  return null;
};
const isPastDay = (iso) => {
  if (!iso) return false;
  const d = new Date(iso);
  const today = new Date();
  const day = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  return day(d) < day(today);
};

export function CrowdfundingProjectList() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axiosInstance.get("/api/crowdfunding-projects");
        setProjects(res.data);
      } catch (err) {
        console.error("Failed to fetch projects", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  // アクティブ判定を頑強に
  const isActive = (p) => {
    // 期限
    const deadlineOk = !p.deadline || !isPastDay(p.deadline);

    // ゴール/合計
    const goal = toInt(p.goal_amount, Infinity);
    const total = toInt(
      p.current_amount ??
      p.currentAmount ??
      p.total_amount ??
      p.supports_sum_amount ??
      0,
      0
    );

    // %での保険
    const percent = parsePercent(p.progress_percent);
    const reachedByPercent = percent !== null && percent >= 100;

    // フラグでの保険
    const reachedByFlag = Boolean(p.is_goal_reached);
    const expiredByFlag = Boolean(p.deadline_passed);

    const reachedByTotal = Number.isFinite(goal) && goal > 0 && total >= goal;

    const expired = expiredByFlag || !deadlineOk;
    const reached = reachedByFlag || reachedByPercent || reachedByTotal;

    return !expired && !reached;
  };

  const visibleProjects = projects
    .filter((p) => p.is_approved) // 公開済のみ
    .filter(isActive);

  return (
    <AppLayout>
      <HeroSection />
      <MissionSection />

      <h1
        className="
          text-4xl md:text-5xl font-serif font-extrabold 
          text-center text-cf-science-blue 
          tracking-wide leading-tight pt-12 pb-6
        "
      >
        Support the Researchers of Tomorrow!
      </h1>
      <div className="w-24 h-1 bg-cf-science-blue mx-auto rounded-full mb-8"></div>

      <section id="explore" className="scroll-mt-24" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 px-6 pb-20">
        {loading ? (
          <p className="col-span-full text-center text-gray-500">Loading projects...</p>
        ) : visibleProjects.length === 0 ? (
          <p className="col-span-full text-center text-gray-500">
            No projects available at the moment.
          </p>
        ) : (
          visibleProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))
        )}
      </div>
    </AppLayout>
  );
}

