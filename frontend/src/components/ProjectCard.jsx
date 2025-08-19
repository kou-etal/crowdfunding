import { Link } from "react-router-dom";
import { Progress } from "./ui/progress";

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


const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

const ProjectCard = ({ project }) => {
  const goal = toInt(project.goal_amount, 0);

  const totalRaw = toInt(
    project.current_amount ??
      project.currentAmount ??
      project.total_amount ??
      project.supports_sum_amount ??
      0,
    0
  );

  const percent = (() => {
    const p = parsePercent(project.progress_percent);
    if (p !== null) return Math.min(Math.round(p), 100);
    return goal > 0 ? Math.min(Math.round((totalRaw / goal) * 100), 100) : 0;
  })();

  const totalForDisplay =
    totalRaw > 0
      ? totalRaw
      : goal > 0 && percent > 0
      ? Math.round((percent / 100) * goal)
      : 0;

  
  const remainingDays = (() => {
    if (!project.deadline) return null;
    const deadline = new Date(project.deadline);
    const today = new Date();
    const diffDays = Math.ceil((startOfDay(deadline) - startOfDay(today)) / (1000 * 60 * 60 * 24));
    return diffDays; 
  })();

  
  const reached =
    Boolean(project.is_goal_reached) ||
    percent >= 100 ||
    (goal > 0 && totalRaw >= goal);

  const expiredByDays = project.deadline ? remainingDays <= 0 : false;

  if (reached || expiredByDays) return null;

  const daysRemainingLabel =
    remainingDays == null ? null : `${remainingDays} days`;

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden relative group w-full">
      
      <Link
        to={`/crowdfunding/${project.id}`}
        className="relative w-full h-48 overflow-hidden bg-gray-200 block"
      >
        <img
          src={project.imageUrl}
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
          decoding="async"
        />
        {daysRemainingLabel && (
          <div className="absolute top-2 right-2 text-white text-sm px-3 py-1 rounded-full font-bold bg-blue-900">
            <span>{daysRemainingLabel} left</span>
          </div>
        )}
      </Link>

      <div className="p-5">
   
        <div className="flex items-center space-x-3 mb-4 mt-2 ml-2 relative z-10 min-w-0">
          <img
            src={project.ownerAvatarUrl}
            alt={project.ownerName}
            className="w-16 h-16 rounded-full border-2 border-white shadow-md bg-gray-300 object-cover flex-shrink-0"
            loading="lazy"
            decoding="async"
          />
          <p className="text-lg font-bold text-blue-800 truncate">
            {project.ownerName || "Project Owner"}
          </p>
        </div>

    
        <h3 className="text-2xl font-bold text-gray-900 mb-2 mt-2 leading-tight">
          {project.title}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {project.description}
        </p>

        
        <div className="mb-4">
          <div className="flex justify-between items-baseline mb-1 text-sm font-medium">
            <span className="text-blue-700 font-bold">
              Goal: {goal ? `$${goal.toLocaleString()}` : "N/A"}
            </span>
            <span className="text-blue-900 text-xl font-bold">
              {`$${totalForDisplay.toLocaleString()}`}
            </span>
          </div>
          <Progress value={percent} className="w-full h-2 bg-blue-200 [&>*]:bg-blue-600" />
          <p className="text-right text-xs text-gray-500 mt-1">{percent}% funded</p>
        </div>

       
        <Link
          to={`/crowdfunding/${project.id}`}
          className="block w-full text-center bg-blue-600 text-white text-lg font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-300"
        >
          View Project
        </Link>
      </div>
    </div>
  );
};

export default ProjectCard;


