import { useEffect, useState } from 'react';
import { axiosInstance } from '../api/axiosInstance';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '../components/AppLayout';


const parseDateLocal = (yyyy_mm_dd) => {
  if (!yyyy_mm_dd) return null;
  const [y, m, d] = String(yyyy_mm_dd).split('-').map((n) => parseInt(n, 10));
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d); 
};
const formatDateLocal = (iso) => {
  const dt = parseDateLocal(iso);
  return dt ? dt.toLocaleDateString() : 'N/A';
};

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
        <h1 className="text-3xl font-extrabold text-blue-900 text-center">
          My Projects
        </h1>

        {projects.length === 0 ? (
          <p className="text-center text-gray-500 mt-10">No projects yet.</p>
        ) : (
          <div className="flex flex-col space-y-6 w-full items-center">
            {projects.map((project) => {
              const goal = Number(project?.goal_amount ?? 0);
              const isApproved = Boolean(project?.is_approved);
              const isRejected = Boolean(project?.is_rejected);
              const isSubmitted = Boolean(project?.is_submitted);
              const rejectedReason = project?.rejected_reason || 'No reason provided';

              return (
                <Card
                  key={project.id}
                  className="border border-gray-300 bg-white shadow-md hover:shadow-lg transition duration-300 w-full max-w-2xl overflow-hidden"
                >
                  <CardContent className="p-6 space-y-3 text-center min-w-0">
                    <h2 className="text-2xl font-bold text-blue-900 break-words">
                      {project.title}
                    </h2>

                    <div className="text-gray-800 space-y-1 text-base">
                      <p>
                        <span className="font-semibold text-blue-900">Target Amount:</span>{' '}
                        ¥{goal.toLocaleString('ja-JP')}
                      </p>
                      <p>
                        <span className="font-semibold text-blue-900">Deadline:</span>{' '}
                        <time dateTime={project.deadline || ''}>
                          {formatDateLocal(project.deadline)}
                        </time>
                      </p>
                      <p className="break-words">
                        <span className="font-semibold text-blue-900">Status:</span>{' '}
                        {isApproved ? (
                          <span className="text-green-700 font-semibold">Approved</span>
                        ) : isRejected ? (
                          <span className="text-red-600 font-semibold">
                            Rejected ({rejectedReason})
                          </span>
                        ) : isSubmitted ? (
                          <span className="text-yellow-600 font-semibold">Under Review</span>
                        ) : (
                          <span className="text-gray-500 font-semibold">Not Submitted</span>
                        )}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}


