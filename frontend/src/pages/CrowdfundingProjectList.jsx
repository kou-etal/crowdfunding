import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { axiosInstance } from "../api/axiosInstance";
import AppLayout from "../components/AppLayout";
import ProjectCard from "../components/ProjectCard";
import { HeroSection } from "../components/HeroSection";
import { MissionSection } from "../components/MissionSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import { AchievedProjectsSection } from "../components/AchievedProjectsSection";

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

function PickUpProjects({ projects }) {
  if (!projects?.length) return null;
  

  const getImage = (p) =>
    p.image_url ||
    p.image_path ||
    p.thumbnail ||
    "https://images.unsplash.com/photo-1529101091764-c3526daf38fe?q=80&w=1600&auto=format&fit=crop";

  return (
    <section className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-16 md:py-24">
      <div className="flex items-end justify-between px-1 pb-3">
      <h2
  className="relative inline-block text-[#111418] text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900
             after:block after:h-[2px] after:w-full after:bg-blue-800 after:mt-1 after:rounded-full"
             style={{ fontFamily: '"Quicksand", sans-serif' }}
>
  Pick Up Projects
</h2>


      
        <button
          type="button"
          onClick={() => {
            const el = document.getElementById("explore");
            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
          className="text-xl font-semibold text-blue-700 hover:text-blue-400"
        >
          Explore all →
        </button>
      </div>

      <div className="grid grid-cols-1">
        {projects.map((p) => (
          <div key={p.id} className="py-6 border-b border-gray-200 last:border-b-0">
            <div className="flex items-stretch justify-between gap-6">
              {/* 左：テキスト */}
              <div className="flex flex-[2_2_0px] flex-col justify-between min-w-0">
                <div className="flex flex-col gap-3">
                  <p className="text-[#111418] text-base md:text-lg font-bold leading-tight line-clamp-2">
                    {p.title}
                  </p>
                  <p className="text-[#4b5563] text-sm leading-relaxed line-clamp-3">
                    {p.description || p.short_description || "—"}
                  </p>
                </div>

                <Link
                  to={`/crowdfunding/${p.id}`}
                  className="inline-flex items-center justify-center h-9 px-4 rounded-lg bg-gray-200 text-gray-900 text-sm font-medium w-fit hover:bg-gray-300 transition-colors mt-4"
                >
                  View Project
                  <svg className="ml-1 size-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M12.293 3.293a1 1 0 011.414 0l4.999 5a1 1 0 010 1.414l-5 5a1 1 0 11-1.414-1.414L15.586 11H3a1 1 0 110-2h12.586l-3.293-3.293a1 1 0 010-1.414z" />
                  </svg>
                </Link>
              </div>

              {/* 右：画像 */}
              <Link
  to={`/crowdfunding/${p.id}`}
  className="group relative block w-full flex-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded-xl"
  aria-label={p.title}
  title={p.title}
>
  <div className="relative overflow-hidden rounded-xl">
    {/* 画像（背景div版→img版推奨） */}
    <div
      className="aspect-video bg-center bg-no-repeat bg-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
      style={{ backgroundImage: `url("${getImage(p)}")` }}
      role="img"
      aria-label={p.title}
    />

    {/* 黒幕（ホバー時にうっすら） */}
    <div className="pointer-events-none absolute inset-0 rounded-xl bg-black/0 group-hover:bg-black/15 transition-colors duration-300" />

    {/* ラベル（ホバー時にフェード＆スライドアップ） */}
   
  </div>
</Link>

            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

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

  const isActive = (p) => {
    const deadlineOk = !p.deadline || !isPastDay(p.deadline);
    const goal = toInt(p.goal_amount, Infinity);
    const total = toInt(
      p.current_amount ??
        p.currentAmount ??
        p.total_amount ??
        p.supports_sum_amount ??
        0,
      0
    );
    const percent = parsePercent(p.progress_percent);
    const reachedByPercent = percent !== null && percent >= 100;
    const reachedByFlag = Boolean(p.is_goal_reached);
    const expiredByFlag = Boolean(p.deadline_passed);
    const reachedByTotal = Number.isFinite(goal) && goal > 0 && total >= goal;

    const expired = expiredByFlag || !deadlineOk;
    const reached = reachedByFlag || reachedByPercent || reachedByTotal;

    return !expired && !reached;
  };

  const visibleProjects = projects.filter((p) => p.is_approved).filter(isActive);

  // 達成済み（最近6件程度）
  const achievedProjects = useMemo(() => {
    const done = projects.filter((p) => p.is_approved && !isActive(p));
    if (!done.length) return [];
    // completed_at → updated_at → deadline → created_at の順で新しいもの
    const key = (p) =>
      new Date(p.completed_at || p.updated_at || p.deadline || p.created_at || 0).getTime();
    const sorted = [...done].sort((a, b) => key(b) - key(a));
    return sorted.slice(0, 6);
  }, [projects]);

  // ピックアップ（進行中）
  const pickUp = useMemo(() => {
    if (!visibleProjects.length) return [];
    const arr = [...visibleProjects];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.slice(0, 5);
  }, [visibleProjects]);

  return (
    <AppLayout>
      <HeroSection />
      <HowItWorksSection />

      {/* ★ 達成済み：円環メリーゴーランド */}
      {!loading && achievedProjects.length > 0 && (
        <AchievedProjectsSection projects={achievedProjects} durationSec={6} />
      )}

      {/* 進行中ピックアップ */}
      {!loading && pickUp.length > 0 && <PickUpProjects projects={pickUp} />}

      <MissionSection />

      {/* 一覧 */}
      <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 my-30">
        <h1 className="text-4xl md:text-5xl font-serif font-extrabold text-center text-cf-science-blue tracking-wide leading-tight pt-12 pb-6">
          Support the Researchers of Tomorrow!
        </h1>
        <div className="w-24 h-1 bg-cf-science-blue mx-auto rounded-full mb-8" />

        <div id="explore" className="h-0 scroll-mt-24" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10 pb-20">
          {loading ? (
            <p className="col-span-full text-center text-gray-500">Loading projects...</p>
          ) : visibleProjects.length === 0 ? (
            <p className="col-span-full text-center text-gray-500">No projects available at the moment.</p>
          ) : (
            visibleProjects.map((project) => <ProjectCard key={project.id} project={project} />)
          )}
        </div>
      </div>
    </AppLayout>
  );
}


