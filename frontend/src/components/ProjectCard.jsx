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
const isPastDay = (iso) => {
  if (!iso) return false;
  const d = new Date(iso);
  const today = new Date();
  const day = (x) =>
    new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  return day(d) < day(today);
};

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

  const deadlineOk = !project.deadline || !isPastDay(project.deadline);
  const reached =
    Boolean(project.is_goal_reached) ||
    percent >= 100 ||
    (goal > 0 && totalRaw >= goal);
  if (!deadlineOk || reached) return null;

  const daysRemaining = (() => {
    if (!project.deadline) return null;
    const deadlineDate = new Date(project.deadline);
    const today = new Date();
    const diff = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
    return diff < 0 ? "Ended" : `${diff} days`;
  })();

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group w-full">
      {/* 画像：固定高を少し低く */}
      <Link
        to={`/crowdfunding/${project.id}`}
        className="relative w-full h-40 md:h-48 overflow-hidden bg-gray-200 block"
      >
        <img
          src={project.imageUrl}
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
          decoding="async"
        />
        {daysRemaining && (
          <div
            className={`absolute top-2 right-2 text-white text-xs px-2.5 py-1 rounded-full font-semibold ${
              daysRemaining === "Ended" ? "bg-gray-600" : "bg-blue-900"
            }`}
          >
            {daysRemaining} left
          </div>
        )}
      </Link>

      {/* 本文 */}
      <div className="flex flex-col p-4 min-w-0 flex-1">
        {/* オーナー */}
        <div className="flex items-center space-x-2 mb-2 min-w-0">
          <img
            src={project.ownerAvatarUrl}
            alt={project.ownerName}
            className="w-10 h-10 rounded-full border border-white shadow bg-gray-300 object-cover flex-shrink-0"
            loading="lazy"
            decoding="async"
          />
          <p className="text-sm md:text-base font-bold text-blue-800 truncate">
            {project.ownerName || "Project Owner"}
          </p>
        </div>

        {/* タイトル */}
        <h3 className="text-lg md:text-xl font-bold text-gray-900 leading-snug line-clamp-2 min-h-[2.25rem]">
          {project.title}
        </h3>

        {/* 説明 */}
        <p className="text-gray-600 text-sm mt-1 mb-3 line-clamp-2 min-h-[2.25rem]">
          {project.description}
        </p>

        {/* 金額＆バー */}
        <div className="mt-auto">
          <div className="flex justify-between items-baseline mb-1 text-xs font-medium">
            <span className="text-blue-700 font-semibold">
              Goal: {goal ? `$${goal.toLocaleString()}` : "N/A"}
            </span>
            <span className="text-blue-900 text-base md:text-lg font-bold">
              {`$${totalForDisplay.toLocaleString()}`}
            </span>
          </div>
          <Progress
            value={percent}
            className="w-full h-2 bg-blue-200 [&>*]:bg-blue-600"
          />
          <p className="text-right text-xs text-gray-500 mt-1">
            {percent}% funded
          </p>

          {/* ボタン */}
          <Link
            to={`/crowdfunding/${project.id}`}
            className="mt-3 block w-full text-center bg-blue-500 text-white text-sm md:text-base font-semibold py-2.5 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            View Project
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;



