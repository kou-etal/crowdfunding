// CrowdfundingProjectList.jsx
import { useEffect, useState } from 'react';
import { axiosInstance } from '../api/axiosInstance';
import AppLayout from '../components/AppLayout';
import ProjectCard from '../components/ProjectCard';
import { HeroSection } from '../components/HeroSection';
import { MissionSection } from '../components/MissionSection';

export function CrowdfundingProjectList() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axiosInstance.get('/api/crowdfunding-projects');
        setProjects(res.data);
      } catch (err) {
        console.error('Failed to fetch projects', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  // 数値へ正規化して合計額を取得（APIのキー差を吸収）
  const getTotal = (p) =>
    Number(
      p.currentAmount ??      // フロントの旧表記
      p.current_amount ??     // APIのスネーク
      p.total_amount ??       // たまにこれで返してるケース
      p.supports_sum_amount ??// withSum など
      0
    );

  // 日付だけで比較（タイムゾーン差でのズレを回避）
  const isPast = (iso) => {
    if (!iso) return false;
    const d = new Date(iso);
    const today = new Date();
    const day = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
    return day(d) < day(today);
  };

  // 期限切れ/達成済みを除外
  const isActive = (p) => {
    const deadlineOk = !p.deadline || !isPast(p.deadline);
    const goal = Number(p.goal_amount ?? Infinity);
    const total = getTotal(p);
    const reached = Number.isFinite(goal) && total >= goal;

    // 進捗%が来ているならそれでも保険判定
    const progressReached = Number(p.progress_percent ?? 0) >= 100;

    return deadlineOk && !reached && !progressReached;
  };

  const visibleProjects = projects
    .filter((p) => p.is_approved)
    .filter(isActive);

  return (
    <AppLayout>
      <HeroSection />
      <MissionSection />

      <h1 className="text-4xl md:text-5xl text-center text-cf-science-blue pt-12 pb-8">
        Support the Researchers of Tomorrow!
      </h1>
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
