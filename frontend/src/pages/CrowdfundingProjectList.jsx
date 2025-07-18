import { useEffect, useState } from 'react';
import { axiosInstance } from '../api/axiosInstance';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Link } from 'react-router-dom';
import AppLayout from '../components/AppLayout';

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
      <div className="max-w-4xl w-full mx-auto mt-20 space-y-6">
        {projects.map(project => (
          <Card key={project.id}>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-xl font-semibold">{project.title}</h2>

              <div className="flex items-center justify-between">
                <span>進捗: {project.progress_percent}%</span>
                <Progress value={project.progress_percent} className="w-2/3" />
              </div>

              <Link
                to={`/crowdfunding/${project.id}`}
                className="text-blue-500 hover:underline inline-block mt-2"
              >
                詳細を見る
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </AppLayout>
  );
}
