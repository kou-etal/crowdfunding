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

  return (
    <AppLayout>
      <HeroSection />
      <MissionSection />
      
      {/* 見出し */}
      <h1 className="text-4xl md:text-5xl text-center text-cf-science-blue pt-12 pb-8">
        Support the Researchers of Tomorrow!
      </h1>

      {/* プロジェクト一覧 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 px-6 pb-20">
        {loading ? (
          <p className="col-span-full text-center text-gray-500">Loading projects...</p>
        ) : projects.filter(p => p.is_approved).length === 0 ? (
          <p className="col-span-full text-center text-gray-500">
            No projects available at the moment.
          </p>
        ) : (
          projects
            .filter(project => project.is_approved)
            .map(project => (
              <ProjectCard key={project.id} project={project} />
            ))
        )}
      </div>
    </AppLayout>
  );
}
