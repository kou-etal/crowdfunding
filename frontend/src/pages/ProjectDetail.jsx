import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { axiosInstance } from "../api/axiosInstance";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import AppLayout from "../components/AppLayout";
import { Input } from "@/components/ui/input";

export function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [amountStr, setAmountStr] = useState("");
  const [amountError, setAmountError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [bioExpanded, setBioExpanded] = useState(false);

  const pickRaised = (p) =>
    Number(
      p?.current_amount ??
        p?.currentAmount ??
        p?.total_amount ??
        p?.supports_sum_amount ??
        0
    );

  useEffect(() => {
    sessionStorage.setItem("lastViewedProjectId", id);
    const fetchProject = async () => {
      try {
        setFetching(true);
        const res = await axiosInstance.get(`/api/crowdfunding-projects/${id}`);
        setProject(res.data);
      } catch (err) {
        console.error("Failed to fetch project details", err);
      } finally {
        setFetching(false);
      }
    };
    fetchProject();
  }, [id]);

  const derived = useMemo(() => {
    if (!project) return { goal: 0, raised: 0, remaining: 0, progress: 0 };
    const goal = Number(project.goal_amount ?? 0);
    const raised = pickRaised(project);
    const remaining = Math.max(0, +(goal - raised).toFixed(2));
    const progress = goal > 0 ? Math.min(Math.round((raised / goal) * 100), 100) : 0;
    return { goal, raised, remaining, progress };
  }, [project]);

  // 画像キーを広めに見る（show/index 両対応）
  const coverImage = useMemo(() => {
    const p = project || {};
    return (
      p.image ??
      p.image_url ??
      p.imageUrl ??
      p.image_path ??
      p.cover_image ??
      p.thumbnail ??
      ""
    );
  }, [project]);

  // 説明パラグラフ
  const paragraphs = useMemo(() => {
    const raw = project?.description ?? "";
    return raw
      .split(/\r?\n\r?\n|<\/p>|<br\s*\/?>/gi)
      .map((s) => s.replace(/<[^>]+>/g, "").trim())
      .filter(Boolean);
  }, [project?.description]);

  // 金額入力
  const onChangeAmount = (e) => {
    let raw = e.target.value;
    raw = raw.replace(/，/g, ",").replace(/．/g, ".").replace(/,/g, "");
    raw = raw.replace(/[^0-9.]/g, "");
    const firstDot = raw.indexOf(".");
    if (firstDot !== -1) {
      const before = raw.slice(0, firstDot + 1);
      const after = raw.slice(firstDot + 1).replace(/\./g, "");
      raw = before + after;
    }
    if (/\.\d{3,}$/.test(raw)) raw = raw.replace(/(\.\d{2})\d+$/, "$1");
    setAmountStr(raw);

    if (raw === "") return setAmountError("");
    const val = parseFloat(raw);
    if (Number.isNaN(val)) return setAmountError("Enter a valid amount (e.g. 10 or 10.50).");
    if (val < 1) return setAmountError("Minimum support amount is $1.00.");
    if (derived.remaining > 0 && val > derived.remaining) {
      return setAmountError(
        `Amount exceeds remaining goal. Only $${derived.remaining.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })} is needed.`
      );
    }
    setAmountError("");
  };

  const handleSupport = async () => {
    const num = parseFloat(amountStr);
    if (!amountStr || Number.isNaN(num) || num < 1 || amountError) {
      alert(amountError || "Please enter a valid amount (min $1.00).");
      return;
    }
    if (num > derived.remaining) {
      alert(
        derived.remaining > 0
          ? `Only $${derived.remaining.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })} is needed to reach the goal.`
          : "This project already reached its goal."
      );
      return;
    }

    try {
      setLoading(true);
      const payload = { project_id: project.id, amount: Number(num.toFixed(2)) };
      const res = await axiosInstance.post("/api/crowdfunding-supports/session", payload);
      window.location.href = res.data.url;
    } catch (err) {
      console.error("Support session creation failed", err);
      const status = err?.response?.status;
      const msg = err?.response?.data?.message;
      if (status === 409) {
        alert("This project already reached its goal.");
      } else if (status === 422 && msg?.includes("exceeds")) {
        const srvRemaining = err?.response?.data?.remaining;
        alert(
          `Amount exceeds remaining goal.${
            typeof srvRemaining === "number"
              ? ` Only $${srvRemaining.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })} is needed.`
              : ""
          }`
        );
      } else {
        alert("Failed to process support request. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // === Loading Animation ===
  if (fetching || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="relative flex flex-col items-center gap-5">
          {/* 内周リング（逆回転） */}
          <div className="relative w-28 h-28">
            <svg
              className="absolute inset-0 w-20 h-20 m-auto animate-spin-reverse"
              viewBox="0 0 100 100"
              aria-hidden="true"
            >
              <circle cx="50" cy="50" r="30" fill="none" stroke="rgba(59,130,246,0.15)" strokeWidth="5" />
              <circle
                cx="50" cy="50" r="30" fill="none" stroke="#60a5fa" strokeWidth="5"
                strokeDasharray="160" strokeDashoffset="110" strokeLinecap="round"
                className="drop-glow"
              />
            </svg>

            {/* 中央パルス点 */}
            <div className="absolute inset-0 m-auto size-3 rounded-full bg-cyan-300 animate-pulse-glow" />
          </div>

          {/* テキスト */}
          <div
            className="text-2xl font-extrabold tracking-widest text-transparent bg-clip-text
                       bg-gradient-to-r from-cyan-300 via-blue-400 to-cyan-300 animate-gradient-text"
            aria-live="polite"
          >
            LOADING
          </div>
        </div>

        {/* アニメーション定義 */}
        <style>{`
          @keyframes spin-reverse { to { transform: rotate(-360deg); } }
          .animate-spin-reverse { animation: spin-reverse 2s linear infinite; }

          @keyframes gradient-text {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .animate-gradient-text {
            background-size: 200% 200%;
            animation: gradient-text 2.8s ease-in-out infinite;
          }

          @keyframes pulse-glow {
            0%, 100% { box-shadow: 0 0 10px rgba(103,232,249,0.7), 0 0 20px rgba(59,130,246,0.5); }
            50%       { box-shadow: 0 0 20px rgba(103,232,249,1),   0 0 40px rgba(59,130,246,0.8); }
          }
          .animate-pulse-glow { animation: pulse-glow 1.4s ease-in-out infinite; }

          .drop-glow {
            filter: drop-shadow(0 0 6px rgba(59,130,246,0.6)) drop-shadow(0 0 12px rgba(103,232,249,0.5));
          }

          @media (prefers-reduced-motion: reduce) {
            .animate-spin-reverse,
            .animate-gradient-text,
            .animate-pulse-glow { animation: none !important; }
          }
        `}</style>
      </div>
    );
  }
  // === /Loading Animation ===

  return (
    <AppLayout>
      <div className="w-full max-w-7xl mx-auto mt-10 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT: 枠なし */}
          <div className="lg:col-span-8 min-w-0">
            <div className="space-y-6">
              <h1 className="text-3xl md:text-4xl font-bold text-blue-900 break-words">
                {project.title}
              </h1>

              {/* ==== カバー画像（高さを出し過ぎないアスペクト比コンテナ） ==== */}
              {coverImage && (
                <figure className="rounded-2xl overflow-hidden shadow-sm">
                  <div className="
                    relative
                    aspect-[16/10]    /* mobile: 少し高め */
                    sm:aspect-[16/9]  /* タブレット */
                    md:aspect-[21/9]  /* デスクトップで薄く */
                    lg:aspect-[24/9]  /* さらに薄く */
                  ">
                    <img
                      src={coverImage}
                      alt={project.title || "Project cover"}
                      className="absolute inset-0 h-full w-full object-cover"
                      loading="lazy"
                      decoding="async"
                      sizes="(max-width: 1024px) 100vw, 800px"
                    />
                  </div>
                </figure>
              )}
              {/* ===================================================== */}

              {/* メタ＋進捗 */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
                  {project.category && (
                    <span className="px-2 py-1 rounded-full bg-blue-50 text-blue-800 font-semibold">
                      {project.category}
                    </span>
                  )}
                  {project.country && (
                    <span className="px-2 py-1 rounded-full bg-slate-100">{project.country}</span>
                  )}
                  <span>
                    Goal: ${derived.goal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                  <span>
                    Raised: ${derived.raised.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <Progress value={derived.progress} />
                  <div className="mt-2 flex justify-between text-xs text-slate-600">
                    <span>{derived.progress}% funded</span>
                    <span>
                      Remaining: $
                      {derived.remaining.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* 説明（読みやすい幅） */}
              <div className="max-w-[70ch] text-slate-800 leading-[1.85] tracking-[0.005em] space-y-4 break-words hyphens-auto">
                {paragraphs.length
                  ? paragraphs.map((t, i) => <p key={i}>{t}</p>)
                  : <p>{project.description}</p>}
              </div>
            </div>
          </div>

          {/* RIGHT: Sticky 支援＆プロフィール */}
          <aside className="lg:col-span-4 min-w-0">
            <div className="lg:sticky lg:top-24 space-y-4">
              {/* 支援カード */}
              <Card className="bg-white/95 backdrop-blur p-6 rounded-2xl shadow-md">
                <h2 className="text-lg font-semibold text-slate-900 mb-3">Support this project</h2>
                <div className="text-sm text-slate-600 mb-3">
                  Secure checkout • No platform fee for donors
                </div>
                <div className="space-y-3">
                  <Input
                    type="text"
                    inputMode="decimal"
                    placeholder="Enter amount (USD, e.g. 10.00)"
                    value={amountStr}
                    onChange={onChangeAmount}
                    disabled={derived.remaining <= 0}
                  />
                  {amountError && <p className="text-red-600 text-sm">{amountError}</p>}
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={handleSupport}
                    disabled={loading || derived.remaining <= 0 || !!amountError || amountStr === ""}
                  >
                    {derived.remaining <= 0
                      ? "Goal Reached"
                      : loading
                      ? "Processing..."
                      : "Support"}
                  </Button>
                </div>
              </Card>

              {/* プロフィールカード */}
              <Card className="bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-md">
                <h3 className="text-base font-semibold text-slate-900 mb-4 text-center">Project Owner</h3>
                <div className="flex flex-col items-center gap-2 mb-4">
                  <img
                    src={project.user?.profile_image}
                    alt={project.user?.name}
                    className="w-20 h-20 rounded-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                  <p className="text-lg font-semibold text-gray-900 break-words text-center">
                    {project.user?.name}
                  </p>
                  <p className="text-sm text-gray-600 break-words text-center">
                    {project.user?.email}
                  </p>
                </div>

                <div className="space-y-2 text-sm text-gray-700">
                  <div><span className="font-medium">Full Name:</span> {project.user?.full_name || "N/A"}</div>

                  {/* Bio 7行クランプ + トグル */}
                  <div>
                    <span className="font-medium">Bio:</span>{" "}
                    <span
                      className={bioExpanded ? "break-words" : "break-words line-clamp-7"}
                      style={
                        bioExpanded
                          ? undefined
                          : {
                              display: "-webkit-box",
                              WebkitLineClamp: 7,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }
                      }
                    >
                      {project.user?.bio || "N/A"}
                    </span>
                    {(project.user?.bio || "").length > 0 && (
                      <button
                        type="button"
                        onClick={() => setBioExpanded((v) => !v)}
                        className="mt-1 ml-1 text-xs font-semibold text-blue-600 hover:underline"
                      >
                        {bioExpanded ? "Read less" : "Read more"}
                      </button>
                    )}
                  </div>

                  <div><span className="font-medium">Degree:</span> {project.user?.degree || "N/A"}</div>
                  <div><span className="font-medium">Expertise:</span> {project.user?.expertise || "N/A"}</div>
                  <div><span className="font-medium">University:</span> {project.user?.university || "N/A"}</div>
                  <div><span className="font-medium">Institute:</span> {project.user?.institute || "N/A"}</div>
                </div>

                <div className="mt-5 pt-4 border-t">
                  <h4 className="text-sm font-semibold text-slate-900 mb-2">Supervisor</h4>
                  <p className="text-sm text-gray-700 break-words">{project.supervisor_name || "N/A"}</p>
                  <p className="text-sm text-gray-700 break-words">{project.supervisor_email || "N/A"}</p>
                  <p className="text-sm text-gray-700 break-words">{project.supervisor_affiliation || "N/A"}</p>
                </div>
              </Card>
            </div>
          </aside>
        </div>
      </div>
    </AppLayout>
  );
}



