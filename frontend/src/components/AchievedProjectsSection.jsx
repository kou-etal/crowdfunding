
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

/**
 * props:
 *  - projects: Array<{ id,title,description,short_description,image_url,image_path,thumbnail }>
 *  - durationSec?: number
 *  - radiusX?: number
 *  - radiusY?: number
 *  - visibleCount?: 2|3
 */
export function AchievedProjectsSection({
  projects = [],
  durationSec = 6,
  radiusX = 420,
  radiusY = 110,
  visibleCount = 3,
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
    const origLen = src.length;
    let i = 0;
    while (src.length < 6) {
      const o = src[i % origLen];
      src.push({ ...o, id: `${o.id ?? "item"}-dup${src.length}` });
      i++;
    }
    return src.slice(0, 6);
  }, [projects]);

  const getImage = (p) =>
    p.image_url ||
    p.image_path ||
    p.thumbnail ||
    "https://images.unsplash.com/photo-1529101091764-c3526daf38fe?q=80&w=1600&auto=format&fit=crop";

  const [phase, setPhase] = useState(0);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setPhase((v) => (v + 1) % 6), durationSec * 1000);
    return () => clearInterval(t);
  }, [durationSec]);

  useEffect(() => setTick((t) => t + 1), [phase]);

  const COUNT = 6;
  const STEP = (2 * Math.PI) / COUNT;

  // 前面3（正面と左右1枚ずつ）/ 前面2 の判定
  const isFrontByIndex = (rel) => {
    if (visibleCount === 2) return rel === 0 || rel === COUNT - 1;
    return rel === 0 || rel === 1 || rel === COUNT - 1;
  };

  // ★前面3枚はブラー0・不透明度1にする
  const cardStyleFor = (i) => {
    const rel = (i - phase + COUNT) % COUNT;         // 0 が正面
    const theta = rel * STEP;
    const x = radiusX * Math.sin(theta);
    const y = radiusY * Math.cos(theta);
    const depth = (Math.cos(theta) + 1) / 2;          // 0..1 手前度
    const isFront = isFrontByIndex(rel);

    const baseScale   = (isFront ? 1.02 : 0.92) + 0.14 * depth;
    const baseOpacity = isFront ? 1 : Math.min(0.45 + 0.35 * depth, 1);
    const blurPx      = isFront ? 0 : Math.round(12 * (1 - depth));
    const zIndex      = 10 + (isFront ? 20 : 0) + Math.round(depth * 10);

    return {
      transform: `translate(-50%,-50%) translate(${x}px, ${y}px)`,
      baseScale,
      baseOpacity,
      blurPx,
      zIndex,
      isFront,
      rel,
    };
  };

  return (
    <section className="relative w-full bg-gradient-to-b from-white via-blue-50/30 to-white mt-12">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-16 md:py-24">
 <h2
  className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-10 text-center"
  style={{ fontFamily: '"Quicksand", sans-serif' }}
>
  Recently Funded Projects
</h2>

<p
  className="text-lg md:text-xl text-gray-700 text-center mb-20"
  style={{ fontFamily: '"Quicksand", sans-serif' }}
>
  Secure payments and global support from backers around the world.
</p>



        {/* ステージ */}
        <div className="relative mx-auto w-full max-w-6xl aspect-[16/7]">
          {items.map((p, i) => {
            const s = cardStyleFor(i);
            return (
              <motion.article
                key={String(p.id ?? i)}
                className="absolute left-1/2 top-1/2 will-change-transform"
                style={{ zIndex: s.zIndex }}
                animate={{
                  transform: s.transform,
                  scale: s.baseScale,
                  opacity: s.baseOpacity,
                  filter: `blur(${s.blurPx}px)`,
                }}
                transition={{ duration: 0.85, ease: "easeInOut" }}
                // ★ ホバー/フォーカスで“浮上＋拡大＋影強化”
                whileHover={{
                  y: -12,
                  scale: s.baseScale * 1.06,
                  boxShadow: "0 25px 50px rgba(0,0,0,0.25)",
                }}
                whileFocusWithin={{
                  y: -12,
                  scale: s.baseScale * 1.06,
                  boxShadow: "0 25px 50px rgba(0,0,0,0.25)",
                }}
              >
                <Link
                  to={p.id ? ("/crowdfunding/" + p.id) : "#"}
                  className={[
                    "group block w-[17rem] md:w-[19rem] rounded-2xl overflow-hidden ring-1 bg-white/90 backdrop-blur",
                    s.isFront ? "ring-black/10 shadow-2xl" : "ring-black/5 shadow",
                    s.isFront ? "pointer-events-auto cursor-pointer" : "pointer-events-none",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
                  ].join(" ")}
                  aria-disabled={!p.id}
                >
                  <div className="relative">
                    <div
                      className="aspect-[16/10] bg-center bg-cover"
                      style={{ backgroundImage: `url("${getImage(p)}")` }}
                    />
                    {/* Funded バッジ */}
                    <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-blue-900/95 text-white text-[11px] font-semibold px-2.5 py-1 shadow">
                      <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 10-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" />
                      </svg>
                      Funded
                    </span>
                  </div>

                  <div className="px-4 py-3">
                    <h3 className="font-semibold text-slate-900 leading-snug line-clamp-2">
                      {p.title || "Funded Project"}
                    </h3>
                    <p className="text-sm text-slate-600 line-clamp-2 mt-1">
                      {p.description || p.short_description || "—"}
                    </p>
                  </div>
                </Link>
              </motion.article>
            );
          })}
        </div>

        {/* 進捗バー（下）：背景グレー、進捗ブラック */}
        <div className="mt-12 max-w-3xl mx-auto mt-30">
  <div className="h-2 bg-gray-300 rounded-full overflow-hidden">
    <motion.div
      key={tick}
      initial={{ width: 0 }}
      animate={{ width: "100%" }}
      transition={{ duration: durationSec, ease: "linear" }}
      className="h-full bg-black"
    />
  </div>
  
</div>
          
        
      </div>
    </section>
  );
}
