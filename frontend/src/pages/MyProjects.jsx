import { useEffect, useState } from 'react';
import { axiosInstance } from '../api/axiosInstance';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '../components/AppLayout';

export function MyProjects() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axiosInstance.get('/api/my-projects');
        setProjects(res.data);
      } catch (err) {
        console.error('Failed to fetch project list', err);
      }
    };

    fetchProjects();
  }, []);

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto mt-16 px-6 flex flex-col items-center space-y-8">
        <h1 className="text-4xl font-extrabold text-cf-science-blue text-center border-b pb-2 border-blue-300 w-full">
          My Projects
        </h1>

        {projects.length === 0 ? (
          <p className="text-center text-gray-500 mt-10">No projects yet.</p>
        ) : (
          <div className="flex flex-col space-y-6 w-full">
            {projects.map((project) => (
              <Card
                key={project.id}
                className="border border-blue-200 bg-white shadow-md hover:shadow-lg transition duration-300 w-full"
              >
                <CardContent className="p-6 space-y-3">
                  <h2 className="text-2xl font-bold text-blue-900 break-words">{project.title}</h2>

                  <div className="text-gray-800 space-y-1 text-base">
                    <p>
                      <span className="font-semibold text-cf-science-blue">Target Amount:</span>{' '}
                      ¥{project.goal_amount.toLocaleString()}
                    </p>
                    <p>
                      <span className="font-semibold text-cf-science-blue">Deadline:</span>{' '}
                      {new Date(project.deadline).toLocaleDateString()}
                    </p>
                    <p>
                      <span className="font-semibold text-cf-science-blue">Status:</span>{' '}
                      {project.is_approved ? (
                        <span className="text-green-700 font-semibold">Approved</span>
                      ) : project.is_rejected ? (
                        <span className="text-red-600 font-semibold">
                          Rejected ({project.rejected_reason || 'No reason provided'})
                        </span>
                      ) : project.is_submitted ? (
                        <span className="text-yellow-600 font-semibold">Under Review</span>
                      ) : (
                        <span className="text-gray-500 font-semibold">Not Submitted</span>
                      )}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
