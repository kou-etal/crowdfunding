import React from 'react';
import { Progress } from './ui/progress';

const ProjectCard = ({ project }) => {
  const calculatedProgress = project.progress_percent
    ? Math.min(Math.round(project.progress_percent), 100)
    : 0;

  const daysRemaining = (() => {
    if (!project.deadline) return null;
    const deadlineDate = new Date(project.deadline);
    const today = new Date();
    const diff = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
    return diff < 0 ? 'Ended' : `${diff} days`;
  })();

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden relative group">
      {/* Project image */}
      <div className="relative w-full h-48 overflow-hidden bg-gray-200">
        <img
          src={project.imageUrl}
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {daysRemaining && (
          <div className={`absolute top-2 right-2 text-white text-sm px-3 py-1 rounded-full font-bold ${daysRemaining === 'Ended' ? 'bg-gray-600' : 'bg-blue-900'}`}>
            {daysRemaining}
          </div>
        )}
      </div>

      <div className="p-5">
        {/* Avatar and Owner name */}
        <div className="flex items-center gap-3 mb-4 mt-2 ml-2 relative z-10">

          <img
            src={project.ownerAvatarUrl}
            alt={project.ownerName}
            className="w-16 h-16 rounded-full border-2 border-white shadow-md bg-gray-300 object-cover"
          />
          <p className="text-lg font-bold text-blue-800">{project.ownerName || "Project Owner"}</p>
        </div>

        {/* Title and description */}
        <h3 className="text-2xl font-bold text-gray-900 mb-2 mt-2 leading-tight">
          {project.title}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {project.description}
        </p>

        {/* Progress and amounts */}
        <div className="mb-4">
          <div className="flex justify-between items-baseline mb-1 text-sm font-medium">
            <span className="text-blue-700 font-bold">
              Goal: {project.goal_amount ? `$${project.goal_amount.toLocaleString()}` : 'N/A'}
            </span>
            <span className="text-blue-900 text-xl font-bold">
              {project.currentAmount ? `$${project.currentAmount.toLocaleString()}` : '$0'}
            </span>
          </div>
          <Progress
            value={calculatedProgress}
            className="w-full h-2 bg-blue-200 [&>*]:bg-blue-600"
          />
          <p className="text-right text-xs text-gray-500 mt-1">
            Progress: {calculatedProgress}%
          </p>
        </div>

        {/* View Details */}
        <a
          href={`/crowdfunding/${project.id}`}
          className="block w-full text-center bg-blue-600 text-white text-lg font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-300"
        >
          View Project
        </a>
      </div>
    </div>
  );
};

export default ProjectCard;
