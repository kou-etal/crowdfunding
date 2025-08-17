// src/components/AchievedProjectsSectionMobile.jsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

/**
 * モバイル版：進捗バーに合わせて 1 枚ずつフェード切替
 * props:
 *  - projects: [{ id,title,description,short_description,image_url,image_path,thumbnail }]
 *  - durationSec?: number  …1枚の表示時間（秒）
 */
export function AchievedProjectsSectionMobile({
  projects = [],
  durationSec = 6,
}) {
  // 6枚に揃える（不足は重複で埋める）
  const items = useMemo(() => {
    const src = (projects || []).slice();
    const fallback = {
      id: "",
      title: "Funded Project",
      description: "This project successfully reached its goal.",
      _dummy: true,
    };
    if (src.length === 0) {
      return Array.from({ length: 6 }, (_, i) => ({ ...fallback, id: `dummy-${i}` }));
    }
    const orig = src.length;
    for (let i = 0; src.length < 6; i++) {
      const o = src[i % orig];
      src.push({ ...o, id: `${o.id ?? "item"}-dup${i}` });
    }
    return src.slice(0, 6);
  }, [projects]);

  const getImage = (p) =>
    p.image_url ||
    p.image_path ||
    p.thumbnail ||
    "https://images.unsplash.com/photo-1529101091764-c3526daf38fe?q=80&w=1600&auto=format&fit=crop";

  const [index, setIndex] = useState(0);
  const [tick, setTick] = useState(0); // バーのリスタート用キー

  // 自動で次へ
  useEffect(() => {
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % 6);
    }, durationSec * 1000);
    return () => clearInterval(t);
  }, [durationSec]);

  // index が変わるたびにプログレスバーを 0→100% へ
  useEffect(() => setTick((t) => t + 1), [index]);

  const current = items[index];

  return (
    <section className="w-full from-white  py-20">
      <div className="max-w-screen-sm mx-auto px-4 py-10">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-extrabold text-gray-900"
            style={{ fontFamily: '"Quicksand", sans-serif' }}>Recently Funded Projects</h2>
          <p className="text-sm text-slate-600 mt-2">
            Secure payments and global support from backers around the world.
          </p>
        </div>

        {/* カード：1枚だけ表示してフェード切替 */}
        <div className="relative min-w-0">
          <AnimatePresence mode="wait">
            <motion.article
              key={String(current.id) + "-" + index}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="rounded-2xl overflow-hidden ring-1 ring-black/10 bg-white shadow-md"
            >
              <Link
                to={current.id ? `/crowdfunding/${current.id}` : "#"}
                aria-disabled={!current.id}
                className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              >
                {/* 画像：背景画像 + アスペクト比固定（Samsung 安定） */}
                <div
                  className="relative w-full rounded-b-none"
                  style={{
                    backgroundImage: `url("${getImage(current)}")`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    paddingTop: "62%", // ≒ aspect-[16/10]
                  }}
                >
                  <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-blue-900/95 text-white text-[11px] font-semibold px-2.5 py-1 shadow">
                    <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 10-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" />
                    </svg>
                    Funded
                  </span>
                </div>

                <div className="px-4 py-3">
                  <h3 className="text-slate-900 font-semibold text-base leading-snug line-clamp-2">
                    {current.title || "Funded Project"}
                  </h3>
                  <p className="text-slate-600 text-sm mt-1 line-clamp-3">
                    {current.description || current.short_description || "—"}
                  </p>
                </div>
              </Link>
            </motion.article>
          </AnimatePresence>
        </div>

        {/* 進捗バー：時間で満タン→次のカードへ */}
        <div className="mt-5">
          <div className="h-2 bg-gray-300 rounded-full overflow-hidden">
            <motion.div
              key={tick}
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: durationSec, ease: "linear" }}
              className="h-full bg-blue-900"
            />
          </div>

          {/* ドットナビ（タップで移動） */}
          <div className="mt-3 flex justify-center gap-1.5">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                aria-label={`Show project ${i + 1}`}
                className={[
                  "h-2.5 rounded-full transition-all",
                  i === index ? "w-6 bg-blue-900" : "w-2.5 bg-blue-300",
                ].join(" ")}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
