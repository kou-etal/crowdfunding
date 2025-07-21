import { useEffect, useState } from 'react';
import { axiosInstance } from '../api/axiosInstance';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Link } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import ProjectCard from '../components/ProjectCard';
import {HeroSection} from '../components/HeroSection';

export function CrowdfundingProjectList() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axiosInstance.get('/api/crowdfunding-projects');
        setProjects(res.data);
      } catch (err) {
        console.error('Failed to fetch projects', err);
      }
    };

    fetchProjects();
  }, []);

  return (

     <AppLayout>
      <HeroSection />
      <h1 className="text-5xl text-center text-cf-science-blue pt-10">Support the Researchers of Tomorrow!</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 p-10">
        {projects
  .filter(project => project.is_approved)
  .map(project => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </AppLayout>
  );
}
